// src/App.js
import React, { useEffect, useState, useCallback } from "react";
import {
  HashRouter,
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
import AgentTripDataView from "./components/TravelAgent/AgentTripDataView";
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
import AllRequests from "./components/AllRequests/AllRequests";
import BusDesk from "./components/BusDesk/BusDesk";
import CarDesk from "./components/CarDesk/CarDesk";
import FlightDesk from "./components/FlightDesk/FlightDesk";
import HotelDesk from "./components/HotelDesk/HotelDesk";
import TrainDesk from "./components/TrainDesk/TrainDesk"
import Trips from "./components/Trips/Trips";
import AgentTripList from "./components/AgentTripList/AgentTripList";


// ---------------------------------------------
// Role constants
// ---------------------------------------------
const ROLES = {
  ADMIN: "admin",
  ADMIN1: "admin1",        
  APPROVER: "approver",
  SUBMITTER: "submitter",
  TRAVEL_ASSOCIATE: "travel_associate",  
  AGENT: "agent",
};


// const FlightDesk = () => <h1>Flight Desk View</h1>;
// const HotelDesk = () => <h1>Hotel Desk View</h1>;
// const CarDesk = () => <h1>Car Rentals View</h1>;
// const BusDesk = () => <h1>Bus Desk View</h1>;
// const TrainDesk = () => <h1>Train Desk View</h1>;


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
  if (currentRole === ROLES.ADMIN || currentRole === ROLES.TRAVEL_ASSOCIATE) return children;
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
    const maxAttempts = 40;
    let attempt = 0;

    const interval = setInterval(() => {
      const el = document.getElementById("login-element");
      const sdkLoaded = !!window.catalyst?.auth?.signIn;

      if (el && sdkLoaded) {
        clearInterval(interval);
        const config = {
          signin_providers_only: true,
          service_url: "/app/index.html#/",
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
    if (v.includes("agent")) return ROLES.AGENT;
    if (v.includes("approver")) return ROLES.APPROVER;
    if (v.includes("submit")) return ROLES.SUBMITTER;
    if (v.includes("travel_associate")) return ROLES.TRAVEL_ASSOCIATE;

    return defaultRole;
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
        console.log("API Response:", json);
        if (!res.ok || json.status !== "success") {
          throw new Error(json?.message || "Access check failed");
        }

        if (json.data?.email) {
          localStorage.setItem("userEmail", json.data.email);
        }

     // Check exact path to role
        const apiRole = json?.data?.role; 
        console.log("Extracted API Role:", apiRole); // <--- SHOULD BE "agent"

        const normalized = normalizeRole(apiRole);
        console.log("Final Normalized Role:", normalized); // <--- SHOULD BE "agent"

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
  if (role === ROLES.TRAVEL_ASSOCIATE || role === ROLES.AGENT) {  
    return <Navigate to="/ta-trips" replace />;
  }
  return <Navigate to="/home" replace />;
}

// ---------------------------------------------
// Shell with routes & guards
// ---------------------------------------------
function AppShell({ currentRole, userEmail, userName, onLogout }) {
console.log("AppShell Rendering with Role:", currentRole);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isTripsApproverPage = location.pathname === "/trips-approver";
  const isTripDetailView = location.pathname.startsWith("/expenseDataView/");
  const isTripData = location.pathname.startsWith("/trip-data");
  const isApproverDataView = location.pathname.startsWith(
    "/approver-trip-data"
  );

const needsFullPageLayout = isTripData || isApproverDataView || isTripDetailView || isTripsApproverPage;
const noScrollMain = isTripData || isTripDetailView || isTripsApproverPage;

  const contentCardClassNames = [
    "content-card",
    // This applies your role-based class (e.g., for themes)
    currentRole === ROLES.ADMIN ? "content-card-admin" : "content-card-ta",
    // This *also* applies the layout class when needed
    needsFullPageLayout ? "content-card--full-page" : ""
  ].join(" ").trim();

  const handleAddFromSidebar = (key) => {
    if (key === "location") navigate("/masters/location/new");
    if (key === "departments") navigate("/masters/department/new");
    if (key === "customdata") navigate("/masters/customdata");
    if (key === "users") navigate("/masters/users/new");
  };

  const handleSelectFromSidebar = (key) => {
    console.log("Sidebar clicked with key:", key);
    if (key === "home") navigate("/home");
    else if (key === "location") navigate("/masters/location");
    else if (key === "departments") navigate("/masters/department");
    else if (key === "customdata") navigate("/masters/customdata");
    else if (key === "trip") navigate("/trip");
    else if (key === "my-approvals") navigate("/trips-approver");
    else if (key === "expenseDataView") navigate("/expenseDataView");
    else if (key === "users") navigate("/masters/users");
    else if (key === "trip-data") navigate("/trip-data");
    else if (key === "allRequests") navigate("/traveldesk/allRequests");
    else if (key === "flightDesk") navigate("/traveldesk/flightDesk");
    else if (key === "hotelDesk") navigate("/traveldesk/hotelDesk");
    else if (key === "carDesk") navigate("/traveldesk/carDesk");
    else if (key === "busDesk") navigate("/traveldesk/busDesk");
    else if (key === "trainDesk") navigate("/traveldesk/trainDesk");
    else if (key === 'trips') navigate("/trips")
    else if (key === 'ta-trips') navigate("/ta-trips");

  };

    const isSidebarVisible = currentRole !== ROLES.TRAVEL_ASSOCIATE;


  return (
    <div className={`app-shell${collapsed ? " collapsed" : ""}${!isSidebarVisible ? " no-sidebar" : ""}`}>
      <Header
        userName={userEmail?.split("@")[0]}   // or actual name from Catalyst if available
        userEmail={userEmail}
        userRole={currentRole}
        onLogout={onLogout}
      />

      {isSidebarVisible &&(
        <aside className="sidebar">
        <Sidebar
          role={currentRole}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onAdd={handleAddFromSidebar}
          onSelect={handleSelectFromSidebar}
        />
      </aside>
      )}

      

     <main className={`main ${noScrollMain ? "main--no-scroll" : ""}`}>
        <div className={contentCardClassNames}>
       
          <Routes>
           <Route path="/index.html" element={<RoleBasedRedirect role={currentRole} />} />
            <Route path="/" element={<RoleBasedRedirect role={currentRole} />} />
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />

            {/* Dashboard: everyone */}
            <Route
              path="/dashboard"
              element={<h1>Welcome to Zoho Expense</h1>}
            />
            <Route
              path="/ta-trips"
              element={
                <RequireRole 
                  allow={[ROLES.ADMIN, ROLES.TRAVEL_ASSOCIATE, ROLES.AGENT]} 
                  currentRole={currentRole}
                >
                 <AgentTripList userEmail={userEmail} />
                </RequireRole>
              }
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
            <Route
  path="/agent-trip-data/:tripId" // Unique route for Agent view
  element={
    <RequireRole 
      allow={[ROLES.ADMIN, ROLES.TRAVEL_ASSOCIATE, ROLES.AGENT]} 
      currentRole={currentRole}
    >
      {/* Pass userEmail for filtering */}
      <AgentTripDataView userEmail={userEmail} />
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

            <Route
              path='/trips'
              element={
                <RequireRole
                  allow={[ROLES.ADMIN]}
                  currentRole={currentRole}
                >
                  <Trips />
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
                <RequireRole allow={[ROLES.ADMIN, ROLES.TRAVEL_ASSOCIATE]} currentRole={currentRole}>
                  <ExpenseDataList />
                </RequireRole>
              }
            />
            <Route
              path="/expenseDataView/:rowid"
              element={
                <RequireRole allow={[ROLES.ADMIN, ROLES.TRAVEL_ASSOCIATE]} currentRole={currentRole}>
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

            {/* Travel Desk Routes */}
            <Route
              path="/traveldesk/allRequests"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <AllRequests />
                </RequireRole>
              }
            />
            <Route
              path="/traveldesk/flightDesk"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <FlightDesk />
                </RequireRole>
              }
            />
            <Route
              path="/traveldesk/hotelDesk"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <HotelDesk />
                </RequireRole>
              }
            />
            <Route
              path="/traveldesk/carDesk"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <CarDesk />
                </RequireRole>
              }
            />
            <Route
              path="/traveldesk/busDesk"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <BusDesk />
                </RequireRole>
              }
            />
            <Route
              path="/traveldesk/trainDesk"
              element={
                <RequireRole allow={[]} currentRole={currentRole}>
                  <TrainDesk />
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
        <HashRouter>
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
        </HashRouter>
      )}

      <ToastContainer />
    </div>
  );
}
