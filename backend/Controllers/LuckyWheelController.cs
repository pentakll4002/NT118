using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/luckywheel")]
public class LuckyWheelController(AppDbContext db) : ControllerBase
{
    // ── Prize definitions ───────────────────────────────────────────────
    private static readonly List<Prize> Prizes =
    [
        new("xu_special", "ShopeeLite Xu Đặc Biệt",   50000, 0.5m,  null, null),
        new("xu_big",     "ShopeeLite Xu Đại",          2000, 10.0m, null, null),
        new("xu_700",     "ShopeeLite Xu 700",            700, 15.0m, null, null),
        new("xu_500",     "ShopeeLite Xu 500",            500, 20.0m, null, null),
        new("xu_100",     "ShopeeLite Xu 100",            100, 25.0m, null, null),
        new("voucher_15", "Voucher Giảm 15%",               0, 10.0m, "Percentage", 15m),
        new("freeship",   "Voucher Freeship",                0, 10.0m, "Fixed", 15000m),
        new("miss",       "Chúc bạn may mắn lần sau",       0, 9.5m,  null, null),
    ];

    private record Prize(string Id, string Label, int XuAmount, decimal Weight, string? VoucherType, decimal? VoucherValue);

    private const int SPIN_COST_XU = 750;

    // Vietnam timezone (UTC+7)
    private static readonly TimeZoneInfo VnTz = TimeZoneInfo.CreateCustomTimeZone("VN", TimeSpan.FromHours(7), "Vietnam", "Vietnam");
    private static DateTime NowVn() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VnTz);

    // ── GET /api/luckywheel/info ─────────────────────────────────────────
    [HttpGet("info")]
    public async Task<IActionResult> GetInfo(CancellationToken ct)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var account = await GetOrCreateAccount(userId, ct);
        ClaimPendingFreeSpins(account);
        await db.SaveChangesAsync(ct);

        var wallet = await db.Wallets.AsNoTracking().FirstOrDefaultAsync(w => w.UserId == userId, ct);

        return Ok(new
        {
            freeSpins = account.FreeSpins,
            spinCostXu = SPIN_COST_XU,
            walletBalance = wallet?.CoinBalance ?? 0m,
            prizes = Prizes.Select(p => new { p.Id, p.Label, p.XuAmount, voucherType = p.VoucherType, voucherValue = p.VoucherValue }),
        });
    }

    // ── POST /api/luckywheel/spin ────────────────────────────────────────
    [HttpPost("spin")]
    public async Task<IActionResult> Spin([FromBody] SpinRequest body, CancellationToken ct)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var account = await GetOrCreateAccount(userId, ct);
        ClaimPendingFreeSpins(account);

        Wallet? wallet = null;

        if (body.UseXu)
        {
            // Pay with xu
            wallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, ct);
            if (wallet == null || wallet.CoinBalance < SPIN_COST_XU)
                return BadRequest(new { message = "Số xu không đủ để quay. Bạn cần 750 xu." });

            wallet.CoinBalance -= SPIN_COST_XU;
            wallet.UpdatedAt = DateTime.UtcNow;

            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = -SPIN_COST_XU,
                Type = "spin",
                Description = "Dùng 750 xu quay Vòng Quay May Mắn",
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            // Use free spin
            if (account.FreeSpins <= 0)
                return BadRequest(new { message = "Bạn đã hết lượt quay miễn phí. Hãy dùng xu để quay thêm." });

            account.FreeSpins--;
        }

        // ── Weighted random pick ───────────────────────────────────
        var prize = PickPrize();

        // ── Award the prize ────────────────────────────────────────
        string rewardDescription = prize.Label;
        decimal rewardXu = 0;

        if (prize.XuAmount > 0)
        {
            // Xu prize
            wallet ??= await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, ct);
            if (wallet == null)
            {
                wallet = new Wallet { UserId = userId, Balance = 0m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                db.Wallets.Add(wallet);
                await db.SaveChangesAsync(ct);
            }

            wallet.CoinBalance += prize.XuAmount;
            wallet.UpdatedAt = DateTime.UtcNow;
            rewardXu = prize.XuAmount;

            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = prize.XuAmount,
                Type = "reward",
                Description = $"Trúng {prize.Label} từ Vòng Quay May Mắn",
                CreatedAt = DateTime.UtcNow
            });
        }
        else if (prize.VoucherType != null)
        {
            // Voucher prize — create a personal voucher for the user
            var now = DateTime.UtcNow;
            var code = $"WHEEL-{prize.Id.ToUpper()}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

            var voucher = new Voucher
            {
                Code = code,
                Name = prize.Label,
                Description = $"Voucher trúng từ Vòng Quay May Mắn",
                DiscountType = prize.VoucherType == "Percentage" ? VoucherDiscountType.percentage : VoucherDiscountType.@fixed,
                DiscountValue = prize.VoucherValue ?? 0,
                MaxDiscount = prize.VoucherType == "Percentage" ? 50000m : null,
                MinOrderValue = 0,
                UsageLimit = 1,
                UsedCount = 0,
                StartDate = now,
                EndDate = now.AddDays(3),
                IsActive = true,
                CreatedAt = now,
            };
            db.Vouchers.Add(voucher);
            await db.SaveChangesAsync(ct); // to generate voucher.Id

            db.UserVouchers.Add(new UserVoucher
            {
                UserId = userId,
                VoucherId = voucher.Id,
                IsUsed = false,
                ExpiresAt = voucher.EndDate,
                CreatedAt = now,
            });

            rewardDescription = $"{prize.Label} (Mã: {code}, HSD: 3 ngày)";
        }
        // else: "miss" — no reward

        await db.SaveChangesAsync(ct);

        // Reload wallet balance
        wallet ??= await db.Wallets.AsNoTracking().FirstOrDefaultAsync(w => w.UserId == userId, ct);

        return Ok(new
        {
            prizeId = prize.Id,
            prizeLabel = prize.Label,
            prizeIndex = Prizes.IndexOf(prize),
            rewardXu,
            rewardDescription,
            freeSpinsRemaining = account.FreeSpins,
            walletBalance = wallet?.CoinBalance ?? 0m,
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private async Task<LuckyWheelAccount> GetOrCreateAccount(long userId, CancellationToken ct)
    {
        var account = await db.LuckyWheelAccounts.FirstOrDefaultAsync(a => a.UserId == userId, ct);
        if (account == null)
        {
            account = new LuckyWheelAccount { UserId = userId, FreeSpins = 0 };
            db.LuckyWheelAccounts.Add(account);
            await db.SaveChangesAsync(ct);
        }
        return account;
    }

    /// <summary>
    /// Check whether the user should receive free spins for daily login and time slots (7h-8h, 19h-20h).
    /// Called on every info/spin request so the user gets spins as soon as they open the wheel.
    /// </summary>
    private static void ClaimPendingFreeSpins(LuckyWheelAccount account)
    {
        var now = NowVn();
        var today = now.Date;

        // Daily login spin (1/day)
        if (account.LastDailyClaimDate == null || account.LastDailyClaimDate.Value.Date < today)
        {
            account.FreeSpins++;
            account.LastDailyClaimDate = today;
        }

        // Slot 1: 07:00 – 08:00
        if (now.Hour >= 7 && now.Hour < 8)
        {
            if (account.LastSlot1ClaimDate == null || account.LastSlot1ClaimDate.Value.Date < today)
            {
                account.FreeSpins++;
                account.LastSlot1ClaimDate = today;
            }
        }

        // Slot 2: 19:00 – 20:00
        if (now.Hour >= 19 && now.Hour < 20)
        {
            if (account.LastSlot2ClaimDate == null || account.LastSlot2ClaimDate.Value.Date < today)
            {
                account.FreeSpins++;
                account.LastSlot2ClaimDate = today;
            }
        }
    }

    private static Prize PickPrize()
    {
        var totalWeight = Prizes.Sum(p => p.Weight);
        var roll = (decimal)(Random.Shared.NextDouble()) * totalWeight;
        decimal cumulative = 0;
        foreach (var p in Prizes)
        {
            cumulative += p.Weight;
            if (roll < cumulative)
                return p;
        }
        return Prizes[^1]; // fallback
    }

    public class SpinRequest
    {
        public bool UseXu { get; set; }
    }
}
