using Backend.Configuration;
using System.Text;
using System.Text.Json;
using Backend.Data;
using Backend.Filters;
using Backend.Hubs;
using Backend.Models;
using Backend.Options;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
DotEnvLoader.Load(Path.Combine(builder.Environment.ContentRootPath, ".env"));

builder.Configuration["Smtp:Host"] = Environment.GetEnvironmentVariable("SMTP_HOST") ?? builder.Configuration["Smtp:Host"];
builder.Configuration["Smtp:Port"] = Environment.GetEnvironmentVariable("SMTP_PORT") ?? builder.Configuration["Smtp:Port"];
builder.Configuration["Smtp:EnableSsl"] = Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL") ?? builder.Configuration["Smtp:EnableSsl"];
builder.Configuration["Smtp:FromEmail"] = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? builder.Configuration["Smtp:FromEmail"];
builder.Configuration["Smtp:FromName"] = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? builder.Configuration["Smtp:FromName"];
builder.Configuration["Smtp:AppPassword"] = Environment.GetEnvironmentVariable("SMTP_APP_PASSWORD") ?? builder.Configuration["Smtp:AppPassword"];
builder.Configuration["ConnectionStrings:DefaultConnection"] =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

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
        npgsql.MapEnum<GenderType>("gender_type");
        npgsql.MapEnum<ShopStatus>("shop_status");
        npgsql.MapEnum<ShopType>("shop_type");
        npgsql.MapEnum<ProductStatus>("product_status");
        npgsql.MapEnum<CategoryStatus>("category_status");
        npgsql.MapEnum<OrderStatus>("order_status");
        npgsql.MapEnum<PaymentStatus>("payment_status");
        npgsql.MapEnum<VoucherDiscountType>("voucher_discount_type");
        npgsql.MapEnum<MessageType>("message_type");
        npgsql.EnableRetryOnFailure();
    }));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt options are not configured.");

if (string.IsNullOrWhiteSpace(jwtOptions.Key) || jwtOptions.Key.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken)
                    && path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddMemoryCache();

builder.Services.AddScoped<ISampleService, SampleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INotificationRealtimeService, NotificationRealtimeService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ApiExceptionFilter>();
builder.Services.AddScoped<ApiResponseWrapperFilter>();
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });



builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials();
    });
});

