"""
Reset a user's password directly in the database.

Useful when you've lost the password for an account (e.g. an admin created
via a raw API call) and there's no in-app password-reset flow.

Usage:
    python reset_password.py <email> <new_password>

Example:
    python reset_password.py creatoriq.admin2@creatoriq.dev adminpass123
"""

import sys

from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.user import User


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    email, new_password = sys.argv[1], sys.argv[2]

    if len(new_password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"No user found with email: {email}")
            sys.exit(1)

        user.hashed_password = get_password_hash(new_password)
        db.commit()

        print(f"Password reset for {user.full_name} <{user.email}> (role: {user.role.value}).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
