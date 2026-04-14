# 📦 Database - Hướng dẫn Seed dữ liệu sản phẩm

## Tổng quan

Folder này chứa:

| File | Mô tả |
|------|--------|
| `init.sql` | Schema đầy đủ PostgreSQL (27 bảng) |
| `gearvn_products_transformed.csv` | Dữ liệu 3,955 sản phẩm từ GearVN |
| `seed_products.py` | Script Python tự động transform CSV → PostgreSQL |

---

## 🚀 Hướng dẫn từng bước

### Bước 1: Cài đặt PostgreSQL

Đảm bảo PostgreSQL đã chạy trên máy.

- **Mặc định:** `localhost:5432`
- **Database:** `nt118`
- **Username:** `postgres`
- **Password:** `postgres`

> Nếu thông tin khác, sửa biến `DB_CONFIG` trong `seed_products.py` (dòng 18-24).

### Bước 2: Tạo database (nếu chưa có)

Mở terminal (`psql` hoặc pgAdmin) và chạy:

```sql
CREATE DATABASE nt118;
```

### Bước 3: Chạy schema

Chạy file `init.sql` để tạo toàn bộ bảng:

```bash
psql -U postgres -d nt118 -f init.sql
```

> ⚠️ **Lưu ý:** `init.sql` sẽ DROP toàn bộ TYPE cũ rồi tạo lại. Chỉ chạy khi init lần đầu hoặc muốn reset DB.

### Bước 4: Cài thư viện Python

```bash
pip install psycopg2-binary pandas numpy
```

### Bước 5: Chạy seed script

```bash
cd database
python seed_products.py
```

Trên **Windows** nếu gặp lỗi Unicode:

```powershell
$env:PYTHONIOENCODING="utf-8"; python seed_products.py
```

### Bước 6: Kiểm tra kết quả

Sau khi chạy xong, output sẽ hiển thị:

```
============================================================
  ShopeeLite Product Seeder
============================================================

[1/6] Reading CSV
[2/6] Cleaning and transforming data...
[3/6] Connecting to PostgreSQL...
[4/6] Creating tables if not exist...
[5/6] Seeding categories and default shop...
[6/6] Inserting 3949 products...

============================================================
  ✅ DONE!
  → Products inserted: 3949
  → Images inserted:   3949
  → Categories:        20
============================================================
```

Kiểm tra bằng SQL:

```sql
SELECT COUNT(*) FROM products;       -- 3949
SELECT COUNT(*) FROM categories;     -- 20
SELECT COUNT(*) FROM product_images; -- 3949
SELECT COUNT(*) FROM shops;          -- 1
```

---

## 📊 Dữ liệu được transform như thế nào?

### Mapping: CSV → Database

| Cột CSV | Cột DB | Ghi chú |
|---------|--------|---------|
| `title` | `products.name` | Tên sản phẩm |
| `id` | — | Dùng tạo slug duy nhất |
| `brand` | `products.brand` | Thương hiệu (nullable) |
| `image` | `product_images.image_url` | Ảnh chính (`is_main = true`) |
| `originalPrice` | `products.original_price` | Giá gốc |
| `salePrice` | `products.price` | Giá bán |
| `rating` | `products.rating` | Clip trong [0, 5] |
| `reviewCount` | `products.total_reviews` | Số lượt đánh giá |
| `description` | `products.description` | Mô tả sản phẩm |
| `thumbnails` | `product_images` | Parse từ list string |
| `detailImage` | `product_images` | Ảnh detail (sort_order = 1) |

### Các field tự sinh bằng `numpy`

Những field này **không có trong CSV**, được tạo tự động:

| Field | Logic |
|-------|-------|
| `stock_quantity` | `random(10, 500)` |
| `sold_quantity` | `reviewCount × random(2, 8)` |
| `weight_grams` | `random(200, 5000)` |
| `dimensions` | `WxHxD` random (cm) |
| `slug` | Slugify từ title + id |
| `category_id` | Auto-detect từ title bằng keyword matching |

### 20 Categories tự động phát hiện

```
Bàn phím (553), Laptop (437), Màn hình (414), Khác (381),
Chuột (358), Vỏ máy tính (240), Tai nghe (227),
Bo mạch chủ (211), Tản nhiệt (205), Phụ kiện (192),
RAM (126), Ổ cứng & SSD (117), Nguồn máy tính (104),
CPU (104), Loa (87), Quạt máy tính (80),
PC - Máy tính bàn (57), Tay cầm (37),
Card màn hình (11), Gaming Gear (8)
```

---

## 🔌 API Endpoints (Backend .NET)

Sau khi seed xong, backend cần restart (`dotnet run` trong folder `backend`).

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/products?page=1&pageSize=20` | Danh sách sản phẩm (phân trang) |
| `GET` | `/api/products/{id}` | Chi tiết sản phẩm |
| `GET` | `/api/products/featured?limit=10` | Sản phẩm nổi bật |

**Query params cho `/api/products`:**

| Param | Type | Mô tả |
|-------|------|--------|
| `page` | int | Trang (mặc định 1) |
| `pageSize` | int | Số item/trang (mặc định 20) |
| `category` | long | Filter theo category ID |
| `search` | string | Tìm theo tên (ILIKE) |
| `brand` | string | Filter theo brand |
| `sort` | string | `newest`, `price_asc`, `price_desc`, `rating`, `popular` |

---

## 🔄 Chạy lại / Reset dữ liệu

Script seed tự động **xóa toàn bộ dữ liệu cũ** trước khi insert mới. Chỉ cần chạy lại:

```bash
python seed_products.py
```

---

## ❗ Troubleshooting

| Lỗi | Cách fix |
|------|----------|
| `UnicodeEncodeError` | Dùng `$env:PYTHONIOENCODING="utf-8"` trên Windows |
| `connection refused` | Kiểm tra PostgreSQL đã chạy trên port 5432 |
| `database "nt118" does not exist` | Tạo DB: `CREATE DATABASE nt118;` |
| `column "brand" does not exist` | Script tự thêm column, hoặc chạy lại `init.sql` |
| `psycopg2 not found` | `pip install psycopg2-binary` |
