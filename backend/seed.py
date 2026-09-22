"""Seed the default Admin user for RaktoSetu.

Runs automatically at FastAPI startup (see main.py lifespan).
Idempotent: identified by email, never creates duplicates.
"""

import logging

import models
from database import SessionLocal
from security import hash_password

logger = logging.getLogger("raktosetu.seed")

ADMIN_EMAIL = "admin@raktosetu.com"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "System Admin"
ADMIN_PHONE = "00000000000"
ADMIN_BLOOD_GROUP = "O+"
ADMIN_DISTRICT = "Dhaka"


def seed_admin() -> models.User | None:
    """Create the default admin if it does not exist.

    Cases handled:
    1. Empty DB / no admin email -> create new admin with hashed password.
    2. Email already exists as admin + active -> do nothing.
    3. Email already exists as member/blocked -> promote to
       role='admin' + status='active', keep existing password.
       (We never create a second row with the same email because
       User.email is unique. We also never overwrite the password
       here, so we cannot hijack a real user's account.)
    """
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == ADMIN_EMAIL).first()

        if existing:
            changed = False
            if existing.role != "admin":
                existing.role = "admin"
                changed = True
            if existing.status != "active":
                existing.status = "active"
                changed = True
            if changed:
                db.commit()
                db.refresh(existing)
                logger.info("Seed: promoted existing '%s' to admin/active.", ADMIN_EMAIL)
            else:
                logger.info("Seed: admin '%s' already exists, skipping.", ADMIN_EMAIL)
            return existing

        admin = models.User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            phone=ADMIN_PHONE,
            hash_password=hash_password(ADMIN_PASSWORD),
            role="admin",
            blood_group=ADMIN_BLOOD_GROUP,
            district=ADMIN_DISTRICT,
            is_available=False,  # admin should not show up as a donor
            status="active",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        logger.info("Seed: created default admin '%s'.", ADMIN_EMAIL)
        return admin
    finally:
        db.close()
