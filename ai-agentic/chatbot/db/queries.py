"""
Direct PostgreSQL product queries for the AI-agentic service.
Mirrors the .NET backend product endpoints but runs directly against the DB.
"""
from typing import List, Dict, Optional
from db.connection import get_connection


async def search_products(
    search: str = "",
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Dict]:
    """Search products directly from PostgreSQL."""
    conditions = ["p.status = 'active'"]
    params = []
    idx = 1

    if search:
        conditions.append(
            f"(p.name ILIKE ${idx} OR p.description ILIKE ${idx} OR p.brand ILIKE ${idx})"
        )
        params.append(f"%{search}%")
        idx += 1

    if category_id:
        conditions.append(f"p.category_id = ${idx}")
        params.append(category_id)
        idx += 1

    if brand:
        conditions.append(f"p.brand ILIKE ${idx}")
        params.append(f"%{brand}%")
        idx += 1

    if min_price is not None:
        conditions.append(f"p.price >= ${idx}")
        params.append(min_price)
        idx += 1

    if max_price is not None:
        conditions.append(f"p.price <= ${idx}")
        params.append(max_price)
        idx += 1

    where = " AND ".join(conditions)

    query = f"""
        SELECT
            p.id,
            p.name AS title,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.stock_quantity,
            p.sold_quantity,
            p.rating,
            p.total_reviews,
            p.brand,
            p.category_id,
            p.weight_grams,
            p.dimensions,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.is_main = true
                LIMIT 1
            ) AS image,
            CASE
                WHEN p.original_price IS NOT NULL AND p.original_price > p.price
                THEN ROUND(((p.original_price - p.price) / p.original_price * 100)::numeric, 0)
                ELSE 0
            END AS discount
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE {where}
        ORDER BY p.sold_quantity DESC, p.rating DESC
        LIMIT ${idx} OFFSET ${idx + 1}
    """
    params.extend([limit, offset])

    async with get_connection() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


async def get_product_by_id(product_id: int) -> Optional[Dict]:
    """Fetch a single product by ID."""
    query = """
        SELECT
            p.id,
            p.name AS title,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.stock_quantity,
            p.sold_quantity,
            p.rating,
            p.total_reviews,
            p.brand,
            p.category_id,
            p.weight_grams,
            p.dimensions,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.is_main = true
                LIMIT 1
            ) AS image
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = $1
    """
    async with get_connection() as conn:
        row = await conn.fetchrow(query, product_id)
        return dict(row) if row else None


async def get_products_by_category(
    category_name: str, limit: int = 50
) -> List[Dict]:
    """Fetch products by category name (fuzzy match)."""
    query = """
        SELECT
            p.id,
            p.name AS title,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.sold_quantity,
            p.rating,
            p.brand,
            p.category_id,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.is_main = true
                LIMIT 1
            ) AS image
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'active'
          AND c.name ILIKE $1
        ORDER BY p.sold_quantity DESC
        LIMIT $2
    """
    async with get_connection() as conn:
        rows = await conn.fetch(query, f"%{category_name}%", limit)
        return [dict(row) for row in rows]


async def get_all_products(limit: int = 200) -> List[Dict]:
    """Fetch all active products (for suggestion/scoring)."""
    query = """
        SELECT
            p.id,
            p.name AS title,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.sold_quantity,
            p.rating,
            p.total_reviews,
            p.brand,
            p.category_id,
            c.name AS category_name,
            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.is_main = true
                LIMIT 1
            ) AS image,
            CASE
                WHEN p.original_price IS NOT NULL AND p.original_price > p.price
                THEN ROUND(((p.original_price - p.price) / p.original_price * 100)::numeric, 0)
                ELSE 0
            END AS discount
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'active'
        ORDER BY p.sold_quantity DESC, p.rating DESC
        LIMIT $1
    """
    async with get_connection() as conn:
        rows = await conn.fetch(query, limit)
        return [dict(row) for row in rows]


async def get_categories() -> List[Dict]:
    """Fetch all active categories."""
    query = """
        SELECT id, name, slug, description, parent_id, image_url, sort_order
        FROM categories
        WHERE status = 'active'
        ORDER BY sort_order, name
    """
    async with get_connection() as conn:
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]


async def log_search(
    user_id: Optional[int],
    search_query: str,
    filters: Optional[dict] = None,
    result_count: int = 0,
) -> None:
    """Log a search query to product_search_logs."""
    import json
    query = """
        INSERT INTO product_search_logs (user_id, search_query, filters, result_count)
        VALUES ($1, $2, $3::jsonb, $4)
    """
    async with get_connection() as conn:
        await conn.execute(
            query,
            user_id,
            search_query[:500],
            json.dumps(filters) if filters else None,
            result_count,
        )
