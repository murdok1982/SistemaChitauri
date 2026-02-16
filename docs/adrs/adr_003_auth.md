# ADR 003: Authentication and Integrity

## Status
Accepted

## Context
The system must operate in high-threat environments where data integrity and source authenticity are non-negotiable.

## Decision
Implement **mTLS** at the transport layer and **Cryptographic Signing** (Universal Event Envelope v1) at the message layer.

## Consequences
- **Pros**: Double layer of security. Even if transport is compromised, message integrity is verifiable. Supports offline-first signing.
- **Cons**: Increased overhead in key management (PKI) for and by every asset.
