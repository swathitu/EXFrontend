import React, { useState, useEffect } from "react";

// 1. Import the API function and a hook to get URL parameters

import { fetchTripById } from "../../api/trips";

import { useParams } from "react-router-dom"; // You'll need react-router-dom for this
 
import "./approverdataview.css";
 
const ApproverTripDataView = () => {

  // 2. Get the trip ID from the URL, e.g., /trips/12345

const params = useParams();
console.log("Params:", params);

 const { tripId } = useParams();
 console.log("trip data",tripId);
  // 3. Set up state to manage data, loading, and errors

  const [tripData, setTripData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("flights");
 
  // 4. Use useEffect to fetch data when the component mounts

  useEffect(() => {

    if (!tripId) {

      setError("No Trip ID provided.");

      setIsLoading(false);

      return;

    }
 
    const loadTripData = async () => {

      try {

        setIsLoading(true);

        const data = await fetchTripById(tripId);

        setTripData(data);

        setError(null);

      } catch (err) {

        setError(err.message || "Failed to fetch trip details.");

        console.error(err);

      } finally {

        setIsLoading(false);

      }

    };
 
    loadTripData();

  }, [tripId]); // Re-run if tripId changes
 
  // 5. Conditional rendering for loading and error states

  if (isLoading) {

    return <div className="ze-placeholder-pane">Loading trip details...</div>;

  }
 
  if (error) {

    return <div className="ze-placeholder-pane ze-btn--danger">Error: {error}</div>;

  }

  // If no data is returned after loading, show a message.

  if (!tripData) {

    return <div className="ze-placeholder-pane">No trip data found.</div>;

  }
 
  // 6. If data is loaded, render the component with backend data

  return (
<div className="ze-dataview-container">

      {/* ROW 1: FULL-WIDTH HEADER */}
<div className="ze-content-header">
<div className="ze-header-left">

          {/* Submitter details are now from the API */}
<div className="ze-avatar" style={{ backgroundColor: tripData.submitter?.color }}>

            {tripData.submitter?.initials || 'U'}
</div>
<div className="ze-header-info">
<span className="ze-info-name">{tripData.submitter?.name || 'Unknown User'}</span>

            {/* The API doesn't provide email, so we'll hide it or show a placeholder */}

            {/* <span className="ze-info-email">zoho.india@zohocorp.com</span> */}
</div>
</div>
<div className="ze-header-center">
<span className="ze-trip-id">{tripData.id}</span>
<span className="ze-chip">{tripData.status.toUpperCase()}</span>
</div>
<div className="ze-header-right">
<a href="#" className="ze-header-link">Comments & History</a>
<button className="ze-btn">Update</button>
<button className="ze-btn ze-btn--danger">Reject</button>
</div>
</div>
 
      {/* ROW 2: TWO-COLUMN GRID */}
<div className="ze-dataview-grid">

        {/* Column 1: Main Content */}
<div className="ze-main-content">
<div className="ze-trip-details-card">
<div className="ze-title-area">
<div className="ze-title-left">
<h2 className="ze-trip-title">{tripData.tripName}</h2>
<p className="ze-trip-duration">{tripData.period}</p>
</div>
<div className="ze-side-card ze-booking-status-card">
<h4 className="ze-side-card-header">Booking Status</h4>
<div className="ze-booking-icons">
<span title="Flight" className="ze-booking-icon">✈️</span>
<span title="Hotel" className="ze-booking-icon">🏨</span>
</div>
</div>
</div>
 
            <div className="ze-tabs">
<button className={activeTab === "flights" ? "is-active" : ""} onClick={() => setActiveTab("flights")}>Flight</button>
<button className={activeTab === "hotels" ? "is-active" : ""} onClick={() => setActiveTab("hotels")}>Hotel</button>
<button className={activeTab === "bus" ? "is-active" : ""} onClick={() => setActiveTab("bus")}>Bus</button>
<button className={activeTab === "train" ? "is-active" : ""} onClick={() => setActiveTab("train")}>Train</button>
<button className={activeTab === "carRental" ? "is-active" : ""} onClick={() => setActiveTab("carRental")}>Car Rental</button>
</div>
<div className="ze-tabpanel">

              {activeTab === "flights" && (
<div>
<h4 className="ze-section-title">Flight Details</h4>

                  {/* Check if flight data exists and is not empty */}

                  {tripData.flights && tripData.flights.length > 0 ? (
<table className="ze-data-table">
<thead><tr><th>Date</th><th>From</th><th>To</th><th>Airline</th><th>Amount</th><th>Status</th></tr></thead>
<tbody>

                        {tripData.flights.map((f, i) => (
<tr key={i}>
<td>{f.DEPARTURE_DATE || 'N/A'}</td>
<td>{f.FROM_CITY || 'N/A'}</td>
<td>{f.TO_CITY || 'N/A'}</td>
<td>{f.AIRLINE || 'N/A'}</td>
<td style={{ textAlign: 'right' }}>₹ {parseFloat(f.TOTAL_FARE || 0).toLocaleString('en-IN')}</td>
<td>{f.STATUS || 'N/A'}</td>
</tr>

                        ))}
</tbody>
</table>

                  ) : (
<div className="ze-placeholder-pane"><p>No flights have been added.</p></div>

                  )}
</div>

              )}

              {/* Other tabs remain as placeholders */}

              {activeTab === "hotels" && <div className="ze-placeholder-pane"><h4 className="ze-section-title">Hotel Details</h4><p>No hotels have been added.</p></div>}

              {activeTab === "bus" && <div className="ze-placeholder-pane"><h4 className="ze-section-title">Bus Details</h4><p>No bus bookings have been added.</p></div>}

              {activeTab === "train" && <div className="ze-placeholder-pane"><h4 className="ze-section-title">Train Details</h4><p>No train bookings have been added.</p></div>}

              {activeTab === "carRental" && <div className="ze-placeholder-pane"><h4 className="ze-section-title">Car Rental Details</h4><p>No car rentals have been added.</p></div>}
</div>
</div>
</div>
 
        {/* Column 2: Right Sidebar */}
<aside className="ze-right-sidebar">
<div className="ze-side-card">
<h4 className="ze-side-card-header">Approver</h4>
<div className="ze-side-card-body">
<div className="ze-avatar ze-avatar--small" style={{ backgroundColor: tripData.approver?.color }}>

                  {tripData.approver?.initials || 'A'}
</div>
<span>{tripData.approver?.name || 'Not Assigned'}</span>
</div>
<a href="#" className="ze-side-card-link">View approval flow</a>
</div>
<a href="#" className="ze-standalone-link">View Traveler Details</a>

          {/* Note: The fields below are not yet in the API response. */}

          {/* They will show 'N/A' until the backend is updated. */}
<div className="ze-side-card"><h4 className="ze-side-card-header">Policy</h4><p>{tripData.policy || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Destination</h4><p>{tripData.destination || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Business Purpose</h4><p>{tripData.purpose || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Activity</h4><p>{tripData.activity || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Donor</h4><p>{tripData.donor || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Condition Areas</h4><p>{tripData.conditionAreas || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Location</h4><p>{tripData.location || "N/A"}</p></div>
<div className="ze-side-card"><h4 className="ze-side-card-header">Branch</h4><p>{tripData.branch || "N/A"}</p></div>
<div className="ze-side-card">
<div className="ze-side-card-header ze-side-card-header--with-action">
<span>Documents</span>
<span className="ze-action-icon" title="Add Document">+</span>
</div>
<p className="ze-text-secondary" style={{ fontSize: '13px', textAlign: 'center', padding: '10px 0' }}>No documents attached.</p>
</div>
</aside>
</div>
</div>

  );

};
 
export default ApproverTripDataView;
 