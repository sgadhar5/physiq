import React from "react";

function Tabs({ selectedTab }) {
  return (
    <div className="tab-content">
      {selectedTab === "SOAP Notes" && (
        <div>
          <h2>Subjective, Objective, Assessment, Plan</h2>
          <p><strong>Subjective:</strong> Patient reports mild chest pain, dizziness.</p>
          <p><strong>Objective:</strong> BP 140/90, HR 85, Temp 98.6°F.</p>
          <p><strong>Assessment:</strong> Hypertension, possible angina.</p>
          <p><strong>Plan:</strong> Order ECG, prescribe beta-blockers.</p>
        </div>
      )}

      {selectedTab === "Prescriptions" && (
        <div>
          <h2>Prescribed Medications</h2>
          <p><strong>Atenolol 50mg</strong> – 1 tablet daily.</p>
          <p><strong>Aspirin 81mg</strong> – 1 tablet daily.</p>
        </div>
      )}

      {selectedTab === "Lab Results" && (
        <div>
          <h2>Recent Lab Results</h2>
          <p><strong>Cholesterol:</strong> 210 mg/dL (Borderline High)</p>
          <p><strong>HbA1c:</strong> 6.5% (Pre-Diabetes)</p>
        </div>
      )}
    </div>
  );
}

export default Tabs;
