using System.Net;
using System.Net.Mail;
using Backend.Options;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public class SmtpEmailService(IOptions<SmtpOptions> smtpOptions) : IEmailService
{
    private readonly SmtpOptions _smtp = smtpOptions.Value;

    public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_smtp.FromEmail) || string.IsNullOrWhiteSpace(_smtp.AppPassword))
            throw new InvalidOperationException("SMTP chưa được cấu hình đầy đủ.");

        var normalizedAppPassword = _smtp.AppPassword.Replace(" ", string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedAppPassword))
            throw new InvalidOperationException("SMTP app password không hợp lệ.");

        using var message = new MailMessage(
            from: new MailAddress(_smtp.FromEmail, _smtp.FromName),
            to: new MailAddress(toEmail))
        {
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        using var client = new SmtpClient
        {
            Host = _smtp.Host,
            Port = _smtp.Port,
            EnableSsl = _smtp.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(_smtp.FromEmail, normalizedAppPassword)
        };

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(message, cancellationToken);
    }
}
