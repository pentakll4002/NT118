using Backend.Data;
using Backend.Models;
using Backend.Options;
using Backend.Services;
using Backend.Configuration;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
DotEnvLoader.Load(Path.Combine(builder.Environment.ContentRootPath, ".env"));

builder.Configuration["Smtp:Host"] = Environment.GetEnvironmentVariable("SMTP_HOST") ?? builder.Configuration["Smtp:Host"];
builder.Configuration["Smtp:Port"] = Environment.GetEnvironmentVariable("SMTP_PORT") ?? builder.Configuration["Smtp:Port"];
builder.Configuration["Smtp:EnableSsl"] = Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL") ?? builder.Configuration["Smtp:EnableSsl"];
builder.Configuration["Smtp:FromEmail"] = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? builder.Configuration["Smtp:FromEmail"];
builder.Configuration["Smtp:FromName"] = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? builder.Configuration["Smtp:FromName"];
builder.Configuration["Smtp:AppPassword"] = Environment.GetEnvironmentVariable("SMTP_APP_PASSWORD") ?? builder.Configuration["Smtp:AppPassword"];

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AppFeatureOptions>(builder.Configuration.GetSection(AppFeatureOptions.SectionName));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured. See appsettings.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.MapEnum<UserRole>("user_role");
        npgsql.MapEnum<UserStatus>("user_status");
        npgsql.EnableRetryOnFailure();
    }));

builder.Services.AddScoped<ISampleService, SampleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddMemoryCache();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true);
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Create database if not exists
    db.Database.EnsureCreated();

    // Create enums if they don't exist
    db.Database.ExecuteSqlRaw(@"
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    ");
}

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run("http://0.0.0.0:5058");
