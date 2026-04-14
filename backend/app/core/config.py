"""
Configuración centralizada de SESIS usando Pydantic BaseSettings.
Todas las variables se cargan desde variables de entorno o archivo .env
"""
import json
from typing import Optional
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Base de datos
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/sesis"

    # NATS
    NATS_URL: str = "nats://localhost:4222"

    # Ollama AI
    OLLAMA_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production-use-32-plus-bytes"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # CORS: acepta string JSON o lista directa
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # API Keys de operadores: JSON string → {key: {name, roles, clearance}}
    OPERATOR_API_KEYS: str = "{}"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # MinIO / S3
    MINIO_URL: str = "http://minio:9000"
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin"

    # Clasificación
    CLASSIFICATION_LEVELS: list[str] = [
        "OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET", "TOP_SECRET"
    ]

    # JWS public key para verificar firmas de eventos (PEM)
    JWS_PUBLIC_KEY: Optional[str] = None

    # Entorno
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Asume string simple separado por comas
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("CLASSIFICATION_LEVELS", mode="before")
    @classmethod
    def parse_classification_levels(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [lvl.strip() for lvl in v.split(",") if lvl.strip()]
        return v

    def get_operator_api_keys(self) -> dict:
        """Parsea OPERATOR_API_KEYS desde JSON string."""
        try:
            return json.loads(self.OPERATOR_API_KEYS)
        except (json.JSONDecodeError, TypeError):
            return {}


settings = Settings()
