import React, { useState, useEffect, useRef, useCallback } from "react";
import "./OptionForm.css";
import { FaCalendarAlt, FaEllipsisH, FaMapMarkerAlt, FaCar, FaUser } from "react-icons/fa";
import FlightOptionForm from "../FlightOptionForm/FlightOptionForm";
import HotelOptions from "../HotelOptionForm/HotelOptionForm";
import TrainOptionForm from "../TrainOptionForm/TrainOptionForm";
import CarOptionForm from "../CarOptionForm/CarOptionForm";
import BusOptionForm from "../BusOptionForm/BusOptionForm";

// Reusable hook: close when clicking outside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// Flight card
const FlightCard = ({ flight, onAddOptionClick }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const menuRef = useRef(null);
  const addRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!flight) return null;

  const seatPref = flight.SEAT_PREF || flight.seatPref || "";
  const mealPref = flight.MEAL_PREF || flight.mealPref || "";
  const hasPrefs = seatPref || mealPref;

  return (
    <div className="flight-card1">
      {hasPrefs && (
        <div className="preferences">
          <span>Preferences:</span>
          {seatPref && <span className="pref-item">Seat: {seatPref}</span>}
          {mealPref && <span className="pref-item">Meal: {mealPref}</span>}
        </div>
      )}

      <div className="status-section">
        <span className="status-badge">Waiting for Options</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="flight-details">
        <div className="flight-date">
          <FaCalendarAlt className="icon" />
          <div>
            <div className="date">{flight.FLIGHT_DEP_DATE || flight.depDate}</div>
            <div className="preferred-time">Preferred Time: {flight.FLIGHT_DEP_TIME || flight.depTime}</div>
          </div>
        </div>

        <div className="flight-route">
          <div className="from">
            <div className="city">
              {(flight.FLIGHT_DEP_CITY || flight.depCity) || "N/A"} - {(flight.DEP_CITY_CODE || flight.depCityCode) || "N/A"}
            </div>
            <div className="subtext">{flight.DEP_AIRPORT_NAME || flight.depAirpot || "N/A"}</div>
          </div>
          <div className="arrow">→</div>
          <div className="to">
            <div className="city">
              {(flight.FLIGHT_ARR_CITY || flight.arrCity) || "N/A"} - {(flight.ARR_CITY_CODE || flight.arrCityCode) || "N/A"}
            </div>
            <div className="subtext">{flight.ARR_AIRPORT_NAME || flight.arrAirpot || "N/A"}</div>
          </div>
        </div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            <button onClick={() => { setShowAddOptions((v) => !v); setShowMenuOptions(false); }}>
              Add Option
            </button>
            {showAddOptions && (
              <div className="dropdown add-option-dropdown">
                <button onClick={onAddOptionClick}>+ Add Options</button>
                <button>+ Add Ticket</button>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => { setShowMenuOptions((v) => !v); setShowAddOptions(false); }}
              style={{ cursor: "pointer", fontSize: 20 }}
            />
            {showMenuOptions && (
              <div className="dropdown menu-options-dropdown">
                <button>Reschedule</button>
                <button>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hotel card
const HotelCard = ({ hotel, onAddHotelOptionClick }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!hotel) return null;

  return (
    <div className="hotel-card">
      <div className="status-section">
        <span className="status-badge">Waiting for Options</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="booking-details">
        <div className="hotel-name">
          <FaMapMarkerAlt className="icon" />
          <span>{hotel.HOTEL_DEP_CITY || hotel.depCity || "N/A"}</span>
        </div>

        <div className="divider"></div>

        <div className="check-info">
          <div className="check-in">
            <span className="label">Check-in</span>
            <span className="date">
              {(hotel.HOTEL_DEP_DATE || hotel.depDate) || "N/A"},{" "}
              {(hotel.HOTEL_DEP_TIME || hotel.depTime) || "N/A"}
            </span>
          </div>
          <span className="separator">-</span>
          <div className="check-out">
            <span className="label">Check-out</span>
            <span className="date">
              {(hotel.HOTEL_ARR_DATE || hotel.arrDate) || "N/A"},{" "}
              {(hotel.HOTEL_ARR_TIME || hotel.arrTime) || "N/A"}
            </span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            <button onClick={() => { setShowAddOptions((v) => !v); setShowMenuOptions(false); }}>
              Add Option
            </button>
            {showAddOptions && (
              <div className="dropdown add-option-dropdown">
                <button onClick={onAddHotelOptionClick}>+ Add Options</button>
                <button>+ Add Ticket</button>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => { setShowMenuOptions((v) => !v); setShowAddOptions(false); }}
              style={{ cursor: "pointer", fontSize: 20 }}
            />
            {showMenuOptions && (
              <div className="dropdown menu-options-dropdown">
                <button>Reschedule</button>
                <button>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Car card
const CarCard = ({ car, onAddCarOptionClick }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!car) return null;

  return (
    <div className="car-card">
      <div className="status-section">
        <span className="status-badge">Waiting for Options</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="booking-details">
        <div className="car-info">
          <div className="car-type">
            <FaCar className="icon" />
            <span className="car-extrainfo">Car Type: {(car.CAR_TYPE || car.carType) || "N/A"}</span>
          </div>
          <div className="driver-info">
            <FaUser className="icon" />
            <span>Driver: {(car.CAR_DRIVER || car.driverNeeded) || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="pickup-dropoff">
          <div className="pickup">
            <span className="label">Pick-Up</span>
            <span className="date">
              {(car.CAR_DEP_DATE || car.depDate || car.pickUpDate) || "N/A"},{" "}
              {(car.CAR_DEP_TIME || car.depTime) || "N/A"}
            </span>
            <span className="location">
              {(car.CAR_DEP_CITY || car.depCity || car.pickUpLocation) || "N/A"},{" "}
              {(car.CAR_ARR_TIME || car.arrTime) || "N/A"}
            </span>
          </div>
          <span className="arrow">→</span>
          <div className="dropoff">
            <span className="label">Drop-Off</span>
            <span className="date">{(car.CAR_ARR_DATE || car.arrDate || car.dropOffDate) || "N/A"}</span>
            <span className="location">{(car.CAR_ARR_CITY || car.arrCity || car.dropOffLocation) || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            <button onClick={() => { setShowAddOptions((v) => !v); setShowMenuOptions(false); }}>
              Add Option
            </button>
            {showAddOptions && (
              <div className="dropdown add-option-dropdown">
                <button onClick={onAddCarOptionClick}>+ Add Options</button>
                <button>+ Add Ticket</button>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => { setShowMenuOptions((v) => !v); setShowAddOptions(false); }}
              style={{ cursor: "pointer", fontSize: 20 }}
            />
            {showMenuOptions && (
              <div className="dropdown menu-options-dropdown">
                <button>Reschedule</button>
                <button>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Train card (minimal)
const TrainCard = ({ train, onAddTrainOptionClick }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!train) return null;

  const depDate = train.TRAIN_DEP_DATE || train.date || "N/A";
  const depCity = train.TRAIN_DEP_CITY || train.departure || "N/A";
  const arrCity = train.TRAIN_ARR_CITY || train.arrival || "N/A";

  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">Waiting for Options</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="booking-details">
        <div className="transfer-date">
          <FaCalendarAlt className="icon" />
          <span>{depDate}</span>
        </div>

        <div className="divider"></div>

        <div className="transfer-route">
          <div className="departure">
            <span className="label">Departure</span>
            <span className="location">{depCity}</span>
          </div>
          <span className="arrow">→</span>
          <div className="arrival">
            <span className="label">Arrival</span>
            <span className="location">{arrCity}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            <button onClick={() => { setShowAddOptions((v) => !v); setShowMenuOptions(false); }}>
              Add Option
            </button>
            {showAddOptions && (
              <div className="dropdown add-option-dropdown">
                <button onClick={onAddTrainOptionClick}>+ Add Options</button>
                <button>+ Add Ticket</button>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => { setShowMenuOptions((v) => !v); setShowAddOptions(false); }}
              style={{ cursor: "pointer", fontSize: 20 }}
            />
            {showMenuOptions && (
              <div className="dropdown menu-options-dropdown">
                <button>Reschedule</button>
                <button>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const BusCard = ({ bus, onAddBusOptionClick }) => {
  console.log("Bus data received:", bus);

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!bus) return null;

  const depDate = bus.item?.BUS_DEP_DATE || bus.item?.date || "N/A";
  const depCity = bus.item?.BUS_DEP_CITY || bus.item?.departure || "N/A";
  const arrCity = bus.item?.BUS_ARR_CITY || bus.item?.arrival || "N/A";


  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">Waiting for Options</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="booking-details">
        <div className="transfer-date">
          <FaCalendarAlt className="icon" />
          <span>{depDate}</span>
        </div>

        <div className="divider"></div>

        <div className="transfer-route">
          <div className="departure">
            <span className="label">Departure</span>
            <span className="location">{depCity}</span>
          </div>
          <span className="arrow">→</span>
          <div className="arrival">
            <span className="label">Arrival</span>
            <span className="location">{arrCity}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            <button onClick={() => { setShowAddOptions((v) => !v); setShowMenuOptions(false); }}>
              Add Option
            </button>
            {showAddOptions && (
              <div className="dropdown add-option-dropdown">
                <button onClick={onAddBusOptionClick}>+ Add Options</button>
                <button>+ Add Ticket</button>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => { setShowMenuOptions((v) => !v); setShowAddOptions(false); }}
              style={{ cursor: "pointer", fontSize: 20 }}
            />
            {showMenuOptions && (
              <div className="dropdown menu-options-dropdown">
                <button>Reschedule</button>
                <button>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OptionForm = ({ request, onClose }) => {
  const [details, setDetails] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);
  const [assignError, setAssignError] = useState(null);
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [optionFormFlight, setOptionFormFlight] = useState(null);
  const [optionFormHotel, setOptionFormHotel] = useState(null);
  const [optionFormTrain, setOptionFormTrain] = useState(null);
  const [optionFormCar, setOptionFormCar] = useState(null);
  const [optionFormBus, setOptionFormBus] = useState(null);

  // Active mode derived from modesSummary
  const [activeMode, setActiveMode] = useState("");

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    setSavedEmail(emailFromStorage);
  }, []);

  useEffect(() => {
    if (!request || !request.id) {
      setDetails(null);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/server/get_optionData?tripId=${request.id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === "success") {
          const reqData = data.data;

          // Compute a default agent id if any is present in associated tables
          let agentId = "";
          const assoc = reqData.associatedData || {};
          for (const key of ["CarData", "FlightData", "HotelData", "TrainData", "BusData"]) {
            if (assoc[key]?.length > 0) {
              const item = assoc[key][0];
              if (item.AGENT_ID) {
                agentId = item.AGENT_ID;
                break;
              }
            }
          }

          setDetails(reqData);
          setAssignedAgentId(agentId);

          // Initialize activeMode from modesSummary if available
          const firstMode = reqData.modesSummary?.[0] || "";
          setActiveMode(firstMode);
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

  const handleAssignedToChange = async (agentRowId) => {
    setAssignError(null);
    setLoadingAssign(true);
    try {
      const selectedAgent = agents.find((a) => a.row_id === agentRowId);
      if (!selectedAgent) throw new Error("Please select a valid agent");

      // Choose a subtable row id with data if present, else trip row id
      const assoc = trip.associatedData || {};
      const firstModeKey = (trip.modesSummary?.[0] || "") + "Data";
      const subtableRowId = assoc[firstModeKey]?.[0]?.ROWID || trip.ROWID || "";

      const payload = {
        from_email: savedEmail,
        to_email: selectedAgent.email,
        ROWID: subtableRowId,
        tripType: trip.modesSummary?.[0] || "",
        id: trip.ROWID || "",
        requestedBy: trip.requestedBy || trip.SUBMITTER_NAME || "",
        tripNumber: trip.tripNumber || trip.TRIP_NUMBER || "N/A",
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

  // Build tab content dynamically from selected mode
  const renderActiveModeCards = () => {
    const assoc = trip.associatedData || {};
    const key = activeMode ? activeMode + "Data" : null;
    const subitems = key ? (assoc[key] || []) : [];

    switch ((activeMode || "").toLowerCase()) {
      case "flight":
        return subitems.map((item) => (
          <FlightCard
            key={item.ROWID || Math.random()}
            flight={item}
            onAddOptionClick={() => setOptionFormFlight(item)}
          />
        ));
      case "hotel":
        return subitems.map((item) => (
          <HotelCard
            key={item.ROWID || Math.random()}
            hotel={item}
            onAddHotelOptionClick={() => setOptionFormHotel(item)}
          />
        ));
      case "car":
        return subitems.map((item) => (
          <CarCard
            key={item.ROWID || Math.random()}
            car={item}
            onAddCarOptionClick={() => setOptionFormCar(item)}
          />
        ));
      case "train":
        return subitems.map((item) => (
          <TrainCard
            key={item.ROWID || Math.random()}
            train={item}
            onAddTrainOptionClick={() => setOptionFormTrain(item)}
          />
        ));
      case "bus":
        return subitems.map((item) => (
          <BusCard // Reuse minimal card layout for bus transfers
            key={item.ROWID || Math.random()}
            bus={{ item }}
            onAddBusOptionClick={() => setOptionFormBus(item)}
          />
        ));
      default:
        return <p>No detailed card available for this travel mode.</p>;
    }
  };

  return (
    <div className="flight-request-container">
      {/* Header */}
      <div className="header1">
        <div className="h3-head">
          <h4 className="h3">
            {trip.tripNumber || trip.TRIP_NUMBER || "N/A"}{" "}
            <span className={`status ${trip.Status?.toLowerCase() || "open"}`}>
              {trip.STATUS}
            </span>
          </h4>
          <p className="option-p">
            Option Addition - Created on {trip.CREATEDTIME || trip.startDate || "N/A"}
          </p>
        </div>
        <div className="header-actions" style={{ position: "relative" }}>
          <button className="btn-primary" onClick={onClose}>
            Send and Close
          </button>
          <button className="btn-icon" onClick={onClose}>X</button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content1">
        <div className="grouped-sections">
          <div className="user-info">
            <div className="user1">
              <div className="avatar">
                {(trip.SUBMITTER_NAME || "NA")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
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

          {/* Tabs for all modes */}
          <div className="tabs">
            {(trip.modesSummary || []).map((mode) => (
              <button
                key={mode}
                className={activeMode === mode ? "active" : ""}
                onClick={() => setActiveMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Cards for active mode */}
          <div className="flight-card-container">{renderActiveModeCards()}</div>
        </div>

        {/* Modals / option forms */}
        {optionFormFlight && (
          <FlightOptionForm flight={optionFormFlight} onClose={() => setOptionFormFlight(null)} />
        )}
        {optionFormHotel && (
          <HotelOptions hotel={optionFormHotel} onClose={() => setOptionFormHotel(null)} />
        )}
        {optionFormTrain && (
          <TrainOptionForm train={optionFormTrain} onClose={() => setOptionFormTrain(null)} />
        )}
        {optionFormCar && (
          <CarOptionForm car={optionFormCar} onClose={() => setOptionFormCar(null)} />
        )}

        {optionFormBus && (
          <BusOptionForm bus={optionFormBus} onClose={() => setOptionFormBus(null)} />
        )}



        {/* Sidebar */}
        <div className="sidebar2">
          <p>
            <span className="span-sidebar">Trip#</span>{" "}
            <span className="span-sidebar">{trip.TRIP_NUMBER || trip.tripNumber || "N/A"}</span>
          </p>
          <p>
            <span className="span-sidebar">Travel Type:</span>{" "}
            <span className="span-sidebar">{trip.TRAVEL_TYPE || "Domestic"}</span>
          </p>
          <p>
            <span className="span-sidebar">CF Activity:</span>{" "}
            <span className="span-sidebar">{trip.CF_ACTIVITY || "N/A"}</span>
          </p>
          <p>
            <span className="span-sidebar">CF Location:</span>{" "}
            <span className="span-sidebar">{trip.CF_LOCATION || "N/A"}</span>
          </p>
          <p>
            <span className="span-sidebar">CF Donor:</span>{" "}
            <span className="span-sidebar">{trip.CF_DONOR || "N/A"}</span>
          </p>
          <p>
            <span className="span-sidebar">CF Condition Area:</span>{" "}
            <span className="span-sidebar">{trip.CF_CONDITION_AREA || "N/A"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptionForm;
