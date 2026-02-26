import os
import json
import google.generativeai as genai
from openai import OpenAI
import anthropic
from pydantic import BaseModel

# Using prompt instructions:
# - Summarize the job in Turkish
# - Extract Language Requirements
# - Extract Location
# - Calculate Compatibility Score (0-100) using the CV against Job Description

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
        # Claude doesn't have a strict JSON mode parameter in the same way, we rely on the prompt
        response = client.messages.create(
            model=model_name,
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
        
    else: # Default to Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        config = genai.GenerationConfig(response_mime_type="application/json") if is_json else None
        response = model.generate_content(prompt, generation_config=config)
        return response.text

def analyze_job(job_desc: str, cv_text: str, link: str = "", provider: str = "Gemini", api_key: str = "", model_name: str = "gemini-1.5-pro") -> dict:
    prompt = f"""
    You are an expert HR recruiter and a career assistant.
    Analyze the following Job Application details against the provided CV.
    
    Job Link: {link}
    Job Description:
    {job_desc}

    Applicant CV:
    {cv_text}

    Provide the following as a structured JSON object:
    - "title": The job title (extract from description). If unknown, "Bilinmiyor".
    - "company": The company name (extract from description). If unknown, "Bilinmiyor".
    - "summary_tr": A concise summary of the job description in Turkish.
    - "language_reqs": Extracted language requirements (e.g. English, German). If none, return "Belirtilmemiş".
    - "location": The extracted location for the job (e.g. Istanbul, Remote).
    - "score": A compatibility score from 0 to 100 indicating how well the CV matches the job. Analyze all parameters, not just keywords.
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
            "summary_tr": "Analysis failed",
            "language_reqs": "Bilinmiyor",
            "location": "Bilinmiyor",
            "score": 0
        }

def generate_motivation_letter(job_desc: str, cv_text: str, language: str, draft: str, provider: str = "Gemini", api_key: str = "", model_name: str = "gemini-1.5-pro", sample_letter_text: str = "") -> str:
    lang_name = "English" if language == "EN" else "German"
    
    sample_instruction = ""
    if sample_letter_text:
        sample_instruction = f"""
    --- SAMPLE LETTER EXPECTED FORMAT/TONE ---
    You MUST analyze its tone, structure, and writing style, and heavily mimic it in your generated letter:
    {sample_letter_text}
    """

    draft_instruction = "No specific notes provided."
    if draft and draft.strip():
        draft_instruction = f"""
    CRITICAL RULE: The applicant has provided the following specific drafts, notes, or points. 
    You MUST incorporate these points prominently and seamlessly into the letter. 
    If they ask to mention a reference, do it. If they ask to mention a skill, do it. Do NOT ignore this!
    NOTES/DRAFT:
    {draft}
    """

    prompt = f"""
    You are an expert copywriter and career coach.
    Write a highly professional motivation letter for a job application.
    
    CRITICAL RULE 1: The entire letter MUST be written in {lang_name}. Do NOT mix languages, even if the CV or Job Description is in a different language.
    CRITICAL RULE 2: Output ONLY the plain text of the letter. Do NOT use markdown.
    CRITICAL RULE 3: ABSOLUTELY NO MARKDOWN FORMATTING. Do not use asterisks (**), hashtags (#), or bold tags. Output ONLY raw, unformatted plain text.
    CRITICAL RULE 4: If a SAMPLE LETTER is provided below, YOU MUST EXACTLY COPY the Name, Address, Email, and Phone number from the sample letter and use them as the applicant's details. DO NOT change or invent personal contact information.
    
    --- JOB DESCRIPTION ---
    {job_desc}
    
    --- APPLICANT CV ---
    {cv_text}
    
    {sample_instruction}
    
    --- APPLICANT DRAFT / INSTRUCTIONS ---
    {draft_instruction}
    """
    try:
        return call_llm(prompt, provider, api_key, model_name, is_json=False)
    except Exception as e:
        print(f"Error generating letter: {e}")
        return "Generation failed."
