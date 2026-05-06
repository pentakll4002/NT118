namespace Backend.Models;

using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    [NotMapped]
    public UserRole Role { get; set; } = UserRole.buyer;
    [NotMapped]
    public UserStatus Status { get; set; } = UserStatus.active;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetCodeExpires { get; set; }

    public UserProfile? Profile { get; set; }
    public List<UserAddress> Addresses { get; set; } = [];
}
