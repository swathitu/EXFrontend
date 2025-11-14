import React, { useState, useEffect } from "react";
import "./OptionForm.css";
import FlightOptionForm from "../FlightOptionForm/FlightOptionForm";

const OptionForm = ({ request, onClose }) => {
  const [details, setDetails] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);
  const [assignError, setAssignError] = useState(null);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showFlightOptionForm, setShowFlightOptionForm] = useState(false);
  const [assignedAgentId, setAssignedAgentId] = useState("");

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    setSavedEmail(emailFromStorage);
    console.log("Saved Email from localStorage:", emailFromStorage);
  }, []);

  // Fetch detailed option data on request change
  useEffect(() => {
    if (!request || !request.id || !request.requestType) {
      setDetails(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/server/get_optionData?tripId=${request.id}&requestType=${request.requestType}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === "success") {
          setDetails(data.data);

          // Set initially assigned agent ID from nested associated data
          let agentId = "";
          if (data.data.agentId) {
            agentId = data.data.agentId;
          } else if (data.data.associatedData) {
            for (const key of ["CarData", "FlightData", "HotelData", "TrainData", "BusData"]) {
              if (data.data.associatedData[key]?.length > 0) {
                const item = data.data.associatedData[key][0];
                if (item.AGENT_ID) {
                  agentId = item.AGENT_ID;
                  break;
                }
              }
            }
          }
          setAssignedAgentId(agentId);
        } else {
          throw new Error(data.message || "Failed to get data");
        }
      } catch (err) {
        setError(err.message);
        console.error("Fetch option form data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request]);

  // Fetch agents list on component mount
  useEffect(() => {
    fetch("/server/getagent_sendmail/agent")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && data.agents) {
          setAgents(data.agents);
        } else {
          console.error("Error fetching agents:", data.message || data);
        }
      })
      .catch((err) => console.error("Failed to fetch agents:", err));
  }, []);

  if (!request) return null;

  const trip = details || request;

  const avatarInitials =
    (trip.SUBMITTER_NAME || trip.requestedBy || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "NA";

  // Handler for changing assigned agent
  const handleAssignedToChange = async (agentRowId) => {
    setAssignError(null);
    setLoadingAssign(true);

    try {
      const selectedAgent = agents.find((a) => a.row_id === agentRowId);
      if (!selectedAgent) throw new Error("Please select a valid agent");

      // Extract subtableRowId from nested data for precise update
      const getSubtableRowId = () => {
        const assoc = trip.associatedData || {};

        // Capitalize first letter of trip type
        const tripTypeRaw = trip.requestType || trip.modesSummary?.[0] || "";
        const tripType = tripTypeRaw.charAt(0).toUpperCase() + tripTypeRaw.slice(1).toLowerCase();

        const key = tripType + "Data"; // e.g., FlightData

        console.log("trip.requestType (raw):", trip.requestType);
        console.log("tripType used for key:", tripType);
        console.log("Looking for associatedData key:", key);

        if (assoc[key] && assoc[key].length > 0) {
          const subRowId = assoc[key][0].ROWID || "";
          console.log("Found subtable ROWID:", subRowId);
          return subRowId;
        }

        console.log("No associated data found for key, fallback to main ROWID:", trip.ROWID);
        return trip.ROWID || "";
      };




      const payload = {
        from_email: savedEmail,
        to_email: selectedAgent.email,
        ROWID: getSubtableRowId(), // Use subtable ROWID
        tripType: trip.requestType || (trip.modesSummary?.[0]) || "",
        id: trip.ROWID || "",
        requestedBy: trip.requestedBy || trip.SUBMITTER_NAME || "",
        tripNumber: trip.tripNumber || trip.TRIP_NUMBER || "N/A",
        // itinerary: trip.itinerary || "",
        // startDate: trip.startDate || "",
        apiStatus: trip.apiStatus || trip.STATUS || "Open",
        status: trip.status || "Open",
        assignedTo: selectedAgent.row_id,
        agentRowId: selectedAgent.row_id,
        agentEmail: selectedAgent.email,
        agentName: selectedAgent.first_name,
      };

      const response = await fetch("/server/getagent_sendmail/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update assigned agent");
      }

      setAssignedAgentId(agentRowId);
    } catch (error) {
      setAssignError(error.message);
      console.error("Agent assignment error:", error);
    } finally {
      setLoadingAssign(false);
    }
  };

  if (loading)
    return (
      <div className="flight-request-container">
        <p>Loading details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flight-request-container">
        <p className="error-text">Error: {error}</p>
        <button className="btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    );

  const getTravelDetails = (trip, requestType) => {
    const assoc = trip.associatedData || {};
    switch (requestType.toLowerCase()) {
      case "flight": {
        const flight = assoc.FlightData?.[0] || {};
        return {
          depCity: flight.FLIGHT_DEP_CITY || "N/A",
          arrCity: flight.FLIGHT_ARR_CITY || "N/A",
          depDate: flight.FLIGHT_DEP_DATE || "N/A",
          arrDate: flight.FLIGHT_ARR_DATE || "N/A",
          depTime: flight.FLIGHT_DEP_TIME || "N/A",
          arrTime: flight.FLIGHT_ARR_TIME || "N/A",
          seatPref: flight.SEAT_PREF || "N/A",
          mealPref: flight.MEAL_PREF || "N/A",
          depClass: flight.FLIGHT_DEP_PREF || "N/A",
          arrClass: flight.FLIGHT_ARR_PREF || "N/A",
          description: flight.DESCRIPTION || "",
          agentName: flight.AGENT_NAME || "Unassigned",
          agentId: flight.AGENT_ID || "",
        };
      }
      case "hotel": {
        const hotel = assoc.HotelData?.[0] || {};
        return {
          depCity: hotel.HOTEL_DEP_CITY || "N/A",
          arrCity: hotel.HOTEL_ARR_CITY || hotel.HOTEL_DEP_CITY || "N/A",
          depDate: hotel.HOTEL_DEP_DATE || "N/A",
          arrDate: hotel.HOTEL_ARR_DATE || "N/A",
          depTime: hotel.HOTEL_DEP_TIME || "N/A",
          arrTime: hotel.HOTEL_ARR_TIME || "N/A",
          description: hotel.DESCRIPTION || "",
          agentName: hotel.AGENT_NAME || "Unassigned",
          agentId: hotel.AGENT_ID || "",
        };
      }
      case "car": {
        const car = assoc.CarData?.[0] || {};
        return {
          depCity: car.CAR_DEP_CITY || "N/A",
          arrCity: car.CAR_ARR_CITY || "N/A",
          depDate: car.CAR_DEP_DATE || "N/A",
          arrDate: car.CAR_ARR_DATE || "N/A",
          depTime: car.CAR_DEP_TIME || "N/A",
          arrTime: car.CAR_ARR_TIME || "N/A",
          carType: car.CAR_TYPE || "N/A",
          driverNeeded: car.CAR_DRIVER || "N/A",
          description: car.DESCRIPTION || "",
          agentName: car.AGENT_NAME || "Unassigned",
          agentId: car.AGENT_ID || "",
        };
      }
      case "train": {
        const train = assoc.TrainData?.[0] || {};
        return {
          depCity: train.TRAIN_DEP_CITY || "N/A",
          arrCity: train.TRAIN_ARR_CITY || "N/A",
          depDate: train.TRAIN_DEP_DATE || "N/A",
          arrDate: train.TRAIN_ARR_DATE || "N/A",
          depTime: train.TRAIN_DEP_TIME || "N/A",
          arrTime: train.TRAIN_ARR_TIME || "N/A",
          description: train.DESCRIPTION || "",
          agentName: train.AGENT_NAME || "Unassigned",
          agentId: train.AGENT_ID || "",
        };
      }
      case "bus": {
        const bus = assoc.BusData?.[0] || {};
        return {
          depCity: bus.BUS_DEP_CITY || "N/A",
          arrCity: bus.BUS_ARR_CITY || "N/A",
          depDate: bus.BUS_DEP_DATE || "N/A",
          arrDate: bus.BUS_ARR_DATE || "N/A",
          depTime: bus.BUS_DEP_TIME || "N/A",
          arrTime: bus.BUS_ARR_TIME || "N/A",
          description: bus.DESCRIPTION || "",
          agentName: bus.AGENT_NAME || "Unassigned",
          agentId: bus.AGENT_ID || "",
        };
      }
      default:
        return {};
    }
  };

  const travelDetails = getTravelDetails(trip, trip.modesSummary?.[0] || request.requestType || "");

  // if (showFlightOptionForm) {
  //   return (
  //     <FlightOptionForm
  //       fromCity={travelDetails.depCity}
  //       toCity={travelDetails.arrCity}
  //       depDate={travelDetails.depDate}
  //       prefTime={travelDetails.depTime}
  //       onClose={() => setShowFlightOptionForm(false)}
  //     />
  //   );
  // }

  return (
    <div className="flight-request-container">
      {/* Header */}
      <div className="header1">
        <div className="h3-head">
          <h4 className="h3">
            {trip.TRIP_NUMBER || trip.tripNumber || "N/A"}{" "}
            <span className={`status ${trip.STATUS?.toLowerCase() || "open"}`}>
              {"Open"}
            </span>
          </h4>
          <p className="option-p">Option Addition - Created on {trip.CREATEDTIME || trip.startDate || "N/A"}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={onClose}>Send and Close</button>
          <button className="btn-icon" onClick={onClose}>X</button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content1">
        <div className="grouped-sections">
          <div className="user-info">
            <div className="user1">
              <div className="avatar">{avatarInitials}</div>
              <h4>{trip.SUBMITTER_NAME || trip.requestedBy || "N/A"}</h4>
            </div>

            {/* Agent assignment dropdown */}
            <div className="assigned">
              <label>Assigned To:</label>
              {loadingAssign ? (
                <p>Assigning agent...</p>
              ) : (
                <select value={assignedAgentId} onChange={(e) => handleAssignedToChange(e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.row_id} value={agent.row_id}>
                      {agent.first_name}
                    </option>
                  ))}
                </select>
              )}
              {assignError && <p className="error-text">{assignError}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className="active">{trip.modesSummary?.[0] || request.requestType || "Mode"}</button>
          </div>

          {/* Dynamic travel segment card */}
          <div className="flight-card">
            {request.requestType.toLowerCase() === "car" ? (
              <>
                <div className="left-section-extra-info">
                  <p className="p3">Car Type: {travelDetails.carType}</p>
                  <p>Driver Needed: {travelDetails.driverNeeded}</p>
                </div>
                <div className="middle-section-pickup-dropoff">
                  <p className="mid1">
                    <strong>Pickup:</strong>{" "}
                    <span>{travelDetails.depDate}, {travelDetails.depTime}</span>{" "}
                    <span>{travelDetails.depCity}</span>
                  </p>
                  <span className="arrow">→</span>
                  <p className="mid1">
                    <strong>Dropoff:</strong>{" "}
                    <span>{travelDetails.arrDate}, {travelDetails.arrTime}</span>{" "}
                    <span>{travelDetails.arrCity}</span>
                  </p>
                </div>
                <div className="right-section-action">
                  <div className="option-buttons">
                    <button
                      className="add-option-toggle"
                      onClick={() => {
                        setShowActionDropdown(false);
                      }}
                    >
                      Add Option
                    </button>
                    {showActionDropdown && (
                      <div className="add-option-menu">
                        <button className="add-options">Add Options</button>
                        <button className="add-ticket">Add Ticket</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : request.requestType.toLowerCase() === "hotel" ? (
              <>
                <div className="left-section-extra-info">
                  <p>{travelDetails.depCity}</p>
                  {/* <p>{travelDetails.arrCity}</p> */}
                </div>
                <div className="middle-section-pickup-dropoff">
                  <p className="mid1">
                    <strong>Check-in:</strong>{" "}
                    <span>{travelDetails.depDate}, {travelDetails.depTime}</span>
                  </p>
                  <span className="arrow">→</span>
                  <p className="mid1">
                    <strong>Check-out:</strong>{" "}
                    <span>{travelDetails.arrDate}, {travelDetails.arrTime}</span>
                  </p>
                </div>
                <div className="right-section-action">
                  <div className="option-buttons">
                    <button
                      className="add-option-toggle"
                      onClick={() => setShowActionDropdown(!showActionDropdown)}
                    >
                      Add Option
                    </button>
                    {showActionDropdown && (
                      <div className="add-option-menu">
                        <button className="add-options">Add Options</button>
                        <button className="add-ticket">Add Ticket</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="left-section-date">
                  <p className="mid1">
                    <span role="img" aria-label="calendar">
                      📅 {travelDetails.depDate}{" "}
                    </span>
                    {travelDetails.depTime && travelDetails.depTime !== "N/A" && (
                      <span>Preference Time: {travelDetails.depTime}</span>
                    )}
                  </p>
                </div>
                <div className="middle-section-route">
                  <div>
                    <h4>{travelDetails.depCity}</h4>
                  </div>
                  <span className="arrow">→</span>
                  <div>
                    <h4>{travelDetails.arrCity}</h4>
                  </div>
                </div>
                <div className="right-section-action">
                  <div className="option-buttons">
                    <button
                      className="add-option-toggle"
                      onClick={() => setShowActionDropdown(!showActionDropdown)}
                    >
                      Add Options
                    </button>
                    {showActionDropdown && (
                      <div className="add-option-menu">
                        <button className="add-options">Add Options</button>
                        <button className="add-ticket">Add Ticket</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comments */}
        {/* <div className="comments">
            <p>Comments</p>
          </div> */}

        {/* Sidebar */}
        <div className="sidebar2">
          <p><strong>Trip#</strong> {trip.TRIP_NUMBER || trip.tripNumber || "N/A"}</p>
          <p><strong>Policy:</strong> {trip.POLICY || "HLB India"}</p>
          <p><strong>Travel Type:</strong> {trip.TRAVEL_TYPE || "Domestic"}</p>
          <div className="traveler-details">
            <p>Traveler Profile is not configured.</p>
          </div>
        </div>

      </div>


    </div>
  );
};

export default OptionForm;
