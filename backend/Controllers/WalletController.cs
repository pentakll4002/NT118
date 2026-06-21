using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/wallet")]
public class WalletController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWallet(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var wallet = await db.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Wallets.Add(wallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        return Ok(new
        {
            wallet.Id,
            wallet.UserId,
            wallet.Balance,
            wallet.CoinBalance,
            wallet.CreatedAt,
            wallet.UpdatedAt
        });
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var wallet = await db.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        return Ok(new { balance = wallet?.Balance ?? 0m, coinBalance = wallet?.CoinBalance ?? 0m });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var wallet = await db.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
        {
            return Ok(Array.Empty<object>());
        }

        var transactions = await db.WalletTransactions
            .Where(t => t.WalletId == wallet.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.WalletId,
                t.Amount,
                t.Type,
                t.Description,
                t.OrderId,
                t.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(transactions);
    }

    [HttpPost("topup")]
    public async Task<IActionResult> TopUp([FromBody] TopUpRequest request, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Số tiền nạp phải lớn hơn 0." });
        }

        var wallet = await db.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Wallets.Add(wallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        wallet.Balance += request.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = request.Amount,
            Type = "topup",
            Description = $"Nạp tiền vào ví ShopeePay",
            CreatedAt = DateTime.UtcNow
        };
        db.WalletTransactions.Add(transaction);

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = $"Nạp thành công {request.Amount:N0}đ vào ví.",
            wallet.Balance,
            transactionId = transaction.Id
        });
    }

    [HttpPost("claim-gift")]
    public async Task<IActionResult> ClaimGift(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var wallet = await db.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Wallets.Add(wallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        // Generate a random coin reward between 500đ and 5000đ
        var random = new Random();
        decimal amount = random.Next(5, 51) * 100m; 

        wallet.Balance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = "gift",
            Description = "Nhận xu từ hộp quà may mắn 100% trúng xu",
            CreatedAt = DateTime.UtcNow
        };
        db.WalletTransactions.Add(transaction);

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Mở quà thành công!",
            amountClaimed = amount,
            newBalance = wallet.Balance,
            transactionId = transaction.Id
        });
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] WithdrawRequest request, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Số tiền rút phải lớn hơn 0." });
        }

        var wallet = await db.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null || wallet.Balance < request.Amount)
        {
            return BadRequest(new { message = "Số dư ví không đủ để thực hiện rút tiền." });
        }

        wallet.Balance -= request.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = -request.Amount,
            Type = "withdraw",
            Description = $"Rút tiền về {request.BankName} ({request.AccountNo})",
            CreatedAt = DateTime.UtcNow
        };
        db.WalletTransactions.Add(transaction);

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = $"Đã rút thành công {request.Amount:N0}đ về tài khoản ngân hàng.",
            wallet.Balance,
            transactionId = transaction.Id
        });
    }
}

public class TopUpRequest
{
    public decimal Amount { get; set; }
}

public class WithdrawRequest
{
    public decimal Amount { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNo { get; set; } = string.Empty;
}
