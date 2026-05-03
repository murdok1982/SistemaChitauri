"""
SESIS v3.0 — Sistema Estatal de Control de Fuerzas Armadas
Main entry point con seguridad militar endurecida.
"""
import logging
import time
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis

from app.core.config import settings
from shared.auth.jwt_service import JWTService
from shared.security.mtls import MTLSMiddleware
from shared.security.rate_limit import RateLimitMiddleware

# Configuración logging estructurado
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)-5s | %(name)s | %(message)s"
)
logger = logging.getLogger("sesis.main")

# Cliente Redis global
redis_client: Redis = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación."""
    global redis_client

    # Startup
    logger.info("🚀 Iniciando SESIS v3.0 — Sistema Estatal de Defensa")

    # Conectar Redis
    try:
        redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=False)
        redis_client.ping()
        logger.info("✅ Redis conectado: %s", settings.REDIS_URL)
    except Exception as e:
        logger.warning("⚠️ Redis no disponible: %s — rate limiting degradado", e)

    yield

    # Shutdown
    if redis_client:
        redis_client.close()
    logger.info("🛑 SESIS detenido")


app = FastAPI(
    title="SESIS — Sistema de Exploración, Supervisión e Inteligencia de Seguridad",
    version="3.0.0",
    description=(
        "Sistema estatal de control de fuerzas armadas en tiempos de paz y guerra. "
        "Multi-Domain Operations (MDO) con IA local ARES. "
        "CLASIFICACIÓN: SECRETO — Acceso restringido a personal autorizado."
    ),
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# ── Middleware de seguridad (orden importa) ──────────────────────────────

# 1. mTLS (si está configurado)
if settings.MTLS_CA_CERT and settings.ENVIRONMENT == "production":
    app.add_middleware(
        MTLSMiddleware,
        ca_cert_path=settings.MTLS_CA_CERT,
        require_mtls=True
    )
    logger.info("🔒 mTLS habilitado (producción)")

# 2. CORS — Restringido
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-MFA-Token"],
)

# 3. Rate Limiting (requiere Redis)
if redis_client:
    app.add_middleware(
        RateLimitMiddleware,
        redis_client=redis_client
    )
    logger.info("🛡️ Rate limiting habilitado con Redis")

# Middleware anti-DoS (Content-Length Limit)
from fastapi import Response

MAX_PAYLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

@app.middleware("http")
async def payload_limit_middleware(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_PAYLOAD_SIZE:
            logger.warning(f"🛡️ Bloqueada petición que excede el límite de tamaño: {content_length} bytes de {request.client.host}")
            return Response("Payload Too Large", status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
    return await call_next(request)

# 4. Audit middleware
@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    logger.info(
        "AUDIT | %s %s | status=%d | latency=%.4fs | ip=%s | ua=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration,
        request.client.host if request.client else "unknown",
        request.headers.get("User-Agent", "")[:50]
    )
    return response


# ── Health checks ────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """Health check básico."""
    return {
        "status": "ok",
        "version": "3.0.0",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT,
        "classification": "SECRET"
    }


@app.get("/health/liveness", tags=["System"])
async def liveness():
    """Liveness probe para Kubernetes."""
    return {"status": "alive"}


@app.get("/health/readiness", tags=["System"])
async def readiness():
    """Readiness probe — verifica dependencias."""
    checks = {"redis": False, "nats": False, "postgres": False}
    # Redis
    if redis_client:
        try:
            redis_client.ping()
            checks["redis"] = True
        except Exception:
            pass

    # TODO: agregar checks para NATS y PostgreSQL

    all_ok = all(checks.values())
    return {"status": "ready" if all_ok else "not_ready", "checks": checks}


# ── Routers — v1 Core ───────────────────────────────────────────────────

from app.api.v1 import ingestion, assets, alerts, timeline, media, policy

app.include_router(ingestion.router, prefix="/v1", tags=["Ingestion"])
app.include_router(assets.router, prefix="/v1/assets", tags=["Assets"])
app.include_router(alerts.router, prefix="/v1/alerts", tags=["Alerts"])
app.include_router(timeline.router, prefix="/v1/timeline", tags=["Timeline"])
app.include_router(media.router, prefix="/v1/media", tags=["Media"])
app.include_router(policy.router, prefix="/v1/policy", tags=["Policy"])

# ── Routers — v1 ARES Brain & Intelligence ─────────────────────────────

from app.api.v1 import brain, intel, sensors

app.include_router(brain.router, prefix="/v1/brain", tags=["ARES Brain"])
app.include_router(intel.router, prefix="/v1/intel", tags=["Intelligence"])
app.include_router(sensors.router, prefix="/v1/sensors", tags=["Sensors"])

# ── Routers — v2 Expanded (FASE 2+) ──────────────────────────────────

try:
    from app.api.v2 import c2, ew, cyber, logistics, border, space
    app.include_router(c2.router, prefix="/v2/c2", tags=["C2 — Command & Control"])
    app.include_router(ew.router, prefix="/v2/ew", tags=["EW — Electronic Warfare"])
    app.include_router(cyber.router, prefix="/v2/cyber", tags=["Cyber Operations"])
    app.include_router(logistics.router, prefix="/v2/logistics", tags=["Logistics"])
    app.include_router(border.router, prefix="/v2/border", tags=["Border Control"])
    app.include_router(space.router, prefix="/v2/space", tags=["Space Domain"])
    logger.info("✅ Módulos v2 (C2, EW, Cyber, Logistics, Border, Space) cargados")
except ImportError as e:
    logger.info("ℹ️ Módulos v2 no disponibles aún: %s", e)


logger.info(
    "SESIS v3.0 online — ARES Brain: %s | Model: %s | Env: %s",
    settings.OLLAMA_URL, settings.OLLAMA_MODEL, settings.ENVIRONMENT
)
