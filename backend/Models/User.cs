namespace Backend.Models;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.buyer;
    public UserStatus Status { get; set; } = UserStatus.active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetCodeExpires { get; set; }
}
