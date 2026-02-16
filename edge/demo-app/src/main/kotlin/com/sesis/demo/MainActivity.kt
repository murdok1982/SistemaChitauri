package com.sesis.demo

import com.sesis.sdk.SesisClient
import com.sesis.sdk.model.*
import com.sesis.sdk.security.CryptoProvider

/**
 * Simulation of how an Android Activity would use the SESIS SDK.
 */
class MainActivity {
    private lateinit var sesisClient: SesisClient

    fun onCreate() {
        val assetId = "ANDROID_TABLET_EU_001"
        val cryptoProvider = CryptoProvider(keyId = "key-001")
        
        sesisClient = SesisClient(
            assetId = assetId,
            baseUrl = "https://api.sesis.eu/v1",
            cryptoProvider = cryptoProvider
        )
        
        println("SESIS Demo App initialized for asset: $assetId")
        
        // 1. Send Heartbeat
        sendHeartbeat()
        
        // 2. Send Manual Observation
        sendManualObservation("Detected suspicious drone activity in Sector B")
    }

    private fun sendHeartbeat() {
        val event = sesisClient.createEvent(
            type = EventType.asset_heartbeat,
            geo = GeoLocation(lat = 48.8566, lon = 2.3522, accuracy_m = 5.0),
            classification = ClassificationLevel.RESTRICTED,
            payload = mapOf("status" to "active", "battery" to 85)
        )
        sesisClient.sendEvent(event)
    }

    private fun sendManualObservation(text: String) {
        val event = sesisClient.createEvent(
            type = EventType.manual_observation,
            geo = GeoLocation(lat = 48.8566, lon = 2.3522, accuracy_m = 10.0),
            classification = ClassificationLevel.CONFIDENTIAL,
            payload = mapOf("observation" to text, "confidence" to "high")
        )
        sesisClient.sendEvent(event)
    }
}
