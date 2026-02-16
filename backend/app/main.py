from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid

app = FastAPI(
    title="SESIS API",
    version="1.0.0",
    description="Soberano UE Multi-Agent System API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Audit log capture
    print(f"AUDIT: {request.method} {request.url.path} | Status: {response.status_code} | Latency: {duration:.4f}s")
    
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

# Include routers
from .api.v1 import ingestion, assets, alerts, timeline, media, policy
app.include_router(ingestion.router, prefix="/v1", tags=["Ingestion"])
app.include_router(assets.router, prefix="/v1/assets", tags=["Assets"])
app.include_router(alerts.router, prefix="/v1/alerts", tags=["Alerts"])
app.include_router(timeline.router, prefix="/v1/timeline", tags=["Timeline"])
app.include_router(media.router, prefix="/v1/media", tags=["Media"])
app.include_router(policy.router, prefix="/v1/policy", tags=["Policy"])
