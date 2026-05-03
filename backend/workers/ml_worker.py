"""
ML Worker - Procesamiento asíncrono conectado a NATS JetStream.
Procesa eventos UEE, detecta anomalías, fusiona inteligencia.
Incluye reconexión automática y Dead Letter Queue.
"""
import asyncio
import json
import logging
from nats.aio.client import Client as NATS
from nats.aio.errors import ErrConnectionClosed, ErrTimeout
from nats.jetstream import JetStreamContext, api
from typing import Optional
import httpx
from datetime import datetime

from app.services.data_service import DataService
from app.services.intel_fusion import IntelFusionService
from ml.anomalies import AnomalyDetector
from ml.correlation import EventCorrelator
from app.db.session import async_session_factory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sesis.ml_worker")

# Configuración
NATS_URL = "nats://localhost:4222"
STREAM_NAME = "SESIS_EVENTS"
CONSUMER_NAME = "ml-worker"
DLQ_STREAM = "SESIS_DLQ"
MAX_RECONNECT_ATTEMPTS = 10
RECONNECT_DELAY = 5  # segundos


class MLWorker:
    """Worker ML conectado a NATS JetStream con reconexión automática."""

    def __init__(self):
        self.nc: Optional[NATS] = None
        self.js: Optional[JetStreamContext] = None
        self.data_service = DataService()
        self.intel_service = IntelFusionService()
        self.anomaly_detector = AnomalyDetector()
        self.correlator = EventCorrelator()
        self.running = False

    async def connect_nats(self, max_attempts: int = MAX_RECONNECT_ATTEMPTS):
        """Conecta a NATS con reconexión automática."""
        for attempt in range(max_attempts):
            try:
                self.nc = NATS()
                await self.nc.connect(
                    servers=[NATS_URL],
                    reconnect_time_wait=RECONNECT_DELAY,
                    max_reconnect_attempts=max_attempts
                )
                self.js = self.nc.jetstream()
                logger.info(f"✅ Conectado a NATS: {NATS_URL}")
                return
            except Exception as e:
                logger.error(f"❌ Intento {attempt + 1}/{max_attempts} falló: {e}")
                if attempt < max_attempts - 1:
                    await asyncio.sleep(RECONNECT_DELAY)
                else:
                    raise ConnectionError(f"No se pudo conectar a NATS tras {max_attempts} intentos")

    async def setup_streams(self):
        """Configura streams de NATS JetStream."""
        try:
            # Stream principal para eventos
            await self.js.add_stream(
                name=STREAM_NAME,
                subjects=["events.>"],
                retention=api.RetentionPolicy.WORK_QUEUE,
                max_age=7 * 24 * 60 * 60 * 1_000_000_000  # 7 días en nanosegundos
            )
            logger.info(f"✅ Stream {STREAM_NAME} configurado")
        except api.JetStreamAPIError as e:
            if "stream name already in use" in str(e):
                logger.info(f"Stream {STREAM_NAME} ya existe")
            else:
                raise

        try:
            # Dead Letter Queue
            await self.js.add_stream(
                name=DLQ_STREAM,
                subjects=["dlq.>"],
                retention=api.RetentionPolicy.LIMITS
            )
        except api.JetStreamAPIError as e:
            if "stream name already in use" in str(e):
                logger.info(f"Stream {DLQ_STREAM} ya existe")
            else:
                raise

    async def process_event(self, msg):
        """Procesa un evento UEE de la cola."""
        try:
            data = json.loads(msg.data.decode())
            event_id = data.get("event_id", "unknown")

            logger.info(f"Procesando evento: {event_id}")

            async with async_session_factory() as session:
                # 1. Detectar anomalías en telemetría
                anomalies = await self.anomaly_detector.detect(data, session)

                # 2. Correlacionar con eventos previos
                correlations = await self.correlator.correlate(data, session)

                # 3. Si score alto, invocar fusión de inteligencia
                if correlations and correlations.get("score", 0) > 0.70:
                    await self.intel_service.fuse_and_generate(data, correlations, session)

                # 4. Marcar evento como procesado
                await self.data_service.mark_event_processed(event_id, session)

            # Ack del mensaje
            await msg.ack()
            logger.info(f"✅ Evento {event_id} procesado exitosamente")

        except Exception as e:
            logger.error(f"❌ Error procesando evento: {e}")
            # Enviar a Dead Letter Queue y hacer ACK para no crear un bucle infinito (Poison Pill)
            dlq_success = await self._send_to_dlq(msg.data, str(e))
            if dlq_success:
                await msg.ack()
            else:
                await msg.nak()

    async def _send_to_dlq(self, original_data: bytes, error: str) -> bool:
        """Envía mensaje fallido a Dead Letter Queue."""
        try:
            dlq_payload = {
                "original": original_data.decode(),
                "error": error,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.js.publish(
                "dlq.events",
                json.dumps(dlq_payload).encode()
            )
            logger.warning(f"Evento enviado a DLQ: {error}")
            return True
        except Exception as dlq_error:
            logger.error(f"Error enviando a DLQ: {dlq_error}")
            return False

    async def start(self):
        """Inicia el worker suscribiéndose a eventos."""
        await self.connect_nats()
        await self.setup_streams()

        self.running = True

        # Suscribirse a eventos UEE
        sub = await self.js.subscribe(
            "events.uee.>",
            cb=self.process_event,
            durable=CONSUMER_NAME,
            manual_ack=True,
            stream=STREAM_NAME
        )

        logger.info(f"🚀 ML Worker iniciado, escuchando en events.uee.>")

        # Mantener vivo
        while self.running:
            await asyncio.sleep(1)

    async def stop(self):
        """Detiene el worker limpiamente."""
        self.running = False
        if self.nc:
            await self.nc.close()
        logger.info("ML Worker detenido")


async def main():
    """Entry point del ML Worker."""
    worker = MLWorker()
    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Interrumpido por usuario")
    except Exception as e:
        logger.error(f"Error fatal: {e}")
    finally:
        await worker.stop()


if __name__ == "__main__":
    asyncio.run(main())
