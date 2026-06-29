import joblib
import numpy as np
import pandas as pd
from resume_parser import parse_resume, gemini_call

placement_model = joblib.load("placement_model.pkl")
salary_model = joblib.load("salary_model.pkl")
print("Models loaded successfully!")

# Step 1: Parse resume
filename = input("\nEnter your resume filename (e.g. resume.pdf): ")
resume_data = parse_resume(filename)

print(f"\nHello {resume_data['name']}!")
print(f"College: {resume_data['college']} ({resume_data['college_tier']})")
print(f"Skills found: {len(resume_data['skills'])}")
print(f"Internships found: {len(resume_data['internships'])}")

# Step 2: Collect missing info
ssc_p = resume_data.get("ssc_percentage") or float(input("Your 10th percentage: "))
hsc_p = resume_data.get("hsc_percentage") or float(input("Your 12th percentage: "))
degree_p = resume_data.get("degree_percentage") or float(input("Your CGPA (out of 10, e.g. 7.5): "))

# Step 3: Derive features from resume
college_tier_str = resume_data.get("college_tier", "Tier 3")
college_tier = int(college_tier_str.split(" ")[1])

num_skills = len(resume_data.get("skills", []))
num_internships = len(resume_data.get("internships", []))
num_certifications = len(resume_data.get("certifications", []))
num_projects = len(resume_data.get("projects", []))
degree_p_scaled = degree_p * 10

print(f"\nHere's your complete profile:")
print(f"10th: {ssc_p}% | 12th: {hsc_p}% | CGPA: {degree_p}")
print(f"College Tier: {college_tier}")
print(f"Skills: {num_skills} | Internships: {num_internships}")
print(f"Certifications: {num_certifications} | Projects: {num_projects}")

# Step 4: Prepare model input
input_features = pd.DataFrame([[
    ssc_p, hsc_p, degree_p_scaled, college_tier,
    num_skills, num_internships, num_certifications, num_projects
]], columns=["ssc_p", "hsc_p", "degree_p", "college_tier",
             "num_skills", "num_internships", "num_certifications", "num_projects"])

# Step 5: Predict
placement_prediction = placement_model.predict(input_features)[0]
salary_prediction = salary_model.predict(input_features)[0]

print("\n========== PREDICTION RESULT ==========")
if placement_prediction == 1:
    print("Placement Status: LIKELY TO BE PLACED")
    print(f"Expected Salary: INR {int(salary_prediction):,} per annum")
else:
    print("Placement Status: NEEDS IMPROVEMENT")
    print("Salary Prediction: Not applicable")
print("========================================")

# Step 6: Quantitative suggestions
print("\n========== SUGGESTIONS TO IMPROVE YOUR VALUE ==========")
suggestions = []

if num_internships < 2:
    suggestions.append(f"Get more internships — each adds ~INR 8,000 to salary. You have {num_internships}, aim for at least 2.")
if num_certifications < 4:
    suggestions.append(f"Add more certifications — each adds ~INR 2,000 to salary. You have {num_certifications}, aim for at least 4.")
if num_projects < 4:
    suggestions.append(f"Build more projects — each adds ~INR 1,500 to salary. You have {num_projects}, aim for at least 4.")
if num_skills < 10:
    suggestions.append(f"Expand your skillset — you have {num_skills} skills, aim for at least 10.")
if degree_p < 7.0:
    suggestions.append(f"Improve your CGPA — you have {degree_p}, students with 7.5+ have better placement odds.")
if not suggestions:
    suggestions.append("Your profile is strong! Focus on applying to companies matching your skillset.")

for i, suggestion in enumerate(suggestions, 1):
    print(f"{i}. {suggestion}")

# Step 7: Gemini personalized suggestions
skills_str = ", ".join(resume_data.get("skills", []))
internships_str = ", ".join([i["role"] for i in resume_data.get("internships", [])])

print("\nGenerating personalized skill recommendations...")
gemini_response = gemini_call(f"""A student has these skills: {skills_str}
Their internship experience: {internships_str}
Their college tier: {college_tier_str}

Based on current job market demands in India for freshers:
1. List 3 specific technical skills they should learn next (that they don't already have)
2. List 2 specific certifications that would boost their employability
3. Suggest 1 project idea that would impress recruiters given their current skillset

Keep each suggestion concise and specific. Format as:

SKILLS TO LEARN:
- skill 1: why it matters
- skill 2: why it matters
- skill 3: why it matters

CERTIFICATIONS TO GET:
- cert 1: why it matters
- cert 2: why it matters

PROJECT IDEA:
- project idea: brief description""")

print("\n========== PERSONALIZED SKILL RECOMMENDATIONS ==========")
print(gemini_response)
print("=========================================================")