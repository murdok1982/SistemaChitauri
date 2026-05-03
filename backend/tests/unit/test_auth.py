"""
Tests para JWT Service - Verifica JWT real + MFA.
"""
import pytest
from shared.auth.jwt_service import JWTService
from shared.auth.mfa_service import MFAService
import redis


@pytest.fixture
def jwt_service():
    return JWTService(
        secret_key="test_32_byte_secret_key_here_1234567890",
        algorithm="HS256"
    )


@pytest.fixture
def redis_mock():
    """Mock Redis para tests."""
    r = redis.Redis(host='localhost', port=6379, db=15, decode_responses=True)
    yield r
    r.flushdb()
    r.close()


class TestJWTService:
    def test_create_access_token(self, jwt_service):
        token = jwt_service.create_access_token(subject="user123")
        assert token is not None
        assert isinstance(token, str)

    def test_create_and_verify_token(self, jwt_service):
        token = jwt_service.create_access_token(
            subject="user456",
            roles=["admin"],
            clearance="SECRET"
        )
        payload = jwt_service.decode_token(token)
        assert payload.sub == "user456"
        assert payload.roles == ["admin"]
        assert payload.clearance == "SECRET"

    def test_refresh_token_workflow(self, jwt_service, redis_mock):
        token = jwt_service.create_refresh_token("user789", redis_mock)
        assert token is not None

        # Verificar que se almacenó en Redis
        stored = redis_mock.get("refresh:user789")
        assert stored == token

        # Verificar refresh token
        payload = jwt_service.verify_refresh_token(token, redis_mock)
        assert payload.sub == "user789"

    def test_revoke_token(self, jwt_service, redis_mock):
        token = jwt_service.create_refresh_token("user_revok", redis_mock)
        jwt_service.revoke_refresh_token("user_revok", redis_mock)
        
        with pytest.raises(Exception):
            jwt_service.verify_refresh_token(token, redis_mock)

    def test_access_token_expiry(self, jwt_service):
        from datetime import timedelta
        jwt_service.access_expire = timedelta(seconds=1)
        token = jwt_service.create_access_token("test_user")
        
        import time
        time.sleep(2)
        
        with pytest.raises(Exception):
            jwt_service.decode_token(token)


class TestMFAService:
    def test_generate_secret(self, redis_mock):
        from shared.auth.mfa_service import MFAService
        mfa = MFAService(redis_mock)
        secret = mfa.generate_secret("test_user")
        
        assert secret is not None
        assert len(secret) == 16  # Base32 secret

    def test_verify_totp(self, redis_mock):
        import pyotp
        from shared.auth.mfa_service import MFAService
        
        mfa = MFAService(redis_mock)
        secret = mfa.generate_secret("totp_user")
        
        # Generar código válido
        totp = pyotp.TOTP(secret)
        code = totp.now()
        
        assert mfa.verify_code("totp_user", code) == True
        assert mfa.verify_code("totp_user", "000000") == False

    def test_backup_codes(self, redis_mock):
        from shared.auth.mfa_service import MFAService
        
        mfa = MFAService(redis_mock)
        codes = mfa.generate_backup_codes("backup_user", count=5)
        
        assert len(codes) == 5
        assert all(len(c) == 8 for c in codes)

        # Verificar y consumir código
        assert mfa.verify_backup_code("backup_user", codes[0]) == True
        # Ya consumido, no debe funcionar otra vez
        assert mfa.verify_backup_code("backup_user", codes[0]) == False
