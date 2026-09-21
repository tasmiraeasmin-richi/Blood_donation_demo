import logging

logger = logging.getLogger("raktosetu.email")


def send_reset_email(to_email: str, raw_reset_token: str) -> None:
    # Demo/development behavior: no SMTP is configured, so no email is sent.
    # The raw token must never appear in normal (INFO+) logs. The reset link
    # is logged at DEBUG level only, so developers can retrieve it locally
    # by enabling DEBUG logging without leaking tokens into normal log output.
    logger.warning(
        "[EMAIL NOT CONFIGURED] Password-reset requested for %s. "
        "No email was sent; enable DEBUG logging to retrieve the dev reset link.",
        to_email,
    )
    reset_link = f"http://localhost:5173/reset-password/{raw_reset_token}"
    logger.debug("Dev password-reset link for %s -> %s", to_email, reset_link)
