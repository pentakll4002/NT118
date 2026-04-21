using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<SampleItem> SampleItems => Set<SampleItem>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ViewHistory> ViewHistories => Set<ViewHistory>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<UserVoucher> UserVouchers => Set<UserVoucher>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<WishlistCollection> WishlistCollections => Set<WishlistCollection>();
    public DbSet<WishlistCollectionItem> WishlistCollectionItems => Set<WishlistCollectionItem>();
    public DbSet<Address> Addresses => Set<Address>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(e =>
        {
            e.ToTable("addresses");
            e.HasKey(x => x.Code);
            e.Property(x => x.Code).HasColumnName("code").HasMaxLength(20);
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(255);
            e.Property(x => x.NameEn).HasColumnName("name_en").HasMaxLength(255);
            e.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(255);
            e.Property(x => x.FullNameEn).HasColumnName("full_name_en").HasMaxLength(255);
            e.Property(x => x.CodeName).HasColumnName("code_name").HasMaxLength(255);
            e.Property(x => x.ParentCode).HasColumnName("parent_code").HasMaxLength(20);
            e.Property(x => x.Level).HasColumnName("level");
        });
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(x => x.Role).HasColumnName("role");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.Property(x => x.PasswordResetCode).HasColumnName("password_reset_code").HasMaxLength(20);
            e.Property(x => x.PasswordResetCodeExpires).HasColumnName("password_reset_code_expires");
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.Username).IsUnique();

            e.HasOne(x => x.Profile)
                .WithOne(x => x.User)
                .HasForeignKey<UserProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(x => x.Addresses)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserProfile>(e =>
        {
            e.ToTable("user_profiles");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
            e.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(100);
            e.Property(x => x.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(500);
            e.Property(x => x.DateOfBirth).HasColumnName("date_of_birth");
            e.Property(x => x.Gender).HasColumnName("gender");
            e.Property(x => x.Bio).HasColumnName("bio");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.UserId).IsUnique();
        });

        modelBuilder.Entity<UserAddress>(e =>
        {
            e.ToTable("user_addresses");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
            e.Property(x => x.RecipientName).HasColumnName("recipient_name").HasMaxLength(100).IsRequired();
            e.Property(x => x.RecipientPhone).HasColumnName("recipient_phone").HasMaxLength(20).IsRequired();
            e.Property(x => x.Province).HasColumnName("province").HasMaxLength(50).IsRequired();
            e.Property(x => x.District).HasColumnName("district").HasMaxLength(50).IsRequired();
            e.Property(x => x.Ward).HasColumnName("ward").HasMaxLength(50).IsRequired();
            e.Property(x => x.StreetAddress).HasColumnName("street_address").IsRequired();
            e.Property(x => x.Latitude).HasColumnName("latitude");
            e.Property(x => x.Longitude).HasColumnName("longitude");
            e.Property(x => x.PoiName).HasColumnName("poi_name").HasMaxLength(200);
            e.Property(x => x.FormattedAddress).HasColumnName("formatted_address").HasMaxLength(500);
            e.Property(x => x.IsDefault).HasColumnName("is_default");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => new { x.UserId, x.IsDefault })
                .HasFilter("is_default = true")
                .IsUnique();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.ParentId).HasColumnName("parent_id");
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Shop>(e =>
        {
            e.ToTable("shops");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OwnerId).HasColumnName("owner_id").IsRequired();
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.LogoUrl).HasColumnName("logo_url").HasMaxLength(500);
            e.Property(x => x.CoverImageUrl).HasColumnName("cover_image_url").HasMaxLength(500);
            e.Property(x => x.Address).HasColumnName("address");
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100);
            e.Property(x => x.Rating).HasColumnName("rating");
            e.Property(x => x.TotalReviews).HasColumnName("total_reviews");
            e.Property(x => x.TotalProducts).HasColumnName("total_products");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.IsVerified).HasColumnName("is_verified");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ShopId).HasColumnName("shop_id").IsRequired();
            e.Property(x => x.CategoryId).HasColumnName("category_id").IsRequired();
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(255).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Price).HasColumnName("price");
            e.Property(x => x.OriginalPrice).HasColumnName("original_price");
            e.Property(x => x.StockQuantity).HasColumnName("stock_quantity");
            e.Property(x => x.SoldQuantity).HasColumnName("sold_quantity");
            e.Property(x => x.Rating).HasColumnName("rating");
            e.Property(x => x.TotalReviews).HasColumnName("total_reviews");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();

            e.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Shop)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.ShopId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductImage>(e =>
        {
            e.ToTable("product_images");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
            e.Property(x => x.AltText).HasColumnName("alt_text").HasMaxLength(255);
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsMain).HasColumnName("is_main");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Product)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductVariant>(e =>
        {
            e.ToTable("product_variants");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Value).HasColumnName("value").HasMaxLength(100).IsRequired();
            e.Property(x => x.PriceModifier).HasColumnName("price_modifier");
            e.Property(x => x.StockQuantity).HasColumnName("stock_quantity");
            e.Property(x => x.Sku).HasColumnName("sku").HasMaxLength(100);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");

            e.HasOne(x => x.Product)
                .WithMany(x => x.Variants)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ViewHistory>(e =>
        {
            e.ToTable("view_history");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
            e.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(x => x.ViewedAt).HasColumnName("viewed_at");

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product)
                .WithMany(x => x.ViewHistories)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.ToTable("cart_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
            e.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(x => x.VariantId).HasColumnName("variant_id");
            e.Property(x => x.Quantity).HasColumnName("quantity").IsRequired();
            e.Property(x => x.AddedAt).HasColumnName("added_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Variant)
                .WithMany()
                .HasForeignKey(x => x.VariantId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OrderNumber).HasColumnName("order_number").HasMaxLength(50).IsRequired();
            e.Property(x => x.BuyerId).HasColumnName("buyer_id").IsRequired();
            e.Property(x => x.ShopId).HasColumnName("shop_id").IsRequired();
            e.Property(x => x.ShippingAddressId).HasColumnName("shipping_address_id").IsRequired();
            e.Property(x => x.VoucherId).HasColumnName("voucher_id");
            e.Property(x => x.ShopVoucherId).HasColumnName("shop_voucher_id");
            e.Property(x => x.Subtotal).HasColumnName("subtotal");
            e.Property(x => x.ShippingFee).HasColumnName("shipping_fee");
            e.Property(x => x.DiscountAmount).HasColumnName("discount_amount");
            e.Property(x => x.TotalAmount).HasColumnName("total_amount");
            e.Property(x => x.PaymentMethod).HasColumnName("payment_method").HasMaxLength(50);
            e.Property(x => x.PaymentStatus).HasColumnName("payment_status");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.Notes).HasColumnName("notes");
            e.Property(x => x.OrderedAt).HasColumnName("ordered_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.OrderNumber).IsUnique();

            e.HasOne(x => x.Buyer)
                .WithMany()
                .HasForeignKey(x => x.BuyerId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Shop)
                .WithMany()
                .HasForeignKey(x => x.ShopId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.ToTable("reviews");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OrderId).HasColumnName("order_id").IsRequired();
            e.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(x => x.ReviewerId).HasColumnName("reviewer_id").IsRequired();
            e.Property(x => x.Rating).HasColumnName("rating").IsRequired();
            e.Property(x => x.Comment).HasColumnName("comment");
            e.Property(x => x.IsVerified).HasColumnName("is_verified");
            e.Property(x => x.HelpfulVotes).HasColumnName("helpful_votes");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Reviewer)
                .WithMany()
                .HasForeignKey(x => x.ReviewerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SampleItem>(e =>
        {
            e.ToTable("sample_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.ParentId).HasColumnName("parent_id");
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Shop>(e =>
        {
            e.ToTable("shops");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OwnerId).HasColumnName("owner_id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.LogoUrl).HasColumnName("logo_url").HasMaxLength(500);
            e.Property(x => x.CoverImageUrl).HasColumnName("cover_image_url").HasMaxLength(500);
            e.Property(x => x.Address).HasColumnName("address");
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100);
            e.Property(x => x.Rating).HasColumnName("rating").HasPrecision(3, 2);
            e.Property(x => x.TotalReviews).HasColumnName("total_reviews");
            e.Property(x => x.TotalProducts).HasColumnName("total_products");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20);
            e.Property(x => x.IsVerified).HasColumnName("is_verified");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ShopId).HasColumnName("shop_id");
            e.Property(x => x.CategoryId).HasColumnName("category_id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(255).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Price).HasColumnName("price").HasPrecision(15, 2);
            e.Property(x => x.OriginalPrice).HasColumnName("original_price").HasPrecision(15, 2);
            e.Property(x => x.StockQuantity).HasColumnName("stock_quantity");
            e.Property(x => x.SoldQuantity).HasColumnName("sold_quantity");
            e.Property(x => x.Rating).HasColumnName("rating").HasPrecision(3, 2);
            e.Property(x => x.TotalReviews).HasColumnName("total_reviews");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20);
            e.Property(x => x.WeightGrams).HasColumnName("weight_grams");
            e.Property(x => x.Dimensions).HasColumnName("dimensions").HasMaxLength(50);
            e.Property(x => x.Brand).HasColumnName("brand").HasMaxLength(100);
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasMany(x => x.Images).WithOne(x => x.Product).HasForeignKey(x => x.ProductId);
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<ProductImage>(e =>
        {
            e.ToTable("product_images");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
            e.Property(x => x.AltText).HasColumnName("alt_text").HasMaxLength(255);
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsMain).HasColumnName("is_main");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Favorite>(e =>
        {
            e.ToTable("favorites");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        });

        modelBuilder.Entity<WishlistCollection>(e =>
        {
            e.ToTable("wishlist_collections");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasMany(x => x.Items).WithOne(x => x.Collection).HasForeignKey(x => x.CollectionId);
        });

        modelBuilder.Entity<WishlistCollectionItem>(e =>
        {
            e.ToTable("wishlist_collection_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CollectionId).HasColumnName("collection_id");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.AddedAt).HasColumnName("added_at");
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
            e.HasIndex(x => new { x.CollectionId, x.ProductId }).IsUnique();
        });
    }
}
