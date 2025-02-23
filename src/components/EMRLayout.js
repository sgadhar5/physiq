import React, { useState } from "react";
import "./../styles/emr-layout.css";
import ChartingAI from "./ChartingAI";
import Tabs from "./Tabs";

function EMRLayout() {
  const [selectedTab, setSelectedTab] = useState("SOAP Notes");

  return (
    <div className="emr-container">
      {/* Sidebar for Navigation */}
      <aside className="sidebar">
        <h2>🩺 EMR Dashboard</h2>
        <nav>
          <ul>
            <li className={selectedTab === "SOAP Notes" ? "active" : ""} onClick={() => setSelectedTab("SOAP Notes")}>SOAP Notes</li>
            <li className={selectedTab === "Prescriptions" ? "active" : ""} onClick={() => setSelectedTab("Prescriptions")}>Prescriptions</li>
            <li className={selectedTab === "Lab Results" ? "active" : ""} onClick={() => setSelectedTab("Lab Results")}>Lab Results</li>
          </ul>
        </nav>
      </aside>

      {/* Main EMR Content */}
      <main className="emr-content">
        <h1>{selectedTab}</h1>
        <Tabs selectedTab={selectedTab} />
        <ChartingAI />
      </main>
    </div>
  );
}

export default EMRLayout;
