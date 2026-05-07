from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    apify_id = Column(String, unique=True, nullable=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    description = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    status = Column(String, default="Yeni")
    score = Column(Integer, nullable=True)
    motivation_letter = Column(Text, nullable=True)
    summary_tr = Column(Text, nullable=True)
    language_reqs = Column(String, nullable=True)
    language_explanation = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
