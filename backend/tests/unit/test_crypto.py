"""
Tests para AES Cipher - Verifica cifrado AES-256-GCM.
"""
import pytest
from shared.crypto.aes_cipher import AESCipher, generate_aes_key_hex


class TestAESCipher:
    @pytest.fixture
    def cipher(self):
        key = bytes.fromhex("a" * 64)  # 32 bytes key
        return AESCipher(key)

    def test_encrypt_decrypt_dict(self, cipher):
        data = {
            "mission": "Operation X",
            "target": "Sector 7G",
            "coordinates": [40.5, -3.8]
        }
        
        encrypted = cipher.encrypt(data)
        assert isinstance(encrypted, str)
        
        decrypted = cipher.decrypt(encrypted)
        assert decrypted == data

    def test_encrypt_decrypt_bytes(self, cipher):
        original = b"Secret military data 12345"
        
        iv, ciphertext, tag = cipher.encrypt_bytes(original)
        assert isinstance(iv, bytes)
        assert isinstance(ciphertext, bytes)
        assert isinstance(tag, bytes)
        
        decrypted = cipher.decrypt_bytes(iv, ciphertext, tag)
        assert decrypted == original

    def test_multiple_encrypt_unique_iv(self, cipher):
        data = {"test": "value"}
        enc1 = cipher.encrypt(data)
        enc2 = cipher.encrypt(data)
        # IVs deben ser diferentes
        import json
        iv1 = json.loads(enc1)[0]
        iv2 = json.loads(enc2)[0]
        assert iv1 != iv2

    def test_invalid_data_raises_error(self, cipher):
        with pytest.raises(ValueError):
            cipher.decrypt("invalid json")

    def test_generate_key_hex(self):
        key_hex = generate_aes_key_hex()
        assert len(key_hex) == 64  # 32 bytes = 64 hex chars
