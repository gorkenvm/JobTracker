import os
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import models
import schemas
import apify_service
from database import engine, get_db
from llm_service import analyze_job, generate_motivation_letter
import docx
import re

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API")
scheduler = BackgroundScheduler(timezone="Europe/Berlin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CV_PATH = os.path.join(BASE_DIR, "cv.md")
SAMPLE_PATH = os.path.join(BASE_DIR, "sample.txt")


def _apply_apify_schedule(config: dict):
    scheduler.remove_all_jobs()
    if config.get("enabled") and config.get("schedule_time"):
        try:
            h, m = config["schedule_time"].split(":")
            scheduler.add_job(
                apify_service.fetch_and_import,
                CronTrigger(hour=int(h), minute=int(m)),
                id="apify_daily",
                replace_existing=True,
            )
            print(f"Apify zamanlandı: her gün {config['schedule_time']}")
        except Exception as e:
            print(f"Zamanlama hatası: {e}")


@app.on_event("startup")
def on_startup():
    # DB migrations
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS language_explanation TEXT"))
            conn.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apify_id VARCHAR UNIQUE"))
            conn.commit()
    except Exception as e:
        print(f"Migration uyarısı: {e}")

    # Start scheduler with saved config
    config = apify_service.load_config()
    _apply_apify_schedule(config)
    if not scheduler.running:
        scheduler.start()


@app.on_event("shutdown")
def on_shutdown():
    if scheduler.running:
        scheduler.shutdown(wait=False)


# ── Jobs ──────────────────────────────────────────────────────────────────────

@app.post("/jobs/", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(
        title="Yükleniyor...",
        company="Yükleniyor...",
        description=job.description,
        link=job.link,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    cv_content = ""
    if os.path.exists(CV_PATH):
        with open(CV_PATH, "r", encoding="utf-8") as f:
            cv_content = f.read()

    analysis = analyze_job(
        job_desc=job.description,
        cv_text=cv_content,
        link=job.link,
        provider=job.provider,
        api_key=job.api_key,
        model_name=job.model_name,
    )
    db_job.title = analysis.get("title", "Bilinmiyor")
    db_job.company = analysis.get("company", "Bilinmiyor")
    db_job.summary_tr = analysis.get("summary_tr", "")
    db_job.language_reqs = analysis.get("language_reqs", "")
    db_job.language_explanation = analysis.get("language_explanation", "")
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


# ── CV & Sample ───────────────────────────────────────────────────────────────

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


# ── Letter ────────────────────────────────────────────────────────────────────

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
        sample_letter_text=sample_content,
    )

    db_job.motivation_letter = letter_text
    db.commit()
    db.refresh(db_job)
    return {"letter": letter_text}


@app.post("/export/letter")
def export_letter(req: schemas.ExportRequest):
    if not req.download_path or not os.path.exists(req.download_path):
        raise HTTPException(status_code=400, detail="Invalid or missing download path.")

    doc = docx.Document()
    doc.add_paragraph(req.letter_text)
    safe_company = re.sub(r'[^a-zA-Z0-9_\-]', '_', req.company_name or "Bilinmiyor")
    filename = f"Motivation_Letter_{safe_company}.docx"
    full_path = os.path.join(req.download_path, filename)
    try:
        doc.save(full_path)
        return {"saved_path": full_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save document: {e}")


# ── Apify ─────────────────────────────────────────────────────────────────────

@app.get("/apify/config", response_model=schemas.ApifyConfig)
def get_apify_config():
    return apify_service.load_config()


@app.post("/apify/config", response_model=schemas.ApifyConfig)
def save_apify_config(cfg: schemas.ApifyConfig):
    old = apify_service.load_config()
    merged = {**old, **cfg.model_dump()}
    apify_service.save_config(merged)
    _apply_apify_schedule(merged)
    return merged


@app.post("/apify/fetch")
def manual_apify_fetch(background_tasks: BackgroundTasks):
    background_tasks.add_task(apify_service.fetch_and_import)
    return {"status": "started"}


@app.post("/apify/fetch-url")
def fetch_job_by_url(req: schemas.FetchUrlRequest):
    """Fetch a single LinkedIn job by URL via Apify and return its raw fields."""
    try:
        data = apify_service.fetch_single_url(req.url)
        return data
    except (ValueError, TimeoutError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
