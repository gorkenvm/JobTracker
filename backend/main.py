import os
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db
from llm_service import analyze_job, generate_motivation_letter
import io
import docx
import re

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CV_PATH = os.path.join(BASE_DIR, "cv.md")
SAMPLE_PATH = os.path.join(BASE_DIR, "sample.txt")

@app.post("/jobs/", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    # Create DB entry with placeholders
    db_job = models.Job(
        title="Yükleniyor...", 
        company="Yükleniyor...", 
        description=job.description,
        link=job.link
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Try reading the local CV.md to run AI analysis
    cv_content = ""
    if os.path.exists(CV_PATH):
        with open(CV_PATH, "r", encoding="utf-8") as f:
            cv_content = f.read()

    # Always analyze, even without CV, to extract Title and Company
    analysis = analyze_job(
        job_desc=job.description or "", 
        cv_text=cv_content, 
        link=job.link or "", 
        provider=job.provider, 
        api_key=job.api_key,
        model_name=job.model_name
    )
    db_job.title = analysis.get("title", "Bilinmiyor")
    db_job.company = analysis.get("company", "Bilinmiyor")
    db_job.summary_tr = analysis.get("summary_tr", "")
    db_job.language_reqs = analysis.get("language_reqs", "")
    db_job.location = analysis.get("location", "")
    db_job.score = analysis.get("score", 0)
    
    db.commit()
    db.refresh(db_job)

    return db_job

@app.get("/jobs/", response_model=list[schemas.Job])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).order_by(models.Job.created_at.desc()).all()

@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted"}

@app.put("/jobs/{job_id}/status", response_model=schemas.Job)
def update_job_status(job_id: int, status_update: schemas.JobUpdateStatus, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.status = status_update.status
    db.commit()
    db.refresh(db_job)
    return db_job

@app.put("/jobs/{job_id}/details", response_model=schemas.Job)
def update_job_details(job_id: int, details_update: schemas.JobUpdateDetails, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.title = details_update.title
    db_job.company = details_update.company
    db.commit()
    db.refresh(db_job)
    return db_job

@app.post("/cv/upload")
async def upload_cv(file: UploadFile = File(...)):
    content = await file.read()
    with open(CV_PATH, "wb") as f:
        f.write(content)
    return {"message": "CV uploaded successfully"}

@app.get("/cv/status")
def get_cv_status():
    return {"has_cv": os.path.exists(CV_PATH)}

@app.post("/sample/upload")
async def upload_sample(file: UploadFile = File(...)):
    content = await file.read()
    with open(SAMPLE_PATH, "wb") as f:
        f.write(content)
    return {"message": "Sample letter uploaded successfully"}

@app.get("/sample/status")
def get_sample_status():
    return {"has_sample": os.path.exists(SAMPLE_PATH)}

@app.post("/generate/letter")
def generate_letter(req: schemas.LetterRequest, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == req.job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    cv_content = ""
    if os.path.exists(CV_PATH):
        with open(CV_PATH, "r", encoding="utf-8") as f:
            cv_content = f.read()
            
    if not cv_content:
        raise HTTPException(status_code=400, detail="Please upload a CV first")

    sample_content = ""
    if os.path.exists(SAMPLE_PATH):
        with open(SAMPLE_PATH, "r", encoding="utf-8") as f:
            sample_content = f.read()
            
    letter_text = generate_motivation_letter(
        job_desc=db_job.description, 
        cv_text=cv_content, 
        language=req.language, 
        draft=req.draft,
        provider=req.provider,
        api_key=req.api_key,
        model_name=req.model_name,
        sample_letter_text=sample_content
    )
    
    return {"letter": letter_text}

@app.post("/export/letter")
def export_letter(req: schemas.ExportRequest):
    if not req.download_path or not os.path.exists(req.download_path):
        raise HTTPException(status_code=400, detail="Invalid or missing download path. Please check settings.")
        
    doc = docx.Document()
    doc.add_paragraph(req.letter_text)
    
    # Format filename
    safe_company = re.sub(r'[^a-zA-Z0-9_\-]', '_', req.company_name or "Bilinmiyor")
    filename = f"Motivation_Letter_{safe_company}.docx"
    full_path = os.path.join(req.download_path, filename)
    
    try:
        doc.save(full_path)
        return {"saved_path": full_path}
    except Exception as e:
        print(f"Error saving docx: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save document: {e}")
