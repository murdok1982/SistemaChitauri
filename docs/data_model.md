# SESIS Data Model Documentation

## Universal Event Envelope (UEE) v1
All events in the system follow this standard envelope.

| Field | Type | Description |
| :--- | :--- | :--- |
| `event_id` | UUID | Unique ID for the event. |
| `ts` | ISO8601 | Event generation timestamp in UTC. |
| `event_type` | Enum | Type of event (e.g., `asset_heartbeat`). |
| `asset_id` | String | ID of the asset that generated the event. |
| `geo` | Object | Lat, Lon, Alt, and Accuracy. |
| `classification` | Enum | Clearance level (OPEN to SECRET). |
| `payload` | Object | Event-specific data. |
| `signature` | Object | Digital signature (alg, kid, sig). |

## Database Architecture
- **PostGIS**: Used for spatial queries on events and asset locations (geocencing, proximity).
- **TimescaleDB**: Optimizes telemetry storage and retrieval (aggregations over time).
- **MinIO**: Stores large binary objects (drone frames, satellite products).

## Ingestion Flow
1. Asset sends signed UEE to `/v1/events/ingest`.
2. Backend verifies mTLS and Message Signature.
3. Backend validates schema using `uee_v1.json`.
4. Event is published to NATS JetStream.
5. Persistent workers save event to PostGIS and Telemetry to TimescaleDB.
