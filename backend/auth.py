import bcrypt
import re

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def sanitize_username(username: str) -> str:
    # Strip HTML tags and non-printable characters, limit length
    clean = re.sub(r'<[^>]+>', '', username)   # remove HTML tags
    clean = re.sub(r'[^\w\s\-\.]', '', clean)  # allow only word chars, spaces, hyphens, dots
    clean = clean.strip()[:60]
    return clean
