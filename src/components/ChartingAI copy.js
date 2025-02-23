import React, { useState } from "react";
import "./../styles/charting.css";

function ChartingAI() {
  const [inputText, setInputText] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Simulated AI Response (Replace with OpenAI API Call)
  const getAISuggestion = async () => {
    if (inputText.trim() === "") return;

    const simulatedResponse =
      "✅ Suggested: Consider checking blood pressure and recommending a follow-up.";

    setAiResponse(simulatedResponse);
  };

  return (
    <div className="charting-container">
      <h2>🩺 AI-Powered Medical Charting</h2>
      <textarea
        className="charting-textarea"
        placeholder="Type patient notes..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button className="charting-button" onClick={getAISuggestion}>
        ✨ Get AI Suggestion
      </button>
      {aiResponse && <p className="ai-response">{aiResponse}</p>}
    </div>
  );
}

export default ChartingAI;
