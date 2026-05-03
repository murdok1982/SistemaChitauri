"""
Cyber Operations API v2.
Ciberdefensa, Kill Chain, Threat Hunting, Incident Response.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime
import uuid

from app.db.session import async_session_factory
from app.models.persistence import CyberIncident, EventStore
from app.core.config import settings

router = APIRouter()


async def get_db():
    async with async_session_factory() as session:
        yield session


# ── Kill Chain Stages ────────────────────────────────────────────────

KILL_CHAIN_STAGES = [
    "RECON", "WEAPONIZE", "DELIVER", "EXPLOIT", "INSTALL", "C2", "ACTIONS"
]


@router.post("/incidents", tags=["Cyber / Incidents"])
async def create_cyber_incident(
    incident_type: str,  # MALWARE, DDoS, INTRUSION, PHISHING
    target_system: str,
    severity: str,  # LOW, MEDIUM, HIGH, CRITICAL
    source_ip: Optional[str] = None,
    kill_chain_stage: Optional[str] = None,
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Registra un incidente de ciberdefensa."""
    if kill_chain_stage and kill_chain_stage not in KILL_CHAIN_STAGES:
        raise HTTPException(status_code=400, detail=f"Etapa inválida. Debe ser: {KILL_CHAIN_STAGES}")

    incident = CyberIncident(
        id=str(uuid.uuid4()),
        incident_type=incident_type,
        severity=severity,
        source_ip=source_ip,
        target_system=target_system,
        kill_chain_stage=kill_chain_stage,
        classification_level=classification,
        status="OPEN",
        created_at=datetime.utcnow()
    )
    db.add(incident)

    event = EventStore(
        aggregate_id=incident.id,
        aggregate_type="CyberIncident",
        event_type="INCIDENT_CREATED",
        payload={
            "type": incident_type,
            "target": target_system,
            "severity": severity,
            "stage": kill_chain_stage
        }
    )
    db.add(event)

    await db.commit()
    return {"id": incident.id, "status": "open"}


@router.get("/incidents", tags=["Cyber / Incidents"])
async def list_cyber_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista incidentes de ciberdefensa."""
    query = select(CyberIncident)
    if status:
        query = query.where(CyberIncident.status == status)
    if severity:
        query = query.where(CyberIncident.severity == severity)

    result = await db.execute(query.order_by(CyberIncident.created_at.desc()))
    incidents = result.scalars().all()

    return [
        {
            "id": i.id,
            "type": i.incident_type,
            "severity": i.severity,
            "target": i.target_system,
            "kill_chain_stage": i.kill_chain_stage,
            "status": i.status,
            "source_ip": i.source_ip,
            "created_at": i.created_at,
            "classification": i.classification_level
        } for i in incidents
    ]


@router.get("/kill-chain/{incident_id}", tags=["Cyber / Kill Chain"])
async def get_kill_chain_status(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Visualiza progresión del Kill Chain para un incidente."""
    result = await db.execute(select(CyberIncident).where(CyberIncident.id == incident_id))
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    current_stage_idx = KILL_CHAIN_STAGES.index(incident.kill_chain_stage) if incident.kill_chain_stage in KILL_CHAIN_STAGES else -1

    chain = []
    for idx, stage in enumerate(KILL_CHAIN_STAGES):
        chain.append({
            "stage": stage,
            "status": "completed" if idx < current_stage_idx else ("active" if idx == current_stage_idx else "pending")
        })

    return {
        "incident_id": incident_id,
        "current_stage": incident.kill_chain_stage,
        "chain": chain,
        "severity": incident.severity
    }


@router.post("/threat-hunt", tags=["Cyber / Threat Hunting"])
async def start_threat_hunt(
    hunt_query: str,  # IOC: IP, hash, domain
    hunt_type: str,  # IOC, YARA, SIGMA
    classification: str = "SECRET",
    db: AsyncSession = Depends(get_db)
):
    """Inicia búsqueda proactiva de amenazas (Threat Hunting)."""
    hunt_id = str(uuid.uuid4())

    event = EventStore(
        aggregate_id=hunt_id,
        aggregate_type="ThreatHunt",
        event_type="HUNT_STARTED",
        payload={
            "query": hunt_query,
            "type": hunt_type,
            "classification": classification
        },
        actor="cyber_analyst"
    )
    db.add(event)

    await db.commit()

    # TODO: Integrar con motor de búsqueda (Elasticsearch/Splunk)
    return {
        "hunt_id": hunt_id,
        "status": "started",
        "query": hunt_query,
        "type": hunt_type,
        "estimated_time": "10-30 minutes"
    }


@router.put("/incidents/{incident_id}/contain", tags=["Cyber / Response"])
async def contain_incident(
    incident_id: str,
    containment_action: str,  # ISOLATE, BLOCK_IP, KILL_PROCESS
    db: AsyncSession = Depends(get_db)
):
    """Ejecuta acción de contención para incidente."""
    result = await db.execute(select(CyberIncident).where(CyberIncident.id == incident_id))
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    incident.status = "CONTAINED"

    event = EventStore(
        aggregate_id=incident_id,
        aggregate_type="CyberIncident",
        event_type="INCIDENT_CONTAINED",
        payload={
            "action": containment_action,
            "previous_status": "OPEN"
        }
    )
    db.add(event)

    await db.commit()
    return {"incident_id": incident_id, "status": "CONTAINED", "action": containment_action}
