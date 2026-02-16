# SESIS System Architecture

## Overview
SESIS (Soberano UE, Coalition-ready, Defensivo) is a multi-agent system designed for high-stakes operational awareness and defense.

## Component Interaction
```mermaid
graph TD
    subgraph "Edge Layer (Android)"
        SDK[Android SDK]
        DemoApp[Demo App]
        SDK --> DemoApp
    end

    subgraph "Ingestion Layer (FastAPI)"
        API[FastAPI Ingest]
        Auth[mTLS/Signature Verification]
        API --> Auth
    end

    subgraph "Messaging Layer (NATS JetStream)"
        Bus[Event Bus]
    end

    subgraph "Persistence Layer"
        PostGIS[PostgreSQL + PostGIS]
        Timescale[TimescaleDB]
        S3[MinIO Object Storage]
    end

    subgraph "Intelligence Layer (ML Workers)"
        Anomaly[Anomaly Detector]
        Correlation[Event Correlator]
        Vision[Vision Analysis]
    end

    subgraph "Presentation Layer (React)"
        Dashboard[Web Dashboard]
    end

    SDK --> API
    API --> Bus
    Bus --> Anomaly
    Bus --> Correlation
    Bus --> Vision
    Anomaly --> PostGIS
    Correlation --> PostGIS
    Vision --> S3
    PostGIS --> Dashboard
    Timescale --> Dashboard
    S3 --> Dashboard
```

## Security Model
- **mTLS**: Every connection from Edge to Backend is protected by mutual TLS.
- **Signature**: Every message in the Universal Event Envelope (UEE) format is cryptographically signed by the source asset.
- **ABAC/RBAC**: Policy-based access control for all API resources.
- **Audit**: All writes and critical reads are logged to an append-only audit trail.

## Data Residency
- All data is stored within EU-controlled infrastructure (MinIO, PostgreSQL).
- Encryption at rest and in transit.
