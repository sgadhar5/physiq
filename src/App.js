import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebaseConfig";
import Login from "./components/Login";
import Signup from "./components/Signup";
import NoteWriter from "./components/NoteWriter";
import PatientSymptom from "./components/PatientSymptom";
import './styles.css';  // Ensure this path correctly points to your CSS file
import logoImage from './assets/logo.png'; // Adjust the path as necessary

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  return (
    <Router>
      <div>
        {isAuthenticated && (
          <nav className="navbar">
            <ul>
            <img src={logoImage} alt="Company Logo" style={{ height: '100px', marginLeft: '20px' }} />

              <li><Link to="/note-writer" className="nav-link">Note Writer</Link></li>
              <li><Link to="/patient-info" className="nav-link">Patient Symptom Checker</Link></li>
            </ul>
          </nav>
        )}
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/note-writer" /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/note-writer" /> : <Signup />} />
          <Route path="/note-writer" element={isAuthenticated ? <NoteWriter /> : <Navigate to="/" />} />
          <Route path="/patient-info" element={isAuthenticated ? <PatientSymptom /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
