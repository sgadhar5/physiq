import React from 'react';
import Iframe from 'react-iframe';

function PatientSymptom() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Iframe
        url="http://localhost:8501/"
        width="100%"
        height="100%"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative"
        allowFullScreen
      />
    </div>
  );
}

export default PatientSymptom;
