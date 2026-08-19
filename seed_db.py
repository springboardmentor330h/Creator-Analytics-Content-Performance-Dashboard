from app.db.database import Base, SessionLocal, engine
# Import all models to register them with Base.metadata
from app.models.content import Content
from app.models.user import User, UserRole

# Re-create tables if missing
Base.metadata.create_all(bind=engine)

db = SessionLocal()

user = db.query(User).filter(User.id == 1).first()
if not user:
    demo_user = User(
        id=1,
        email="demo@creatoriq.com",
        full_name="Demo Creator",
        hashed_password="dummy_password",
        role=UserRole.CREATOR,
    )
    db.add(demo_user)
    db.commit()
    print("User 1 successfully created.")
else:
    print("User 1 already exists.")

db.close()