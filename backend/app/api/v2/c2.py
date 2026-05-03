"""
C2 API — Command & Control v2.
Gestión de misiones, ORBAT, órdenes, Blue/Red Force Tracking.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from datetime import datetime
import uuid

from app.db.session import async_session_factory
from app.models.persistence import (
    ORBATUnit, Mission, BlueForceTracking, EventStore
)
from app.core.config import settings
from shared.auth.jwt_service import JWTService
from shared.security.rate_limit import RateLimitMiddleware

router = APIRouter()
jwt_service = JWTService(settings.JWT_SECRET_KEY)


# ── Dependencia de sesión DB ────────────────────────────────────────

async def get_db():
    async with async_session_factory() as session:
        yield session


# ── ORBAT (Order of Battle) ────────────────────────────────────────

@router.get("/orbat", tags=["C2 / ORBAT"])
async def get_orbat(db: AsyncSession = Depends(get_db)):
    """Obtiene jerarquía ORBAT completa."""
    result = await db.execute(select(ORBATUnit).where(ORBATUnit.status != "DELETED"))
    units = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "type": u.unit_type,
            "parent_id": u.parent_id,
            "status": u.status,
            "location": u.location.ST_AsText() if u.location else None,
            "classification": u.classification_level
        } for u in units
    ]


@router.post("/orbat/units", tags=["C2 / ORBAT"])
async def create_orbat_unit(
    name: str,
    unit_type: str,
    parent_id: Optional[str] = None,
    classification: str = "CONFIDENTIAL",
    db: AsyncSession = Depends(get_db)
):
    """Crea una nueva unidad en el ORBAT."""
    unit = ORBATUnit(
        id=str(uuid.uuid4()),
        name=name,
        unit_type=unit_type,
        parent_id=parent_id,
        classification_level=classification,
        status="ACTIVE"
    )
    db.add(unit)

    # Event Sourcing: registrar evento
    event = EventStore(
        aggregate_id=unit.id,
        aggregate_type="ORBATUnit",
        event_type="UNIT_CREATED",
        payload={"name": name, "type": unit_type, "parent": parent_id}
    )
    db.add(event)

    await db.commit()
    return {"id": unit.id, "status": "created"}


# ── Misiones ────────────────────────────────────────────────────────

@router.post("/missions", tags=["C2 / Missions"])
async def create_mission(
    name: str,
    mission_type: str,
    orbat_unit_id: str,
    classification: str = "SECRET",
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Crea una nueva misión militar."""
    mission = Mission(
        id=str(uuid.uuid4()),
        name=name,
        mission_type=mission_type,
        orbat_unit_id=orbat_unit_id,
        classification_level=classification,
        description=description,
        status="PLANNED"
    )
    db.add(mission)

    event = EventStore(
        aggregate_id=mission.id,
        aggregate_type="Mission",
        event_type="MISSION_CREATED",
        payload={"name": name, "type": mission_type, "unit": orbat_unit_id},
        actor="system"
    )
    db.add(event)

    await db.commit()
    return {"id": mission.id, "status": "planned"}


@router.get("/missions", tags=["C2 / Missions"])
async def list_missions(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista misiones activas."""
    query = select(Mission)
    if status:
        query = query.where(Mission.status == status)
    result = await db.execute(query)
    missions = result.scalars().all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "type": m.mission_type,
            "status": m.status,
            "classification": m.classification_level,
            "start": m.start_time,
            "end": m.end_time
        } for m in missions
    ]


@router.put("/missions/{mission_id}/status", tags=["C2 / Missions"])
async def update_mission_status(
    mission_id: str,
    new_status: str,
    db: AsyncSession = Depends(get_db)
):
    """Actualiza estado de misión (PLANNED→ACTIVE→COMPLETED)."""
    await db.execute(
        update(Mission).where(Mission.id == mission_id).values(status=new_status)
    )

    event = EventStore(
        aggregate_id=mission_id,
        aggregate_type="Mission",
        event_type="MISSION_STATUS_CHANGED",
        payload={"new_status": new_status}
    )
    db.add(event)

    await db.commit()
    return {"status": "updated", "mission_id": mission_id}


# ── Blue Force Tracking ─────────────────────────────────────────────

@router.post("/blue-force/report", tags=["C2 / Blue Force"])
async def report_blue_force(
    unit_id: str,
    asset_id: Optional[str],
    lat: float,
    lon: float,
    altitude: Optional[float] = None,
    heading: Optional[float] = None,
    speed: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """Reporte de posición Blue Force (amigo)."""
    from geoalchemy2.elements import WKTElement
    position = WKTElement(f"POINT({lon} {lat})", srid=4326)

    report = BlueForceTracking(
        id=str(uuid.uuid4()),
        unit_id=unit_id,
        asset_id=asset_id,
        position=position,
        altitude=altitude,
        heading=heading,
        speed=speed,
        status="ACTIVE",
        timestamp=datetime.utcnow()
    )
    db.add(report)

    # Evento para procesamiento
    event = EventStore(
        aggregate_id=report.id,
        aggregate_type="BlueForce",
        event_type="POSITION_REPORTED",
        payload={"unit": unit_id, "lat": lat, "lon": lon}
    )
    db.add(event)

    await db.commit()
    return {"id": report.id, "status": "reported"}


@router.get("/blue-force/active", tags=["C2 / Blue Force"])
async def get_active_blue_force(db: AsyncSession = Depends(get_db)):
    """Obtiene fuerzas amigas activas."""
    result = await db.execute(
        select(BlueForceTracking)
        .where(BlueForceTracking.status == "ACTIVE")
        .order_by(BlueForceTracking.timestamp.desc())
    )
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "unit_id": r.unit_id,
            "position": r.position.ST_AsText() if r.position else None,
            "altitude": r.altitude,
            "heading": r.heading,
            "speed": r.speed,
            "timestamp": r.timestamp
        } for r in reports
    ]


# ── Órdenes (OPORD) ───────────────────────────────────────────────

@router.post("/orders", tags=["C2 / Orders"])
async def issue_order(
    mission_id: str,
    content: str,
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Emite una orden de operación (OPORD)."""
    order_id = str(uuid.uuid4())

    event = EventStore(
        aggregate_id=order_id,
        aggregate_type="Order",
        event_type="ORDER_ISSUED",
        payload={
            "mission_id": mission_id,
            "content": content,
            "classification": classification
        },
        actor="commander"
    )
    db.add(event)

    await db.commit()
    return {"order_id": order_id, "status": "issued"}
