"""
JWT Service - Manejo seguro de tokens JWT con refresh y MFA.
Cumple directrices: Access max 15 min, Refresh max 7 días.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
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


class JWTService:
    """Servicio JWT con refresh tokens y validación MFA."""

    def __init__(self, secret_key: str, algorithm: str = "HS256",
                 access_expire_min: int = 15, refresh_expire_days: int = 7):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expire = timedelta(minutes=access_expire_min)
        self.refresh_expire = timedelta(days=refresh_expire_days)

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
        """Crea refresh token (max 7 días) y lo almacena en Redis."""
        expire = datetime.utcnow() + self.refresh_expire
        payload = {
            "sub": subject,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "aud": "sesis-c2",
            "iss": "sesis-auth-server"
        }
        token = jwt.encode(payload, self.secret_key, self.algorithm)
        # Almacenar en Redis con expiración
        redis_key = f"refresh:{subject}"
        redis_client.setex(redis_key, self.refresh_expire, token)
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
        """Verifica refresh token contra Redis (revocación)."""
        payload = self.decode_token(token)
        if payload.type != "refresh":
            raise HTTPException(status_code=400, detail="No es un refresh token")

        redis_key = f"refresh:{payload.sub}"
        stored = redis_client.get(redis_key)
        if not stored or stored.decode() != token:
            raise HTTPException(status_code=401, detail="Refresh token revocado o inválido")
        return payload

    def revoke_refresh_token(self, subject: str, redis_client: redis.Redis) -> None:
        """Revoca refresh token (logout)."""
        redis_client.delete(f"refresh:{subject}")
