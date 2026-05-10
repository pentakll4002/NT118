"""
PostgreSQL connection pool for ai-agentic service.
Connects directly to the same database used by the .NET backend.
"""
import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

try:
    import asyncpg
except ImportError:
    asyncpg = None

import config.setting as config


_pool: Optional[object] = None
_pool_lock = asyncio.Lock()


def _get_database_url() -> str:
    """Build PostgreSQL DSN from environment variables."""
    url = os.getenv("DATABASE_URL")
    if url:
        return url

    # Parse from .NET-style connection string if available
    conn_str = os.getenv("ConnectionStrings__DefaultConnection", "")
    if conn_str:
        parts = {}
        for segment in conn_str.split(";"):
            if "=" in segment:
                key, val = segment.split("=", 1)
                parts[key.strip().lower()] = val.strip()
        host = parts.get("host", "localhost")
        port = parts.get("port", "5432")
        db = parts.get("database", "nt118")
        user = parts.get("username", "postgres")
        pw = parts.get("password", "123456")
        return f"postgresql://{user}:{pw}@{host}:{port}/{db}"

    # Fallback defaults
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    db = os.getenv("DB_NAME", "nt118")
    user = os.getenv("DB_USER", "postgres")
    pw = os.getenv("DB_PASSWORD", "123456")
    return f"postgresql://{user}:{pw}@{host}:{port}/{db}"


async def get_pool():
    """Get or create the connection pool (lazy singleton)."""
    global _pool
    if _pool is not None:
        return _pool

    async with _pool_lock:
        if _pool is not None:
            return _pool

        if asyncpg is None:
            raise ImportError(
                "asyncpg is not installed. Run: pip install asyncpg"
            )

        dsn = _get_database_url()
        print(f"[db] Connecting to PostgreSQL: {dsn.split('@')[-1]}")
        _pool = await asyncpg.create_pool(
            dsn=dsn,
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
        print("[db] Connection pool created successfully")
        return _pool


@asynccontextmanager
async def get_connection():
    """Acquire a connection from the pool."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def close_pool():
    """Close the connection pool (call on shutdown)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        print("[db] Connection pool closed")
