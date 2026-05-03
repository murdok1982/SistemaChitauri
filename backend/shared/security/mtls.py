"""
mTLS Middleware - Autenticación mutua TLS para comunicaciones Edge-Backend.
Obligatorio para sistema militar estatal.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Optional
import logging

logger = logging.getLogger("sesis.security.mtls")


class MTLSMiddleware(BaseHTTPMiddleware):
    """
    Middleware para validar certificados cliente (mTLS).
    Extrae información del certificado y la inyecta en request.state
    """

    def __init__(self, app, ca_cert_path: Optional[str] = None, 
                 require_mtls: bool = False):
        super().__init__(app)
        self.ca_cert_path = ca_cert_path
        self.require_mtls = require_mtls
        self.logger = logger

    async def dispatch(self, request: Request, call_next: Callable):
        # Verificar si se proporcionó certificado cliente
        client_cert = request.headers.get("X-SSL-Client-Cert")
        cert_verified = request.headers.get("X-SSL-Client-Verify")
        cert_subject = request.headers.get("X-SSL-Client-Subject")

        # En producción con Nginx/proxy que termina TLS, estas headers deben estar
        if self.require_mtls:
            if not client_cert:
                self.logger.warning(f"mTLS requerido pero no provisto: {request.url}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Certificado cliente requerido (mTLS)"
                )

            if cert_verified != "SUCCESS":
                self.logger.warning(f"Verificación certificado falló: {cert_verified}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Certificado cliente inválido o no verificado"
                )

            # Mitigación de Spoofing: Validar que la IP cliente sea el Proxy Inverso (Nginx/Envoy)
            client_ip = request.client.host if request.client else "unknown"
            # Asumimos que los proxies corren en redes privadas o localhost en un despliegue Docker
            if not (client_ip.startswith("10.") or client_ip.startswith("172.") or client_ip.startswith("192.168.") or client_ip == "127.0.0.1"):
                self.logger.critical(f"Intento de spoofing mTLS desde IP pública o no confiable: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Conexión mTLS rechazada por política de proxy seguro"
                )

            # Extraer CN del subject (ej: CN=edge-device-123,O=MinistryOfDefense,C=ES)
            if cert_subject:
                request.state.cert_subject = cert_subject
                request.state.cert_cn = self._extract_cn(cert_subject)
                self.logger.info(f"mTLS: Conexión autenticada desde {request.state.cert_cn}")

        response = await call_next(request)
        return response

    def _extract_cn(self, subject: str) -> str:
        """Extrae Common Name del subject del certificado."""
        try:
            for part in subject.split(","):
                if part.strip().startswith("CN="):
                    return part.strip()[3:]
        except Exception:
            pass
        return "unknown"

    @staticmethod
    def extract_cert_from_request(request: Request) -> Optional[dict]:
        """Utilidad para extraer info del certificado en endpoints."""
        return {
            "subject": getattr(request.state, "cert_subject", None),
            "cn": getattr(request.state, "cert_cn", None)
        }
