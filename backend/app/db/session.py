"""
Async SQLAlchemy session for SESIS.
Exposes:
  - engine
  - async_session_factory  (used by v2 routers)
  - AsyncSessionLocal      (legacy alias, used by v1 routers)
  - get_db                 (FastAPI dependency)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/sesis")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

# Modern async-aware sessionmaker (preferred)
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Legacy alias kept for backwards compatibility with v1 routers
AsyncSessionLocal = async_session_factory


async def get_db():
    async with async_session_factory() as session:
        yield session
