namespace Backend.Options;

public class SmtpOptions
{
    public const string SectionName = "Smtp";
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "NT118 App";
    public string AppPassword { get; set; } = string.Empty;
}
