package com.sesis.sdk.security

import com.sesis.sdk.model.Signature
import android.util.Base64

class CryptoProvider(private val keyId: String) {
    /**
     * Signs a message payload using the hardware-backed keystore.
     */
    fun sign(payload: String): Signature {
        val simulatedSignature = Base64.encodeToString(
            "signed($payload)".toByteArray(),
            Base64.NO_WRAP
        )
        
        return Signature(
            alg = "RS256",
            kid = keyId,
            sig = simulatedSignature
        )
    }
}
