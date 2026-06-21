#!/usr/bin/env python3
"""Seed products from gearvn_products_transformed.csv into PostgreSQL."""

import argparse
import ast
import csv
import json
import os
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Iterable, List, Sequence, Tuple

import psycopg2
from psycopg2.extras import execute_values


DEFAULT_CSV_FILE = "gearvn_products_transformed.csv"
DEFAULT_JSON_FILE = "data.json"


CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "laptop": ["laptop", "notebook", "macbook", "legion", "thinkbook", "vivobook"],
    "pc-may-tinh-ban": ["pc ", "may tinh", "desktop", "workstation", "mini pc"],
    "man-hinh": ["man hinh", "monitor", "display", "hz", "oled", "ips"],
    "chuot": ["chuot", "mouse"],
    "ban-phim": ["ban phim", "keyboard"],
    "tai-nghe": ["tai nghe", "headset", "earbuds", "in-ear"],
    "loa": ["loa", "speaker", "soundbar"],
    "tay-cam": ["tay cam", "controller", "gamepad", "joystick"],
    "cpu": ["cpu", "ryzen", "intel core", "processor"],
    "card-man-hinh": ["vga", "rtx", "radeon", "card man hinh", "graphics card"],
    "bo-mach-chu": ["mainboard", "bo mach chu", "motherboard", "z790", "b760"],
    "ram": ["ram", "ddr4", "ddr5"],
    "o-cung-va-ssd": ["ssd", "hdd", "o cung", "nvme"],
    "nguon-may-tinh": ["psu", "nguon", "power supply"],
    "tan-nhiet": ["tan nhiet", "cooler", "heatsink", "aio", "liquid"],
    "vo-may-tinh": ["case", "vo may", "chassis"],
    "quat-may-tinh": ["fan", "quat", "argb fan"],
    "gaming-gear": ["gaming gear", "gear"],
    "phu-kien": ["phu kien", "adapter", "dock", "hub", "cable", "sac"],
    "khac": [],
}

CATEGORY_DISPLAY_NAMES: Dict[str, str] = {
    "laptop": "Laptop",
    "pc-may-tinh-ban": "PC - May tinh ban",
    "man-hinh": "Man hinh",
    "chuot": "Chuot",
    "ban-phim": "Ban phim",
    "tai-nghe": "Tai nghe",
    "loa": "Loa",
    "tay-cam": "Tay cam",
    "cpu": "CPU",
    "card-man-hinh": "Card man hinh",
    "bo-mach-chu": "Bo mach chu",
    "ram": "RAM",
    "o-cung-va-ssd": "O cung va SSD",
    "nguon-may-tinh": "Nguon may tinh",
    "tan-nhiet": "Tan nhiet",
    "vo-may-tinh": "Vo may tinh",
    "quat-may-tinh": "Quat may tinh",
    "gaming-gear": "Gaming Gear",
    "phu-kien": "Phu kien",
    "khac": "Khac",
}


@dataclass
class DbConfig:
    host: str
    port: int
    database: str
    user: str
    password: str


@dataclass
class ProductRow:
    external_id: str
    name: str
    slug: str
    description: str
    brand: str
    price: float
    original_price: float
    rating: float
    total_reviews: int
    stock_quantity: int
    sold_quantity: int
    weight_grams: int
    dimensions: str
    category_slug: str
    image_urls: List[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed products CSV & address JSON to PostgreSQL")
    parser.add_argument("--csv", default=DEFAULT_CSV_FILE, help="Path to CSV file")
    parser.add_argument("--json", default=DEFAULT_JSON_FILE, help="Path to address JSON file")
    parser.add_argument("--host", default=os.getenv("DB_HOST", "localhost"))
    parser.add_argument("--port", type=int, default=int(os.getenv("DB_PORT", "5432")))
    parser.add_argument("--database", default=os.getenv("DB_NAME", "nt118"))
    parser.add_argument("--user", default=os.getenv("DB_USER", "postgres"))
    parser.add_argument("--password", default=os.getenv("DB_PASSWORD", "postgres"))
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate products/product_images before inserting",
    )
    parser.add_argument(
        "--skip-address",
        action="store_true",
        help="Skip seeding addresses from JSON",
    )
    parser.add_argument(
        "--skip-products",
        action="store_true",
        help="Skip seeding products from CSV",
    )
    return parser.parse_args()


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug or "item"


