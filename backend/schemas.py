from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    link: Optional[str] = None

class JobCreate(BaseModel):
    link: Optional[str] = None
    description: Optional[str] = None
    provider: str = "Gemini"
    api_key: str = ""
    model_name: str = "gemini-1.5-pro"

class JobUpdateStatus(BaseModel):
    status: str

class JobUpdateDetails(BaseModel):
    title: str
    company: str

class Job(JobBase):
    id: int
    status: str
    score: Optional[int] = None
    motivation_letter: Optional[str] = None
    summary_tr: Optional[str] = None
    language_reqs: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LetterRequest(BaseModel):
    job_id: int
    language: str # 'EN' or 'DE'
    draft: str
    provider: str = "Gemini"
    api_key: str = ""
    model_name: str = "gemini-1.5-pro"

class ExportRequest(BaseModel):
    letter_text: str
    company_name: str
    download_path: str
