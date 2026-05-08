"""
ML Worker - Esqueleto mínimo conectado a NATS JetStream.
Procesa eventos UEE y delega a servicios ML cuando estén listos.
"""
import asyncio
import logging

import nats

from app.core.config import settings

logging.basicConfig(level=settings.LOG_LEVEL)
log = logging.getLogger("sesis.ml-worker")


async def main():
    nc = await nats.connect(settings.NATS_URL)
    js = nc.jetstream()
    log.info("ml-worker conectado a NATS %s", settings.NATS_URL)
    try:
        # Crea/asegura stream
        try:
            await js.add_stream(name="SESIS_EVENTS", subjects=["events.>"])
        except Exception:
            pass
        sub = await js.subscribe("events.>", durable="ml-worker", manual_ack=True)
        async for msg in sub.messages:
            try:
                log.info("evento recibido: subject=%s len=%d", msg.subject, len(msg.data))
                # TODO: invocar AnomalyDetector / EventCorrelator cuando estén listos
                await msg.ack()
            except Exception as e:
                log.exception("error procesando: %s", e)
                await msg.nak()
    finally:
        await nc.drain()


if __name__ == "__main__":
    asyncio.run(main())
