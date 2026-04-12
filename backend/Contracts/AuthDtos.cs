namespace Backend.Contracts;

public record RegisterRequest(string Email, string Password);

public record LoginRequest(string Email, string Password);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Code, string NewPassword);

public record AuthResponse(string Token, long UserId, string Email);

public record ForgotPasswordResponse(string Message, string? ResetCode);

public record MessageResponse(string Message);
