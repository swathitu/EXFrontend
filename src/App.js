// src/App.js

import React, { useState } from "react";

import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import "./App.css";
 
import Header from "./components/Header";

import Sidebar from "./components/Sidebar";

import Footer from "./components/Footer";

import Home from "./components/Home";

import Trip from "./components/Trip/Trip";

import LocationList from "./components/masters/LocationList";

import LocationForm from "./components/masters/LocationForm";
import DepartmentList from "./components/masters/DepartmentList";
import DepartmentForm from "./components/masters/DepartmentForm";
import UserList from "./components/masters/UserList";
import UserForm from "./components/masters/UserForm";
import TripDataView from "./components/Trip/TripDataView";

import { listDeptHeads } from "./api/departments";

//Loading department head from backend for the Head dropdown in DepartmentForm
function DepartmentFormLoader({ onSave, onCancel }) {
  const [heads, setHeads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
 
  React.useEffect(() => {
    (async () => {
      try {
        const data = await listDeptHeads();       // calls /Heads
        setHeads(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        setError(e.message || "Failed to load department heads");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
 
  if (loading) return <div>Loading department heads…</div>;
  if (error)   return <div style={{ color: "crimson" }}>Error: {error}</div>;
 
  return <DepartmentForm users={heads} onSave={onSave} onCancel={onCancel} />;
}

const USERS  = [{ id: "u1", name: "Alice" }, { id: "u2", name: "Bob" }];
const ROLES = [
  { id: "submitter", name: "Submitter" },
  { id: "approver",  name: "Approver" },
  { id: "admin",     name: "Admin" },
];
const MANAGERS = USERS; // reuse your user list for now
const DEPARTMENTS = [
  { id: "dep1", name: "Finance" },
  { id: "dep2", name: "Operations" },
  { id: "dep3", name: "HR" },
];
const LOCATIONS = [
  { id: "loc1", name: "Bengaluru HQ" },
  { id: "loc2", name: "Mumbai" },
];

const STATES = [

  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",

  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",

  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",

  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",

  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",

  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",

  "Ladakh","Lakshadweep","Puducherry"

];
 


const GSTINS = ["29ABCDE1234F1Z5", "27ABCDE1234F1Z3"];
 
function AppShell() {

  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
 
  const handleAddFromSidebar = (key) => {

    if (key === "location") navigate("/masters/location/new");
    if (key === "departments") navigate("/masters/department/new");
    if (key === "users") navigate("/masters/users/new");
     

  };
 
  const handleSelectFromSidebar = (key) => {

    if (key === "home") navigate("/home");
    else if (key === "location") navigate("/masters/location");
    else if (key === "departments") navigate("/masters/department");
    else if (key === "trip") navigate("/trip");
    else if (key === "users") navigate("/masters/users");
    else if (key === "trip-data") navigate("/trip-data");
   

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
<Route path="/" element={<Navigate to="/dashboard" replace />} />
<Route path="/dashboard" element={<h1>Welcome to Zoho Expense</h1>} />
<Route path="/home" element={<Home />} />
<Route path="/trip" element={<Trip />} />
<Route path="/trip-data" element={<TripDataView />} />
<Route path="/masters/location" element={<LocationList />} />
<Route

              path="/masters/location/new"

              element={
<LocationForm

                  states={STATES}

                  gstins={GSTINS}

                  admins={USERS}

                  contacts={USERS}

                 onSave={() => navigate("/masters/location")}

                  onCancel={() => navigate("/masters/location")}

                />

              }

            />
<Route path="/masters/department" element={<DepartmentList />} />
<Route
  path="/masters/department/new"
  element={
<DepartmentFormLoader
      onSave={() => navigate("/masters/department")}
      onCancel={() => navigate("/masters/department")}
    />
  }
/>
<Route path="/masters/users" element={<UserList />} />
<Route
              path="/masters/users/new"
              element={
<UserForm
                  roles={ROLES}
                  managers={MANAGERS}
                  departments={DEPARTMENTS}
                  locations={LOCATIONS}
                  onSave={() => navigate("/masters/users")}
                  onCancel={() => navigate("/masters/users")}
                />
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

 