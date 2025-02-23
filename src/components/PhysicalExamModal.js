import React, { useState, useEffect } from "react";
import "./../styles/physicalexam.css";

const examSystems = {
  General: [
    "Well-nourished", "Obese", "Cachectic", "In acute distress",
    "Normal skin color", "Pale", "Jaundiced", "Cyanotic"
  ],
  Head: [
    "Normocephalic, atraumatic", "Scalp normal", "Scalp tender",
    "Facial symmetry normal", "Facial asymmetry", "Lesions",
    "Tender sinuses", "Tenderness"
  ],
  Eyes: [
    "Pupils equal, round, reactive to light (PERRL)", "Conjunctival injection",
    "Sclerae anicteric", "EOMI", "Fundoscopic exam normal",
    "Papilledema present", "Retinal hemorrhage", "Conjunctival pallor"
  ],
  Ears: [
    "Hearing loss", "Otorrhea", "Tympanic membranes normal",
    "Tenderness", "External ear normal"
  ],
  Nose: [
    "Nasal congestion", "Septum midline", "Nasal mucosa normal",
    "Nasal polyps", "Sinus tenderness", "Epistaxis"
  ],
  Mouth: [
    "Mucous membranes moist", "Oropharynx clear", "Tonsillar exudates",
    "Oral lesions", "Dental caries"
  ],
  Neck: [
    "Lymphadenopathy", "Thyromegaly",  "JVD",
    "Neck supple", "Full ROM", "Cervical tenderness"
  ],
  Cardiovascular: [
    "Regular rate and rhythm", "Murmurs", "Rubs, gallops",
    "Peripheral edema", "Capillary refill < 2 sec",
    "Carotid bruit", "Signs of DVT"
  ],
  Pulmonary: [
    "Clear to auscultation bilaterally", "Rales, wheezing, or rhonchi",
    "Tachypnea", "Normal respiratory effort", "Use of accessory muscles"
  ],
  Abdominal: [
    "Soft, non-tender", "Rebound tenderness", "Guarding",
    "Bowel sounds present", "Hpatosplenomegaly", "Masses"
  ],
  Neurological: [
    "Alert and oriented x3", "Cranial nerves intact", "Strength 5/5 in all extremities",
    "Focal deficits", "Sensation intact", "Reflexes normal",
    "Normal gait", "Pronator drift"
  ],
  Extremities: [
    "Clubbing, cyanosis, or edema", "Full ROM in all joints",
    "Joint swelling", "Tenderness", "Deformities"
  ],
  Skin: [
    "Warm, dry, intact", "Rashes", "Nesions", "Signs of infection",
    "Ulcerations", "Ecchymosis"
  ],
};

function PhysicalExamModal({ setIsExamModalOpen, setPhysicalExamText, existingExamText }) {
  const [selectedSystem, setSelectedSystem] = useState("General");
  const [examFindings, setExamFindings] = useState({});

  useEffect(() => {
    if (existingExamText) {
      setExamFindings(parseExistingExam(existingExamText));
    } else {
      setExamFindings(initializeExamFindings());
    }
  }, [existingExamText]);

  const initializeExamFindings = () => {
    let findings = {};
    Object.keys(examSystems).forEach((system) => {
      findings[system] = {};
      examSystems[system].forEach((symptom) => {
        findings[system][symptom] = ""; // Default to empty (not selected)
      });
    });
    return findings;
  };

  const parseExistingExam = (text) => {
    let findings = initializeExamFindings();
    Object.keys(examSystems).forEach((system) => {
      examSystems[system].forEach((symptom) => {
        if (text.includes(`${symptom} present`)) findings[system][symptom] = "+";
        else if (text.includes(`No ${symptom}`)) findings[system][symptom] = "-";
      });
    });
    return findings;
  };

  const toggleSymptom = (system, symptom, value) => {
    setExamFindings((prev) => ({
      ...prev,
      [system]: {
        ...prev[system],
        [symptom]: prev[system]?.[symptom] === value ? "" : value, // Toggle selection
      },
    }));
  };

  const generateExamNote = () => {
    let updatedExam = {};
    Object.entries(examFindings).forEach(([system, findings]) => {
      let positive = Object.entries(findings)
        .filter(([_, value]) => value === "+")
        .map(([symptom]) => symptom + " present");
      let negative = Object.entries(findings)
        .filter(([_, value]) => value === "-")
        .map(([symptom]) => `No ${symptom}`);

      if (positive.length || negative.length) {
        updatedExam[system] = [...positive, ...negative].join(", ");
      }
    });

    let newExamText = "Physical Exam:\n";
    Object.entries(updatedExam).forEach(([system, details]) => {
      newExamText += `- ${system}: ${details}.\n`;
    });

    setPhysicalExamText(newExamText);
    setIsExamModalOpen(false);
  };

  return (
    <div className="exam-modal">
      <div className="exam-modal-content">
        <h2>Physical Exam</h2>

        {/* System Tabs */}
        <div className="exam-tabs">
          {Object.keys(examSystems).map((system) => (
            <button
              key={system}
              className={selectedSystem === system ? "active" : ""}
              onClick={() => setSelectedSystem(system)}
            >
              {system}
            </button>
          ))}
        </div>

        {/* Checklist with Aligned Buttons */}
        <div className="exam-checklist">
          {examSystems[selectedSystem].map((symptom) => (
            <div key={symptom} className="exam-checkbox">
              <span>{symptom}</span>
              <button
                className={examFindings[selectedSystem]?.[symptom] === "+" ? "positive" : ""}
                onClick={() => toggleSymptom(selectedSystem, symptom, "+")}
              >
                ✅
              </button>
              <button
                className={examFindings[selectedSystem]?.[symptom] === "-" ? "negative" : ""}
                onClick={() => toggleSymptom(selectedSystem, symptom, "-")}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="exam-modal-buttons">
          <button onClick={generateExamNote} className="save-exam">
            Save Exam
          </button>
          <button onClick={() => setIsExamModalOpen(false)} className="cancel-exam">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhysicalExamModal;
