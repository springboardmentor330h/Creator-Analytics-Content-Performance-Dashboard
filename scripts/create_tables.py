import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from app.db.database import Base,engine
import app.models

if __name__=="__main__":
    Base.metadata.create_all(bind=engine)
    print("All CreatorIQ database tables created successfully.")
