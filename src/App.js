import React, { useState } from "react";

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import "./App.css";

import Header from "./components/Header";

import Sidebar from "./components/Sidebar";

import Footer from "./components/Footer";
import Home from "./components/Home"
import Trips from "./components/Trips";
import LocationList from "./components/masters/LocationList";
import LocationForm from "./components/masters/LocationForm";
 
const STATES = [

  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",

  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",

  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",

  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",

  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",

  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",

  "Ladakh","Lakshadweep","Puducherry"

];

const USERS  = [{ id: "u1", name: "Alice" }, { id: "u2", name: "Bob" }];

const GSTINS = ["29ABCDE1234F1Z5", "27ABCDE1234F1Z3"];
 
function AppShell() {

  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
 
  const handleAddFromSidebar = (key) => {

    if (key === "location") {

      navigate("/masters/location/new");

    }

  };

  

const handleSelectFromSidebar = (key) => {
  if (key === "home") navigate("/home");
    else if (key === "location") navigate("/masters/location");
    else if (key === "departments") navigate("/masters/department");
    else if (key === "trips") navigate("/trips");
};

 
  return (
<div className={`app-shell${collapsed ? " collapsed" : ""}`}>
<Header />

<Sidebar

          collapsed={collapsed}

          setCollapsed={setCollapsed}

          onAdd={handleAddFromSidebar}
          onSelect={handleSelectFromSidebar}
        />

<main className="main">
<div className="content-card">
<Routes>

            {/* Existing routes */}
<Route path="/" element={<Navigate to="/dashboard" replace />} />
<Route path="/dashboard" element={<h1>Welcome to Zoho Expense</h1>} />
<Route path="/home" element={<Home />} />
<Route path="/trips" element={<Trips />} />
<Route path="/masters/location" element={<LocationList />} />
<Route
  path="/masters/location/new"
  element={
    <div>
      <LocationForm
        states={STATES}
        gstins={GSTINS}
        admins={USERS}
        contacts={USERS}
       // to save location data to backend
onSave={async (data) => {
  try {
    const response = await fetch("/server/ex_location_data_function", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save location");
    }

    const result = await response.json();
    console.log("✅ Location saved:", result);

    navigate("/masters/location"); // Redirect after successful save
  } catch (error) {
    console.error("❌ Error saving location:", error);
    alert("Failed to save location. Please try again.");
  }
}}

        onCancel={() => navigate("/masters/location")}
      />
    </div>
  }
/>




</Routes>
</div>
</main>
<Footer />
</div>

  );

}
 
export default function App() {

  return (
<BrowserRouter>
<AppShell />
</BrowserRouter>

  );

}

 