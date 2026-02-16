from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from ..models.persistence import Asset
from ..db.session import get_db

router = APIRouter()

@router.post("/register")
async def register_asset(
    asset_data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new asset in the system.
    """
    new_asset = Asset(
        id=asset_data["id"],
        kind=asset_data["kind"],
        classification_level=asset_data["classification_level"],
        metadata_json=asset_data.get("metadata", {}),
        current_status="registered"
    )
    db.add(new_asset)
    await db.commit()
    return {"status": "registered", "asset_id": new_asset.id}

@router.get("/{id}")
async def get_asset(
    id: String,
    db: AsyncSession = Depends(get_db)
):
    """
    Get current state of an asset.
    """
    result = await db.execute(select(Asset).where(Asset.id == id))
    asset = result.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.get("/")
async def list_assets(
    db: AsyncSession = Depends(get_db)
):
    """
    List all registered assets.
    """
    result = await db.execute(select(Asset))
    return result.scalars().all()
