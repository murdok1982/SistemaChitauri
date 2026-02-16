# SESIS Definition of Done (DoD)

For a task to be considered "Done" in SESIS, it must meet the following criteria:

## 1. Quality & Tests
- [ ] Unit tests covering at least 80% of new logic.
- [ ] Integration tests verify communication between components (e.g., API to Bus).
- [ ] Linting and type checking (mypy, flake8/black) pass.

## 2. Security
- [ ] UEE messages are validated against the schema.
- [ ] Signature verification is implemented for all ingestion points.
- [ ] ABAC policies are defined and tested for new resources.
- [ ] Secrets are NOT committed to the repository (use .env.example or Helm secrets).

## 3. Observability
- [ ] Logs are structured (JSON) and contain trace IDs.
- [ ] OpenTelemetry instrumentation is added to critical paths.
- [ ] Key metrics are exposed for Prometheus.

## 4. Documentation
- [ ] API endpoints are documented in OpenAPI/Swagger.
- [ ] Architecture or Data Model changes are updated in `/docs`.
- [ ] Runbook steps are added if the change requires specific operations.

## 5. Deployment
- [ ] Dockerfiles are updated/tested.
- [ ] k8s manifests or Helm charts are ready for the component.
- [ ] Build pipeline passes.
