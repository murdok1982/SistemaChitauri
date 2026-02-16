import asyncio
import json
import logging
from ml.anomalies import AnomalyDetector
from ml.correlation import EventCorrelator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sesis.ml_worker")

class MLWorker:
    """
    Simulated background worker that processes events.
    In production, this would subscribe to NATS JetStream.
    """
    
    def __init__(self):
        self.detector = AnomalyDetector()
        self.correlator = EventCorrelator()
        self.event_buffer = []

    async def process_message(self, event_json: str):
        event = json.loads(event_json)
        logger.info(f"ML Processing event: {event['event_id']}")
        
        # 1. Run Anomaly Detection
        if event["event_type"] == "vehicle_telemetry_sample":
            # Simulate fetching history from TimescaleDB
            history = [10.2, 11.5, 10.8, 12.1, 11.0] 
            current_val = event["payload"].get("value", 0.0)
            result = self.detector.detect_telemetry_outlier(history, current_val)
            
            if result["is_anomaly"]:
                logger.warning(f"ANOMALY DETECTED: {result['explanation']}")
                # In real app: await self.create_alert(event, result)

        # 2. Run Correlation
        self.event_buffer.append(event)
        if len(self.event_buffer) > 10:
            found = self.correlator.correlate_multi_domain(self.event_buffer)
            for correlation in found:
                logger.warning(f"CORRELATION FOUND: {correlation['description']}")
            self.event_buffer = self.event_buffer[-10:] # Keep window

    async def run(self):
        logger.info("ML Worker started. Waiting for events...")
        while True:
            # Simulated sleep/poll
            await asyncio.sleep(10)

if __name__ == "__main__":
    worker = MLWorker()
    asyncio.run(worker.run())
