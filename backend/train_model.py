import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_absolute_error
import joblib

np.random.seed(42)
n_students = 500

# Academic features
ssc_p = np.random.normal(70, 10, n_students).clip(40, 99)
hsc_p = np.random.normal(70, 10, n_students).clip(40, 99)
degree_p = np.random.normal(68, 8, n_students).clip(50, 95)

# College tier (1=best, 3=average)
college_tier = np.random.choice([1, 2, 3], n_students, p=[0.15, 0.30, 0.55])

# Resume derived features
num_skills = np.random.randint(3, 25, n_students)
num_internships = np.random.randint(0, 5, n_students)
num_certifications = np.random.randint(0, 8, n_students)
num_projects = np.random.randint(0, 8, n_students)

# Placement score formula (hidden rule model will discover)
placement_score = (
    (degree_p - 50) * 0.8 +
    (ssc_p - 50) * 0.3 +
    (hsc_p - 50) * 0.3 +
    (4 - college_tier) * 8 +
    num_skills * 0.8 +
    num_internships * 5 +
    num_certifications * 2 +
    num_projects * 2 +
    np.random.normal(0, 8, n_students)
)

status = np.where(placement_score > 55, "Placed", "Not Placed")

# Salary formula (only for placed students)
salary = (
    180000 +
    (degree_p * 500) +
    (4 - college_tier) * 40000 +
    num_skills * 800 +
    num_internships * 5000 +
    num_certifications * 1500 +
    num_projects * 1000 +
    np.random.normal(0, 10000, n_students)
).clip(150000, 600000)

salary = np.where(status == "Placed", salary.astype(int), 0)

# Build dataframe
df = pd.DataFrame({
    "ssc_p": ssc_p.round(2),
    "hsc_p": hsc_p.round(2),
    "degree_p": degree_p.round(2),
    "college_tier": college_tier,
    "num_skills": num_skills,
    "num_internships": num_internships,
    "num_certifications": num_certifications,
    "num_projects": num_projects,
    "status": status,
    "salary": salary
})

print("Dataset created! Shape:", df.shape)
print(df["status"].value_counts())

# Encode target
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df["status"] = le.fit_transform(df["status"])

# Features and target
x = df[["ssc_p", "hsc_p", "degree_p", "college_tier",
        "num_skills", "num_internships", "num_certifications", "num_projects"]]
y = df["status"]

# Train test split
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

# Classification model
model = LogisticRegression(max_iter=1000)
model.fit(x_train, y_train)
predictions = model.predict(x_test)
accuracy = accuracy_score(y_test, predictions)
print("Placement Accuracy:", accuracy)

# Salary regression model
placed_df = df[df["status"] == 1]
x_salary = placed_df[["ssc_p", "hsc_p", "degree_p", "college_tier",
                       "num_skills", "num_internships", "num_certifications", "num_projects"]]
y_salary = placed_df["salary"]

x_train_s, x_test_s, y_train_s, y_test_s = train_test_split(x_salary, y_salary, test_size=0.2, random_state=42)

salary_model = LinearRegression()
salary_model.fit(x_train_s, y_train_s)
salary_predictions = salary_model.predict(x_test_s)
mae = mean_absolute_error(y_test_s, salary_predictions)
print("Salary MAE:", mae)

baseline = y_train_s.mean()
baseline_preds = [baseline] * len(y_test_s)
baseline_mae = mean_absolute_error(y_test_s, baseline_preds)
print("Baseline MAE:", baseline_mae)

# Feature importance
feature_importance = pd.DataFrame({
    "feature": x_salary.columns,
    "impact_on_salary": salary_model.coef_
})
print("\nFeature Importance:")
print(feature_importance.sort_values("impact_on_salary", ascending=False))

# Save models
joblib.dump(model, "placement_model.pkl")
joblib.dump(salary_model, "salary_model.pkl")
print("\nModels saved!")