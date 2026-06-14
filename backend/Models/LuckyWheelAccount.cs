namespace Backend.Models;

public class LuckyWheelAccount
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public int FreeSpins { get; set; } = 0;
    
    // Tracks the date of the last daily claim (e.g. 2026-06-14)
    public DateTime? LastDailyClaimDate { get; set; }
    
    // Tracks the date of the last 7h-8h claim
    public DateTime? LastSlot1ClaimDate { get; set; }
    
    // Tracks the date of the last 19h-20h claim
    public DateTime? LastSlot2ClaimDate { get; set; }

    public User User { get; set; } = null!;
}
