package com.sesis.sdk

import com.sesis.sdk.model.*
import com.sesis.sdk.security.CryptoProvider
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*

class SesisClient(
    private val assetId: String,
    private val baseUrl: String,
    private val cryptoProvider: CryptoProvider
) {
    private val eventQueue: MutableList<Uee> = mutableListOf()

    fun createEvent(
        type: EventType,
        geo: GeoLocation,
        classification: ClassificationLevel,
        payload: Map<String, Any>,
        sourceKind: SourceKind = SourceKind.ANDROID
    ): Uee {
        return Uee(
            event_type = type,
            asset_id = assetId,
            ts = DateTimeFormatter.ISO_INSTANT.format(Instant.now()),
            geo = geo,
            classification_level = classification,
            confidence_score = 1.0f,
            source = Source(sourceKind, assetId),
            payload = payload
        )
    }

    fun sendEvent(event: Uee) {
        // 1. Sign
        val payloadString = event.payload.toString() // Simplified for simulation
        event.signature = cryptoProvider.sign(payloadString)
        
        // 2. Queue (Offline-first simulation)
        eventQueue.add(event)
        
        // 3. Try flush (Simulated)
        flushQueue()
    }

    private fun flushQueue() {
        if (eventQueue.isEmpty()) return
        
        val event = eventQueue.first()
        println("SESIS_SDK: Sending event ${event.event_id} to $baseUrl")
        
        // Simulation: In real life, use OkHttp/Retrofit to POST to backend
        // If success, remove from queue
        eventQueue.removeAt(0)
    }
}
