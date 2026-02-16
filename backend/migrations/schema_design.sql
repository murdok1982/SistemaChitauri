-- SESIS Database Schema Design (v1)
-- Requires PostGIS and TimescaleDB extensions

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Assets Table (Operational State)
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    current_status TEXT,
    last_heartbeat TIMESTAMPTZ,
    location GEOGRAPHY(POINT, 4326),
    classification_level TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- 2. Events Table (PostGIS focus)
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    asset_id TEXT NOT NULL REFERENCES assets(id),
    ts TIMESTAMPTZ NOT NULL,
    geo_point GEOGRAPHY(POINT, 4326) NOT NULL,
    classification_level TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    payload JSONB NOT NULL,
    signature JSONB NOT NULL
);

CREATE INDEX idx_events_geo ON events USING GIST (geo_point);
CREATE INDEX idx_events_ts ON events(ts DESC);
CREATE INDEX idx_events_asset ON events(asset_id);

-- 3. Telemetry Table (TimescaleDB hypertable)
-- Specific for high-frequency samples like vehicle_telemetry_sample
CREATE TABLE telemetry (
    ts TIMESTAMPTZ NOT NULL,
    asset_id TEXT NOT NULL,
    parameter TEXT NOT NULL,
    value FLOAT NOT NULL,
    unit TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Convert to hypertable
SELECT create_hypertable('telemetry', 'ts');

-- 4. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(event_id),
    rule_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    is_anomaly BOOLEAN DEFAULT FALSE,
    human_validated BOOLEAN DEFAULT FALSE,
    validation_ts TIMESTAMPTZ,
    validated_by TEXT,
    metadata JSONB DEFAULT '{}'
);

-- 5. Audit Log (Append-only)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    context JSONB DEFAULT '{}'
);

CREATE INDEX idx_audit_ts ON audit_log(ts DESC);
