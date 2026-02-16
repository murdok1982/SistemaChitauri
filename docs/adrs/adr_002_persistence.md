# ADR 002: Persistence Strategy

## Status
Accepted

## Context
Multi-domain defense data includes spatial (geo), time-series (telemetry), and relational data.

## Decision
We chose a hybrid approach using **PostgreSQL** with **PostGIS** and **TimescaleDB** extensions.

## Consequences
- **Pros**: Single database engine reduces operational complexity. PostGIS is the gold standard for spatial. TimescaleDB hypertables handle ingestion rates of millions of points per second.
- **Cons**: Requires specific extensions to be enabled in the DB image.
