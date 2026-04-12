namespace Backend.Options;

public class AppFeatureOptions
{
    public const string SectionName = "AppFeatures";

    /// <summary>
    /// When true, forgot-password response may include reset code (dev only; production should use email).
    /// </summary>
    public bool ExposePasswordResetCodes { get; set; }
}
