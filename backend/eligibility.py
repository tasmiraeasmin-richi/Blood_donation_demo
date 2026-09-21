from datetime import datetime, timedelta
from typing import Optional

from security import utcnow_naive

DONATION_COOLDOWN_DAYS = 90


def is_donor_eligible(is_available: bool, last_donation_date: Optional[datetime]) -> bool:
    if not is_available:
        return False
    if last_donation_date is None:
        return True
    return (utcnow_naive() - last_donation_date) >= timedelta(days=DONATION_COOLDOWN_DAYS)


def days_until_eligible(last_donation_date: Optional[datetime]) -> int:
    if last_donation_date is None:
        return 0
    elapsed = utcnow_naive() - last_donation_date
    remaining_days = DONATION_COOLDOWN_DAYS - elapsed.days
    return max(remaining_days, 0)
