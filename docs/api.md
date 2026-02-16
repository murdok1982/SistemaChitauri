# SESIS Backend API Documentation (v1)

## Base URL: `/v1`

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/events/ingest` | POST | Edge/Source | Ingest a signed UEE message. |
| `/assets/register` | POST | Provisioner | Register a new asset with PKI metadata. |
| `/assets/{id}` | GET | UI/Worker | Get current state of an asset. |
| `/map/overlay` | GET | UI | Get GeoJSON tiles or features for map rendering. |
| `/media/upload` | POST | Source | Request a pre-signed URL for S3 upload. |
| `/alerts` | GET | UI | List recent alerts and anomalies. |
| `/timeline/query` | GET | UI | Query time-series telemetry data. |
| `/policy/evaluate` | POST | Internal | Evaluate ABAC policies (Subject, Resource, Context). |

## Security
- **mTLS**: Required for all production endpoints.
- **Audit**: All requests are logged with actor ID and timestamp.
- **Classification**: Data filtered by the user's clearance level.
