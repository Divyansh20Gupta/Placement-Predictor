import pdfplumber
from google import genai
from dotenv import load_dotenv
import os
import json
import time

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def gemini_call(prompt):
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text
        except Exception as e:
            if attempt < 2:
                print(f"Gemini busy, retrying in 10 seconds... (attempt {attempt + 1}/3)")
                time.sleep(10)
            else:
                return "GEMINI_UNAVAILABLE"

def parse_resume(filename):
    with pdfplumber.open(filename) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    text = text.replace("(cid:127)", "")

    raw = gemini_call(f"""Extract information from this resume and return ONLY a JSON object with these exact fields:
{{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "college": "college/university name",
  "degree_percentage": "CGPA or percentage as a number or null if not found",
  "ssc_percentage": "10th marks percentage as number or null if not found",
  "hsc_percentage": "12th marks percentage as number or null if not found",
  "gender": "M or F or null if not found",
  "branch": "field of study",
  "skills": ["skill1", "skill2"],
  "internships": [{{"role": "job title", "company": "company name", "duration": "duration"}}],
  "full_time_jobs": [{{"role": "job title", "company": "company name", "duration": "duration"}}],
  "certifications": ["cert1", "cert2"],
  "projects": ["project1", "project2"],
  "college_tier": "Tier 1 or Tier 2 or Tier 3 (Tier 1=IIT/NIT/BITS, Tier 2=VIT/Manipal/IIIT, Tier 3=other private colleges)"
}}

Return ONLY the JSON, no explanation, no markdown, no extra text.

Resume:
{text}""")

    cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
    result = json.loads(cleaned)
    return result