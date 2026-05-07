import os
import json
import google.generativeai as genai
from openai import OpenAI
import anthropic


def call_llm(prompt: str, provider: str, api_key: str, model_name: str, is_json: bool = False) -> str:
    if provider == "OpenAI":
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model_name,
            response_format={"type": "json_object"} if is_json else None,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    elif provider == "Claude":
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model_name,
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    else:  # Default to Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        config = genai.GenerationConfig(response_mime_type="application/json") if is_json else None
        response = model.generate_content(prompt, generation_config=config)
        return response.text


def analyze_job(job_desc: str, cv_text: str, link: str = "", provider: str = "Gemini", api_key: str = "", model_name: str = "gemini-1.5-pro") -> dict:
    prompt = f"""
    You are an expert HR recruiter and career assistant.
    Analyze the following job application against the provided CV.

    Job Link: {link}
    Job Description:
    {job_desc}

    Applicant CV:
    {cv_text}

    Return a JSON object with exactly these fields:

    - "title": Job title extracted from the description. If unknown, use "Bilinmiyor".
    - "company": Company name extracted from the description. If unknown, use "Bilinmiyor".
    - "summary_tr": A professional, high-density summary in Turkish (max 400 words) structured with these labeled sections:
        [Sektör]: Company's industry and domain.
        [Rol]: Core purpose of the position.
        [Beklentiler]: Key responsibilities and required seniority level.
        [Teknoloji]: Main tools, languages, and frameworks required.
        [Güçlü Yönler]: Top 3 strengths from the CV that match this role.
        [Eksikler]: Top 3 gaps or missing requirements relative to this role.
        Avoid filler words. Focus on hard facts only.
    - "language_reqs": Language requirements in 'DE: [Level] / ENG: [Level]' format (e.g., DE: B2 / ENG: C1). If none stated, return "Belirtilmemiş".
    - "language_explanation": 1-2 sentences in Turkish explaining how you determined the language levels (e.g., based on keywords like 'sicheres Deutsch', the language of the job ad, or the nature of the role).
    - "location": Extracted job location (e.g., Berlin, Remote). If unknown, use "Bilinmiyor".
    - "score": Compatibility score 0-100 based on weighted evaluation. Do NOT just match keywords — analyze depth of experience.
        Weighting:
        - Technical Stack Match (40%): Alignment of tools, languages, frameworks.
        - Seniority & Experience (30%): Years of experience and responsibility level vs. job requirements.
        - Industry/Domain Fit (15%): Relevant sector experience.
        - Education & Languages (15%): Degree and language prerequisites.
        Final score must reflect realistic hiring probability. If a mandatory skill (e.g., German for a German-only role) is missing, penalize heavily.
    """
    try:
        response_text = call_llm(prompt, provider, api_key, model_name, is_json=True)
        data = json.loads(response_text)
        return data
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return {
            "title": "Analiz Edilemedi",
            "company": "Analiz Edilemedi",
            "summary_tr": "Analysis failed.",
            "language_reqs": "Bilinmiyor",
            "language_explanation": "",
            "location": "Bilinmiyor",
            "score": 0
        }


def generate_motivation_letter(job_desc: str, cv_text: str, language: str, draft: str, provider: str = "Gemini", api_key: str = "", model_name: str = "gemini-1.5-pro", sample_letter_text: str = "") -> str:
    lang_name = "English" if language == "EN" else "German"

    sample_instruction = ""
    if sample_letter_text:
        sample_instruction = f"""
--- SAMPLE LETTER (tone, structure, and personal details to copy) ---
YOU MUST EXACTLY COPY the Name, Address, Email, and Phone number from this sample.
Mimic its tone and writing style closely.
{sample_letter_text}
"""

    draft_instruction = "No specific notes provided."
    if draft and draft.strip():
        draft_instruction = f"""
CRITICAL: The applicant provided the following notes. Incorporate them prominently and seamlessly.
Do NOT ignore any instruction or reference mentioned here.
NOTES:
{draft}
"""

    prompt = f"""
You are an expert career coach specializing in the German job market.
Write a highly professional motivation letter for a job application.
Use a direct, evidence-based tone: no hyperbole, no filler phrases, concrete achievements with numbers where possible.

CRITICAL RULE 1: Write the entire letter in {lang_name}. Do NOT mix languages.
CRITICAL RULE 2: Output ONLY plain text. No markdown, no asterisks, no hashtags, no bold tags.
CRITICAL RULE 3: If a SAMPLE LETTER is provided, EXACTLY COPY the Name, Address, Email, and Phone from it. Do not invent contact details.
CRITICAL RULE 4: The letter MUST be between 250 and 350 words.
CRITICAL RULE 5: Incorporate all applicant notes below. Do not ignore any instruction.

--- JOB DESCRIPTION ---
{job_desc}

--- APPLICANT CV ---
{cv_text}

{sample_instruction}

--- APPLICANT NOTES / DRAFT ---
{draft_instruction}

--- LETTER STRUCTURE (4 paragraphs, no headers or labels) ---

Paragraph 1 — Opening:
State the exact position and give the single strongest reason the applicant is a fit. Be specific.

Paragraph 2 — Technical Experience:
Highlight 2-3 specific, quantified achievements from the CV most relevant to this role. Use numbers. Do not invent facts.

Paragraph 3 — Company Connection:
Explain why the applicant is interested in this specific company and role. Reference something concrete from the job description.

Paragraph 4 — Closing:
State availability, work authorization, and include a clear professional call to action.
"""
    try:
        return call_llm(prompt, provider, api_key, model_name, is_json=False)
    except Exception as e:
        print(f"Error generating letter: {e}")
        return "Generation failed."
