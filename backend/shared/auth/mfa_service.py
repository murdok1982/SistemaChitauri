"""
MFA Service - Autenticación multifactor con TOTP (RFC 6238).
Soporta Google Authenticator, Authy, y estándar nacional.
"""
import pyotp
import pyqrcode
from io import BytesIO
import base64
from redis import Redis
from typing import Optional


class MFAService:
    """Servicio de autenticación multifactor usando TOTP."""

    def __init__(self, redis_client: Redis, issuer: str = "SESIS-CHITAURI"):
        self.redis = redis_client
        self.issuer = issuer

    def generate_secret(self, user_id: str) -> str:
        """Genera secreto MFA y lo almacena temporalmente (30 días)."""
        secret = pyotp.random_base32()
        self.redis.setex(f"mfa_secret:{user_id}", 2592000, secret)  # 30 días
        return secret

    def get_provisioning_uri(self, user_id: str, secret: str) -> str:
        """Genera URI para escanear con app autenticadora."""
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_id,
            issuer_name=self.issuer
        )

    def generate_qr_code(self, uri: str) -> str:
        """Genera QR code en base64 para escaneo fácil."""
        qr = pyqrcode.create(uri)
        buffer = BytesIO()
        qr.png(buffer, scale=8)
        return base64.b64encode(buffer.getvalue()).decode()

    def verify_code(self, user_id: str, code: str) -> bool:
        """Verifica código TOTP (válido en ventana de 90 segundos)."""
        secret = self.redis.get(f"mfa_secret:{user_id}")
        if not secret:
            return False
        totp = pyotp.TOTP(secret.decode())
        return totp.verify(code, valid_window=1)

    def enable_mfa(self, user_id: str) -> None:
        """Activa MFA para el usuario (mueve secreto a almacenamiento permanente)."""
        temp_key = f"mfa_secret:{user_id}"
        perm_key = f"mfa_enabled:{user_id}"
        secret = self.redis.get(temp_key)
        if secret:
            self.redis.setex(perm_key, 86400 * 365, secret.decode())  # 1 año
            self.redis.delete(temp_key)

    def is_mfa_enabled(self, user_id: str) -> bool:
        """Verifica si MFA está activo para el usuario."""
        return bool(self.redis.exists(f"mfa_enabled:{user_id}"))

    def generate_backup_codes(self, user_id: str, count: int = 10) -> list[str]:
        """Genera códigos de respaldo (uso único)."""
        import secrets
        codes = [secrets.token_hex(4).upper() for _ in range(count)]
        for code in codes:
            self.redis.setex(f"mfa_backup:{user_id}:{code}", 86400 * 365, "1")
        return codes

    def verify_backup_code(self, user_id: str, code: str) -> bool:
        """Verifica y consume código de respaldo."""
        key = f"mfa_backup:{user_id}:{code.upper()}"
        if self.redis.exists(key):
            self.redis.delete(key)
            return True
        return False
