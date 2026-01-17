---
name: wallestars-security
description: Security and secrets management for Wallestars using KeePassXC, cryptography, and secure credential handling. Use when managing passwords, encrypting sensitive data, handling API keys, or implementing secure authentication workflows.
---

# Wallestars Security Management

Comprehensive security toolkit for password management, encryption, secrets handling, and secure operations.

## Security Stack

### KeePassXC
- Encrypted password database
- Cross-platform compatibility  
- CLI and GUI access
- TOTP support

### Cryptography
- Encryption/decryption
- Key generation
- Secure hashing
- Digital signatures

## KeePassXC Operations

### Database Management

```python
from pykeepass import PyKeePass

# Open database
kp = PyKeePass('wallestars.kdbx', password='master_password')

# Create entry
entry = kp.add_entry(
    destination_group=kp.root_group,
    title='GitHub',
    username='krasavetsa1',
    password='secure_password_123',
    url='https://github.com'
)

# Get entry
entry = kp.find_entries(title='GitHub', first=True)
print(f"Password: {entry.password}")
```

## Encryption Operations

```python
from cryptography.fernet import Fernet

# Generate key and encrypt
key = Fernet.generate_key()
cipher = Fernet(key)
encrypted = cipher.encrypt(b"Sensitive data")
decrypted = cipher.decrypt(encrypted)
```

## Password Hashing

```python
import bcrypt

# Hash password
password = b"user_password"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())

# Verify
bcrypt.checkpw(password, hashed)
```

## Two-Factor Authentication

```python
import pyotp

# Generate TOTP
secret = pyotp.random_base32()
totp = pyotp.TOTP(secret)
current_code = totp.now()
is_valid = totp.verify(user_code)
```

## Best Practices

1. Use strong passwords (12+ characters)
2. Enable 2FA everywhere
3. Rotate secrets every 90 days
4. Never commit secrets to git
5. Use environment variables
6. Encrypt sensitive data at rest
7. Implement rate limiting
8. Audit security logs regularly
9. Keep dependencies updated
10. Use HTTPS for all APIs
