// src/App.js
import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Trip from "./components/Trip/Trip";
import ApproverTripDataView from "./components/ApproverTripDataView/ApproverTripDataView";
import TripDataView from "./components/Trip/TripDataView";
import LocationList from "./components/masters/LocationList";
import LocationForm from "./components/masters/LocationForm";
import DepartmentList from "./components/masters/DepartmentList";
import DepartmentForm from "./components/masters/DepartmentForm";
import UserList from "./components/masters/UserList";
import UserForm from "./components/masters/UserForm";
import CustomData from "./components/masters/CustomData/CustomData";
import TripsApprover from "./components/Trip/TripsApprover";
import ExpenseDataList from "./components/expenseData/expensedatalist";
import TripDetailView from "./components/expenseData/TripDetailView";

// ---------------------------------------------
// Role constants
// ---------------------------------------------
const ROLES = {
  ADMIN: "admin",
  ADMIN1: "admin1",        // <--- new role
  APPROVER: "approver",
  SUBMITTER: "submitter",
  TRAVEL_AGENT: "travel_agent",
};


// ---------------------------------------------
// Small components
// ---------------------------------------------
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

function RequireRole({ allow, currentRole, children }) {
  // Admin and Admin1 can access everything
  if (currentRole === ROLES.ADMIN || currentRole === ROLES.ADMIN1) return children;
  // Other roles must be explicitly allowed
  return allow.includes(currentRole) ? children : <NotAuthorized />;
}


// ---------------------------------------------
// Auth hook (Catalyst-based) embedded in App.js
// ---------------------------------------------
function useUserManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  const renderCatalystLogin = useCallback(() => {
    const maxAttempts = 20;
    let attempt = 0;

    const interval = setInterval(() => {
      const el = document.getElementById("login-element");
      const sdkLoaded = !!window.catalyst?.auth?.signIn;

      if (el && sdkLoaded) {
        clearInterval(interval);
        const config = {
          signin_providers_only: true,
          service_url: "/app/index.html",
        };
        window.catalyst.auth.signIn("login-element", config);
      } else {
        attempt++;
        if (attempt >= maxAttempts) {
          console.error(
            "Login element or Catalyst SDK not found after multiple attempts."
          );
          clearInterval(interval);
        }
      }
    }, 150);
  }, []);

  const checkAuth = useCallback(() => {
    setAuthLoading(true);

    if (!window.catalyst?.auth?.isUserAuthenticated) {
      console.error("Catalyst not initialized or auth unavailable.");
      setAuthLoading(false);
      setIsAuthenticated(false);
      return;
    }

    window.catalyst.auth
      .isUserAuthenticated()
      .then((result) => {
        if (result?.content) {
          const user = result.content;
          setIsAuthenticated(true);
          setUserEmail(user.email_id || user.email || null);
          toast.success(`Welcome ${user.first_name || user.email_id}`);
        } else {
          setIsAuthenticated(false);
          window.catalyst.auth.signOut(
            window.location.origin + "/__catalyst/auth/login"
          );
        }
      })
      .catch((err) => {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        window.catalyst.auth.signOut(
          window.location.origin + "/__catalyst/auth/login"
        );
      })
      .finally(() => setAuthLoading(false));
  }, [renderCatalystLogin]);

  const handleLogout = useCallback(() => {
    if (window.catalyst?.auth?.signOut) {
      window.catalyst.auth.signOut(
        window.location.origin + "/__catalyst/auth/login"
      );
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    toast.success("Logged out");
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    authLoading,
    handleLogout,
    userEmail,
  };
}

// ---------------------------------------------
// Access role hook — fetch current user's role
// ---------------------------------------------
function useAccessRole(userEmail, { defaultRole = ROLES.ADMIN } = {}) {
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(Boolean(userEmail));
  const [error, setError] = useState("");

  const normalizeRole = (value) => {
    const v = String(value || "").toLowerCase();
    if (v === "admin1") return ROLES.ADMIN1; // must come before "admin"
    if (v === "admin") return ROLES.ADMIN;
    if (v.includes("approver")) return ROLES.APPROVER;
    if (v.includes("submit")) return ROLES.SUBMITTER;
    if (v.includes("travel_agent")) return ROLES.TRAVEL_AGENT;
    return defaultRole; // fallback keeps current behavior unaffected
  };



  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/server/find_userDetails/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, action: "check_access" }),
        });

        const json = await res.json();

        if (!res.ok || json.status !== "success") {
          throw new Error(json?.message || "Access check failed");
        }

        // Expecting shape: { status: "success", data: { email, role } }
        const apiRole = json?.data?.role;
        const normalized = normalizeRole(apiRole);
        if (!cancelled) setRole(normalized);
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userEmail, defaultRole]);

  return { role, loading, error };
}

