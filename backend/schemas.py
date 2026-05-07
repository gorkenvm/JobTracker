from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobCreate(BaseModel):
    link: str
    description: str
    provider: str = "Gemini"
    api_key: str = ""
    model_name: str = "gemini-1.5-pro"

class JobUpdateStatus(BaseModel):
    status: str

class JobUpdateDetails(BaseModel):
    title: str
    company: str

class ApifyConfig(BaseModel):
    token: str = ""
    task_id: str = ""
    schedule_time: str = "09:00"
    enabled: bool = False
    default_provider: str = "Gemini"
    default_api_key: str = ""
    default_model: str = "gemini-1.5-pro"
    last_run: Optional[str] = None
    last_imported: int = 0
    last_skipped: int = 0
    last_error: Optional[str] = None


class Job(BaseModel):
    id: int
    apify_id: Optional[str] = None
    title: str
    company: str
    description: Optional[str] = None
    link: Optional[str] = None
    status: str
    score: Optional[int] = None
    motivation_letter: Optional[str] = None
    summary_tr: Optional[str] = None
    language_reqs: Optional[str] = None
    language_explanation: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LetterRequest(BaseModel):
    job_id: int
    language: str
    draft: str
    provider: str = "Gemini"
    api_key: str = ""
    model_name: str = "gemini-1.5-pro"

class ExportRequest(BaseModel):
    letter_text: str
    company_name: str
    download_path: str

class FetchUrlRequest(BaseModel):
    url: str
