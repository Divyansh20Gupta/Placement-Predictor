from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import joblib
import shutil
import os
import tempfile
import pandas as pd
from resume_parser import parse_resume, gemini_call

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

placement_model = joblib.load("placement_model.pkl")
salary_model = joblib.load("salary_model.pkl")

@app.get("/")
def home():
    return {"message": "Placement Predictor API is running!"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    ssc_p: float = Form(...),
    hsc_p: float = Form(...),
    degree_p: float = Form(...),
    is_graduated: bool = Form(False)
):
    # Save uploaded PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # Parse resume
    resume_data = parse_resume(tmp_path)

    # Derive features
    college_tier_str = resume_data.get("college_tier", "Tier 3")
    college_tier = int(college_tier_str.split(" ")[1])
    num_skills = len(resume_data.get("skills", []))
    num_internships = len(resume_data.get("internships", []))
    num_certifications = len(resume_data.get("certifications", []))
    num_projects = len(resume_data.get("projects", []))
    degree_p_scaled = degree_p * 10

    # Prepare model input
    input_features = pd.DataFrame([[
        ssc_p, hsc_p, degree_p_scaled, college_tier,
        num_skills, num_internships, num_certifications, num_projects
    ]], columns=["ssc_p", "hsc_p", "degree_p", "college_tier",
                 "num_skills", "num_internships", "num_certifications", "num_projects"])

    # Predict
    placement_prediction = int(placement_model.predict(input_features)[0])
    salary_prediction = int(salary_model.predict(input_features)[0])

    # Suggestions
    suggestions = []

    if num_internships < 2:
        if not is_graduated:
            suggestions.append(f"Get more internships — you have {num_internships}, aim for at least 2 before graduating.")
        else:
            suggestions.append(f"You have {num_internships} internships — focus on entry-level full-time roles and highlight freelance or personal projects as experience.")

    if num_certifications < 4:
        suggestions.append(f"Add more certifications — you have {num_certifications}, aim for at least 4. Try Google, IBM, or Microsoft certifications.")

    if num_projects < 4:
        suggestions.append(f"Build more projects — you have {num_projects}, aim for at least 4. Focus on projects that solve real problems.")

    if num_skills < 10:
        suggestions.append(f"Expand your skillset — you have {num_skills} skills, aim for at least 10. Focus on in-demand technologies.")

    if degree_p < 7.0:
        if not is_graduated:
            suggestions.append(f"Your CGPA is {degree_p} — aim for 7.5+. Focus on upcoming semester exams to bring it up.")
        else:
            suggestions.append(f"Your CGPA was {degree_p} — compensate by adding strong projects, certifications, and real work experience to your profile.")

    if college_tier == 3:
        if not is_graduated:
            suggestions.append("Build a strong GitHub profile and get certifications from Google, IBM, or Microsoft to stand out despite college tier.")
        else:
            suggestions.append("Highlight your work experience and projects prominently — they matter more than college tier for experienced candidates.")

    if not suggestions:
        suggestions.append("Your profile is strong! Focus on applying to companies matching your skillset and keep building projects.")

    # Gemini personalized suggestions
    skills_str = ", ".join(resume_data.get("skills", []))
    internships_str = ", ".join([i["role"] for i in resume_data.get("internships", [])])
    gemini_suggestions = gemini_call(f"""A {'graduate' if is_graduated else 'student'} has these skills: {skills_str}
Their internship experience: {internships_str}
Their college tier: {college_tier_str}
Based on current job market in India for freshers:
1. 3 specific skills to learn next
2. 2 certifications to get
3. 1 project idea
Keep it concise.""")

    # Clean up temp file
    os.remove(tmp_path)

    # Return response
    return {
        "name": resume_data.get("name"),
        "college": resume_data.get("college"),
        "college_tier": college_tier_str,
        "skills_count": num_skills,
        "internships_count": num_internships,
        "certifications_count": num_certifications,
        "projects_count": num_projects,
        "placement_prediction": placement_prediction,
        "salary_prediction": salary_prediction,
        "suggestions": suggestions,
        "gemini_suggestions": gemini_suggestions
    }