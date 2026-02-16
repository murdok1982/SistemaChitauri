# SESIS Threat Model (STRIDE)

## Asset Analysis
- **UEE Messages**: Integrity and Authenticity are critical.
- **PostGIS/TimescaleDB**: Confidentiality and Availability of operational data.
- **MinIO**: Confidentiality of media (images/video).
- **Backend API**: Availability and proper Authorization.

## Threat Assessment

| Threat Category | Threat Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Spoofing** | Unauthorized assets sending fake heartbeats or observations. | **mTLS** + **Cryptographic Signing** of every UEE message. |
| **Tampering** | Modification of data in transit or at rest. | **TLS 1.3** + **Signed Payloads** + **Audit Trail**. |
| **Repudiation** | An asset owner denying they sent a specific command or observation. | **Non-repudiation** through digital signatures (JWS/JOS). |
| **Information Disclosure** | Unauthorized access to the dashboard or internal DBs. | **ABAC** + **Encryption at rest** + **Network Segmentation**. |
| **Denial of Service** | Flooding the ingestion API with junk data. | **Rate Limiting** + **NATS Flow Control** + **Load Balancing**. |
| **Elevation of Privilege** | A "Restricted" user accessing "Secret" data. | **Granular ABAC policies** based on clearance level. |

## Controls
- **Audit Logging**: Every event is logged to an immutable audit file.
- **Secret Management**: Keys and credentials managed via Vault (simulated/K8s secrets).
- **Network Security**: Private VPC, IP whitelisting for known gateways.
