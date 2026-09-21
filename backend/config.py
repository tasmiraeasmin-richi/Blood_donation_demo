import logging
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger("raktosetu.config")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
RESET_TOKEN_EXPIRE_MINUTES = 30

_DEV_FALLBACK_SECRET = "dev-secret-key-change-me"

SECRET_KEY = os.getenv("RAKTOSETU_SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("RAKTOSETU_ENV", "development").lower() == "production":
        raise RuntimeError(
            "RAKTOSETU_SECRET_KEY is not set. "
            "Set it in backend/.env (see backend/.env.example); "
            "production must not use the dev fallback secret."
        )
    logger.warning(
        "RAKTOSETU_SECRET_KEY is not set; using an insecure dev fallback secret. "
        "Do not use this in production."
    )
    SECRET_KEY = _DEV_FALLBACK_SECRET
