# syntax=docker/dockerfile:1.6
# ─── Builder stage ──────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Toolchain de compilación (sólo en builder).
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ─── Runtime stage ──────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Sólo runtime libs: libpq + curl (para HEALTHCHECK).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Usuario no-root.
RUN groupadd --system --gid 1000 appuser \
    && useradd --system --uid 1000 --gid appuser --shell /usr/sbin/nologin --create-home appuser

# Copiar dependencias instaladas desde el builder.
COPY --from=builder /install /usr/local

WORKDIR /app
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