function RoleBasedRedirect({ role }) {
  if (role === ROLES.TRAVEL_AGENT) {
    return <Navigate to="/expenseDataView" replace />;
  }
  return <Navigate to="/home" replace />;
}
// ---------------------------------------------
// Shell with routes & guards
// ---------------------------------------------
function AppShell({ currentRole, userEmail, userName, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isTripData = location.pathname.startsWith("/trip-data");
  const isApproverDataView = location.pathname.startsWith(
    "/approver-trip-data"
  );

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
    else if (key === "trip") navigate("/trip");
    else if (key === "my-approvals") navigate("/trips-approver");
    else if (key === "expenseDataView") navigate("/expenseDataView");
    else if (key === "users") navigate("/masters/users");
    else if (key === "trip-data") navigate("/trip-data");
  };

  return (
    <div className={`app-shell${collapsed ? " collapsed" : ""}`}>
      <Header
        userName={userEmail?.split("@")[0]}   // or actual name from Catalyst if available
        userEmail={userEmail}
        userRole={currentRole}
        onLogout={onLogout}
      />

      <aside className="sidebar">
        <Sidebar
          role={currentRole}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onAdd={handleAddFromSidebar}
          onSelect={handleSelectFromSidebar}
        />
      </aside>

      <main className={`main ${isApproverDataView ? "main--no-scroll" : ""}`}>
        <div className={`content-card ${isTripData ? "tdv-full-bleed" : ""}`}>
          <Routes>
           <Route path="/index.html" element={<RoleBasedRedirect role={currentRole} />} />
            <Route path="/" element={<RoleBasedRedirect role={currentRole} />} />
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />

            {/* Dashboard: everyone */}
            <Route
              path="/dashboard"
              element={<h1>Welcome to Zoho Expense</h1>}
            />

            {/* Home: approver + submitter (+ admin via guard) */}
            <Route
              path="/home"
              element={
                <RequireRole
                  allow={[ROLES.APPROVER, ROLES.SUBMITTER]}
                  currentRole={currentRole}
                >
                  <Home />
                </RequireRole>
              }
            />

            {/* Trip: admin + submitter */}
            <Route
              path="/trip"
              element={
                <RequireRole
                  allow={[ROLES.SUBMITTER, ROLES.ADMIN]}
                  currentRole={currentRole}
                >
                  <Trip />
                </RequireRole>
              }
            />

            {/* My approvals: approver only */}
            <Route
              path="/trips-approver"
              element={
                <RequireRole
                  allow={[ROLES.APPROVER]}
                  currentRole={currentRole}
                >
                  <TripsApprover />
                </RequireRole>
              }
            />

            {/* Admin-only (adjust according to your policy) */}

            <Route
              path="/expenseDataView"
              element={
                <RequireRole allow={[ROLES.ADMIN, ROLES.TRAVEL_AGENT]} currentRole={currentRole}>
                  <ExpenseDataList />
                </RequireRole>
              }
            />

            {/* Detail View */}
           <Route
              path="/expenseDataView/:rowid"
              element={
                <RequireRole allow={[ROLES.ADMIN, ROLES.TRAVEL_AGENT]} currentRole={currentRole}>
                  <TripDetailView />
                </RequireRole>
              }
            />


            <Route
              path="/approver-trip-data/:tripId"
              element={
                <RequireRole
                  allow={[ROLES.APPROVER]}
                  currentRole={currentRole}
                >
                  <ApproverTripDataView />
                </RequireRole>
              }
            />

            <Route
              path="/trip-data"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <TripDataView />
                </RequireRole>
              }
            />

            {/* Masters */}
            <Route
              path="/masters/location"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <LocationList />
                </RequireRole>
              }
            />
            <Route
              path="/masters/location/new"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <LocationForm />
                </RequireRole>
              }
            />
            <Route
              path="/masters/location/:id/edit"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <LocationForm />
                </RequireRole>
              }
            />
            <Route
              path="/masters/users"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <UserList />
                </RequireRole>
              }
            />
            <Route
              path="/masters/department"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <DepartmentList />
                </RequireRole>
              }
            />
            <Route
              path="/masters/department/new"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <DepartmentForm />
                </RequireRole>
              }
            />
            <Route path="/masters/customdata/" element={<CustomData />} />
            <Route
              path="/masters/department/:id/edit"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <DepartmentForm />
                </RequireRole>
              }
            />

            {/* Users */}
            <Route
              path="/masters/users/new"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <UserForm />
                </RequireRole>
              }
            />
            <Route
              path="/masters/user/:id/edit"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <UserForm />
                </RequireRole>
              }
            />

            {/* Fallback */}
           <Route path="*" element={<RoleBasedRedirect role={currentRole} />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------
// Root component
// ---------------------------------------------
export default function App() {
  const { isAuthenticated, authLoading, handleLogout, userEmail } =
    useUserManagement();

  // Fetch role dynamically from your backend (/server/find_userDetails/)
  // while keeping the previous behavior (default admin) until the role is known.
  const {
    role,
    loading: roleLoading,
    error: roleError,
  } = useAccessRole(userEmail, { defaultRole: ROLES.ADMIN });

  return (
    <div className="App">

      {authLoading && (
        <div className="loading">
          <p>Checking authentication...</p>
        </div>
      )}

      {!authLoading && !isAuthenticated && (
        <div id="catalyst-login-container">
          <div id="login-element"></div>
        </div>
      )}

      {!authLoading && isAuthenticated && (
        <BrowserRouter>
          {roleLoading ? (
            <div className="loading">
              <p>Checking access…</p>
            </div>
          ) : (
            <AppShell
              currentRole={role}
              userEmail={userEmail}
              userName={userEmail ? userEmail.split("@")[0] : "User"}
              onLogout={handleLogout}
            />
          )}
          {!!roleError && (
            <div style={{ padding: 12, color: "#a00" }}>
              Access check error: {roleError}
            </div>
          )}
        </BrowserRouter>
      )}

      <ToastContainer />
    </div>
  );
}
