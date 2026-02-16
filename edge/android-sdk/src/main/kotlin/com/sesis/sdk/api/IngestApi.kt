package com.sesis.sdk.api

import com.sesis.sdk.model.Uee
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import com.google.gson.Gson

class IngestApi(private val baseUrl: String) {
    private val gson = Gson()

    fun ingest(event: Uee): Boolean {
        return try {
            val url = URL("$baseUrl/events/ingest")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json")
            
            val json = gson.toJson(event)
            OutputStreamWriter(conn.outputStream).use { it.write(json) }
            
            conn.responseCode == 200
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
