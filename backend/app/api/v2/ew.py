"""
Electronic Warfare (EW) API v2.
Gestión de espectro RF, jamming, detección de emisores.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime
import uuid

from app.db.session import async_session_factory
from app.models.persistence import ElectronicWarfareEvent, EventStore
from app.core.config import settings

router = APIRouter()


async def get_db():
    async with async_session_factory() as session:
        yield session


@router.post("/scans", tags=["EW / Spectrum"])
async def report_rf_scan(
    event_type: str,  # JAMMING, SIGINT, ELINT
    frequency_mhz: float,
    bandwidth_mhz: Optional[float] = None,
    signal_strength: Optional[float] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Reporte de escaneo del espectro RF."""
    from geoalchemy2.elements import WKTElement
    position = None
    if lat and lon:
        position = WKTElement(f"POINT({lon} {lat})", srid=4326)

    event = ElectronicWarfareEvent(
        id=str(uuid.uuid4()),
        event_type=event_type,
        frequency_mhz=frequency_mhz,
        bandwidth_mhz=bandwidth_mhz,
        signal_strength=signal_strength,
        position=position,
        classification_level=classification,
        timestamp=datetime.utcnow()
    )
    db.add(event)

    # Event Sourcing
    store_event = EventStore(
        aggregate_id=event.id,
        aggregate_type="EWEvent",
        event_type="RF_SCAN_REPORTED",
        payload={
            "type": event_type,
            "freq": frequency_mhz,
            "strength": signal_strength
        }
    )
    db.add(store_event)

    await db.commit()
    return {"id": event.id, "status": "recorded"}


@router.get("/scans", tags=["EW / Spectrum"])
async def list_rf_scans(
    event_type: Optional[str] = None,
    min_freq: Optional[float] = None,
    max_freq: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista escaneos RF registrados."""
    query = select(ElectronicWarfareEvent)
    if event_type:
        query = query.where(ElectronicWarfareEvent.event_type == event_type)
    if min_freq:
        query = query.where(ElectronicWarfareEvent.frequency_mhz >= min_freq)
    if max_freq:
        query = query.where(ElectronicWarfareEvent.frequency_mhz <= max_freq)

    result = await db.execute(query.order_by(ElectronicWarfareEvent.timestamp.desc()))
    events = result.scalars().all()

    return [
        {
            "id": e.id,
            "type": e.event_type,
            "frequency_mhz": e.frequency_mhz,
            "bandwidth_mhz": e.bandwidth_mhz,
            "signal_strength": e.signal_strength,
            "position": e.position.ST_AsText() if e.position else None,
            "timestamp": e.timestamp,
            "classification": e.classification_level
        } for e in events
    ]


@router.post("/jamming/activate", tags=["EW / Jamming"])
async def activate_jamming(
    target_frequency: float,
    bandwidth: float,
    duration_seconds: int,
    location_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Activa jamming en frecuencia específica."""
    event = ElectronicWarfareEvent(
        id=str(uuid.uuid4()),
        event_type="JAMMING_ACTIVE",
        frequency_mhz=target_frequency,
        bandwidth_mhz=bandwidth,
        classification_level="SECRET",
        timestamp=datetime.utcnow()
    )
    db.add(event)

    store_event = EventStore(
        aggregate_id=event.id,
        aggregate_type="Jamming",
        event_type="JAMMING_ACTIVATED",
        payload={
            "frequency": target_frequency,
            "bandwidth": bandwidth,
            "duration": duration_seconds
        },
        actor="ew_operator"
    )
    db.add(store_event)

    await db.commit()
    return {
        "id": event.id,
        "status": "active",
        "frequency": target_frequency,
        "expires_in": duration_seconds
    }


@router.get("/threat-emitters", tags=["EW / Threats"])
async def get_threat_emitters(db: AsyncSession = Depends(get_db)):
    """Identifica emisores hostiles basado en patrones."""
    # Análisis simplificado: frecuencias con múltiples reportes
    query = select(ElectronicWarfareEvent).where(
        ElectronicWarfareEvent.event_type.in_(["SIGINT", "ELINT"])
    ).order_by(ElectronicWarfareEvent.frequency_mhz)

    result = await db.execute(query)
    events = result.scalars().all()

    # Agrupar por frecuencia
    freq_map = {}
    for e in events:
        freq = e.frequency_mhz
        if freq not in freq_map:
            freq_map[freq] = {"count": 0, "types": set(), "positions": []}
        freq_map[freq]["count"] += 1
        freq_map[freq]["types"].add(e.event_type)
        if e.position:
            freq_map[freq]["positions"].append(e.position.ST_AsText())

    # Identificar amenazas (frecuencias con >3 reportes)
    threats = []
    for freq, data in freq_map.items():
        if data["count"] >= 3:
            threats.append({
                "frequency_mhz": freq,
                "report_count": data["count"],
                "types": list(data["types"]),
                "sample_positions": data["positions"][:3],
                "threat_level": "HIGH" if data["count"] > 10 else "MEDIUM"
            })

    return {"threat_emitters": threats, "total": len(threats)}
