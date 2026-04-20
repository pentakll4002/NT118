using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Backend.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService(
    AppDbContext db,
    IOptions<JwtOptions> jwtOptions,
    IMemoryCache cache,
    IEmailService emailService) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;
    private readonly PasswordHasher<User> _passwordHasher = new();
    private const string RegisterCaptchaPrefix = "register-captcha:";

    public async Task<MessageResponse> SendRegisterCaptchaAsync(SendRegisterCaptchaRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("Email là bắt buộc.");

        if (await db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            throw new InvalidOperationException("Email đã được đăng ký.");

        var code = Random.Shared.Next(100000, 1_000_000).ToString();
        cache.Set(
            $"{RegisterCaptchaPrefix}{email}",
            code,
            TimeSpan.FromMinutes(10));

        var subject = "Ma xac thuc dang ky NT118";
        var body = $"Ma captcha cua ban la: {code}. Ma co hieu luc trong 10 phut.";
        await emailService.SendAsync(email, subject, body, cancellationToken);

        return new MessageResponse("Đã gửi mã captcha qua email.");
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.CaptchaCode))
            throw new InvalidOperationException("Email, mật khẩu và mã captcha là bắt buộc.");

        if (request.Password.Length < 6)
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 6 ký tự.");

        if (await db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            throw new InvalidOperationException("Email đã được đăng ký.");

        if (!cache.TryGetValue<string>($"{RegisterCaptchaPrefix}{email}", out var storedCode)
            || string.IsNullOrWhiteSpace(storedCode)
            || storedCode != request.CaptchaCode.Trim())
            throw new InvalidOperationException("Mã captcha không hợp lệ hoặc đã hết hạn.");

        cache.Remove($"{RegisterCaptchaPrefix}{email}");

        var username = await GenerateUniqueUsernameAsync(email, cancellationToken);
        var now = DateTime.UtcNow;
        var user = new User
        {
            Email = email,
            Username = username,
            CreatedAt = now,
            UpdatedAt = now,
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Email và mật khẩu là bắt buộc.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

        var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

        return CreateAuthResponse(user);
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email))
            return new ForgotPasswordResponse("Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã đặt lại mật khẩu.", null);

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null)
            return new ForgotPasswordResponse("Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã đặt lại mật khẩu.", null);

        var code = Random.Shared.Next(100000, 1_000_000).ToString();
        user.PasswordResetCode = code;
        user.PasswordResetCodeExpires = DateTime.UtcNow.AddMinutes(15);
        await db.SaveChangesAsync(cancellationToken);

        var subject = "Ma dat lai mat khau NT118";
        var body = $"Ma xac thuc dat lai mat khau cua ban la: {code}. Ma co hieu luc trong 15 phut.";
        await emailService.SendAsync(email, subject, body, cancellationToken);

        return new ForgotPasswordResponse(
            "Mã đặt lại mật khẩu đã được gửi qua email.",
            null);
    }

    public async Task<MessageResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.NewPassword))
            throw new InvalidOperationException("Mã và mật khẩu mới là bắt buộc.");

        if (request.NewPassword.Length < 6)
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 6 ký tự.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new InvalidOperationException("Mã xác thực không hợp lệ hoặc đã hết hạn.");

        if (user.PasswordResetCode is null
            || user.PasswordResetCodeExpires is null
            || user.PasswordResetCodeExpires < DateTime.UtcNow
            || user.PasswordResetCode != request.Code.Trim())
            throw new InvalidOperationException("Mã xác thực không hợp lệ hoặc đã hết hạn.");

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpires = null;
        await db.SaveChangesAsync(cancellationToken);

        return new MessageResponse("Đặt lại mật khẩu thành công.");
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = CreateJwt(user);
        // Include the user's role so the client can route to the correct screen
        return new AuthResponse(token, user.Id, user.Email, user.Role.ToString());
    }

    private string CreateJwt(User user)
    {
        if (string.IsNullOrWhiteSpace(_jwt.Key) || _jwt.Key.Length < 32)
            throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiresMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private async Task<string> GenerateUniqueUsernameAsync(string email, CancellationToken cancellationToken)
    {
        var local = email.Split('@')[0];
        if (string.IsNullOrWhiteSpace(local))
            local = "user";

        var baseName = local.Length > 50 ? local[..50] : local;
        var candidate = baseName;
        var n = 0;
        while (await db.Users.AnyAsync(u => u.Username == candidate, cancellationToken))
        {
            n++;
            var suffix = n.ToString();
            var maxLen = 50 - suffix.Length;
            candidate = (baseName.Length > maxLen ? baseName[..maxLen] : baseName) + suffix;
        }

        return candidate;
    }
}
