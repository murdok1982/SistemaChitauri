from sqlalchemy import Column, String, DateTime, Float, JSON, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship, declarative_base
from geoalchemy2 import Geography
import datetime
import uuid

Base = declarative_base()

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(String, primary_key=True)
    kind = Column(String, nullable=False)
    current_status = Column(String)
    last_heartbeat = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    location = Column(Geography(geometry_type="POINT", srid=4326))
    classification_level = Column(String, nullable=False)
    metadata_json = Column(JSON, name="metadata", default={})

class Event(Base):
    __tablename__ = "events"
    
    event_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    geo_point = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    classification_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    payload = Column(JSON, nullable=False)
    signature = Column(JSON, nullable=False)

class Telemetry(Base):
    __tablename__ = "telemetry"
    
    ts = Column(DateTime(timezone=True), primary_key=True)
    asset_id = Column(String, primary_key=True)
    parameter = Column(String, primary_key=True)
    value = Column(Float, nullable=False)
    unit = Column(String)
    metadata_json = Column(JSON, name="metadata", default={})

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.event_id"))
    rule_id = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    description = Column(String)
    is_anomaly = Column(Boolean, default=False)
    human_validated = Column(Boolean, default=False)
    validated_by = Column(String)
    metadata_json = Column(JSON, name="metadata", default={})

class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    context = Column(JSON, default={})
