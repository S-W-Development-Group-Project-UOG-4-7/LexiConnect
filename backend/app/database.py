from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# replace username/password/host/port/dbname as appropriate
DATABASE_URL = "postgresql+psycopg2://lexiuser:12345678@localhost:5432/lexiconnect"

engine = create_engine(DATABASE_URL)  # no check_same_thread with Postgres
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
