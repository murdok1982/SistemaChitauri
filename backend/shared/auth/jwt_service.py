"""
JWT Service - Manejo seguro de tokens JWT con refresh y MFA.
Cumple directrices: Access max 15 min, Refresh max 7 días.
"""
import hashlib
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from fastapi import HTTPException, status
import redis
from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str
    exp: int
    mfa: bool = False
    type: str = "access"
    roles: list[str] = []
    clearance: str = "OPEN"
    aud: str = "sesis-c2"
    iss: str = "sesis-auth-server"
    jti: Optional[str] = None


class JWTService:
    """Servicio JWT con refresh tokens y validación MFA."""

    def __init__(self, secret_key: str, algorithm: str = "HS256",
                 access_expire_min: int = 15, refresh_expire_days: int = 7):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expire = timedelta(minutes=access_expire_min)
        self.refresh_expire = timedelta(days=refresh_expire_days)

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def create_access_token(
        self,
        subject: str,
        roles: list[str] = None,
        clearance: str = "OPEN",
        mfa_verified: bool = False
    ) -> str:
        """Crea access token (max 15 min según directrices)."""
        expire = datetime.utcnow() + self.access_expire
        payload = {
            "sub": subject,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
            "mfa": mfa_verified,
            "roles": roles or [],
            "clearance": clearance,
            "aud": "sesis-c2",
            "iss": "sesis-auth-server"
        }
        return jwt.encode(payload, self.secret_key, self.algorithm)

    def create_refresh_token(self, subject: str, redis_client: redis.Redis) -> str:
        """Crea refresh token (max 7 días) y lo almacena hasheado en Redis."""
        import uuid as _uuid
        expire = datetime.utcnow() + self.refresh_expire
        jti = _uuid.uuid4().hex
        payload = {
            "sub": subject,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "aud": "sesis-c2",
            "iss": "sesis-auth-server",
            "jti": jti,
        }
        token = jwt.encode(payload, self.secret_key, self.algorithm)
        # Almacenar SHA-256 del token (no el token íntegro) — CRITICAL HIGH.
        redis_key = f"refresh:{subject}"
        redis_client.setex(redis_key, self.refresh_expire, self._hash_token(token))
        return token

    def decode_token(self, token: str) -> TokenPayload:
        """Decodifica y valida un JWT token verificando claims estrictos."""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                audience="sesis-c2",
                issuer="sesis-auth-server"
            )
            return TokenPayload(**payload)
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token inválido: {str(e)}"
            )

    def verify_refresh_token(self, token: str, redis_client: redis.Redis) -> TokenPayload:
        """
        Verifica refresh token contra Redis (revocación) y rota: revoca el actual
        añadiendo su jti al blacklist con TTL = remaining lifetime.
        """
        payload = self.decode_token(token)
        if payload.type != "refresh":
            raise HTTPException(status_code=400, detail="No es un refresh token")

        # Comprobar blacklist (jti revocado).
        if payload.jti and redis_client.exists(f"revoked:{payload.jti}"):
            raise HTTPException(status_code=401, detail="Refresh token revocado")

        redis_key = f"refresh:{payload.sub}"
        stored = redis_client.get(redis_key)
        if not stored:
            raise HTTPException(status_code=401, detail="Refresh token revocado o inválido")
        stored_str = stored.decode() if isinstance(stored, (bytes, bytearray)) else stored
        if stored_str != self._hash_token(token):
            raise HTTPException(status_code=401, detail="Refresh token revocado o inválido")

        # Revocación rotativa: marcar jti del token consumido como revocado por el resto de su vida.
        if payload.jti:
            remaining = max(1, payload.exp - int(time.time()))
            redis_client.setex(f"revoked:{payload.jti}", remaining, "1")
        # Limpiar la entrada de refresh actual para forzar reemisión.
        redis_client.delete(redis_key)

        return payload

    def rotate_tokens(
        self,
        token: str,
        redis_client: redis.Redis,
        roles: Optional[list[str]] = None,
        clearance: str = "OPEN",
        mfa_verified: bool = False,
    ) -> Tuple[str, str]:
        """
        Verifica el refresh token, lo revoca y emite un nuevo par (access, refresh).
        """
        payload = self.verify_refresh_token(token, redis_client)
        new_access = self.create_access_token(
            subject=payload.sub,
            roles=roles or payload.roles,
            clearance=clearance or payload.clearance,
            mfa_verified=mfa_verified or payload.mfa,
        )
        new_refresh = self.create_refresh_token(payload.sub, redis_client)
        return new_access, new_refresh

    def revoke_refresh_token(self, subject: str, redis_client: redis.Redis) -> None:
        """Revoca refresh token (logout)."""
        redis_client.delete(f"refresh:{subject}")
