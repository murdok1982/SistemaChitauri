"""
Logistics API v2.
Cadena de suministro, munición, personal, MEDEVAC.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from datetime import datetime
import uuid

from app.db.session import async_session_factory
from app.models.persistence import LogisticsSupply, EventStore, ORBATUnit
from app.core.config import settings

router = APIRouter()


async def get_db():
    async with async_session_factory() as session:
        yield session


@router.post("/supplies", tags=["Logistics / Supplies"])
async def add_supply(
    item_type: str,  # AMMO_5_56, AMMO_7_62, FUEL, MEDICINE, FOOD
    quantity: float,
    unit: str,  # rounds, liters, boxes, kg
    location_id: Optional[str] = None,
    min_threshold: Optional[float] = None,
    classification: str = "CONFIDENTIAL",
    db: AsyncSession = Depends(get_db)
):
    """Agrega suministros al inventario."""
    supply = LogisticsSupply(
        id=str(uuid.uuid4()),
        item_type=item_type,
        quantity=quantity,
        unit=unit,
        location_id=location_id,
        min_threshold=min_threshold,
        classification_level=classification,
        last_updated=datetime.utcnow()
    )
    db.add(supply)

    event = EventStore(
        aggregate_id=supply.id,
        aggregate_type="LogisticsSupply",
        event_type="SUPPLY_ADDED",
        payload={"type": item_type, "qty": quantity, "unit": unit}
    )
    db.add(event)

    await db.commit()
    return {"id": supply.id, "status": "added"}


@router.get("/supplies", tags=["Logistics / Supplies"])
async def list_supplies(
    item_type: Optional[str] = None,
    location_id: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista suministros. low_stock=true muestra solo por debajo del umbral."""
    query = select(LogisticsSupply)
    if item_type:
        query = query.where(LogisticsSupply.item_type == item_type)
    if location_id:
        query = query.where(LogisticsSupply.location_id == location_id)

    result = await db.execute(query)
    supplies = result.scalars().all()

    items = []
    for s in supplies:
        is_low = s.min_threshold and s.quantity <= s.min_threshold
        if low_stock and not is_low:
            continue
        items.append({
            "id": s.id,
            "type": s.item_type,
            "quantity": s.quantity,
            "unit": s.unit,
            "location_id": s.location_id,
            "min_threshold": s.min_threshold,
            "is_low_stock": is_low,
            "last_updated": s.last_updated
        })

    return {"supplies": items, "total": len(items)}


@router.put("/supplies/{supply_id}/consume", tags=["Logistics / Supplies"])
async def consume_supply(
    supply_id: str,
    quantity: float,
    db: AsyncSession = Depends(get_db)
):
    """Consume suministros (ej: munición disparada)."""
    result = await db.execute(select(LogisticsSupply).where(LogisticsSupply.id == supply_id))
    supply = result.scalar_one_or_none()

    if not supply:
        raise HTTPException(status_code=404, detail="Suministro no encontrado")

    if supply.quantity < quantity:
        raise HTTPException(status_code=400, detail="Cantidad insuficiente")

    supply.quantity -= quantity
    supply.last_updated = datetime.utcnow()

    event = EventStore(
        aggregate_id=supply_id,
        aggregate_type="LogisticsSupply",
        event_type="SUPPLY_CONSUMED",
        payload={"qty_consumed": quantity, "remaining": supply.quantity}
    )
    db.add(event)

    await db.commit()
    return {
        "supply_id": supply_id,
        "remaining": supply.quantity,
        "is_low_stock": supply.min_threshold and supply.quantity <= supply.min_threshold
    }


@router.get("/personnel", tags=["Logistics / Personnel"])
async def get_personnel_status(db: AsyncSession = Depends(get_db)):
    """Obtiene estado de personal por unidad (OPDIS)."""
    result = await db.execute(select(ORBATUnit).where(ORBATUnit.unit_type.in_(["tierra", "mar", "aire"])))
    units = result.scalars().all()

    # TODO: Conectar con módulo de RRHH real
    personnel = []
    for u in units:
        personnel.append({
            "unit_id": u.id,
            "unit_name": u.name,
            "type": u.unit_type,
            "status": u.status,
            "assigned": "N/A",  # TODO: tabla personnel
            "ready": "N/A",
            "medical": "N/A"
        })

    return {"personnel": personnel, "total_units": len(personnel)}


@router.post("/medevac", tags=["Logistics / Medical"])
async def request_medevac(
    unit_id: str,
    priority: str,  # T1 (immediate), T2 (urgent), T3 (routine)
    casualties: int,
    location_desc: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Solicita evacuación médica (MEDEVAC)."""
    medevac_id = str(uuid.uuid4())

    event = EventStore(
        aggregate_id=medevac_id,
        aggregate_type="Medevac",
        event_type="MEDEVAC_REQUESTED",
        payload={
            "unit_id": unit_id,
            "priority": priority,
            "casualties": casualties,
            "location": location_desc
        },
        actor="medical_officer"
    )
    db.add(event)

    await db.commit()
    return {
        "medevac_id": medevac_id,
        "priority": priority,
        "status": "requested",
        "estimated_arrival": "15-45 minutes" if priority == "T1" else "1-3 hours"
    }
