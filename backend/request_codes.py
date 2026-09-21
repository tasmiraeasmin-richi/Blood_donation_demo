from datetime import datetime

from sqlalchemy.orm import Session

import models


def generate_request_code(db: Session) -> str:
    year = datetime.now().year
    prefix = f"BR-{year}-"
    existing_codes = (
        db.query(models.BloodRequest.request_code)
        .filter(models.BloodRequest.request_code.like(f"{prefix}%"))
        .all()
    )
    highest = 0
    for (code,) in existing_codes:
        suffix = code[len(prefix):]
        if suffix.isdigit():
            highest = max(highest, int(suffix))
    return f"{prefix}{highest + 1:04d}"
