import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("sesis.main")

app = FastAPI(
    title="SESIS — Sistema de Exploración, Supervisión e Inteligencia de Seguridad",
    version="2.0.0",
    description=(
        "Plataforma de inteligencia militar multi-dominio con cerebro ARES (LLM local). "
        "Clasificación: CONFIDENCIAL. Acceso restringido a personal autorizado."
    ),
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# CORS — usa orígenes configurados (nunca * en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH"],
    allow_headers=["*"],
)


@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        "AUDIT | %s %s | status=%d | latency=%.4fs | ip=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration,
        request.client.host if request.client else "unknown",
    )
    return response


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "version": "2.0.0",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT,
    }


# ---------------------------------------------------------------------------
# Routers — v1 core
# ---------------------------------------------------------------------------
from .api.v1 import ingestion, assets, alerts, timeline, media, policy  # noqa: E402

app.include_router(ingestion.router, prefix="/v1", tags=["Ingestion"])
app.include_router(assets.router, prefix="/v1/assets", tags=["Assets"])
app.include_router(alerts.router, prefix="/v1/alerts", tags=["Alerts"])
app.include_router(timeline.router, prefix="/v1/timeline", tags=["Timeline"])
app.include_router(media.router, prefix="/v1/media", tags=["Media"])
app.include_router(policy.router, prefix="/v1/policy", tags=["Policy"])

# ---------------------------------------------------------------------------
# Routers — v2 ARES Brain & Intelligence
# ---------------------------------------------------------------------------
from .api.v1 import brain, intel, sensors  # noqa: E402

app.include_router(brain.router, prefix="/v1/brain", tags=["ARES Brain"])
app.include_router(intel.router, prefix="/v1/intel", tags=["Intelligence"])
app.include_router(sensors.router, prefix="/v1/sensors", tags=["Sensors"])

logger.info("SESIS v2.0 online — ARES Brain: %s | Model: %s", settings.OLLAMA_URL, settings.OLLAMA_MODEL)
