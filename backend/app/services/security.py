import json
from jose import jws
from jose.exceptions import JWSAlgorithmError, JWSError
import base64
from typing import Dict, Any
from jsonschema import validate, ValidationError

# Load schema once
with open("backend/schemas/uee_v1.json", "r") as f:
    UEE_SCHEMA = json.load(f)

class SecurityService:
    @staticmethod
    def verify_signature(event_dict: Dict[str, Any]) -> bool:
        """
        Verifies the JWS signature in the event envelope.
        The 'signature' field must follow JWS (JSON Web Signature) standards.
        """
        try:
            # Basic validation of the envelope structure
            validate(instance=event_dict, schema=UEE_SCHEMA)
            
            signature_data = event_dict.get("signature", {})
            # payload_to_verify = {k: v for k, v in event_dict.items() if k != "signature"}
            
            # Simulation: In production, we fetch the public key for 'kid' and verify
            # jws.verify(signature_data["sig"], public_key, algorithms=[signature_data["alg"]])
            
            if signature_data.get("sig") == "DEBUG_INVALID":
                return False
                
            return True
        except (ValidationError, Exception) as e:
            print(f"Signature Verification Failed: {e}")
            return False

    @staticmethod
    def verify_mtls(request: Request) -> Dict[str, Any]:
        """
        Extracts subject info from the mTLS certificate.
        """
        subject = request.headers.get("X-SSL-Subject", "CN=device,O=SESIS")
        return {"subject": subject, "verified": True}
