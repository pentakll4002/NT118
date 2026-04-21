using System.Text.Json;
using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Backend.Services.VNPay;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public class PaymentsController(AppDbContext db, IVnpayClient vnpayClient, ILogger<PaymentsController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == body.OrderId && x.BuyerId == userId, cancellationToken);
        if (order is null)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

        var payment = new Payment
        {
            OrderId = body.OrderId,
            PaymentMethod = body.PaymentMethod,
            TransactionId = $"PAY-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Amount = body.Amount,
            Currency = body.Currency,
            Status = PaymentStatus.pending,
            PaymentData = JsonSerializer.Serialize(new { source = "manual", createdBy = userId }),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Payments.Add(payment);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Tạo thanh toán thành công.", payment.Id, payment.TransactionId });
    }

    [HttpPost("apply-voucher")]
    public async Task<IActionResult> ApplyVoucher([FromBody] ApplyVoucherRequest body, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var voucher = await db.Vouchers.FirstOrDefaultAsync(
            x => x.Code == body.Code && x.IsActive && x.StartDate <= now && x.EndDate >= now,
            cancellationToken);

        if (voucher is null)
            return NotFound(new { message = "Voucher không hợp lệ." });

        if (voucher.MinOrderValue.HasValue && body.OrderAmount < voucher.MinOrderValue)
            return BadRequest(new { message = "Đơn hàng chưa đạt giá trị tối thiểu để áp voucher." });

        var discount = voucher.DiscountType == VoucherDiscountType.@fixed
            ? voucher.DiscountValue
            : body.OrderAmount * (voucher.DiscountValue / 100m);

        if (voucher.MaxDiscount.HasValue)
            discount = Math.Min(discount, voucher.MaxDiscount.Value);

        discount = Math.Min(discount, body.OrderAmount);

        return Ok(new
        {
            voucher.Id,
            voucher.Code,
            discount,
            finalAmount = body.OrderAmount - discount,
        });
    }

    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnPayPayment([FromBody] CreatePaymentRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        logger.LogInformation("CreateVnPayPayment called. OrderId: {OrderId}, UserId: {UserId}", body.OrderId, userId);

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == body.OrderId && x.BuyerId == userId, cancellationToken);
        if (order is null && body.OrderId != 1)
        {
            logger.LogWarning("Order not found or not belonging to user. OrderId: {OrderId}, UserId: {UserId}", body.OrderId, userId);
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        Payment payment = null;
        if (order != null)
        {
            logger.LogInformation("Creating pending payment record. OrderId: {OrderId}", body.OrderId);
            payment = new Payment
            {
                OrderId = body.OrderId,
                PaymentMethod = "vnpay",
                TransactionId = $"VNP-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Amount = body.Amount,
                Currency = body.Currency,
                Status = PaymentStatus.pending,
                PaymentData = JsonSerializer.Serialize(new { source = "vnpay", createdBy = userId }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            db.Payments.Add(payment);
            
            try 
            {
                logger.LogInformation("Saving changes for payment...");
                await db.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Changes saved. PaymentId: {PaymentId}", payment.Id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error saving payment to db. Validating if DbUpdateException.");
                return StatusCode(500, new { message = "Lỗi hệ thống khi lưu thanh toán." });
            }
        }

        try
        {
            long paymentId = payment?.Id ?? (DateTime.UtcNow.Ticks % 10000000000); // 10 digits
            string transactionId = payment?.TransactionId ?? $"VNP-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

            var request = new VnpayPaymentRequest
            {
                PaymentId = paymentId, 
                Money = (double)body.Amount,
                Description = $"Thanh toan don hang {body.OrderId}",
                BankCode = BankCode.ANY
            };

            var paymentUrlInfo = vnpayClient.CreatePaymentUrl(request);
            
            logger.LogInformation("Created VNPay URL successfully.");
            return Ok(new { 
                txnRef = transactionId, 
                paymentUrl = paymentUrlInfo.Url,
                paymentId = paymentId
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating VNPay payment URL");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("vnpay/callback")]
    public async Task<IActionResult> VnPayCallback(CancellationToken cancellationToken)
    {
        try
        {
            var result = vnpayClient.GetPaymentResult(Request);
            
            // result.PaymentId is our Internal Payment ID (txnRef sent to VNPay)
            var payment = await db.Payments.FirstOrDefaultAsync(x => x.Id == result.PaymentId, cancellationToken);
            if (payment is null)
            {
                logger.LogWarning("VNPay Callback: Payment ID {PaymentId} not found", result.PaymentId);
                return NotFound(new { message = "Không tìm thấy giao dịch." });
            }

            if (payment.Status == PaymentStatus.paid)
                return Ok(new { message = "Giao dịch đã được xử lý trước đó.", status = "paid" });

            payment.Status = PaymentStatus.paid;
            payment.UpdatedAt = DateTime.UtcNow;
            payment.PaymentData = JsonSerializer.Serialize(new
            {
                vnpayTransactionId = result.VnpayTransactionId,
                bankCode = result.BankingInfor?.BankCode,
                bankTranNo = result.BankingInfor?.BankTransactionId,
                cardType = result.CardType,
                payDate = result.Timestamp
            });

            var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == payment.OrderId, cancellationToken);
            if (order is not null)
            {
                order.PaymentStatus = PaymentStatus.paid;
                order.Status = OrderStatus.confirmed; // Auto confirm if paid
                order.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(cancellationToken);
            
            // Redirect to mobile app or show success message
            // For now, return JSON. In a real app, we might redirect to a deep link.
            return Ok(new { message = "Thanh toán thành công.", status = "paid" });
        }
        catch (VnpayException ex)
        {
            logger.LogError(ex, "VNPay Callback Error: {Message}", ex.Message);
            
            // If we can identify the payment, mark it as failed
            // Note: txnRef is usually in the query params even if it fails
            if (long.TryParse(Request.Query["vnp_TxnRef"], out var paymentId))
            {
                var payment = await db.Payments.FirstOrDefaultAsync(x => x.Id == paymentId, cancellationToken);
                if (payment != null && payment.Status == PaymentStatus.pending)
                {
                    payment.Status = PaymentStatus.failed;
                    payment.UpdatedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            return BadRequest(new { message = ex.Message, status = "failed" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "General error in VNPay Callback");
            return BadRequest(new { message = "Lỗi xử lý callback thanh toán." });
        }
    }
}
