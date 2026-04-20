using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts;

public record RegisterRequest(
	[property: Required, EmailAddress, MaxLength(100)] string Email,
	[property: Required, MinLength(6), MaxLength(128)] string Password,
	[property: Required, MinLength(4), MaxLength(20)] string CaptchaCode);

public record LoginRequest(
	[property: Required, EmailAddress, MaxLength(100)] string Email,
	[property: Required, MinLength(6), MaxLength(128)] string Password);

public record ForgotPasswordRequest([property: Required, EmailAddress, MaxLength(100)] string Email);

public record ResetPasswordRequest(
	[property: Required, EmailAddress, MaxLength(100)] string Email,
	[property: Required, MinLength(4), MaxLength(20)] string Code,
	[property: Required, MinLength(6), MaxLength(128)] string NewPassword);

public record AuthResponse(string Token, long UserId, string Email, string Role);

public record ForgotPasswordResponse(string Message, string? ResetCode);

public record MessageResponse(string Message);

public record SendRegisterCaptchaRequest([property: Required, EmailAddress, MaxLength(100)] string Email);
