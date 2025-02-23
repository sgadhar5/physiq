import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./../styles/notewriter.css";
import PhysicalExamModal from "./PhysicalExamModal";
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc,getDoc } from "firebase/firestore";

import OpenAI from "openai";

function NoteWriter() {
  const [patientName, setPatientName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [prediction, setPrediction] = useState("");
  const [noteText, setNoteText] = useState("");
  const [physicalExamText, setPhysicalExamText] = useState("Physical Exam:\n");
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [patients, setPatients] = useState([]);
  const [selectedPage, setSelectedPage] = useState("notes"); // Toggle between Notes and Vitals
  const [vitals, setVitals] = useState({ bloodPressure: "", heartRate: "", temperature: "" });
  const textAreaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  // Speech recognition logic
  useEffect(() => {
        recognition.onresult = (event) => {
            // Capture the complete transcript of what's been said so far
            const transcript = Array.from(event.results)
                                    .map(result => result[0])
                                    .map(result => result.transcript)
                                    .join('');
            setFinalTranscript(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
        };

        // Handle stopping manually via button
        recognition.onend = () => {
            console.log('Speech recognition ended.'); // Log when the recognition ends
        };

        if (isListening) {
            recognition.start();
            console.log('Recognition started'); // Log for debugging
        } else {
            recognition.stop();
            setNoteText(currentText => currentText + '\n' + finalTranscript); // Append the complete transcript when stopping
            setFinalTranscript(''); // Clear final transcript after appending
            handleGeneratePrediction1();
        }

        // Ensure to stop recognition when the component unmounts
        return () => {
            recognition.stop();
        };
    }, [isListening]);

// Patient-specific logic
useEffect(() => {
    fetchPatients(); // Function to fetch patient list
    if (patientName && visitDate) {
        loadNote(); // Function to load notes
        loadVitals(); // Function to load vitals
    }
}, [patientName, visitDate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out.");
    }
  };

  
  
  // Fetch list of patients from Firestore
  const fetchPatients = async () => {
    try {
      const notesCollectionRef = collection(db, "notes");
      const snapshot = await getDocs(notesCollectionRef);
      let patientList = snapshot.docs.map((doc) => doc.id);
      setPatients(patientList);
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("Failed to load patients.");
    }
  };
 // Save note under the selected patient's visit
 const saveNote = async () => {
  if (!userId || !patientName || !visitDate) {
    alert("Please enter a patient name and visit date.");
    return;
  }

  try {
    const patientDocRef = doc(db, "notes", patientName);
    await setDoc(patientDocRef, { exists: true }, { merge: true });

    const visitRef = doc(collection(patientDocRef, "visits"), visitDate);

    // Get existing data to merge instead of replacing
    const visitSnap = await getDoc(visitRef);
    let existingData = visitSnap.exists() ? visitSnap.data() : {};

    await setDoc(visitRef, {
      ...existingData, // Keep existing vitals if they exist
      noteText,
      physicalExamText,
      timestamp: new Date(),
    });

    alert("Note saved successfully!");
  } catch (error) {
    console.error("Error saving note:", error);
    alert("Failed to save note.");
  }
};



// Load note for a specific patient and visit date
const loadNote = async () => {
  if (!userId || !patientName || !visitDate) {
    alert("Please enter a patient name and visit date.");
    return;
  }


  try {
    const patientDocRef = doc(db, "notes", patientName);
    const visitRef = doc(collection(patientDocRef, "visits"), visitDate);
    const docSnap = await getDoc(visitRef);


    if (docSnap.exists()) {
      setNoteText(docSnap.data().noteText || "");
      setPhysicalExamText(docSnap.data().physicalExamText || "Physical Exam:\n");
    } else {
      alert("No saved note found for this patient and visit date.");
    }
  } catch (error) {
    console.error("Error loading note:", error);
    alert("Failed to load note.");
  }
};

const saveVitals = async () => {
  if (!userId || !patientName || !visitDate) {
    alert("Please enter a patient name and visit date.");
    return;
  }

  try {
    const patientDocRef = doc(db, "notes", patientName);
    await setDoc(patientDocRef, { exists: true }, { merge: true });

    const visitRef = doc(collection(patientDocRef, "visits"), visitDate);

    // Get existing data to merge instead of replacing
    const visitSnap = await getDoc(visitRef);
    let existingData = visitSnap.exists() ? visitSnap.data() : {};

    await setDoc(visitRef, {
      ...existingData, // Keep existing notes if they exist
      vitals,
      timestamp: new Date(),
    });

    alert("Vitals saved successfully!");
  } catch (error) {
    console.error("Error saving vitals:", error);
    alert("Failed to save vitals.");
  }
};


  // Load vitals for a specific patient and visit date
  const loadVitals = async () => {
    if (!userId || !patientName || !visitDate) {
      alert("Please enter a patient name and visit date.");
      return;
    }
  
    try {
      const patientDocRef = doc(db, "notes", patientName);
      const visitRef = doc(collection(patientDocRef, "visits"), visitDate);
      const docSnap = await getDoc(visitRef);
  
      if (docSnap.exists() && docSnap.data().vitals) {
        const vitalsData = docSnap.data().vitals;
  
        setVitals(vitalsData);
  
        // Format the vitals section
        const vitalsText = `\n\n**Vitals**\n- Blood Pressure: ${vitalsData.bloodPressure || "N/A"}\n- Heart Rate: ${vitalsData.heartRate || "N/A"} BPM\n- Temperature: ${vitalsData.temperature || "N/A"}°F`;
        setVitalsSection(`**Vitals**\n- Blood Pressure: ${vitalsData.bloodPressure || "N/A"}\n- Heart Rate: ${vitalsData.heartRate || "N/A"} BPM\n- Temperature: ${vitalsData.temperature || "N/A"}°F`);

        // Ensure it is inserted AFTER the physical exam section

      } else {
        alert("No saved vitals found for this patient and visit date.");
      }
    } catch (error) {
      console.error("Error loading vitals:", error);
      alert("Failed to load vitals.");
    }
  };
  const [vitalsSection, setVitalsSection] = useState("**Vitals**\n- Blood Pressure: N/A\n- Heart Rate: N/A BPM\n- Temperature: N/A°F");


  const handleInputChange = (e) => {
    const updatedText = e.target.value;
    if (updatedText.includes("\n\n**Physical Exam**\n")) {
      const splitIndex = updatedText.indexOf("\n\n**Physical Exam**\n");
      setNoteText(updatedText.slice(0, splitIndex));
    } else {
      setNoteText(updatedText);
    }
  };



// Function to fetch past notes from Firestore according to the specified database structure
const fetchPastNotes = async (patientName) => {
  try {
    const patientDocRef = doc(db, "notes", patientName);  // Pointing to the patient's document by name
    const visitsCollectionRef = collection(patientDocRef, "visits");  // Subcollection of visits
    const notesQuery = query(visitsCollectionRef, orderBy("timestamp", "desc"), limit(5));  // Query to fetch the latest 5 visits

    const querySnapshot = await getDocs(notesQuery);
    const pastNotes = [];
    querySnapshot.forEach((doc) => {
      if (doc.exists() && doc.data().noteText) {
        pastNotes.push(doc.data().noteText);  // Fetching the noteText field
      }
    });

    return pastNotes;
  } catch (error) {
    console.error("Error fetching past notes:", error);
    return [];
  }
};

  
  // Function to generate suggestions using OpenAI's GPT-4
  const generateSuggestion = async (currentText, patientName) => {
    console.log("Generating suggestion for current text:", currentText); // Debug: Log current text
    const pastNotes = await fetchPastNotes(patientName);
    if (!pastNotes.length) {
      console.log("No past notes available for prediction."); // Debug: Log when no notes are available
      return "";
    }
  
    const prompt = `
Use the past notes to make a fill in the blank structure for the physician to easily fill out for the whole HPI.
    ${pastNotes}

    Current draft text needing enhancement:
    "${currentText}"


    `;
  
    console.log("Sending prompt to OpenAI:", prompt); // Debug: Log the full prompt sent to OpenAI
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `***`, // Use your API key
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a ai tool to provide suggestive predictions for a doctor filling out a HPI note. Don't suggest any information relevant to the patient like complaints, symptoms, age, or gender." },
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: prompt },
          ],
        }),
      });

  
      const data = await response.json();
      console.log("Prediction response:", data); // Debug: Log response data
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      return "";
    }
  };


 const handleGeneratePrediction = async () => {
    if (!patientName) {
      return;
    }
    setIsLoading(true); // Set loading to true
    console.log("Starting prediction generation..."); // Debug: Log start of prediction generation
    const suggestion = await generateSuggestion(noteText, patientName);
    setSuggestions(suggestion);  // Set the fetched suggestion into the suggestions state
    setIsLoading(false); // Set loading to false
    console.log("Prediction generated and set."); // Debug: Log successful prediction setting
    setNoteText(noteText + suggestion);
    return suggestion;
  };

  const generateSuggestion1 = async (currentText, patientName) => {
    console.log("Generating suggestion for current text:", currentText); // Debug: Log current text
    const pastNotes = await fetchPastNotes(patientName);
    if (!pastNotes.length) {
      console.log("No past notes available for prediction."); // Debug: Log when no notes are available
      return "";
    }
  
    const prompt = `
Use the past notes to make a fill in the blank structure for the physician to easily fill out for the whole HPI.
    ${pastNotes}

    Fill out the HPI template with the transcript from the patient encounter.:
    "${finalTranscript}"


    `;
  
    console.log("Sending prompt to OpenAI:", prompt); // Debug: Log the full prompt sent to OpenAI
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `***`, // Use your API key
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a ai tool to provide suggestive predictions for a doctor filling out a HPI note." },
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: prompt },
          ],
        }),
      });

  
      const data = await response.json();
      console.log("Prediction response:", data); // Debug: Log response data
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      return "";
    }
  };


 const handleGeneratePrediction1 = async () => {
    if (!patientName) {
      return;
    }
    setIsLoading(true); // Set loading to true
    console.log("Starting prediction generation..."); // Debug: Log start of prediction generation
    const suggestion = await generateSuggestion1(noteText, patientName);
    setSuggestions(suggestion);  // Set the fetched suggestion into the suggestions state
    setIsLoading(false); // Set loading to false
    console.log("Prediction generated and set."); // Debug: Log successful prediction setting
    setNoteText(noteText + suggestion);
    return suggestion;
  };


  
 
 
  return (
    <div className="notewriter-container">
      {/* Sidebar */}
      <aside className="sidebar">
        
        <nav>
          <ul>

            <li className={selectedPage === "notes" ? "active" : ""} onClick={() => setSelectedPage("notes")}>
              Clinical Notes
            </li>
            <li className={selectedPage === "vitals" ? "active" : ""} onClick={() => setSelectedPage("vitals")}>
              Vitals
            </li>
            <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
          </ul>
        </nav>
       
      </aside>

      {/* Patient Selection */}
      <div className="content-container">
        <div className="patient-info">
          <h3>Patient Selection</h3>
          <div className="input-group">
            <label>Patient Name</label>
            <select value={patientName} onChange={(e) => setPatientName(e.target.value)}>
              <option value="">Select a patient</option>
              {patients.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter a new patient"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>
        </div>

        {/* Conditional Rendering: Clinical Notes or Vitals */}
        {selectedPage === "notes" ? (
   <main className="notewriter-content">
   <h1>Clinical Documentation</h1>


   {/* Combined Textbox (Editable & Non-Editable Sections) */}
   <textarea
     ref={textAreaRef}
     className="notewriter-textarea"
     placeholder="Type your clinical notes here..."
     value={noteText + "\n\n**Physical Exam**\n" + physicalExamText + "\n\n" + vitalsSection + "\n\n"  }
     onChange={handleInputChange}
   />
   

   <div className="button-group">
   <button onClick={handleGeneratePrediction} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Prediction'}
      </button>
      {prediction && (
        <div>
          <h3>Suggestion:</h3>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />
        </div>
        
      )}

     <button className="exam-button" onClick={() => setIsExamModalOpen(true)}>
       Open Physical Exam
     </button>
     <button onClick={() => setIsListening(prevState => !prevState)}>
        {isListening ? 'Stop Listening' : '🎤 Start Listening'}
      </button>
     <button className="save-button" onClick={saveNote}>
       Save Note
     </button>
     <button className="refresh-button" onClick={() => {
  loadNote();
  loadVitals();
}}>
  🔄 Refresh Data
</button>

   </div>
 </main>

        ) : (
          <main className="vitals-content">
            <h1>Patient Vitals</h1>
            <div className="input-group">
              <label>Blood Pressure (mmHg)</label>
              <input
                type="text"
                placeholder="e.g. 120/80"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Heart Rate (BPM)</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 98.6"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              />
            </div>
            <div className="button-group">
              <button className="save-button" onClick={saveVitals}>
                Save Vitals
              </button>
              
              
            </div>
          </main>
        )}
      </div>
      {isExamModalOpen && (
       <PhysicalExamModal
         setIsExamModalOpen={setIsExamModalOpen}
         setPhysicalExamText={setPhysicalExamText}
         existingExamText={physicalExamText}
       />
     )}
   </div>
 );
}

export default NoteWriter;
