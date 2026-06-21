using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MissionsController(AppDbContext db) : ControllerBase
{
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyMissions(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var today = DateTime.UtcNow.Date;

        // Ensure missions exist (seed if empty)
        var missions = await db.Missions.Where(m => m.IsActive).ToListAsync(cancellationToken);
        if (!missions.Any())
        {
            var now = DateTime.UtcNow;
            db.Missions.AddRange(
                new Mission { Title = "Đăng nhập hàng ngày", Description = "Điểm danh mỗi ngày để nhận Xu", Type = MissionType.DailyCheckIn, RewardXu = 100, IsDaily = true, CreatedAt = now, UpdatedAt = now },
                new Mission { Title = "Chia sẻ App", Description = "Chia sẻ ứng dụng lên mạng xã hội", Type = MissionType.ShareApp, RewardXu = 200, IsDaily = true, CreatedAt = now, UpdatedAt = now },
                new Mission { Title = "Mời bạn bè", Description = "Mời bạn bè tải App và nhập mã giới thiệu", Type = MissionType.Referral, RewardXu = 5000, IsDaily = false, CreatedAt = now, UpdatedAt = now }
            );
            await db.SaveChangesAsync(cancellationToken);
            missions = await db.Missions.Where(m => m.IsActive).ToListAsync(cancellationToken);
        }

        var userMissions = await db.UserMissions
            .Where(um => um.UserId == userId)
            .ToListAsync(cancellationToken);

        var result = missions.Select(m =>
        {
            var um = userMissions
                .Where(x => x.MissionId == m.Id)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault();

            var status = "todo";
            if (um != null)
            {
                if (m.IsDaily && um.CreatedAt.Date < today)
                    status = "todo"; // Reset daily
                else
                    status = um.Status;
            }

            return new
            {
                m.Id,
                m.Title,
                m.Description,
                Type = (int)m.Type,
                m.RewardXu,
                m.IsDaily,
                Status = status
            };
        });

        // Check-in streak & today status
        var checkInMission = missions.FirstOrDefault(m => m.Type == MissionType.DailyCheckIn);
        var checkInStreak = 0;
        var hasCheckedInToday = false;

        if (checkInMission != null)
        {
            var claims = userMissions
                .Where(x => x.MissionId == checkInMission.Id && x.Status == "claimed" && x.ClaimedAt.HasValue)
                .OrderByDescending(x => x.ClaimedAt)
                .ToList();

            if (claims.Any() && claims[0].ClaimedAt?.Date == today)
                hasCheckedInToday = true;

            // Calculate streak (consecutive days ending today or yesterday)
            if (claims.Any())
            {
                var checkDate = hasCheckedInToday ? today : today.AddDays(-1);
                foreach (var c in claims)
                {
                    if (c.ClaimedAt?.Date == checkDate)
                    {
                        checkInStreak++;
                        checkDate = checkDate.AddDays(-1);
                    }
                    else break;
                }
            }
        }

        // Get wallet balance
        var wallet = await db.Wallets.AsNoTracking().FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        return Ok(new
        {
            checkInStreak,
            hasCheckedInToday,
            balance = wallet?.CoinBalance ?? 0m,
            missions = result
        });
    }

    [HttpPost("claim")]
    public async Task<IActionResult> ClaimMission([FromBody] ClaimMissionRequest req, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var today = DateTime.UtcNow.Date;

        var mission = await db.Missions.FirstOrDefaultAsync(m => m.Id == req.MissionId && m.IsActive, cancellationToken);
        if (mission == null)
            return NotFound(new { message = "Nhiệm vụ không tồn tại." });

        // Check if already claimed today (daily) or ever (one-time)
        var existingClaim = await db.UserMissions
            .Where(um => um.UserId == userId && um.MissionId == mission.Id)
            .OrderByDescending(um => um.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingClaim != null && existingClaim.Status == "claimed")
        {
            if (!mission.IsDaily || existingClaim.ClaimedAt?.Date == today)
                return BadRequest(new { message = "Bạn đã nhận thưởng nhiệm vụ này rồi." });
        }

        // Create new record for daily, or update existing for one-time
        if (existingClaim == null || (mission.IsDaily && existingClaim.CreatedAt.Date < today))
        {
            existingClaim = new UserMission
            {
                UserId = userId,
                MissionId = mission.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.UserMissions.Add(existingClaim);
        }

        existingClaim.Status = "claimed";
        existingClaim.ClaimedAt = DateTime.UtcNow;
        existingClaim.UpdatedAt = DateTime.UtcNow;

        // Calculate reward
        var reward = mission.RewardXu;

        // Get or create wallet
        var wallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
        if (wallet == null)
        {
            wallet = new Wallet { UserId = userId, Balance = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            db.Wallets.Add(wallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        wallet.CoinBalance += reward;
        wallet.UpdatedAt = DateTime.UtcNow;

        db.WalletTransactions.Add(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = reward,
            Type = "mission_reward",
            Description = $"Thưởng nhiệm vụ: {mission.Title}",
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Nhận thưởng thành công!", rewardXu = reward, newBalance = wallet.CoinBalance });
    }

    [HttpPost("referral")]
    public async Task<IActionResult> SubmitReferral([FromBody] ReferralRequest req, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var referrer = await db.Users.FirstOrDefaultAsync(
            u => u.Id.ToString() == req.Code || u.Username == req.Code, cancellationToken);

        if (referrer == null || referrer.Id == userId)
            return BadRequest(new { message = "Mã giới thiệu không hợp lệ." });

        // Check if user already used a referral code (prevent repeated use)
        var alreadyReferred = await db.WalletTransactions
            .AnyAsync(t => t.Wallet.UserId == userId && t.Type == "referral_reward", cancellationToken);
        if (alreadyReferred)
            return BadRequest(new { message = "Bạn đã sử dụng mã giới thiệu rồi." });

        // Reward current user
        var wallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
        if (wallet == null)
        {
            wallet = new Wallet { UserId = userId, Balance = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            db.Wallets.Add(wallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        wallet.CoinBalance += 5000;
        wallet.UpdatedAt = DateTime.UtcNow;
        db.WalletTransactions.Add(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = 5000,
            Type = "referral_reward",
            Description = $"Nhận thưởng nhập mã giới thiệu từ {referrer.Username}",
            CreatedAt = DateTime.UtcNow
        });

        // Reward referrer too
        var referrerWallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == referrer.Id, cancellationToken);
        if (referrerWallet == null)
        {
            referrerWallet = new Wallet { UserId = referrer.Id, Balance = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            db.Wallets.Add(referrerWallet);
            await db.SaveChangesAsync(cancellationToken);
        }

        referrerWallet.CoinBalance += 5000;
        referrerWallet.UpdatedAt = DateTime.UtcNow;
        db.WalletTransactions.Add(new WalletTransaction
        {
            WalletId = referrerWallet.Id,
            Amount = 5000,
            Type = "referral_reward",
            Description = $"Thưởng giới thiệu bạn bè (người được mời: userId={userId})",
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Nhập mã thành công! Bạn nhận được 5,000 Xu.", rewardXu = 5000, newBalance = wallet.CoinBalance });
    }
}

public class ClaimMissionRequest
{
    public long MissionId { get; set; }
}

public class ReferralRequest
{
    public string Code { get; set; } = null!;
}

