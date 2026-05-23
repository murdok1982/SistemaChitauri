"""
import hispan_shield_guardian  # noqa: F401
SESIS v3.0 — Sistema Estatal de Control de Fuerzas Armadas
Main entry point con seguridad militar endurecida.
"""
import sys
from pathlib import Path

_backend_root = Path(__file__).parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt as _jose_jwt
from redis import Redis

from app.core.config import settings
from shared.security.mtls import MTLSMiddleware
from shared.security.rate_limit import RateLimitMiddleware

# ── Logging estructurado ─────────────────────────────────────────────────
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)-5s | %(name)s | %(message)s",
)
logger = logging.getLogger("sesis.main")

# ── Cliente Redis SÍNCRONO al import (no en lifespan) ────────────────────
# Nota: Redis.from_url devuelve cliente perezoso; el ping real se hace en
# lifespan. Si Redis no responde al arranque, el middleware queda registrado
# pero `RateLimitMiddleware` debe tolerar fallos transientes (fail-closed
# en producción, fail-open en dev — comportamiento actual del módulo).
redis_client: Optional[Redis] = None
try:
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=False)
except Exception as e:  # pragma: no cover
    logger.warning("Redis: no se pudo construir cliente al import: %s", e)
    redis_client = None


# ── Lifespan: ping Redis + cleanup ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001 — firma exigida por FastAPI
    logger.info("Iniciando SESIS v3.0 — Sistema Estatal de Defensa")
    if redis_client is not None:
        try:
            redis_client.ping()
            logger.info("Redis conectado: %s", settings.REDIS_URL)
        except Exception as e:
            logger.warning("Redis no disponible: %s — rate limiting degradado", e)
    yield
    if redis_client is not None:
        try:
            redis_client.close()
        except Exception:
            pass
    logger.info("SESIS detenido")


# ── Fail-closed mTLS en producción ───────────────────────────────────────
if settings.ENVIRONMENT == "production" and not settings.MTLS_CA_CERT:
    raise RuntimeError(
        "MTLS_CA_CERT obligatorio en ENVIRONMENT=production. "
        "Sin CA, el sistema no puede validar identidades de cliente."
    )


# ── Aplicación FastAPI ───────────────────────────────────────────────────
app = FastAPI(
    title="SESIS — Sistema de Exploración, Supervisión e Inteligencia de Seguridad",
    version="3.0.0",
    description=(
        "Sistema estatal de control de fuerzas armadas en tiempos de paz y guerra. "
        "Multi-Domain Operations (MDO) con IA local ARES. "
        "CLASIFICACIÓN MÁXIMA ADMISIBLE: RESTRICTED / FOUO — "
        "Acceso restringido a personal autorizado."
    ),
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)


# ── Middlewares funcionales (decoradores) ────────────────────────────────
# Starlette ejecuta inbound del último registrado al primero.
# Para que el flujo inbound real sea:
#   mTLS → CORS → RateLimit → SecurityHeaders → PayloadLimit → JWTPrincipal → Audit → app
# se debe registrar:
#   1. Decoradores de adentro-hacia-afuera del flujo (audit primero)
#   2. add_middleware (RateLimit, CORS, mTLS) DESPUÉS de los decoradores
#      en el orden inverso al deseado.

MAX_PAYLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
_PRINCIPAL_BYPASS_PREFIXES = ("/health", "/docs", "/openapi.json", "/redoc")


@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    """Audit log de cada petición (penúltimo inbound, último outbound)."""
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
        request.headers.get("User-Agent", "")[:50],
    )
    return response


@app.middleware("http")
async def jwt_principal_middleware(request: Request, call_next):
    """Decodifica JWT y pobla request.state.principal / clearance para ABAC."""
    path = request.url.path
    if not any(path == p or path.startswith(p) for p in _PRINCIPAL_BYPASS_PREFIXES):
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                payload = _jose_jwt.decode(
                    token,
                    settings.JWT_SECRET_KEY,
                    algorithms=[settings.JWT_ALGORITHM],
                    audience="sesis-c2",
                    issuer="sesis-auth-server",
                )
                request.state.principal = payload
                request.state.clearance = payload.get("clearance", "OPEN")
            except JWTError:
                pass
    return await call_next(request)


