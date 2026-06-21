namespace Backend.Models;

public enum MissionType
{
    DailyCheckIn = 1,
    ShareApp = 2,
    WriteReview = 3,
    Referral = 4,
    PlayLuckyWheel = 5
}

public class Mission
{
    public long Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public MissionType Type { get; set; }
    public int RewardXu { get; set; }
    public bool IsDaily { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
