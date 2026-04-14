"""
SESIS ML Worker v2 — Procesamiento async de eventos con ARES Brain.

Suscribe a NATS JetStream, ejecuta detección de anomalías y correlación
multi-dominio, y escala a análisis LLM cuando se detectan amenazas críticas.
"""
import asyncio
import json
import logging
import os
import sys

# Permite ejecutar como módulo desde la raíz del proyecto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ml.anomalies import AnomalyDetector
from ml.correlation import EventCorrelator

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("sesis.ml_worker")

# ---------------------------------------------------------------------------
# Lazy import del cerebro ARES (evita ciclo al importar fuera de FastAPI)
# ---------------------------------------------------------------------------
_brain = None


async def _get_brain():
    global _brain
    if _brain is None:
        try:
            from backend.app.services.military_brain import MilitaryBrainService
            _brain = MilitaryBrainService()
            logger.info("ARES Brain service inicializado en el worker.")
        except Exception as exc:
            logger.warning("No se pudo cargar MilitaryBrainService: %s", exc)
    return _brain


# ---------------------------------------------------------------------------
# Worker principal
# ---------------------------------------------------------------------------

class MLWorker:
    """
    Worker de procesamiento de inteligencia en tiempo real.

    Flujo por evento:
    1. Detección de anomalías en telemetría (Z-score)
    2. Correlación multi-dominio (RF + geo + HUMINT)
    3. Para severidad HIGH/CRITICAL → análisis ARES LLM
    4. Generación de IntelligenceProduct si correlación exitosa
    """

    SEVERITY_ESCALATE = {"HIGH", "CRITICAL"}

    def __init__(self) -> None:
        self.detector = AnomalyDetector()
        self.correlator = EventCorrelator()
        self.event_buffer: list[dict] = []

    # ------------------------------------------------------------------
    # Procesamiento de eventos individuales
    # ------------------------------------------------------------------

    async def process_message(self, event_json: str) -> None:
        try:
            event = json.loads(event_json)
        except json.JSONDecodeError as exc:
            logger.error("JSON inválido en mensaje NATS: %s", exc)
            return

        event_id = event.get("event_id", "unknown")
        event_type = event.get("event_type", "unknown")
        logger.info("Procesando evento %s (tipo=%s)", event_id, event_type)

        alerts_generated = []

        # 1. Detección de anomalías en telemetría
        if event_type == "vehicle_telemetry_sample":
            alert = await self._check_telemetry_anomaly(event)
            if alert:
                alerts_generated.append(alert)

        # 2. Correlación multi-dominio (ventana deslizante de 10 eventos)
        self.event_buffer.append(event)
        if len(self.event_buffer) > 10:
            correlation_alerts = await self._run_correlation()
            alerts_generated.extend(correlation_alerts)
            self.event_buffer = self.event_buffer[-10:]

        # 3. Escalado a ARES para alertas de alta severidad
        for alert in alerts_generated:
            if alert.get("severity") in self.SEVERITY_ESCALATE:
                await self._escalate_to_ares(event, alert)

    async def _check_telemetry_anomaly(self, event: dict) -> dict | None:
        """Detecta outliers en telemetría de vehículos usando Z-score."""
        history = [10.2, 11.5, 10.8, 12.1, 11.0, 10.9, 11.3, 10.6, 11.8, 10.4]
        current_val = float(event.get("payload", {}).get("value", 0.0))

        result = self.detector.detect_telemetry_outlier(history, current_val)

        if result["is_anomaly"]:
            severity = "HIGH" if abs(result.get("z_score", 0)) > 4 else "MEDIUM"
            logger.warning(
                "ANOMALÍA DETECTADA | asset=%s | z_score=%.2f | severidad=%s",
                event.get("asset_id"),
                result.get("z_score", 0),
                severity,
            )
            return {
                "type": "ANOMALY",
                "severity": severity,
                "asset_id": event.get("asset_id"),
                "event_id": event.get("event_id"),
                "description": result.get("explanation", "Anomalía en telemetría"),
                "z_score": result.get("z_score"),
            }
        return None

    async def _run_correlation(self) -> list[dict]:
        """Correlación multi-dominio sobre ventana de eventos recientes."""
        alerts = []
        try:
            correlations = self.correlator.correlate_multi_domain(self.event_buffer)
            for correlation in correlations:
                severity = correlation.get("severity", "MEDIUM")
                logger.warning(
                    "CORRELACIÓN DETECTADA | tipo=%s | descripción=%s | severidad=%s",
                    correlation.get("type"),
                    correlation.get("description"),
                    severity,
                )
                alerts.append({
                    "type": "CORRELATION",
                    "severity": severity,
                    "description": correlation.get("description"),
                    "correlated_events": [e.get("event_id") for e in self.event_buffer],
                })
        except Exception as exc:
            logger.error("Error en correlación multi-dominio: %s", exc)
        return alerts

    async def _escalate_to_ares(self, event: dict, alert: dict) -> None:
        """Escala amenazas HIGH/CRITICAL al cerebro ARES para análisis LLM."""
        brain = await _get_brain()
        if brain is None:
            logger.warning("ARES no disponible para escalado de alerta %s", alert)
            return

        try:
            threat_data = {
                "event_id": event.get("event_id"),
                "event_type": event.get("event_type"),
                "asset_id": event.get("asset_id"),
                "alert_type": alert.get("type"),
                "description": alert.get("description"),
                "severity": alert.get("severity"),
                "geo": event.get("geo", {}),
                "timestamp": event.get("ts"),
            }
            context = {
                "recent_events_count": len(self.event_buffer),
                "classification": event.get("classification_level", "CONFIDENTIAL"),
            }

            logger.info("Escalando a ARES: asset=%s | severidad=%s", event.get("asset_id"), alert.get("severity"))
            analysis = await brain.analyze_threat(threat_data, context)

            if analysis.get("status") != "DEGRADED":
                logger.info(
                    "ARES ANÁLISIS COMPLETADO | recomendación_coa=%s | riesgo=%s",
                    analysis.get("recommended_coa"),
                    analysis.get("risk_assessment", "")[:100],
                )
            else:
                logger.warning("ARES en modo degradado: %s", analysis.get("message"))

        except Exception as exc:
            logger.error("Error en escalado a ARES: %s", exc)

    # ------------------------------------------------------------------
    # Loop principal
    # ------------------------------------------------------------------

    async def run(self) -> None:
        """
        Loop principal del worker.
        En producción, reemplazar el sleep por suscripción real a NATS JetStream:

            nc = await nats.connect(os.environ["NATS_URL"])
            js = nc.jetstream()
            sub = await js.subscribe("sesis.events.>", durable="ml-worker")
            async for msg in sub.messages:
                await self.process_message(msg.data.decode())
                await msg.ack()
        """
        logger.info("SESIS ML Worker v2 iniciado. Escuchando eventos...")
        logger.info("ARES Brain: %s | Modelo: %s", os.environ.get("OLLAMA_URL", "http://ollama:11434"), os.environ.get("OLLAMA_MODEL", "mistral:7b"))

        # Pre-cargar el cerebro ARES
        await _get_brain()

        iteration = 0
        while True:
            await asyncio.sleep(10)
            iteration += 1
            if iteration % 6 == 0:  # Log cada minuto
                logger.info("Worker activo | buffer_eventos=%d | iteración=%d", len(self.event_buffer), iteration)


if __name__ == "__main__":
    worker = MLWorker()
    asyncio.run(worker.run())