@app.middleware("http")
async def payload_limit_middleware(request: Request, call_next):
    """Bloquea cargas > 10 MB (anti-DoS volumétrico)."""
    if request.method in ("POST", "PUT", "PATCH"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_PAYLOAD_SIZE:
            client_ip = request.client.host if request.client else "unknown"
            logger.warning(
                "Bloqueada petición que excede el límite de tamaño: %s bytes de %s",
                content_length,
                client_ip,
            )
            return Response(
                "Payload Too Large",
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
    return await call_next(request)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Headers HSTS, CSP, X-Frame, X-Content-Type, Referrer, Permissions."""
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = (
        "max-age=63072000; includeSubDomains; preload"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; frame-ancestors 'none'"
    )
    response.headers["Permissions-Policy"] = (
        "geolocation=(), microphone=(), camera=()"
    )
    response.headers.pop("Server", None)
    return response


# ── Middlewares de clase (add_middleware) ────────────────────────────────
# Registrados al final → corren PRIMERO inbound.

# RateLimit (requiere Redis; si el cliente es None lo omite limpiamente).
if redis_client is not None:
    app.add_middleware(RateLimitMiddleware, redis_client=redis_client)
    logger.info("Rate limiting habilitado con Redis")
else:
    logger.warning(
        "Rate limiting OMITIDO: redis_client=None al import. "
        "En producción, REDIS_URL debe ser válido."
    )

# CORS — sólo orígenes whitelisted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-MFA-Token"],
)

# mTLS — exige cert válido del cliente. Último registrado → primer inbound.
if settings.MTLS_CA_CERT and settings.ENVIRONMENT == "production":
    app.add_middleware(
        MTLSMiddleware,
        ca_cert_path=settings.MTLS_CA_CERT,
        require_mtls=True,
    )
    logger.info("mTLS habilitado (producción)")


# ── Health checks ────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "version": "3.0.0",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT,
        "classification": "RESTRICTED",
    }


@app.get("/health/liveness", tags=["System"])
async def liveness():
    return {"status": "alive"}


@app.get("/health/readiness", tags=["System"])
async def readiness():
    checks = {"redis": False, "nats": False, "postgres": False}
    if redis_client is not None:
        try:
            redis_client.ping()
            checks["redis"] = True
        except Exception:
            pass
    all_ok = all(checks.values())
    return {"status": "ready" if all_ok else "not_ready", "checks": checks}


# ── Routers — v1 Core ───────────────────────────────────────────────────

from app.api.v1 import ingestion, assets, alerts, timeline, media, policy  # noqa: E402

app.include_router(ingestion.router, prefix="/v1", tags=["Ingestion"])
app.include_router(assets.router, prefix="/v1/assets", tags=["Assets"])
app.include_router(alerts.router, prefix="/v1/alerts", tags=["Alerts"])
app.include_router(timeline.router, prefix="/v1/timeline", tags=["Timeline"])
app.include_router(media.router, prefix="/v1/media", tags=["Media"])
app.include_router(policy.router, prefix="/v1/policy", tags=["Policy"])

# ── Routers — v1 ARES Brain & Intelligence ─────────────────────────────

from app.api.v1 import brain, intel, sensors  # noqa: E402

app.include_router(brain.router, prefix="/v1/brain", tags=["ARES Brain"])
app.include_router(intel.router, prefix="/v1/intel", tags=["Intelligence"])
app.include_router(sensors.router, prefix="/v1/sensors", tags=["Sensors"])

# ── Routers — v2 Expanded (FASE 2+) ──────────────────────────────────

from app.api.v2 import c2, ew, cyber, logistics, border, space  # noqa: E402

app.include_router(c2.router, prefix="/api/v2/c2", tags=["v2", "C2 — Command & Control"])
app.include_router(ew.router, prefix="/api/v2/ew", tags=["v2", "EW — Electronic Warfare"])
app.include_router(cyber.router, prefix="/api/v2/cyber", tags=["v2", "Cyber Operations"])
app.include_router(logistics.router, prefix="/api/v2/logistics", tags=["v2", "Logistics"])
app.include_router(border.router, prefix="/api/v2/border", tags=["v2", "Border Control"])
app.include_router(space.router, prefix="/api/v2/space", tags=["v2", "Space Domain"])

app.include_router(c2.router, prefix="/v2/c2", tags=["legacy-v2", "C2 — Command & Control"])
app.include_router(ew.router, prefix="/v2/ew", tags=["legacy-v2", "EW — Electronic Warfare"])
app.include_router(cyber.router, prefix="/v2/cyber", tags=["legacy-v2", "Cyber Operations"])
app.include_router(logistics.router, prefix="/v2/logistics", tags=["legacy-v2", "Logistics"])
app.include_router(border.router, prefix="/v2/border", tags=["legacy-v2", "Border Control"])
app.include_router(space.router, prefix="/v2/space", tags=["legacy-v2", "Space Domain"])

logger.info("Módulos v2 (C2, EW, Cyber, Logistics, Border, Space) cargados en /api/v2 y /v2")


logger.info(
    "SESIS v3.0 online — ARES Brain: %s | Model: %s | Env: %s",
    settings.OLLAMA_URL,
    settings.OLLAMA_MODEL,
    settings.ENVIRONMENT,
)
