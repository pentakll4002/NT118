namespace Backend.Models;

public class UserMission
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long MissionId { get; set; }
    public string Status { get; set; } = "todo"; // todo, completed, claimed
    public DateTime? ClaimedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public Mission Mission { get; set; } = null!;
}
