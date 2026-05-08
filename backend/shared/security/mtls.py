"""
mTLS Middleware - Autenticación mutua TLS para comunicaciones Edge-Backend.
Obligatorio para sistema militar estatal.
"""
import base64
import hashlib
import logging
from datetime import datetime, timezone
from typing import Callable, Iterable, Optional
from urllib.parse import unquote

from cryptography import x509
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("sesis.security.mtls")

# Cache lazy del cert de la CA a nivel de módulo (evita IO en cada petición).
_CA_CERT: Optional[x509.Certificate] = None


def _load_ca_cert(ca_cert_path: str) -> x509.Certificate:
    global _CA_CERT
    if _CA_CERT is not None:
        return _CA_CERT
    with open(ca_cert_path, "rb") as f:
        _CA_CERT = x509.load_pem_x509_certificate(f.read())
    return _CA_CERT


def _decode_client_cert(raw_header: str) -> Optional[str]:
    """Soporta tanto URL-encoded PEM como base64-encoded PEM/DER en header."""
    if not raw_header:
        return None
    try:
        candidate = unquote(raw_header)
        if "BEGIN CERTIFICATE" in candidate:
            return candidate
    except Exception:
        candidate = raw_header
    try:
        decoded = base64.b64decode(raw_header, validate=False)
        text = decoded.decode("utf-8", errors="ignore")
        if "BEGIN CERTIFICATE" in text:
            return text
    except Exception:
        pass
    return candidate if "BEGIN CERTIFICATE" in candidate else None


def _verify_cert_signature(ca_cert: x509.Certificate, client_cert: x509.Certificate) -> None:
    """Verifica que el cert cliente esté firmado por la CA. Lanza InvalidSignature si no."""
    ca_pubkey = ca_cert.public_key()
    if isinstance(ca_pubkey, rsa.RSAPublicKey):
        ca_pubkey.verify(
            client_cert.signature,
            client_cert.tbs_certificate_bytes,
            padding.PKCS1v15(),
            client_cert.signature_hash_algorithm,
        )
    elif isinstance(ca_pubkey, ec.EllipticCurvePublicKey):
        ca_pubkey.verify(
            client_cert.signature,
            client_cert.tbs_certificate_bytes,
            ec.ECDSA(client_cert.signature_hash_algorithm),
        )
    else:
        # Otros tipos (ed25519, ed448) — verify acepta sólo (sig, data).
        ca_pubkey.verify(client_cert.signature, client_cert.tbs_certificate_bytes)


def _extract_cn(name: x509.Name) -> Optional[str]:
    try:
        attrs = name.get_attributes_for_oid(x509.NameOID.COMMON_NAME)
        if attrs:
            return attrs[0].value
    except Exception:
        return None
    return None


def _spki_fingerprint(cert: x509.Certificate) -> str:
    from cryptography.hazmat.primitives import serialization
    spki = cert.public_key().public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return hashlib.sha256(spki).hexdigest()


class MTLSMiddleware(BaseHTTPMiddleware):
    """
    Middleware para validar certificados cliente (mTLS).
    Extrae información del certificado y la inyecta en request.state
    """

    def __init__(
        self,
        app,
        ca_cert_path: Optional[str] = None,
        require_mtls: bool = False,
        ip_whitelist: Optional[Iterable[str]] = None,
    ):
        super().__init__(app)
        self.ca_cert_path = ca_cert_path
        self.require_mtls = require_mtls
        self.logger = logger
        # IPs locales siempre permitidas; el operador puede añadir IPs proxy adicionales.
        base_whitelist = {"127.0.0.1", "::1"}
        if ip_whitelist:
            base_whitelist.update(ip_whitelist)
        self.ip_whitelist = base_whitelist

    async def dispatch(self, request: Request, call_next: Callable):
        client_cert_header = request.headers.get("X-SSL-Client-Cert")
        client_ip = request.client.host if request.client else "unknown"

        if self.require_mtls:
            # Caso 1: el header trae el cert (proxy mTLS upstream).
            if client_cert_header:
                if not self.ca_cert_path:
                    self.logger.error("mTLS requerido pero ca_cert_path no configurado")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="mTLS mal configurado en el servidor",
                    )

                client_pem = _decode_client_cert(client_cert_header)
                if not client_pem:
                    self.logger.warning("mTLS: header X-SSL-Client-Cert no decodificable")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Certificado cliente ilegible",
                    )

                try:
                    ca_cert = _load_ca_cert(self.ca_cert_path)
                    client_cert = x509.load_pem_x509_certificate(client_pem.encode())
                except Exception as e:
                    self.logger.warning("mTLS: error cargando certs: %s", e)
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Certificado cliente inválido",
                    )

                # Validar firma contra CA.
                try:
                    _verify_cert_signature(ca_cert, client_cert)
                except InvalidSignature:
                    self.logger.warning("mTLS: firma del cert cliente inválida contra CA")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Certificado cliente no firmado por CA confiable",
                    )
                except Exception as e:
                    self.logger.warning("mTLS: error verificando firma: %s", e)
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Verificación de certificado falló",
                    )

                # Validar fechas (UTC).
                now = datetime.now(timezone.utc)
                try:
                    not_before = client_cert.not_valid_before_utc
                    not_after = client_cert.not_valid_after_utc
                except AttributeError:
                    # Compat: cryptography <42 expone los naive *_before / *_after en UTC.
                    not_before = client_cert.not_valid_before.replace(tzinfo=timezone.utc)
                    not_after = client_cert.not_valid_after.replace(tzinfo=timezone.utc)
                if not (not_before <= now <= not_after):
                    self.logger.warning("mTLS: cert fuera de ventana de validez")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Certificado fuera de ventana de validez",
                    )

                # Exponer subject CN y huella SPKI.
                request.state.mtls_subject = _extract_cn(client_cert.subject)
                request.state.mtls_fingerprint = _spki_fingerprint(client_cert)
                request.state.cert_subject = client_cert.subject.rfc4514_string()
                request.state.cert_cn = request.state.mtls_subject or "unknown"
                self.logger.info(
                    "mTLS OK subject=%s fp=%s ip=%s",
                    request.state.mtls_subject,
                    request.state.mtls_fingerprint[:16],
                    client_ip,
                )
            else:
                # Caso 2: sin header → sólo se permite si IP cliente está en whitelist (bypass interno).
                if client_ip not in self.ip_whitelist:
                    self.logger.warning(
                        "mTLS requerido y no provisto desde IP no autorizada: %s", client_ip
                    )
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Certificado cliente requerido (mTLS)",
                    )

        response = await call_next(request)
        return response

    def _extract_cn(self, subject: str) -> str:
        """Extrae Common Name del subject del certificado (string CSV-style)."""
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
            "cn": getattr(request.state, "cert_cn", None),
            "fingerprint": getattr(request.state, "mtls_fingerprint", None),
        }
