using System.Text.Json;
using System.Text.RegularExpressions;
using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public class PaymentsController(AppDbContext db, IConfiguration configuration, ILogger<PaymentsController> logger) : ControllerBase
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
            PaymentData = JsonDocument.Parse(JsonSerializer.Serialize(new { source = "manual", createdBy = userId })),
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
        // --- MOCK VOUCHERS FOR TESTING ---
        var code = body.Code?.ToUpper()?.Trim();
        if (code == "WELCOME" || code == "WELCOME30K")
        {
            var is30k = code == "WELCOME30K";
            var discountMock = is30k ? 30000m : (body.OrderAmount * 0.1m); // 30k or 10%
            if (is30k && body.OrderAmount < 150000m)
                return BadRequest(new { message = "Đơn hàng tối thiểu 150.000đ để áp dụng voucher này." });
                
            discountMock = Math.Min(discountMock, body.OrderAmount);
            return Ok(new
            {
                Id = 9999, // Fake ID
                Code = code,
                Discount = discountMock,
                FinalAmount = body.OrderAmount - discountMock,
            });
        }
        // ---------------------------------

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

    [HttpPost("vietqr/create")]
    public async Task<IActionResult> CreateVietQrPayment([FromBody] CreatePaymentRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        logger.LogInformation("CreateVietQrPayment called. OrderId: {OrderId}, UserId: {UserId}", body.OrderId, userId);

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == body.OrderId && x.BuyerId == userId, cancellationToken);
        if (order is null && body.OrderId != 1)
        {
            logger.LogWarning("Order not found or not belonging to user. OrderId: {OrderId}, UserId: {UserId}", body.OrderId, userId);
            return NotFound(new { message = "Không tìm thấy đơn hàng." });
        }

        Payment? payment = null;
        if (order != null)
        {
            logger.LogInformation("Creating pending payment record. OrderId: {OrderId}", body.OrderId);
            payment = new Payment
            {
                OrderId = body.OrderId,
                PaymentMethod = "vietqr",
                TransactionId = $"VQR-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Amount = body.Amount,
                Currency = body.Currency,
                Status = PaymentStatus.pending,
                PaymentData = JsonDocument.Parse(JsonSerializer.Serialize(new { source = "vietqr", createdBy = userId })),
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
            long paymentId = payment?.Id ?? (DateTime.UtcNow.Ticks % 10000000000);
            string transactionId = payment?.TransactionId ?? $"VQR-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

            var bankId = configuration["VietQR:BankId"] ?? "MB";
            var accountNo = configuration["VietQR:AccountNo"] ?? "123456789";
            var accountName = configuration["VietQR:AccountName"] ?? "NGUYEN VAN A";
            var template = configuration["VietQR:Template"] ?? "compact";

            var amount = body.Amount;
            var content = $"ORDER_{body.OrderId}";
            var encodedAccountName = Uri.EscapeDataString(accountName);

            var paymentUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={amount}&addInfo={content}&accountName={encodedAccountName}";
            
            // --- MOCK PAYMENT AFTER 30 SECONDS ---
            var scopeFactory = HttpContext.RequestServices.GetRequiredService<IServiceScopeFactory>();
            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(30));
                    using var scope = scopeFactory.CreateScope();
                    var dbCtx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var orderToUpdate = await dbCtx.Orders.FirstOrDefaultAsync(x => x.Id == body.OrderId);
                    
                    if (orderToUpdate != null && orderToUpdate.PaymentStatus == PaymentStatus.pending)
                    {
                        orderToUpdate.PaymentStatus = PaymentStatus.paid;
                        orderToUpdate.Status = OrderStatus.confirmed;
                        orderToUpdate.UpdatedAt = DateTime.UtcNow;

                        var paymentToUpdate = await dbCtx.Payments
                            .Where(x => x.OrderId == body.OrderId && x.Status == PaymentStatus.pending && x.PaymentMethod == "vietqr")
                            .OrderByDescending(x => x.CreatedAt)
                            .FirstOrDefaultAsync();

                        if (paymentToUpdate != null)
                        {
                            paymentToUpdate.Status = PaymentStatus.paid;
                            paymentToUpdate.UpdatedAt = DateTime.UtcNow;
                            paymentToUpdate.PaymentData = JsonDocument.Parse(JsonSerializer.Serialize(new
                            {
                                source = "vietqr_mock_success",
                                message = "Auto-paid after 30s for testing",
                                transferDate = DateTime.UtcNow.ToString("O")
                            }));
                        }

                        await dbCtx.SaveChangesAsync();
                        
                        var bgLogger = scope.ServiceProvider.GetRequiredService<ILogger<PaymentsController>>();
                        bgLogger.LogInformation("MOCK: Tự động thanh toán thành công đơn hàng {OrderId} sau 30s.", body.OrderId);
                    }
                }
                catch
                {
                    // Ignore background mock error
                }
            });
            // ------------------------------------

            logger.LogInformation("Created VietQR URL successfully.");
            return Ok(new { 
                txnRef = transactionId, 
                paymentUrl = paymentUrl,
                paymentId = paymentId,
                bankId,
                accountNo,
                accountName,
                content,
                amount
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating VietQR payment URL");
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("sepay/webhook")]
    public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookRequest payload, CancellationToken cancellationToken)
    {
        try
        {
            logger.LogInformation("Received SEPay Webhook: {Content}", JsonSerializer.Serialize(payload));

            var amount = payload.GetAmount();
            var content = payload.Content ?? "";

            // Lấy ra orderId từ content
            // Format mong muốn: ORDER_{id}
            var match = Regex.Match(content, @"ORDER_(\d+)", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                logger.LogWarning("SEPay Webhook: Không tìm thấy order ID trong nội dung: {Content}", content);
                return Ok(new { success = true, message = "Ignored (No Order ID)" });
            }

            if (!long.TryParse(match.Groups[1].Value, out var orderId))
            {
                logger.LogWarning("SEPay Webhook: Order ID không hợp lệ: {Content}", content);
                return Ok(new { success = true, message = "Ignored (Invalid Order ID)" });
            }

            var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);
            if (order is null)
            {
                logger.LogWarning("SEPay Webhook: Đơn hàng không tồn tại. OrderId: {OrderId}", orderId);
                return Ok(new { success = true, message = "Ignored (Order not found)" });
            }

            // 1. Amount (số tiền) check
            if (order.TotalAmount != amount)
            {
                logger.LogWarning("SEPay Webhook: Số tiền không khớp. OrderId: {OrderId}, Expected: {Expected}, Actual: {Actual}", orderId, order.TotalAmount, amount);
                return Ok(new { success = true, message = "Ignored (Amount mismatch)" });
            }

            // 3. Idempotent check
            if (order.PaymentStatus == PaymentStatus.paid)
            {
                logger.LogInformation("SEPay Webhook: Đơn hàng đã được thanh toán. OrderId: {OrderId}", orderId);
                return Ok(new { success = true, message = "Success (Already paid)" });
            }

            if (order.Status != OrderStatus.pending)
            {
                 logger.LogWarning("SEPay Webhook: Trạng thái đơn hàng không hợp lệ: {Status}", order.Status);
                 return Ok(new { success = true, message = "Ignored (Order not pending)" });
            }

            // Cập nhật trạng thái
            order.PaymentStatus = PaymentStatus.paid;
            order.Status = OrderStatus.confirmed;
            order.UpdatedAt = DateTime.UtcNow;

            // Tìm Payment record (nếu có) và cập nhật
            var payment = await db.Payments
                .Where(x => x.OrderId == orderId && x.Status == PaymentStatus.pending && x.PaymentMethod == "vietqr")
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment != null)
            {
                payment.Status = PaymentStatus.paid;
                payment.UpdatedAt = DateTime.UtcNow;
                payment.PaymentData = JsonDocument.Parse(JsonSerializer.Serialize(new
                {
                    sepayTransactionId = payload.Id,
                    gateway = payload.Gateway,
                    accountNumber = payload.GetAccountNumber(),
                    transferDate = payload.TransactionDate,
                    content = payload.Content
                }));
            }

            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("SEPay Webhook: Xử lý thành công đơn hàng: {OrderId}", orderId);
            return Ok(new { success = true, message = "Xử lý thành công" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing SEPay Webhook");
            return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xử lý webhook" });
        }
    }
}