def to_float(value: str, fallback: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def to_int(value: str, fallback: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return fallback


def clamp_rating(value: float) -> float:
    return max(0.0, min(5.0, value))


def parse_thumbnail_list(raw_value: str) -> List[str]:
    if not raw_value:
        return []
    try:
        parsed = ast.literal_eval(raw_value)
        if isinstance(parsed, list):
            return [str(url).strip() for url in parsed if str(url).strip()]
    except (ValueError, SyntaxError):
        pass
    return []


def detect_category_slug(product_name: str) -> str:
    text = slugify(product_name).replace("-", " ")
    for slug, keywords in CATEGORY_KEYWORDS.items():
        if slug == "khac":
            continue
        if any(keyword in text for keyword in keywords):
            return slug
    return "khac"


def derive_stock_quantity(review_count: int, sale_price: float) -> int:
    if sale_price <= 0:
        return 100
    base = 50 + min(review_count, 500)
    return max(10, min(base, 1000))


def derive_sold_quantity(review_count: int) -> int:
    return max(review_count * 3, 0)


def derive_weight_grams(product_name: str) -> int:
    name = product_name.lower()
    if "laptop" in name:
        return 1800
    if "man hinh" in slugify(name).replace("-", " "):
        return 4500
    if "chuot" in slugify(name).replace("-", " "):
        return 200
    if "ban phim" in slugify(name).replace("-", " "):
        return 900
    return 1200


def derive_dimensions(weight_grams: int) -> str:
    if weight_grams >= 4000:
        return "60x40x20"
    if weight_grams >= 1500:
        return "40x30x15"
    if weight_grams >= 600:
        return "30x20x10"
    return "20x15x8"


def iter_csv_rows(csv_path: str) -> Iterable[dict]:
    with open(csv_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row


def transform_rows(csv_path: str) -> List[ProductRow]:
    products: List[ProductRow] = []
    seen_slugs = set()

    for row in iter_csv_rows(csv_path):
        name = (row.get("title") or "").strip()
        external_id = (row.get("id") or "").strip()
        if not name or not external_id:
            continue

        base_slug = slugify(name)
        slug = f"{base_slug}-{external_id}"
        if slug in seen_slugs:
            slug = f"{slug}-{len(seen_slugs)}"
        seen_slugs.add(slug)

        sale_price = to_float(row.get("salePrice"), 0.0)
        if sale_price <= 0:
            continue

        original_price = to_float(row.get("originalPrice"), sale_price)
        rating = clamp_rating(to_float(row.get("rating"), 0.0))
        review_count = max(0, to_int(row.get("reviewCount"), 0))

        main_image = (row.get("image") or "").strip()
        detail_image = (row.get("detailImage") or "").strip()
        thumbnails = parse_thumbnail_list(row.get("thumbnails") or "")

        image_urls: List[str] = []
        for url in [main_image, detail_image, *thumbnails]:
            if url and url not in image_urls:
                image_urls.append(url)

        stock_quantity = derive_stock_quantity(review_count, sale_price)
        sold_quantity = derive_sold_quantity(review_count)
        weight_grams = derive_weight_grams(name)

        products.append(
            ProductRow(
                external_id=external_id,
                name=name,
                slug=slug,
                description=(row.get("description") or "").strip() or "Dang cap nhat mo ta.",
                brand=(row.get("brand") or "Khac").strip()[:100],
                price=max(sale_price, 0.0),
                original_price=max(original_price, 0.0),
                rating=rating,
                total_reviews=review_count,
                stock_quantity=stock_quantity,
                sold_quantity=sold_quantity,
                weight_grams=weight_grams,
                dimensions=derive_dimensions(weight_grams),
                category_slug=detect_category_slug(name),
                image_urls=image_urls,
            )
        )

    return products


def ensure_seller_and_shop(cur) -> int:
    cur.execute(
        "SELECT id FROM users WHERE email = %s OR username = %s;",
        ("gearvn.seller@nt118.local", "gearvn_store")
    )
    row = cur.fetchone()
    if row:
        seller_id = row[0]
        cur.execute(
            """
            UPDATE users 
            SET username = %s, email = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
            """,
            ("gearvn_store", "gearvn.seller@nt118.local", seller_id)
        )
    else:
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'seller'::user_role, 'active'::user_status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id;
            """,
            (
                "gearvn_store",
                "gearvn.seller@nt118.local",
                "$2a$12$placeholder.hash.for.seeding.only",
            ),
        )
        seller_id = cur.fetchone()[0]

    cur.execute(
        """
        INSERT INTO shops (owner_id, name, slug, description, type, status, is_verified, created_at, updated_at, rating, total_reviews, total_products)
        VALUES (%s, %s, %s, %s, 'individual', 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0.0, 0, 0)
        ON CONFLICT (slug)
        DO UPDATE SET owner_id = EXCLUDED.owner_id, name = EXCLUDED.name
        RETURNING id;
        """,
        (
            seller_id,
            "GEARVN Official",
            "gearvn-official",
            "Default shop for imported GearVN products.",
        ),
    )
    shop_id = cur.fetchone()[0]
    return shop_id


def ensure_categories(cur, category_slugs: Sequence[str]) -> Dict[str, int]:
    now = datetime.utcnow()
    category_rows = [
        (
            CATEGORY_DISPLAY_NAMES.get(slug, slug.replace("-", " ").title()),
            slug,
            None,
            0,
            "active",
            now,
            now,
        )
        for slug in sorted(set(category_slugs))
    ]

    execute_values(
        cur,
        """
        INSERT INTO categories (name, slug, description, sort_order, status, created_at, updated_at)
        VALUES %s
        ON CONFLICT (slug)
        DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;
        """,
        category_rows,
    )

    cur.execute(
        "SELECT id, slug FROM categories WHERE slug = ANY(%s)",
        (list(sorted(set(category_slugs))),),
    )
    return {slug: category_id for category_id, slug in cur.fetchall()}


def truncate_product_tables(cur) -> None:
    cur.execute("TRUNCATE TABLE product_images, products RESTART IDENTITY CASCADE;")


def insert_products(cur, products: Sequence[ProductRow], shop_id: int, category_ids: Dict[str, int]) -> Dict[str, int]:
    now = datetime.utcnow()
    rows = [
        (
            shop_id,
            category_ids[p.category_slug],
            p.name,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.stock_quantity,
            p.sold_quantity,
            p.rating,
            p.total_reviews,
            "active",
            p.weight_grams,
            p.dimensions,
            p.brand,
            now,
            now,
        )
        for p in products
    ]

    execute_values(
        cur,
        """
        INSERT INTO products (
            shop_id, category_id, name, slug, description,
            price, original_price, stock_quantity, sold_quantity,
            rating, total_reviews, status, weight_grams, dimensions,
            brand, created_at, updated_at
        ) VALUES %s
        ON CONFLICT (slug)
        DO UPDATE SET
            shop_id = EXCLUDED.shop_id,
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            original_price = EXCLUDED.original_price,
            stock_quantity = EXCLUDED.stock_quantity,
            sold_quantity = EXCLUDED.sold_quantity,
            rating = EXCLUDED.rating,
            total_reviews = EXCLUDED.total_reviews,
            status = EXCLUDED.status,
            weight_grams = EXCLUDED.weight_grams,
            dimensions = EXCLUDED.dimensions,
            brand = EXCLUDED.brand,
            updated_at = EXCLUDED.updated_at;
        """,
        rows,
        page_size=500,
    )

    slugs = [p.slug for p in products]
    cur.execute("SELECT id, slug FROM products WHERE slug = ANY(%s)", (slugs,))
    return {slug: product_id for product_id, slug in cur.fetchall()}


def replace_product_images(cur, products: Sequence[ProductRow], product_ids: Dict[str, int]) -> int:
    if not products:
        return 0

    ids = [product_ids[p.slug] for p in products if p.slug in product_ids]
    if ids:
        cur.execute("DELETE FROM product_images WHERE product_id = ANY(%s)", (ids,))

    rows: List[Tuple[int, str, str, int, bool, datetime]] = []
    now = datetime.utcnow()

    for p in products:
        product_id = product_ids.get(p.slug)
        if not product_id:
            continue

        for idx, image_url in enumerate(p.image_urls):
            rows.append(
                (
                    product_id,
                    image_url,
                    p.name[:255],
                    idx,
                    idx == 0,
                    now,
                )
            )

    if rows:
        execute_values(
            cur,
            """
            INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_main, created_at)
            VALUES %s
            """,
            rows,
            page_size=1000,
        )

    return len(rows)


def slugify_address(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", ascii_text.lower()).strip("_")
    return slug or "item"


def iter_address_rows(json_path: str) -> List[Tuple[str, str, str, str, str, str, str | None, int]]:
    with open(json_path, "r", encoding="utf-8") as f:
        data: List[Dict[str, Any]] = json.load(f)

    rows: List[Tuple[str, str, str, str, str, str, str | None, int]] = []
    for level1 in data:
        code1 = (level1.get("level1_id") or "").strip()
        name1 = (level1.get("name") or "").strip()
        if code1 and name1:
            code_name1 = slugify_address(name1)
            rows.append((code1, name1, "", name1, "", code_name1, None, 1))

        level2s = level1.get("level2s") or []
        for level2 in level2s:
            code2 = (level2.get("level2_id") or "").strip()
            name2 = (level2.get("name") or "").strip()
            if code2 and name2:
                code_name2 = slugify_address(name2)
                rows.append((code2, name2, "", name2, "", code_name2, code1 or None, 2))

            level3s = level2.get("level3s") or []
            for level3 in level3s:
                code3 = (level3.get("level3_id") or "").strip()
                name3 = (level3.get("name") or "").strip()
                if code3 and name3:
                    code_name3 = slugify_address(name3)
                    rows.append((code3, name3, "", name3, "", code_name3, code2 or None, 3))

    return rows


def insert_addresses(cur, rows: Sequence[Tuple[str, str, str, str, str, str, str | None, int]]) -> int:
    if not rows:
        return 0

    execute_values(
        cur,
        """
        INSERT INTO addresses (code, name, name_en, full_name, full_name_en, code_name, parent_code, level)
        VALUES %s
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            name_en = EXCLUDED.name_en,
            full_name = EXCLUDED.full_name,
            full_name_en = EXCLUDED.full_name_en,
            code_name = EXCLUDED.code_name,
            parent_code = EXCLUDED.parent_code,
            level = EXCLUDED.level;
        """,
        rows,
        page_size=500,
    )
    return len(rows)


def run_seed(db: DbConfig, csv_path: str, json_path: str | None, truncate: bool, skip_address: bool, skip_products: bool) -> None:
    conn = psycopg2.connect(
        host=db.host,
        port=db.port,
        dbname=db.database,
        user=db.user,
        password=db.password,
    )

    inserted_products = 0
    inserted_images = 0
    inserted_addresses = 0
    shop_id = 0
    category_count = 0

    try:
        with conn:
            with conn.cursor() as cur:
                # --- Seed addresses ---
                if not skip_address and json_path:
                    address_rows = iter_address_rows(json_path)
                    if address_rows:
                        inserted_addresses = insert_addresses(cur, address_rows)
                        print(f"Addresses upserted: {inserted_addresses}")

                # --- Seed products ---
                if not skip_products:
                    products = transform_rows(csv_path)
                    if not products:
                        raise RuntimeError("No valid rows found in CSV.")

                    if truncate:
                        truncate_product_tables(cur)

                    shop_id = ensure_seller_and_shop(cur)
                    category_ids = ensure_categories(cur, [p.category_slug for p in products])
                    product_ids = insert_products(cur, products, shop_id, category_ids)
                    inserted_images = replace_product_images(cur, products, product_ids)
                    inserted_products = len(product_ids)
                    category_count = len(set(p.category_slug for p in products))

        print("=" * 60)
        print("Seeding completed")
        print("=" * 60)
        if not skip_address and json_path:
            print(f"Addresses upserted : {inserted_addresses}")
        if not skip_products:
            print(f"Products upserted  : {inserted_products}")
            print(f"Images inserted    : {inserted_images}")
            print(f"Categories synced  : {category_count}")
            print(f"Shop id used       : {shop_id}")
        print("=" * 60)
    finally:
        conn.close()


def main() -> None:
    args = parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))

    csv_path = args.csv
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(script_dir, csv_path)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    json_path: str | None = None
    if not args.skip_address:
        json_path = args.json
        if not os.path.isabs(json_path):
            json_path = os.path.join(script_dir, json_path)
        if not os.path.exists(json_path):
            print(f"WARNING: JSON file not found: {json_path}, skipping address seeding")
            json_path = None

    db_config = DbConfig(
        host=args.host,
        port=args.port,
        database=args.database,
        user=args.user,
        password=args.password,
    )

    run_seed(db_config, csv_path, json_path, truncate=args.truncate, skip_address=args.skip_address, skip_products=args.skip_products)


if __name__ == "__main__":
    main()
