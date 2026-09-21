import logging

logger = logging.getLogger("raktosetu.email")


def send_reset_email(to_email: str, raw_reset_token: str) -> None:
    reset_link = f"http://localhost:5173/reset-password/{raw_reset_token}"
    logger.warning(
        "[EMAIL NOT CONFIGURED] Would send password-reset email to %s -> %s",
        to_email,
        reset_link,
    )
