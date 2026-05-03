"""
Border & Maritime Control API v2.
Control fronterizo, ADIZ (Air Defense ID Zone), dominio marítimo.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime
import uuid

from app.db.session import async_session_factory
from app.models.persistence import EventStore, Asset
from app.core.config import settings

router = APIRouter()


async def get_db():
    async with async_session_factory() as session:
        yield session


@router.post("/perimeter-sensor", tags=["Border / Sensors"])
async def report_perimeter_event(
    sensor_id: str,
    event_type: str,  # INTRUSION, MOVEMENT, BREACH
    lat: float,
    lon: float,
    severity: str = "MEDIUM",
    classification: str = "CONFIDENTIAL",
    db: AsyncSession = Depends(get_db)
):
    """Reporte de sensor perimetral fronterizo."""
    from geoalchemy2.elements import WKTElement
    position = WKTElement(f"POINT({lon} {lat})", srid=4326)

    event_id = str(uuid.uuid4())
    event = EventStore(
        aggregate_id=event_id,
        aggregate_type="BorderSensor",
        event_type="PERIMETER_ALERT",
        payload={
            "sensor_id": sensor_id,
            "event_type": event_type,
            "position": f"{lat},{lon}",
            "severity": severity
        }
    )
    db.add(event)

    await db.commit()
    return {"event_id": event_id, "status": "recorded", "classification": classification}


@router.get("/perimeter-status", tags=["Border / Status"])
async def get_perimeter_status(db: AsyncSession = Depends(get_db)):
    """Estado del perímetro fronterizo."""
    # TODO: Conectar con sensores reales
    return {
        "sectors": [
            {"name": "NORTE", "status": "SECURE", "sensors_active": 12, "alerts_24h": 3},
            {"name": "SUR", "status": "ELEVATED", "sensors_active": 8, "alerts_24h": 7},
            {"name": "ESTE", "status": "SECURE", "sensors_active": 15, "alerts_24h": 1},
            {"name": "OESTE", "status": "MONITORING", "sensors_active": 10, "alerts_24h": 4}
        ],
        "total_sensors": 45,
        "active_sensors": 42,
        "alerts_last_24h": 15
    }


@router.post("/adiz-violation", tags=["Border / ADIZ"])
async def report_adiz_violation(
    aircraft_id: str,
    lat: float,
    lon: float,
    altitude: float,
    speed: float,
    heading: float,
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Reporte de violación de ADIZ (Air Defense Identification Zone)."""
    event_id = str(uuid.uuid4())

    event = EventStore(
        aggregate_id=event_id,
        aggregate_type="ADIZ",
        event_type="ADIZ_VIOLATION",
        payload={
            "aircraft_id": aircraft_id,
            "position": f"{lat},{lon},{altitude}",
            "speed": speed,
            "heading": heading,
            "violation_type": "UNAUTHORIZED_ENTRY"
        }
    )
    db.add(event)

    await db.commit()
    return {
        "event_id": event_id,
        "status": "violation_recorded",
        "response": "INTERCEPTOR_DISPATCHED",
        "classification": classification
    }


@router.get("/maritime-tracks", tags=["Maritime / AIS"])
async def get_maritime_tracks(
    zone: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Obtiene tracks marítimos (AIS) en zona económica exclusiva."""
    # TODO: Integrar con AIS real
    return {
        "zone": zone or "EEZ_COMPLETE",
        "vessels": [
            {
                "mmsi": "123456789",
                "name": "BUQUE PESQUERO 1",
                "type": "FISHING",
                "position": "41.0N,4.5W",
                "speed": 8.5,
                "course": 180,
                "status": "MONITORED"
            },
            {
                "mmsi": "987654321",
                "name": "CARGA INTERNACIONAL",
                "type": "CARGO",
                "position": "40.5N,3.8W",
                "speed": 12.0,
                "course": 270,
                "status": "CLEARED"
            }
        ],
        "total_tracks": 2,
        "alerts": 0
    }


@router.post("/maritime-interdiction", tags=["Maritime / Operations"])
async def initiate_maritime_interdiction(
    vessel_mmsi: str,
    reason: str,  # SMUGGLING, TRESPASS, SUSPICIOUS
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Inicia interdicción marítima."""
    interdiction_id = str(uuid.uuid4())

    event = EventStore(
        aggregate_id=interdiction_id,
        aggregate_type="MaritimeInterdiction",
        event_type="INTERDICTION_STARTED",
        payload={
            "vessel_mmsi": vessel_mmsi,
            "reason": reason,
            "force_used": "MINIMAL"
        }
    )
    db.add(event)

    await db.commit()
    return {
        "interdiction_id": interdiction_id,
        "status": "initiated",
        "response_units": ["COAST_GUARD_PATROL_1", "NAVAL_UNIT_3"],
        "classification": classification
    }
