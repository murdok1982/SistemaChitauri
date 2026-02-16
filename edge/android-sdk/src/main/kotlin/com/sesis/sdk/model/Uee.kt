package com.sesis.sdk.model

import java.util.UUID

data class Uee(
    val event_id: UUID = UUID.randomUUID(),
    val schema_version: String = "1.0",
    val event_type: EventType,
    val asset_id: String,
    val ts: String, // ISO8601
    val geo: GeoLocation,
    val classification_level: ClassificationLevel,
    val confidence_score: Float,
    val source: Source,
    val payload: Map<String, Any>,
    var signature: Signature? = null
)

enum class EventType {
    asset_heartbeat,
    asset_status_change,
    manual_observation,
    vehicle_telemetry_sample,
    drone_frame_batch,
    satellite_product_ingest,
    rf_anomaly_event,
    cyber_defense_alert
}

data class GeoLocation(
    val lat: Double,
    val lon: Double,
    val alt: Double? = null,
    val accuracy_m: Double
)

enum class ClassificationLevel {
    OPEN, RESTRICTED, CONFIDENTIAL, SECRET
}

data class Source(
    val kind: SourceKind,
    val id: String
)

enum class SourceKind {
    ANDROID, VEHICLE_GATEWAY, DRONE_GATEWAY, SAT_PRODUCT, RF_SENSOR, CYBER_FEED
}

data class Signature(
    val alg: String,
    val kid: String,
    val sig: String
)