builder.Services.AddControllers(options =>
{
    options.Filters.AddService<ApiExceptionFilter>();
    options.Filters.AddService<ApiResponseWrapperFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors.Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value" : e.ErrorMessage).ToArray());

        var response = Backend.Contracts.ApiResponses.Validation(errors, context.HttpContext.TraceIdentifier);
        return new BadRequestObjectResult(response);
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
    var seedNow = DateTime.UtcNow;

    Console.WriteLine("🚀 [Seed] Starting database initialization...");
    try
    {
        db.Database.EnsureCreated();
        var accounts = new[]
        {
            new { Email = "admin@nt118.com", Username = "admin", Role = UserRole.admin, Password = "admin123", FullName = "System Administrator" },
            new { Email = "buyer@nt118.com", Username = "buyer", Role = UserRole.buyer, Password = "buyer123", FullName = "Default Buyer" },
            new { Email = "seller@shopeelite.com", Username = "seller", Role = UserRole.seller, Password = "seller", FullName = "Shopee Elite Seller" }
        };

        foreach (var acc in accounts)
        {
            var seedUser = db.Users.FirstOrDefault(u => u.Email == acc.Email);
            if (seedUser == null)
            {
                seedUser = new User
                {
                    Email = acc.Email,
                    Username = acc.Username,
                    Role = acc.Role,
                    Status = UserStatus.active,
                    CreatedAt = seedNow,
                    UpdatedAt = seedNow
                };
                seedUser.PasswordHash = hasher.HashPassword(seedUser, acc.Password);
                db.Users.Add(seedUser);
                db.SaveChanges();

                db.UserProfiles.Add(new UserProfile
                {
                    UserId = seedUser.Id,
                    FullName = acc.FullName,
                    CreatedAt = seedNow,
                    UpdatedAt = seedNow,
                });
                db.SaveChanges();
            }
        }
    }
    catch (Exception ex)
    {
        if (ex.InnerException != null)
        {
            Console.WriteLine($"🔍 [Seed] Inner Error: {ex.InnerException.Message}");
        }
    }

    // Create enums if they don't exist
    db.Database.ExecuteSqlRaw(@"
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE shop_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Ensure 'pending' value exists in shop_status enum (for existing databases)
        DO $$ BEGIN
            ALTER TYPE shop_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE shop_type AS ENUM ('individual', 'business');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Ensure 'deleted' value exists in product_status enum
        DO $$ BEGIN
            ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'deleted';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE category_status AS ENUM ('active', 'inactive');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'refunded');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE voucher_discount_type AS ENUM ('percentage', 'fixed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'product');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS password_reset_code_expires TIMESTAMP;

        ALTER TABLE user_addresses
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS poi_name VARCHAR(200),
            ADD COLUMN IF NOT EXISTS formatted_address VARCHAR(500);

        ALTER TABLE shops
            ADD COLUMN IF NOT EXISTS pickup_address VARCHAR(500),
            ADD COLUMN IF NOT EXISTS type shop_type DEFAULT 'individual';
    ");

    // Apply pending migrations only if the database is already managed by EF migrations.
    // If the DB was created from init.sql (no __EFMigrationsHistory), running Migrate() can fail
    // with PendingModelChangesWarning.
    try
    {
        var hasHistory = db.Database.SqlQueryRaw<bool>("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '__EFMigrationsHistory')").AsEnumerable().FirstOrDefault();
        if (hasHistory)
        {
            db.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration skipped/failed: {ex.Message}");
    }

    // Ensure addresses table exists (fallback when DB was created before Address entity was added)
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS addresses (
            code VARCHAR(20) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            name_en VARCHAR(255) NOT NULL DEFAULT '',
            full_name VARCHAR(255) NOT NULL,
            full_name_en VARCHAR(255) NOT NULL DEFAULT '',
            code_name VARCHAR(255) NOT NULL DEFAULT '',
            parent_code VARCHAR(20),
            level INTEGER NOT NULL
        );
    ");

    // Normalize legacy NULL values (e.g. inserted by seed_address.js) to avoid InvalidCastException
    db.Database.ExecuteSqlRaw(@"
        UPDATE addresses
        SET
            name_en = COALESCE(name_en, ''),
            full_name_en = COALESCE(full_name_en, ''),
            code_name = COALESCE(code_name, '')
        WHERE name_en IS NULL OR full_name_en IS NULL OR code_name IS NULL;

        ALTER TABLE addresses
            ALTER COLUMN name_en SET DEFAULT '',
            ALTER COLUMN full_name_en SET DEFAULT '',
            ALTER COLUMN code_name SET DEFAULT '';
    ");

    // Seed address data if empty
    try
    {
        if (!db.Addresses.Any())
        {
            var jsonPath = Path.Combine(builder.Environment.ContentRootPath, "data.json");
            if (File.Exists(jsonPath))
            {
                var json = File.ReadAllText(jsonPath);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                var batch = new List<Address>();
                int count = 0;

                foreach (var level1 in root.EnumerateArray())
                {
                    var code1 = level1.GetProperty("level1_id").GetString()!;
                    var name1 = level1.GetProperty("name").GetString()!;
                    batch.Add(new Address { Code = code1, Name = name1, FullName = name1, CodeName = Slugify(name1), ParentCode = null, Level = 1, NameEn = "", FullNameEn = "" });
                    count++;

                    if (level1.TryGetProperty("level2s", out var level2s))
                    {
                        foreach (var level2 in level2s.EnumerateArray())
                        {
                            var code2 = level2.GetProperty("level2_id").GetString()!;
                            var name2 = level2.GetProperty("name").GetString()!;
                            batch.Add(new Address { Code = code2, Name = name2, FullName = name2, CodeName = Slugify(name2), ParentCode = code1, Level = 2, NameEn = "", FullNameEn = "" });
                            count++;

                            if (level2.TryGetProperty("level3s", out var level3s))
                            {
                                foreach (var level3 in level3s.EnumerateArray())
                                {
                                    var code3 = level3.GetProperty("level3_id").GetString()!;
                                    var name3 = level3.GetProperty("name").GetString()!;
                                    batch.Add(new Address { Code = code3, Name = name3, FullName = name3, CodeName = Slugify(name3), ParentCode = code2, Level = 3, NameEn = "", FullNameEn = "" });
                                    count++;

                                    if (batch.Count >= 500)
                                    {
                                        db.Addresses.AddRange(batch);
                                        db.SaveChanges();
                                        batch.Clear();
                                    }
                                }
                            }
                        }
                    }
                }

                if (batch.Count > 0)
                {
                    db.Addresses.AddRange(batch);
                    db.SaveChanges();
                }

                Console.WriteLine($"✅ [Seed] Successfully seeded {count} address rows.");
            }
            else
            {
                Console.WriteLine("⚠️ [Seed] WARNING: data.json not found, address table is empty");
            }
        }
        else
        {
            Console.WriteLine("ℹ️ [Seed] Addresses already seeded, skipping.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ [Seed] Error seeding address data: {ex.Message}");
    }

    // Ensure shops table has required columns
    db.Database.ExecuteSqlRaw(@"
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='business_hours') THEN
                ALTER TABLE shops ADD COLUMN business_hours VARCHAR(200);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='pickup_address') THEN
                ALTER TABLE shops ADD COLUMN pickup_address VARCHAR(500);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='type') THEN
                ALTER TABLE shops ADD COLUMN type VARCHAR(20) DEFAULT 'individual';
            END IF;
        END $$;
    ");

    // Seed a default shop for the seller account if missing
    try
    {
        var sellerUser = db.Users.FirstOrDefault(u => u.Email == "seller@shopeelite.com");
        if (sellerUser != null && !db.Shops.Any(s => s.OwnerId == sellerUser.Id))
        {
            var now = DateTime.Now;
                db.Shops.Add(new Shop
                {
                    OwnerId = sellerUser.Id,
                    Name = "Shopee Elite Store",
                    Slug = "shopee-elite-store",
                    Description = "Cửa hàng bán lẻ uy tín hàng đầu, chuyên cung cấp các sản phẩm chất lượng.",
                    Status = ShopStatus.active,
                    Type = ShopType.individual,
                    IsVerified = true,
                    CreatedAt = now,
                    UpdatedAt = now,
                    BusinessHours = "08:00 - 22:00",
                    PickupAddress = "123 Đường ABC, Quận 1, TP. HCM",
                    Email = "seller@shopeelite.com",
                    Phone = "0901234567"
                });
            db.SaveChanges();
            Console.WriteLine("✅ Seeded default shop for seller@shopeelite.com");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding shop: {ex.Message}");
    }

    // Create wishlist tables if they don't exist
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS favorites (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id)
        );
        CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS wishlist_collections (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_wishlist_collections_user ON wishlist_collections(user_id);

        CREATE TABLE IF NOT EXISTS wishlist_collection_items (
            id BIGSERIAL PRIMARY KEY,
            collection_id BIGINT NOT NULL REFERENCES wishlist_collections(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(collection_id, product_id)
        );
        CREATE INDEX IF NOT EXISTS idx_wishlist_collection_items_collection ON wishlist_collection_items(collection_id);
    ");
}

app.UseStaticFiles();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

// ── Health check endpoint (used by Docker HEALTHCHECK & Azure probes) ──
app.MapGet("/health", async (AppDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new
        {
            status = canConnect ? "healthy" : "degraded",
            database = canConnect ? "connected" : "disconnected",
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Ok(new
        {
            status = "degraded",
            database = "error",
            error = ex.Message,
            timestamp = DateTime.UtcNow
        });
    }
});

app.Run("http://0.0.0.0:5058");

static string Slugify(string input)
{
    var s = (input ?? "").Trim().ToLowerInvariant();
    s = s.Normalize(NormalizationForm.FormD);
    var sb = new StringBuilder();
    foreach (var c in s)
    {
        if (char.GetUnicodeCategory(c) == System.Globalization.UnicodeCategory.NonSpacingMark) continue;
        sb.Append(c);
    }
    s = sb.ToString().Replace('đ', 'd');
    s = System.Text.RegularExpressions.Regex.Replace(s, "[^a-z0-9]+", "_");
    return s.Trim('_');
}
