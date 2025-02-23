import pandas as pd
import streamlit as st
from openai import OpenAI
import openai
from PIL import Image
import os
from dotenv import load_dotenv
load_dotenv()

#img = Image.open("logo.png")
st.set_page_config(
    page_title="PhysIQ - At Home AI Diagnosis",
    #page_icon=img,
    layout="wide",
)

st.markdown(
    """
    <style>
    /* Overall page styling */
    body {
        background-color: #f0f2f6;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        font-size: 50px;
    }
    /* Header styling */
    .main-header {
        text-align: center;
        padding: 30px 0 10px 0;
    }
    /* Container for main content */
    .main-container {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin: 20px auto;
    }
    /* Button styling */
    .stButton button {
        background-color: #623ea8;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
    }
    .stButton button:hover {
        background-color: #3c2569;
        color: #fff;
        text-color: #fff !important;
    }
    .stMultiSelect div[role="button"] span {
        color: black !important;
    }
    </style>
    """,
    unsafe_allow_html=True
)


# Load the dataset to obtain a list of possible symptoms
symptoms = ["abdominal pain", "abnormal menstruation", "acidity", "acute liver failure", "altered sensorium", "anxiety", "back pain", "belly pain", "blackheads", "bladder discomfort", "blister", "blood in sputum", "bloody stool", "blurred and distorted vision", "breathlessness", "brittle nails", "bruising", "burning micturition", "chest pain", "chills", "cold hands and feet", "coma", "congestion", "constipation", "continuous feel of urine", "continuous sneezing", "cough", "cramps", "dark urine", "dehydration", "depression", "diarrhoea", "dyschromic patches", "distention of abdomen", "dizziness", "drying and tingling lips", "enlarged thyroid", "excessive hunger", "extra marital contacts", "family history", "fast heart rate", "fatigue", "fluid overload", "fluid overload.1", "foul smell of urine", "headache", "high fever", "hip joint pain", "history of alcohol consumption", "increased appetite", "indigestion", "inflammatory nails", "internal itching", "irregular sugar level", "irritability", "irritation in anus", "itching", "joint pain", "knee pain", "lack of concentration", "lethargy", "loss of appetite", "loss of balance", "loss of smell", "loss of taste", "malaise", "mild fever", "mood swings", "movement stiffness", "mucoid sputum", "muscle pain", "muscle wasting", "muscle weakness", "nausea", "neck pain", "nodal skin eruptions", "obesity", "pain behind the eyes", "pain during bowel movements", "pain in anal region", "painful walking", "palpitations", "passage of gases", "patches in throat", "phlegm", "polyuria", "prominent veins on calf", "puffy face and eyes", "pus filled pimples", "receiving blood transfusion", "receiving unsterile injections", "red sore around nose", "red spots over body", "redness of eyes", "restlessness", "runny nose", "rusty sputum", "scurrying", "shivering", "silver like dusting", "sinus pressure", "skin peeling", "skin rash", "slurred speech", "small dents in nails", "spinning movements", "spotting urination", "stiff neck", "stomach bleeding", "stomach pain", "sunken eyes", "sweating", "swelled lymph nodes", "swelling joints", "swelling of stomach", "swollen blood vessels", "swollen extremities", "swollen legs", "throat irritation", "tiredness", "toxic look (typhus)", "ulcers on tongue", "unsteadiness", "visual disturbances", "vomiting", "watering from eyes", "weakness in limbs", "weakness of one body side", "weight gain", "weight loss", "yellow crust ooze", "yellow urine", "yellowing of eyes", "yellowish skin"]



st.title("PhysIQ")
st.header("At home AI diagnosis")

# Let user select symptoms from the list
user_symptoms = st.multiselect("Select your symptoms:", symptoms)

if st.button("Diagnose"):
    if user_symptoms:
        # Build a prompt for GPT‑4 using the selected symptoms
        prompt = (
            f"I have the following symptoms: {', '.join(user_symptoms)}. "
            "Based on these, what disease or medical condition might I have? "
            "Please provide a brief and concise diagnosis. Keep the answers very brief and casual as to not scare patients. Provide advice and at-home possible remedies and advise to see doctors as needed."
            "Please give a severity level based on the diagnosis and recommend how urgent the patient must seek physician help on a scale of 1 to 5, 5 being urgent. "
        )
        
        # Set your OpenAI API key (it is recommended to store this securely in Streamlit secrets)
#         client = OpenAI(
#     api_key= os.getenv("OPENAI_API_KEY")
# )
        client = OpenAI(api_key="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")

        # Call the GPT‑4 API with the prompt
        chat_completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful and knowledgeable medical assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        
        # Extract and display the predicted diagnosis
        predicted_disease =  chat_completion.choices[0].message.content.strip()
        st.subheader("Predicted Disease:")
        st.write(predicted_disease)
    else:
        st.write("Please select at least one symptom.")
