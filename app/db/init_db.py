from app.db.database import Base, engine

from app.models.user import User
from app.models.content import Content
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
import app.models.audience
import app.models.growth



def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!")