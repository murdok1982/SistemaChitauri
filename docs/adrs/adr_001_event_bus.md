# ADR 001: Event Bus Selection

## Status
Accepted

## Context
The SESIS platform requires a highly reliable, low-latency messaging system for real-time situational awareness and multi-agent coordination.

## Decision
We chose **NATS JetStream** over Kafka/Redpanda.

## Consequences
- **Pros**: Light footprint (ideal for sovereign edge deployments), built-in persistence (JetStream), natively supports request-response and pub-sub.
- **Cons**: Smaller ecosystem compared to Kafka, but sufficient for the specified requirements.
