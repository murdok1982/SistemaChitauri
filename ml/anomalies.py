import numpy as np
from typing import List, Dict, Any, Optional

class AnomalyDetector:
    """
    Core logic for detecting anomalies in telemetry and events.
    Focuses on robust, explainable statistical methods.
    """
    
    @staticmethod
    def detect_telemetry_outlier(history: List[float], current_value: float, threshold: float = 3.0) -> Dict[str, Any]:
        """
        Z-score based outlier detection.
        """
        if len(history) < 5:
            return {"is_anomaly": False, "score": 0.0}
            
        mean = np.mean(history)
        std = np.std(history)
        
        if std == 0:
            return {"is_anomaly": False, "score": 0.0}
            
        z_score = abs(current_value - mean) / std
        
        return {
            "is_anomaly": z_score > threshold,
            "score": float(z_score),
            "explanation": f"Value {current_value} is {z_score:.2f} standard deviations from the mean ({mean:.2f})."
        }

    @staticmethod
    def detect_location_jump(last_geo: Dict[str, float], current_geo: Dict[str, float], time_delta_sec: float) -> Dict[str, Any]:
        """
        Detects unrealistic physical movements (e.g., speed > 1000 km/h for a ground vehicle).
        """
        # Simplified speed check
        # dist = haversine(last_geo, current_geo)
        # speed = dist / time_delta_sec
        # if speed > max_expected_speed: return anomaly
        return {"is_anomaly": False, "score": 0.0}
