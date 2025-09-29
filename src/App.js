// src/App.js

import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

import Header from "./components/Header";

import Sidebar from "./components/Sidebar";

import Footer from "./components/Footer";

import Home from "./components/Home";

import Trip from "./components/Trip/Trip";

import TripDataView from "./components/Trip/TripDataView";

import LocationList from "./components/masters/LocationList";

import LocationForm from "./components/masters/LocationForm";

import DepartmentList from "./components/masters/DepartmentList";

import DepartmentForm from "./components/masters/DepartmentForm";

import UserList from "./components/masters/UserList";

import UserForm from "./components/masters/UserForm";

import CustomData from "./components/masters/CustomData/CustomData";

import TicketDataView from "./components/TicketDataView/TicketDataView";
import TripsApprover from "./components/Trip/TripsApprover";
/** ──────────────────────────────────────────────────────────────────────────

* Roles & simple guard

* Hardcode the current role for now as requested.

* Allowed roles per route:

*   - admin: everything

*   - approver, submitter: only Home (/home) and Trips (/trip)

* ────────────────────────────────────────────────────────────────────────── */

const ROLES = {
  ADMIN: "admin",

  APPROVER: "approver",

  SUBMITTER: "submitter",
};

// 👉 Hardcoded for the time being

const CURRENT_ROLE = ROLES.APPROVER;

function NotAuthorized() {
  return (
    <div style={{ padding: 24 }}>
      <h2>403 — Not authorized</h2>
      <p>You don’t have access to this page.</p>
      <p>
        Try going back to <a href="/home">Home</a> or <a href="/trip">Trips</a>.
      </p>
    </div>
  );
}

function RequireRole({ allow, children }) {
  // Admin can access everything

  if (CURRENT_ROLE === ROLES.ADMIN) return children;

  // Other roles must be explicitly allowed

  return allow.includes(CURRENT_ROLE) ? children : <NotAuthorized />;
}

/** ──────────────────────────────────────────────────────────────────────────

* App Shell

* ────────────────────────────────────────────────────────────────────────── */

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const isTripData = location.pathname.startsWith("/trip-data");

  const handleAddFromSidebar = (key) => {
    if (key === "location") navigate("/masters/location/new");

    if (key === "departments") navigate("/masters/department/new");

    if (key === "customdata") navigate("/masters/customdata");

    if (key === "users") navigate("/masters/users/new");
  };

  const handleSelectFromSidebar = (key) => {
    if (key === "home") navigate("/home");
    else if (key === "location") navigate("/masters/location");
    else if (key === "departments") navigate("/masters/department");
    else if (key === "customdata") navigate("/masters/customdata");
    else if (key === "trip") {
      if (CURRENT_ROLE === ROLES.APPROVER) {
        navigate("/trips-approver");
      } else {
        navigate("/trip");
      }
    } else if (key === "ticketDataView") navigate("/ticketDataView");
    else if (key === "users") navigate("/masters/users");
    else if (key === "trip-data") navigate("/trip-data");
  };

  return (
    <div className={`app-shell${collapsed ? " collapsed" : ""}`}>
      <Header />

      {/* Pass the current role down so the Sidebar can render allowed menus */}
      <Sidebar
        role={CURRENT_ROLE}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onAdd={handleAddFromSidebar}
        onSelect={handleSelectFromSidebar}
      />

      <main className="main">
        <div className={`content-card ${isTripData ? "tdv-full-bleed" : ""}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard: everyone can see */}
            <Route
              path="/dashboard"
              element={<h1>Welcome to Zoho Expense</h1>}
            />

            {/* Home: approver + submitter + admin */}
            <Route
              path="/home"
              element={
                <RequireRole allow={[ROLES.APPROVER, ROLES.SUBMITTER]}>
                  <Home />
                </RequireRole>
              }
            />

            {/* Trip: approver + submitter + admin */}
            {/* Trip route */}
            <Route
              path="/trip"
              element={
                <RequireRole allow={[ROLES.SUBMITTER]}>
                  <Trip />
                </RequireRole>
              }
            />

            {/* TripsApprover route */}
            <Route
              path="/trips-approver"
              element={
                <RequireRole allow={[ROLES.APPROVER]}>
                  <TripsApprover />
                </RequireRole>
              }
            />

            {/* Admin-only routes below */}
            <Route
              path="/ticketDataView"
              element={
                <RequireRole allow={[]}>
                  <TicketDataView />
                </RequireRole>
              }
            />

            <Route
              path="/trip-data"
              element={
                <RequireRole allow={[]}>
                  <TripDataView />
                </RequireRole>
              }
            />

            {/* Masters */}
            <Route
              path="/masters/location"
              element={
                <RequireRole allow={[]}>
                  <LocationList />
                </RequireRole>
              }
            />
            <Route
              path="/masters/location/new"
              element={
                <RequireRole allow={[]}>
                  <LocationForm />
                </RequireRole>
              }
            />
            <Route
              path="/masters/location/:id/edit"
              element={
                <RequireRole allow={[]}>
                  <LocationForm />
                </RequireRole>
              }

/>


            <Route
              path="/masters/users"
              element={
                <RequireRole allow={[]}>
                  <UserList />
                </RequireRole>
              }
            />

            <Route
              path="/masters/department"
              element={
                <RequireRole allow={[]}>
                  <DepartmentList />
                </RequireRole>
              }
            />
            <Route
              path="/masters/department/new"
              element={
                <RequireRole allow={[]}>
                  <DepartmentForm />
                </RequireRole>
              }
            />
            <Route path="/masters/customdata/" element={<CustomData />} />

            <Route
              path="/masters/department/:id/edit"
              element={
                <RequireRole allow={[]}>
                  <DepartmentForm />
                </RequireRole>
              }
            />

            {/* Users */}
            <Route
              path="/masters/users/new"
              element={
                <RequireRole allow={[]}>
                  <UserForm />
                </RequireRole>
              }
            />
            <Route
              path="/masters/user/:id/edit"
              element={
                <RequireRole allow={[]}>
                  <UserForm />
                </RequireRole>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotAuthorized />} />
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

