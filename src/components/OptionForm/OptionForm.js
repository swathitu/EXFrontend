import React, { useState, useEffect, useRef, useCallback } from "react";
import "./OptionForm.css";
import { FaCalendarAlt, FaEllipsisH, FaMapMarkerAlt, FaCar, FaUser } from "react-icons/fa";
import FlightOptionForm from "../FlightOptionForm/FlightOptionForm";
import HotelOptions from "../HotelOptionForm/HotelOptionForm";
import TrainOptionForm from "../TrainOptionForm/TrainOptionForm";
import CarOptionForm from "../CarOptionForm/CarOptionForm";
import BusOptionForm from "../BusOptionForm/BusOptionForm";
import HotelRescheduleForm from "../HotelRescheduleForm/HotelRescheduleForm";
import HotelPreviousItineraries from "../HotelPreviousItineraries/HotelPreviousItineraries";
import CancelItineraryModal from "../CancelItineraryModal/CancelItineraryModal";
import FlightRescheduleForm from "../FlightRescheduleForm/FlightRescheduleForm";
import FlightPreviousItineraries from "../FlightPreviousItineraries/FlightPreviousItineraries";
import CarRescheduleForm from "../CarRescheduleForm/CarRescheduleForm";
import CarPreviousItineraries from "../CarPreviousItineraries/CarPreviousItineraries";
import TrainRescheduleForm from "../TrainRescheduleForm/TrainRescheduleForm";
import TrainPreviousItineraries from "../TrainPreviousItineraries/TrainPreviousItineraries";
import BusRescheduleForm from "../BusRescheduleForm/BusRescheduleForm";
import BusPreviousItineraries from "../BusPreviousItineraries/BusPreviousItineraries";
import FlightTicketForm from "../FlightTicketForm/FlightTicketForm";
import BusTicketForm from "../BusTicketForm/BusTicketForm";
import HotelTicketForm from "../HotelTicketForm/HotelTicketForm";
import CarTicketForm from "../CarTicketForm/CarTicketForm";
import TrainTicketForm from "../TrainTicketForm/TrainTicketForm";
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

const ActionMenu = ({
  optionStatus,
  entity,           // flight or hotel object
  buttonType,
  onAddOptionClick,
  onEditOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  rescheduleStatus,
}) => {
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  return (
    <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
      <div ref={addRef}>
        {buttonType === "add" && (
          <button className="button-type" onClick={() => onAddOptionClick(entity)}>Add Option</button>
        )}
        {buttonType === "edit" && (
          <button className="button-type" onClick={() => onEditOptionClick(entity)}>Edit Option</button>
        )}
        {buttonType === "ticket" && (
          <button className="button-type" onClick={() => onAddTicketClick(entity)}>Add Ticket</button>
        )}
        {buttonType === "editTicket" && (
          <button className="button-type" onClick={() => onEditTicketClick(entity)}>Edit Ticket</button>
        )}
        {buttonType === "view" && (
          <button className="button-type" onClick={() => alert("View Ticket clicked")}>View Ticket</button>
        )}
      </div>

      <div ref={menuRef}>
        <FaEllipsisH
          onClick={() => {
            setShowMenuOptions(v => !v);
            setShowAddOptions(false);
          }}
          style={{ cursor: "pointer", fontSize: 20 }}
        />
        {showMenuOptions && (
          <div className="dropdown menu-options-dropdown">
            {(!optionStatus || optionStatus === "") && (
              <>
                <button onClick={() => onRescheduleClick(entity)}>Reschedule</button>
                <button onClick={() => onCancelClick(entity)}>Cancel</button>
                {rescheduleStatus === "Reschedule" && (
                  <button className="button-type" onClick={() => onViewPreviousItineraryClick(entity)}>View Previous Itinerary</button>
                )}              </>
            )}
            {optionStatus === "added" && (
              <>
                <button onClick={() => onDeleteClick(entity)}>Delete</button>
                {/* <button onClick={() => onSelectOptionsClick(entity)}>Select Options</button> */}
                <button onClick={() => onRescheduleClick(entity)}>Reschedule</button>
                <button onClick={() => onCancelClick(entity)}>Cancel</button>
                {rescheduleStatus === "Reschedule" && (
                  <button className="button-type" onClick={() => onViewPreviousItineraryClick(entity)}>View Previous Itinerary</button>
                )}              </>
            )}
            {optionStatus === "selected" && (
              <>
                <button onClick={() => onEditOptionClick(entity)}>Edit</button>
                <button onClick={() => onDeleteClick(entity)}>Delete</button>
              </>
            )}
            {optionStatus === "booked" && (
              <>
                <button onClick={() => onViewTicketClick(entity)}>View Ticket</button>
                <button onClick={() => onDownloadTicketClick(entity)}>Download Ticket</button>
                <button onClick={() => onViewOptionsClick(entity)}>View Options</button>
                {/* <button onClick={() => onRescheduleClick(entity)}>Reschedule</button> */}
                {/* <button onClick={() => onCancelClick(entity)}>Cancel</button> */}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Flight card


const FlightCard = ({
  flight,
  optionsData = [],
  onAddOptionClick,
  onEditOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  onSaveReschedule,
  assignedAgentId,
  agents,
  loadingAssign,
  assignError,
  onAssignAgentChange,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showPreviousItineraries, setShowPreviousItineraries] = useState(false);
  const [cancelBookingItem, setCancelBookingItem] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState(null);

  if (!flight) return null;

  // Determine current optionStatus from optionsData
  const optionStatus =
    optionsData.length > 0
      ? (
        optionsData.find(
          (opt) => opt.Option_Status && opt.Option_Status.trim() !== ""
        )?.Option_Status || ""
      ).toLowerCase()
      : null;

  const rescheduleStatus = flight.Reschedule_Status || "";
  const cancelStatus = flight.Cancel_Status || "";

  let statusText = "Waiting for Options";
  let buttonType = "add";

  // Get displayOption for single selected option if exists
  let displayOption = null;

  if (cancelStatus.toLowerCase() === "cancelled") {
    statusText = "Cancelled";
    buttonType = null; // Hide main buttons and dropdown except possibly "View Previous Itinerary"
  } else {
    if (!optionStatus || optionStatus === "") {
      statusText = "Waiting for Options";
      buttonType = "add";
      displayOption = null;
    } else if (optionStatus === "added") {
      statusText = "Yet to select options";
      buttonType = "edit";
      displayOption = optionsData.find(
        (opt) => (opt.Option_Status || "").toLowerCase() === "added"
      );
    } else if (optionStatus === "selected") {
      statusText = "Booking pending";
      buttonType = "ticket";
      displayOption = optionsData.find(
        (opt) => (opt.Option_Status || "").toLowerCase() === "selected"
      );
    } else if (optionStatus === "booked") {
      statusText = "Ticket booked";
      buttonType = "editTicket";
      displayOption = optionsData.find(
        (opt) => (opt.Option_Status || "").toLowerCase() === "booked"
      );
    }
  }

  // For multi-selected options, filter those
  const selectedOptions = optionsData.filter(
    (opt) => (opt.Option_Status || "").toLowerCase() === "selected"
  );

  // Compose mergedFlight for display based on multiple selected options (if any)
  // Use first flight for departure info and last flight for arrival info
  const firstFlight = selectedOptions.length > 0 ? selectedOptions[0] : null;
  const lastFlight =
    selectedOptions.length > 1
      ? selectedOptions[selectedOptions.length - 1]
      : firstFlight;

  const mergedFlightMulti = {
    FLIGHT_DEP_DATE:
      firstFlight?.FLIGHT_DEP_DATE ||
      displayOption?.FLIGHT_DEP_DATE ||
      flight.FLIGHT_DEP_DATE ||
      flight.depDate,
    FLIGHT_DEP_TIME:
      firstFlight?.FLIGHT_DEP_TIME ||
      displayOption?.FLIGHT_DEP_TIME ||
      flight.FLIGHT_DEP_TIME ||
      flight.depTime,
    FLIGHT_ARR_DATE:
      lastFlight?.FLIGHT_ARR_DATE ||
      displayOption?.FLIGHT_ARR_DATE ||
      flight.FLIGHT_ARR_DATE ||
      flight.arrDate,
    FLIGHT_ARR_TIME:
      lastFlight?.FLIGHT_ARR_TIME ||
      displayOption?.FLIGHT_ARR_TIME ||
      flight.FLIGHT_ARR_TIME ||
      flight.arrTime,
    FLIGHT_DEP_CITY:
      firstFlight?.FLIGHT_DEP_CITY ||
      displayOption?.FLIGHT_DEP_CITY ||
      flight.FLIGHT_DEP_CITY ||
      flight.depCity,
    FLIGHT_ARR_CITY:
      lastFlight?.FLIGHT_ARR_CITY ||
      displayOption?.FLIGHT_ARR_CITY ||
      flight.FLIGHT_ARR_CITY ||
      flight.arrCity,
    DEP_CITY_CODE:
      firstFlight?.DEP_CITY_CODE ||
      displayOption?.DEP_CITY_CODE ||
      flight.DEP_CITY_CODE ||
      flight.depCityCode,
    ARR_CITY_CODE:
      lastFlight?.ARR_CITY_CODE ||
      displayOption?.ARR_CITY_CODE ||
      flight.ARR_CITY_CODE ||
      flight.arrCityCode,
    DEP_AIRPORT_NAME:
      firstFlight?.DEP_AIRPORT_NAME ||
      displayOption?.DEP_AIRPORT_NAME ||
      flight.DEP_AIRPORT_NAME ||
      flight.depAirpot,
    ARR_AIRPORT_NAME:
      lastFlight?.ARR_AIRPORT_NAME ||
      displayOption?.ARR_AIRPORT_NAME ||
      flight.ARR_AIRPORT_NAME ||
      flight.arrAirpot,
    MERCHANT_NAME: displayOption?.Merchant_Name || flight.MERCHANT_NAME,
    AMOUNT: displayOption?.Amount
  };

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };

  const handleViewPreviousItinerary = () => {
    setShowPreviousItineraries(true);
  };

  const handleCancelClick = (item, type) => {
    setCancelBookingItem({ ...item, requestType: type });
  };

  const handleAddTicketClick = (flightData) => {
    console.log("Add Ticket clicked with flightData:", flightData);
    setTicketFormData(flightData);
    setShowTicketForm(true);
  };

  const handleConfirmCancel = async (item, reason) => {
    try {
      const payload = {
        rowId: item.rowId || item.ROWID || item.id,
        requestType: item.requestType,
        reason: reason,
      };

      const response = await fetch("/server/trip_cancelation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Booking cancelled successfully");
        setCancelBookingItem(null);
        if (onSaveReschedule) {
          onSaveReschedule();
        }
      } else {
        alert("Failed to cancel: " + result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Error during cancellation.");
    }
  };

  const showButtons = cancelStatus.toLowerCase() !== "cancelled";

  return (
    <div className="flight-card1">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">
          Travel Agent:{" "}
          {assignedAgentId
            ? agents.find((agent) => agent.row_id === assignedAgentId)?.first_name ||
            "Assigned"
            : "Yet to be assigned"}
        </span>
        <div
          className="assigned"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}
        >
          <label>Assigned To:</label>
          {loadingAssign ? (
            <span>Assigning...</span>
          ) : (
            <select
              value={assignedAgentId || ""}
              onChange={(e) => onAssignAgentChange && onAssignAgentChange(e.target.value)}
            >
              <option value="">Unassigned</option>
              {agents?.map((agent) => (
                <option key={agent.row_id} value={agent.row_id}>
                  {agent.first_name}
                </option>
              ))}
            </select>
          )}
          {assignError && <span className="error-text">{assignError}</span>}
        </div>
      </div>

      <div className="flight-details">
        <div className="flight-date">
          {optionStatus === "selected" && (
            <span>{mergedFlightMulti.MERCHANT_NAME}</span>
          )}

          {optionStatus === "cancelled" && (
            <>
              <span>{mergedFlightMulti.MERCHANT_NAME}</span>
              <span style={{ marginLeft: 8 }}>
                {displayOption?.Flight_Number || mergedFlightMulti.Flight_Number || ""}
              </span>
            </>
          )}

          {optionStatus !== "selected" && optionStatus !== "cancelled" && (
            <>
              <span>{mergedFlightMulti.MERCHANT_NAME}</span>
              <FaCalendarAlt className="icon" />
              <div>
                <div className="date">{mergedFlightMulti.FLIGHT_DEP_DATE}</div>
                <div className="preferred-time">
                  Preferred Time: {mergedFlightMulti.FLIGHT_DEP_TIME}
                </div>
              </div>
            </>
          )}
        </div>


        <div className="flight-route">
          <div className="from">
            <div className="time">{mergedFlightMulti.FLIGHT_DEP_DATE},{mergedFlightMulti.FLIGHT_DEP_TIME}</div>
            <div className="city">
              {mergedFlightMulti.FLIGHT_DEP_CITY} - {mergedFlightMulti.DEP_CITY_CODE}
            </div>
            <div className="subtext">{mergedFlightMulti.DEP_AIRPORT_NAME}</div>
          </div>
          <div className="arrow">→</div>
          <div className="to">
            <div className="time">{mergedFlightMulti.FLIGHT_ARR_DATE}{mergedFlightMulti.FLIGHT_ARR_TIME}</div>
            <div className="city">
              {mergedFlightMulti.FLIGHT_ARR_CITY} - {mergedFlightMulti.ARR_CITY_CODE}
            </div>
            <div className="subtext">{mergedFlightMulti.ARR_AIRPORT_NAME}</div>
          </div>
        </div>

        {showButtons && (
          <ActionMenu
            optionStatus={optionStatus}
            entity={flight}
            buttonType={buttonType}
            onAddOptionClick={onAddOptionClick}
            onEditOptionClick={(entity) => onEditOptionClick(entity, optionsData)}
            onAddTicketClick={() =>
              handleAddTicketClick(
                selectedOptions.length > 1 ? selectedOptions : selectedOptions[0] || displayOption || flight
              )
            }
            onEditTicketClick={(entity) => onEditTicketClick(entity, optionsData)}
            onDeleteClick={onDeleteClick}
            onSelectOptionsClick={onSelectOptionsClick}
            onChangeSelectionClick={onChangeSelectionClick}
            onViewPreviousItineraryClick={
              rescheduleStatus === "Reschedule" ? handleViewPreviousItinerary : () => { }
            }
            onViewTicketClick={onViewTicketClick}
            onDownloadTicketClick={onDownloadTicketClick}
            onViewOptionsClick={onViewOptionsClick}
            onRescheduleClick={handleReschedule}
            onCancelClick={(item) => handleCancelClick(item, "flight")}
            rescheduleStatus={rescheduleStatus}
          />
        )}


        {cancelStatus.toLowerCase() === "cancelled" && (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginTop: 8,
            }}
          >
            <button onClick={() => setShowPreviousItineraries((v) => !v)}>
              View Previous Itinerary
            </button>
            {showPreviousItineraries && (
              <div
                className="dropdown menu-options-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ccc",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 8,
                  zIndex: 999,
                  minWidth: 180,
                }}
              >
                {rescheduleStatus ? (
                  <button onClick={handleViewPreviousItinerary}>
                    View Previous Itinerary Details
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {showTicketForm && ticketFormData && (
        <FlightTicketForm
          flight={ticketFormData}
          onClose={() => setShowTicketForm(false)}
          onSave={() => {
            setShowTicketForm(false);
            if (onSaveReschedule) onSaveReschedule();
          }}
        />
      )}

      {showRescheduleForm && (
        <FlightRescheduleForm
          bookingData={flight}
          onClose={() => setShowRescheduleForm(false)}
          onSave={onSaveReschedule}
        />
      )}

      {showPreviousItineraries && (
        <FlightPreviousItineraries
          bookingData={flight}
          onClose={() => setShowPreviousItineraries(false)}
        />
      )}

      {cancelBookingItem && (
        <CancelItineraryModal
          bookingData={cancelBookingItem}
          onClose={() => setCancelBookingItem(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};




// Hotel card
const HotelCard = ({
  hotel,
  optionsData = [],
  onAddHotelOptionClick,
  onEditHotelOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  onSaveReschedule,
  assignedAgentId,
  agents,
  loadingAssign,
  assignError,
  onAssignAgentChange,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showPreviousItineraries, setShowPreviousItineraries] = useState(false);
  const [cancelBookingItem, setCancelBookingItem] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState(null);


  if (!hotel) return null;

  const optionStatus =
    optionsData.length > 0
      ? (optionsData.find((opt) => opt.Option_Status && opt.Option_Status.trim() !== "")?.Option_Status || "").toLowerCase()
      : null;

  const rescheduleStatus = hotel.Reschedule_Status || "";
  const cancelStatus = hotel.Cancel_Status || "";

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (cancelStatus.toLowerCase() === "cancelled") {
    statusText = "Cancelled";
    buttonType = null; // Hide all main buttons and dropdown except View Previous Itinerary below
  } else {
    if (!optionStatus || optionStatus === "") {
      statusText = "Waiting for Options";
      buttonType = "add";
      displayOption = null;
    } else if (optionStatus === "added") {
      statusText = "Yet to select options";
      buttonType = "edit";
      displayOption = optionsData.find((opt) => (opt.Option_Status || "").toLowerCase() === "added");
    } else if (optionStatus === "selected") {
      statusText = "Booking pending";
      buttonType = "ticket";
      displayOption = optionsData.find((opt) => (opt.Option_Status || "").toLowerCase() === "selected");
    } else if (optionStatus === "booked") {
      statusText = "Ticket booked";
      buttonType = "editTicket";
      displayOption = optionsData.find((opt) => (opt.Option_Status || "").toLowerCase() === "booked");
    }
  }

  const mergedHotel = {
    HOTEL_DEP_CITY: displayOption?.HOTEL_DEP_CITY || hotel.HOTEL_DEP_CITY || hotel.depCity,
    HOTEL_ARR_DATE: displayOption?.HOTEL_ARR_DATE || hotel.HOTEL_ARR_DATE || hotel.arrDate,
    HOTEL_ARR_TIME: displayOption?.HOTEL_ARR_TIME || hotel.HOTEL_ARR_TIME || hotel.arrTime,
    HOTEL_DEP_DATE: displayOption?.HOTEL_DEP_DATE || hotel.HOTEL_DEP_DATE || hotel.depDate,
    HOTEL_DEP_TIME: displayOption?.HOTEL_DEP_TIME || hotel.HOTEL_DEP_TIME || hotel.depTime,
  };

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };

  const handleViewPreviousItinerary = () => {
    setShowPreviousItineraries(true);
  };


  const handleAddTicketClick = (optionData) => {
    setTicketFormData(optionData);
    setShowTicketForm(true);
  };


  const handleCancelClick = (item, type) => {
    setCancelBookingItem({ ...item, requestType: type });
  };

  const handleConfirmCancel = async (item, reason) => {
    try {
      const payload = {
        rowId: item.rowId || item.ROWID || item.id,
        requestType: item.requestType, // e.g., 'car', 'bus', 'train', etc.
        reason: reason,
      };

      const response = await fetch('/server/trip_cancelation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // refresh data or UI as needed
        alert("Booking cancelled successfully");

        setCancelBookingItem(null); // close the modal
        onSaveReschedule();
      } else {
        alert("Failed to cancel: " + result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Error during cancellation.");
    }
  };

  const showButtons = cancelStatus.toLowerCase() !== "cancelled"; // buttons hidden only if cancelled

  return (
    <div className="hotel-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">
          Travel Agent: {assignedAgentId
            ? agents.find(agent => agent.row_id === assignedAgentId)?.first_name || "Assigned"
            : "Yet to be assigned"}
        </span>
        <div className="assigned" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Assigned To:</label>
          {loadingAssign ? (
            <span>Assigning...</span>
          ) : (
            <select
              value={assignedAgentId || ""}
              onChange={(e) =>
                onAssignAgentChange && onAssignAgentChange(e.target.value)
              }
            >
              <option value="">Unassigned</option>
              {agents?.map((agent) => (
                <option key={agent.row_id} value={agent.row_id}>
                  {agent.first_name}
                </option>
              ))}
            </select>
          )}
          {assignError && (
            <span className="error-text">
              {assignError}
            </span>
          )}
        </div>
      </div>

      <div className="booking-details">
        <div className="hotel-name">
          <FaMapMarkerAlt className="icon" />
          <span>{mergedHotel.HOTEL_DEP_CITY || "N/A"}</span>
        </div>

        <div className="divider"></div>

        <div className="check-info">
          <div className="check-in">
            <span className="label">Check-in</span>
            <span className="date">{mergedHotel.HOTEL_DEP_DATE || "N/A"}, {mergedHotel.HOTEL_DEP_TIME || "N/A"}</span>
          </div>
          <span className="separator">-</span>
          <div className="check-out">
            <span className="label">Check-out</span>
            <span className="date">{mergedHotel.HOTEL_ARR_DATE || "N/A"}, {mergedHotel.HOTEL_ARR_TIME || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        {showButtons && (
          <ActionMenu
            optionStatus={optionStatus}
            entity={hotel}
            buttonType={buttonType}
            onAddOptionClick={onAddHotelOptionClick}
            onEditOptionClick={(entity) => onEditHotelOptionClick(entity, optionsData)}
            onAddTicketClick={() => handleAddTicketClick(displayOption)}
            onEditTicketClick={onEditTicketClick}
            onDeleteClick={onDeleteClick}
            onSelectOptionsClick={onSelectOptionsClick}
            onChangeSelectionClick={onChangeSelectionClick}
            onViewPreviousItineraryClick={
              rescheduleStatus === "Reschedule"
                ? handleViewPreviousItinerary
                : () => { } // empty handler to hide button
            }
            onViewTicketClick={onViewTicketClick}
            onDownloadTicketClick={onDownloadTicketClick}
            onViewOptionsClick={onViewOptionsClick}
            onRescheduleClick={handleReschedule}
            rescheduleStatus={rescheduleStatus}
            onCancelClick={(item) => handleCancelClick(item, "hotel")}
          />
        )}

        {cancelStatus.toLowerCase() === "cancelled" && (
          <div style={{ position: "relative", display: "inline-block", marginTop: 8, marginLeft: 'auto' }}>
            <button onClick={() => setShowPreviousItineraries((v) => !v)}>
              View Previous Itinerary
            </button>
            {showPreviousItineraries && (
              <div
                className="dropdown menu-options-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ccc",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 8,
                  zIndex: 999,
                  minWidth: 180,
                }}
              >
                {rescheduleStatus ? (
                  <button onClick={handleViewPreviousItinerary}>
                    View Previous Itinerary Details
                  </button>
                ) : null}
                {/* ...add more dropdown options if needed */}
              </div>
            )}
          </div>
        )}


      </div>

      {showRescheduleForm && (
        <HotelRescheduleForm
          bookingData={hotel}
          onClose={() => setShowRescheduleForm(false)}
          onSave={onSaveReschedule}
        />
      )}

      {showTicketForm && ticketFormData && (
        <HotelTicketForm
          Hotel={ticketFormData}
          onClose={() => setShowTicketForm(false)}
          onSave={() => {
            setShowTicketForm(false);
            if (onSaveReschedule) onSaveReschedule();
          }}
        />
      )}


      {showPreviousItineraries && (
        <HotelPreviousItineraries
          bookingData={hotel}
          onClose={() => setShowPreviousItineraries(false)}
        />
      )}

      {cancelBookingItem && (
        <CancelItineraryModal
          bookingData={cancelBookingItem}
          onClose={() => setCancelBookingItem(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};



// Car card
const CarCard = ({
  car,
  optionsData = [],
  onAddCarOptionClick,
  onEditCarOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  onSaveReschedule,
  assignedAgentId,
  agents,
  loadingAssign,
  assignError,
  onAssignAgentChange,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = React.useState(false);
  const [showPreviousItineraries, setShowPreviousItineraries] = React.useState(false);
  const [cancelBookingItem, setCancelBookingItem] = React.useState(null);
  const [showMenuOptions, setShowMenuOptions] = React.useState(false);
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState(null);

  const addRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!car) return null;

  const optionStatus = optionsData.length > 0
    ? (optionsData.find(opt => opt.Option_Status && opt.Option_Status.trim() !== "")?.Option_Status || "").toLowerCase()
    : null;

  const rescheduleStatus = car.Reschedule_Status || "";
  const cancelStatus = car.Cancel_Status || "";

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (cancelStatus.toLowerCase() === "cancelled") {
    statusText = "Cancelled";
    buttonType = null; // Hide main buttons & dropdown except View Previous Itinerary
  } else {
    if (!optionStatus || optionStatus === "") {
      statusText = "Waiting for Options";
      buttonType = "add";
      displayOption = null;
    } else if (optionStatus === "added") {
      statusText = "Yet to select options";
      buttonType = "edit";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
    } else if (optionStatus === "selected") {
      statusText = "Booking pending";
      buttonType = "ticket";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
    } else if (optionStatus === "booked") {
      statusText = "Ticket booked";
      buttonType = "view";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
    }
  }

  const mergedCar = {
    CAR_TYPE: displayOption?.CAR_TYPE || displayOption?.carType || car.CAR_TYPE || car.carType,
    CAR_DRIVER: displayOption?.CAR_DRIVER || displayOption?.driverNeeded || car.CAR_DRIVER || car.driverNeeded,
    CAR_DEP_DATE: displayOption?.CAR_DEP_DATE || displayOption?.depDate || car.CAR_DEP_DATE || car.depDate,
    CAR_DEP_TIME: displayOption?.CAR_DEP_TIME || displayOption?.depTime || car.CAR_DEP_TIME || car.depTime,
    CAR_DEP_CITY: displayOption?.CAR_DEP_CITY || displayOption?.depCity || car.CAR_DEP_CITY || car.depCity,
    CAR_ARR_DATE: displayOption?.CAR_ARR_DATE || displayOption?.arrDate || car.CAR_ARR_DATE || car.arrDate,
    CAR_ARR_TIME: displayOption?.CAR_ARR_TIME || displayOption?.arrTime || car.CAR_ARR_TIME || car.arrTime,
    CAR_ARR_CITY: displayOption?.CAR_ARR_CITY || displayOption?.arrCity || car.CAR_ARR_CITY || car.arrCity,
    pickUpDate: displayOption?.CAR_DEP_DATE || displayOption?.depDate || car.pickUpDate,
    pickUpTime: displayOption?.CAR_DEP_TIME || displayOption?.depTime || car.pickUpTime,
    pickUpLocation: displayOption?.CAR_DEP_CITY || displayOption?.depCity || car.pickUpLocation,
    dropOffDate: displayOption?.CAR_ARR_DATE || displayOption?.arrDate || car.dropOffDate,
    dropOffTime: displayOption?.CAR_ARR_TIME || displayOption?.arrTime || car.dropOffTime,
    dropOffLocation: displayOption?.CAR_ARR_CITY || displayOption?.arrCity || car.dropOffLocation,
  };

  const showButtons = cancelStatus.toLowerCase() !== "cancelled";

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };

  const handleViewPreviousItinerary = () => {
    setShowPreviousItineraries(true);
  };


  const handleAddTicketClick = (optionData) => {
    setTicketFormData(optionData);
    setShowTicketForm(true);
  };

  const handleCancelClick = (item, type) => {
    setCancelBookingItem({ ...item, requestType: type });
  };

  const handleConfirmCancel = async (item, reason) => {
    try {
      const payload = {
        rowId: item.rowId || item.ROWID || item.id,
        requestType: item.requestType,
        reason,
      };
      const response = await fetch('/server/trip_cancelation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("Booking cancelled successfully");
        setCancelBookingItem(null);
        if (onSaveReschedule) onSaveReschedule();
      } else {
        alert("Failed to cancel: " + result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Error during cancellation.");
    }
  };

  return (
    <div className="car-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">
          Travel Agent: {assignedAgentId
            ? agents.find(agent => agent.row_id === assignedAgentId)?.first_name || "Assigned"
            : "Yet to be assigned"}
        </span>
        <div className="assigned" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Assigned To:</label>
          {loadingAssign ? (
            <span>Assigning...</span>
          ) : (
            <select
              value={assignedAgentId || ""}
              onChange={(e) =>
                onAssignAgentChange && onAssignAgentChange(e.target.value)
              }
            >
              <option value="">Unassigned</option>
              {agents?.map((agent) => (
                <option key={agent.row_id} value={agent.row_id}>
                  {agent.first_name}
                </option>
              ))}
            </select>
          )}
          {assignError && (
            <span className="error-text">
              {assignError}
            </span>
          )}
        </div>
      </div>

      <div className="booking-details">
        <div className="car-info">
          {buttonType === "ticket" && displayOption?.Merchant_Name && (
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>{displayOption.Merchant_Name}</div>
          )}
          <div className="car-type">
            <FaCar className="icon" />
            <span className="car-extrainfo">{mergedCar.CAR_TYPE || "N/A"}</span>
          </div>
          <div className="driver-info">
            <FaUser className="icon" />
            <span>{mergedCar.CAR_DRIVER || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="pickup-dropoff">
          <div className="pickup">
            <span className="label">Pick-Up</span>
            <span className="date">
              {mergedCar.CAR_DEP_DATE || mergedCar.pickUpDate || "N/A"},{" "}
              {mergedCar.CAR_DEP_TIME || mergedCar.pickUpTime || "N/A"}
            </span>
            <span className="location">{mergedCar.CAR_DEP_CITY || mergedCar.pickUpLocation || "N/A"}</span>
          </div>
          <span className="arrow">→</span>
          <div className="dropoff">
            <span className="label">Drop-Off</span>
            <span className="date">
              {mergedCar.CAR_ARR_DATE || mergedCar.dropOffDate || "N/A"},{" "}
              {mergedCar.CAR_ARR_TIME || mergedCar.dropOffTime || "N/A"}
            </span>
            <span className="location">{mergedCar.CAR_ARR_CITY || mergedCar.dropOffLocation || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        {showButtons && (
          <ActionMenu
            optionStatus={optionStatus}
            entity={car}
            buttonType={buttonType}
            onAddOptionClick={onAddCarOptionClick}
            onEditOptionClick={(entity) => onEditCarOptionClick(entity, optionsData)}
            onAddTicketClick={() => handleAddTicketClick(displayOption)}
            onEditTicketClick={onEditTicketClick}
            onDeleteClick={onDeleteClick}
            onSelectOptionsClick={onSelectOptionsClick}
            onChangeSelectionClick={onChangeSelectionClick}
            onViewPreviousItineraryClick={
              rescheduleStatus === "Reschedule"
                ? handleViewPreviousItinerary
                : () => { } // empty handler to hide button
            }
            onViewTicketClick={onViewTicketClick}
            onDownloadTicketClick={onDownloadTicketClick}
            onViewOptionsClick={onViewOptionsClick}
            onRescheduleClick={handleReschedule}
            rescheduleStatus={rescheduleStatus}
            onCancelClick={(item) => handleCancelClick(item, "car")}
          />
        )}

        {cancelStatus.toLowerCase() === "cancelled" && (
          <div style={{ position: "relative", display: "inline-block", marginTop: 8, marginLeft: "auto" }}>
            <button onClick={() => setShowPreviousItineraries((v) => !v)}>
              View Previous Itinerary
            </button>
            {showPreviousItineraries && (
              <div
                className="dropdown menu-options-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ccc",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 8,
                  zIndex: 999,
                  minWidth: 180,
                }}
              >
                {rescheduleStatus ? (
                  <button onClick={handleViewPreviousItinerary}>View Previous Itinerary Details</button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {showRescheduleForm && (
        <CarRescheduleForm
          bookingData={car}
          onClose={() => setShowRescheduleForm(false)}
          onSave={onSaveReschedule}
        />
      )}

      {showTicketForm && ticketFormData && (
        <CarTicketForm
          Car={ticketFormData}
          onClose={() => setShowTicketForm(false)}
          onSave={() => {
            setShowTicketForm(false);
            if (onSaveReschedule) onSaveReschedule();
          }}
        />
      )}

      {showPreviousItineraries && (
        <CarPreviousItineraries
          bookingData={car}
          onClose={() => setShowPreviousItineraries(false)}
        />
      )}

      {cancelBookingItem && (
        <CancelItineraryModal
          bookingData={cancelBookingItem}
          onClose={() => setCancelBookingItem(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};


// Train card (minimal)
const TrainCard = ({
  train,
  optionsData = [],
  onAddTrainOptionClick,
  onEditTrainOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  onSaveReschedule,
  assignedAgentId,
  agents,
  loadingAssign,
  assignError,
  onAssignAgentChange,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = React.useState(false);
  const [showPreviousItineraries, setShowPreviousItineraries] = React.useState(false);
  const [cancelBookingItem, setCancelBookingItem] = React.useState(null);
  const [showMenuOptions, setShowMenuOptions] = React.useState(false);
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState(null);

  const addRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!train) return null;

  const optionStatus = optionsData.length > 0
    ? (optionsData.find(opt => opt.Option_Status && opt.Option_Status.trim() !== "")?.Option_Status || "").toLowerCase()
    : null;

  const rescheduleStatus = train.Reschedule_Status || "";
  const cancelStatus = train.Cancel_Status || "";

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (cancelStatus.toLowerCase() === "cancelled") {
    statusText = "Cancelled";
    buttonType = null; // Hide main buttons except "View Previous Itinerary"
  } else {
    if (!optionStatus || optionStatus === "") {
      statusText = "Waiting for Options";
      buttonType = "add";
      displayOption = null;
    } else if (optionStatus === "added") {
      statusText = "Yet to select options";
      buttonType = "edit";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
    } else if (optionStatus === "selected") {
      statusText = "Booking pending";
      buttonType = "ticket";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
    } else if (optionStatus === "booked") {
      statusText = "Ticket booked";
      buttonType = "view";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
    }
  }

  const mergedTrain = {
    TRAIN_DEP_DATE: displayOption?.TRAIN_DEP_DATE || train.TRAIN_DEP_DATE || train.date,
    TRAIN_DEP_CITY: displayOption?.TRAIN_DEP_CITY || train.TRAIN_DEP_CITY || train.departure,
    TRAIN_ARR_CITY: displayOption?.TRAIN_ARR_CITY || train.TRAIN_ARR_CITY || train.arrival,
  };

  const showButtons = cancelStatus.toLowerCase() !== "cancelled";

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };



  const handleAddTicketClick = (optionData) => {
    setTicketFormData(optionData);
    setShowTicketForm(true);
  };

  const handleViewPreviousItinerary = () => {
    setShowPreviousItineraries(true);
  };

  const handleCancelClick = (item, type) => {
    setCancelBookingItem({ ...item, requestType: type });
  };

  const handleConfirmCancel = async (item, reason) => {
    try {
      const payload = {
        rowId: item.rowId || item.ROWID || item.id,
        requestType: item.requestType,
        reason,
      };
      const response = await fetch('/server/trip_cancelation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("Booking cancelled successfully");
        setCancelBookingItem(null);
        if (onSaveReschedule) onSaveReschedule();
      } else {
        alert("Failed to cancel: " + result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Error during cancellation.");
    }
  };

  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">
          Travel Agent: {assignedAgentId
            ? agents.find(agent => agent.row_id === assignedAgentId)?.first_name || "Assigned"
            : "Yet to be assigned"}
        </span>
        <div className="assigned" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Assigned To:</label>
          {loadingAssign ? (
            <span>Assigning...</span>
          ) : (
            <select
              value={assignedAgentId || ""}
              onChange={(e) =>
                onAssignAgentChange && onAssignAgentChange(e.target.value)
              }
            >
              <option value="">Unassigned</option>
              {agents?.map((agent) => (
                <option key={agent.row_id} value={agent.row_id}>
                  {agent.first_name}
                </option>
              ))}
            </select>
          )}
          {assignError && (
            <span className="error-text">
              {assignError}
            </span>
          )}
        </div>
      </div>

      <div className="booking-details">
        <div className="transfer-date">
          <FaCalendarAlt className="icon" />
          <span>{mergedTrain.TRAIN_DEP_DATE || "N/A"}</span>
        </div>

        <div className="divider"></div>

        <div className="transfer-route">
          <div className="departure">
            <span className="label">Departure</span>
            <span className="location">{mergedTrain.TRAIN_DEP_CITY || "N/A"}</span>
          </div>
          <span className="arrow">→</span>
          <div className="arrival">
            <span className="label">Arrival</span>
            <span className="location">{mergedTrain.TRAIN_ARR_CITY || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        {showButtons && (
          <ActionMenu
            optionStatus={optionStatus}
            entity={train}
            buttonType={buttonType}
            onAddOptionClick={onAddTrainOptionClick}
            onEditOptionClick={(entity) => onEditTrainOptionClick(entity, optionsData)}
            onAddTicketClick={() => handleAddTicketClick(displayOption)}
            onEditTicketClick={onEditTicketClick}
            onDeleteClick={onDeleteClick}
            onSelectOptionsClick={onSelectOptionsClick}
            onChangeSelectionClick={onChangeSelectionClick}
            onViewPreviousItineraryClick={
              rescheduleStatus === "Reschedule"
                ? handleViewPreviousItinerary
                : () => { } // empty handler to hide button
            }
            onViewTicketClick={onViewTicketClick}
            onDownloadTicketClick={onDownloadTicketClick}
            onViewOptionsClick={onViewOptionsClick}
            onRescheduleClick={handleReschedule}
            rescheduleStatus={rescheduleStatus}
            onCancelClick={(item) => handleCancelClick(item, "train")}
          />
        )}

        {cancelStatus.toLowerCase() === "cancelled" && (
          <div style={{ position: "relative", display: "inline-block", marginTop: 8, marginLeft: "auto" }}>
            <button onClick={() => setShowPreviousItineraries((v) => !v)}>
              View Previous Itinerary
            </button>
            {showPreviousItineraries && (
              <div
                className="dropdown menu-options-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ccc",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 8,
                  zIndex: 999,
                  minWidth: 180,
                }}
              >
                {rescheduleStatus ? (
                  <button onClick={handleViewPreviousItinerary}>View Previous Itinerary Details</button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {showRescheduleForm && (
        <TrainRescheduleForm
          bookingData={train}
          onClose={() => setShowRescheduleForm(false)}
          onSave={onSaveReschedule}
        />
      )}

      {showPreviousItineraries && (
        <TrainPreviousItineraries
          bookingData={train}
          onClose={() => setShowPreviousItineraries(false)}
        />
      )}

      {showTicketForm && ticketFormData && (
        <TrainTicketForm
          Train={ticketFormData}
          onClose={() => setShowTicketForm(false)}
          onSave={() => {
            setShowTicketForm(false);
            if (onSaveReschedule) onSaveReschedule();
          }}
        />
      )}

      {cancelBookingItem && (
        <CancelItineraryModal
          bookingData={cancelBookingItem}
          onClose={() => setCancelBookingItem(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};



const BusCard = ({
  bus,
  optionsData = [],
  onAddBusOptionClick,
  onEditBusOptionClick,
  onAddTicketClick,
  onEditTicketClick,
  onDeleteClick,
  onSelectOptionsClick,
  onChangeSelectionClick,
  onViewPreviousItineraryClick,
  onViewTicketClick,
  onDownloadTicketClick,
  onViewOptionsClick,
  onRescheduleClick,
  onCancelClick,
  onSaveReschedule,
  assignedAgentId,
  agents,
  loadingAssign,
  assignError,
  onAssignAgentChange,
}) => {
  const [showRescheduleForm, setShowRescheduleForm] = React.useState(false);
  const [showPreviousItineraries, setShowPreviousItineraries] = React.useState(false);
  const [cancelBookingItem, setCancelBookingItem] = React.useState(null);
  const [showMenuOptions, setShowMenuOptions] = React.useState(false);
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const [showTicketForm, setShowTicketForm] = React.useState(false);
  const [ticketFormData, setTicketFormData] = React.useState(null);

  const addRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!bus) return null;
  const priority = ["booked", "selected", "added"];

  const optionStatus = optionsData.length > 0
    ? (() => {
      // Map all option statuses to lowercase
      const statuses = optionsData
        .map(opt => (opt.Option_Status || "").toLowerCase())
        .filter(s => s); // Remove empty

      // Find the highest priority status present
      for (const p of priority) {
        if (statuses.includes(p)) return p;
      }
      return null;
    })()
    : null;

  const rescheduleStatus = bus.Reschedule_Status || "";
  console.log('resc status', rescheduleStatus)
  const cancelStatus = bus.Cancel_Status || "";

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (cancelStatus.toLowerCase() === "cancelled") {
    statusText = "Cancelled";
    buttonType = null; // Hide main buttons except View Previous Itinerary below
  } else {
    if (!optionStatus || optionStatus === "") {
      statusText = "Waiting for Options";
      buttonType = "add";
      displayOption = null;
    } else if (optionStatus === "added") {
      statusText = "Yet to select options";
      buttonType = "edit";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
    } else if (optionStatus === "selected") {
      statusText = "Booking pending";
      buttonType = "ticket";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
    } else if (optionStatus === "booked") {
      statusText = "Ticket booked";
      buttonType = "view";
      displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
    }
  }

  const mergedBus = {
    BUS_DEP_DATE: displayOption?.BUS_DEP_DATE || bus.item?.BUS_DEP_DATE || bus.item?.date,
    BUS_DEP_CITY: displayOption?.BUS_DEP_CITY || bus.item?.BUS_DEP_CITY || bus.item?.departure,
    BUS_ARR_CITY: displayOption?.BUS_ARR_CITY || bus.item?.BUS_ARR_CITY || bus.item?.arrival,
  };

  const showButtons = cancelStatus.toLowerCase() !== "cancelled";

  const handleReschedule = () => {
    setShowRescheduleForm(true);
  };

  const handleViewPreviousItinerary = () => {
    setShowPreviousItineraries(true);
  };

  const handleCancelClick = (item, type) => {
    setCancelBookingItem({ ...item, requestType: type });
  };

  const handleAddTicketClick = (optionData) => {
    setTicketFormData(optionData);
    setShowTicketForm(true);
  };

  const handleConfirmCancel = async (item, reason) => {
    try {
      const payload = {
        rowId: item.rowId || item.ROWID || item.id,
        requestType: item.requestType,
        reason,
      };
      const response = await fetch('/server/trip_cancelation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("Booking cancelled successfully");
        setCancelBookingItem(null);
        if (onSaveReschedule) onSaveReschedule();
      } else {
        alert("Failed to cancel: " + result.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Error during cancellation.");
    }
  };

  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">
          Travel Agent: {assignedAgentId
            ? agents.find(agent => agent.row_id === assignedAgentId)?.first_name || "Assigned"
            : "Yet to be assigned"}
        </span>
        <div className="assigned" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Assigned To:</label>
          {loadingAssign ? (
            <span>Assigning...</span>
          ) : (
            <select
              value={assignedAgentId || ""}
              onChange={(e) =>
                onAssignAgentChange && onAssignAgentChange(e.target.value)
              }
            >
              <option value="">Unassigned</option>
              {agents?.map((agent) => (
                <option key={agent.row_id} value={agent.row_id}>
                  {agent.first_name}
                </option>
              ))}
            </select>
          )}
          {assignError && (
            <span className="error-text">
              {assignError}
            </span>
          )}
        </div>
      </div>

      <div className="booking-details">
        <div className="transfer-date1">
          {buttonType === "ticket" && displayOption?.Merchant_Name && (
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>{displayOption.Merchant_Name}</div>
          )}
          <div className="transfer-date">
            <FaCalendarAlt className="icon" />
            <span>{mergedBus.BUS_DEP_DATE || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="transfer-route">
          <div className="departure">
            <span className="label">Departure</span>
            <span className="location">{mergedBus.BUS_DEP_CITY || "N/A"}</span>
          </div>
          <span className="arrow">→</span>
          <div className="arrival">
            <span className="label">Arrival</span>
            <span className="location">{mergedBus.BUS_ARR_CITY || "N/A"}</span>
          </div>
        </div>

        <div className="divider"></div>


        {showButtons && (
          <ActionMenu
            optionStatus={optionStatus}
            entity={bus}
            buttonType={buttonType}
            onAddOptionClick={onAddBusOptionClick}
            onEditOptionClick={(entity) => onEditBusOptionClick(entity, optionsData)}
            onAddTicketClick={() => handleAddTicketClick(displayOption)}
            onEditTicketClick={onEditTicketClick}
            onDeleteClick={onDeleteClick}
            onSelectOptionsClick={onSelectOptionsClick}
            onChangeSelectionClick={onChangeSelectionClick}
            onViewPreviousItineraryClick={
              rescheduleStatus === "Reschedule"
                ? handleViewPreviousItinerary
                : () => { } // empty handler to hide button
            }
            onViewTicketClick={onViewTicketClick}
            onDownloadTicketClick={onDownloadTicketClick}
            onViewOptionsClick={onViewOptionsClick}
            onRescheduleClick={handleReschedule}
            rescheduleStatus={rescheduleStatus}
            onCancelClick={(item) => handleCancelClick(item, "bus")}
          />
        )}

        {cancelStatus.toLowerCase() === "cancelled" && (
          <div style={{ position: "relative", display: "inline-block", marginTop: 8, marginLeft: "auto" }}>
            <button onClick={() => setShowPreviousItineraries((v) => !v)}>
              View Previous Itinerary
            </button>
            {showPreviousItineraries && (
              <div
                className="dropdown menu-options-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ccc",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 8,
                  zIndex: 999,
                  minWidth: 180,
                }}
              >
                {rescheduleStatus ? (
                  <button onClick={handleViewPreviousItinerary}>View Previous Itinerary Details</button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>


      {showTicketForm && ticketFormData && (
        <BusTicketForm
          Bus={ticketFormData}
          onClose={() => setShowTicketForm(false)}
          onSave={() => {
            setShowTicketForm(false);
            if (onSaveReschedule) onSaveReschedule();
          }}
        />
      )}

      {showRescheduleForm && (
        <BusRescheduleForm
          bookingData={bus}
          onClose={() => setShowRescheduleForm(false)}
          onSave={onSaveReschedule}
        />
      )}

      {showPreviousItineraries && (
        <BusPreviousItineraries
          bookingData={bus}
          onClose={() => setShowPreviousItineraries(false)}
        />
      )}

      {cancelBookingItem && (
        <CancelItineraryModal
          bookingData={cancelBookingItem}
          onClose={() => setCancelBookingItem(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
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
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [assignedAgentsByRowId, setAssignedAgentsByRowId] = useState({});


  // Active mode derived from modesSummary
  const [activeMode, setActiveMode] = useState("");

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    setSavedEmail(emailFromStorage);
  }, []);

  const fetchOptionData = useCallback(async () => {
    if (!request || !request.id) {
      setDetails(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/server/get_optionData?tripId=${request.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success") {


        const reqData = data.data;
        const email = reqData.SUBMITTER_EMAIL || "";
        setSubmitterEmail(email);
        // Compute default agentId...
        let agentId = "";
        const assoc = reqData.associatedData || {};
        const map = {};
        ["CarData", "FlightData", "HotelData", "TrainData", "BusData"].forEach((key) => {
          (assoc[key] || []).forEach((item) => {
            if (item.AGENT_ID && item.ROWID) {
              map[item.ROWID] = item.AGENT_ID;
            }
          });
        });

        setAssignedAgentsByRowId(map);
        setDetails(reqData);
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
  }, [request]);

  useEffect(() => {
    fetchOptionData();
  }, [fetchOptionData]);


  const handlecallApi = () => {
    fetchOptionData();
    setOptionFormCar(null);
  };

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
  const handleAssignedToChange = async (rowId, agentRowId) => {
    setAssignError(null);
    setLoadingAssign(true);
    try {
      const selectedAgent = agents.find((a) => a.row_id === agentRowId);
      if (!selectedAgent) throw new Error("Please select a valid agent");

      const assoc = trip.associatedData || {};
      const allModeKeys = ["FlightData", "HotelData", "CarData", "TrainData", "BusData"];

      let tripType = "";
      for (const key of allModeKeys) {
        const found = (assoc[key] || []).find(
          (i) => String(i.ROWID) === String(rowId)
        );
        if (found) {
          tripType = key.replace("Data", ""); // Flight, Hotel, etc.
          break;
        }
      }

      const payload = {
        from_email: savedEmail,
        to_email: selectedAgent.email,
        ROWID: rowId,
        tripType: tripType || trip.modesSummary?.[0] || "",
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

      setAssignedAgentsByRowId((prev) => ({
        ...prev,
        [rowId]: agentRowId,
      }));
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
      case "flight": {
        const flightOptions = assoc.Flight_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForFlight = flightOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          const rowId = item.ROWID;
          const currentAgentId = assignedAgentsByRowId[rowId] || "";
          return (
            <FlightCard
              key={item.ROWID || Math.random()}
              flight={item}
              optionsData={optionsForFlight}
              assignedAgentId={currentAgentId}
              agents={agents}
              loadingAssign={loadingAssign}
              assignError={assignError}
              onAssignAgentChange={(agentRowId) =>
                handleAssignedToChange(rowId, agentRowId)
              }
              onAddOptionClick={() => setOptionFormFlight(item)}
              onEditOptionClick={(flight, options) =>
                setOptionFormFlight({ ...flight, options })
              }
              onAddTicketClick={(flight, options) =>
                setOptionFormFlight({ ...flight, options })
              }
            />
          );
        });
      }
      case "hotel": {
        const hotelOptions = assoc.Hotel_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForHotel = hotelOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          const rowId = item.ROWID;
          const currentAgentId = assignedAgentsByRowId[rowId] || "";
          return (
            <HotelCard
              key={item.ROWID || Math.random()}
              hotel={item}
              optionsData={optionsForHotel}
              assignedAgentId={currentAgentId}
              agents={agents}
              loadingAssign={loadingAssign}
              assignError={assignError}
              onAssignAgentChange={(agentRowId) =>
                handleAssignedToChange(rowId, agentRowId)
              }
              onAddHotelOptionClick={() => setOptionFormHotel(item)}
              onEditHotelOptionClick={(hotel, options) =>
                setOptionFormHotel({ ...hotel, options })
              }
              onAddTicketClick={(hotel, options) =>
                setOptionFormHotel({ ...hotel, options })
              }
              onSaveReschedule={handlecallApi}
            />
          );
        });
      }
      case "car":
        const carOptions = assoc.Car_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForCar = carOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          const rowId = item.ROWID;
          const currentAgentId = assignedAgentsByRowId[rowId] || "";

          return (
            <CarCard
              key={item.ROWID || Math.random()}
              car={item}
              optionsData={optionsForCar}
              assignedAgentId={currentAgentId}
              agents={agents}
              loadingAssign={loadingAssign}
              assignError={assignError}
              onAssignAgentChange={(agentRowId) =>
                handleAssignedToChange(rowId, agentRowId)
              }
              onAddCarOptionClick={(car) => setOptionFormCar(car)}
              onEditCarOptionClick={(car, options) => {
                setOptionFormCar({ ...car, options });
              }}
              onAddTicketClick={(car, options) => {
                setOptionFormCar({ ...car, options });
              }}
            />
          );
        });
      case "train": {
        const trainOptions = assoc.Train_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForTrain = trainOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          const rowId = item.ROWID;
          const currentAgentId = assignedAgentsByRowId[rowId] || "";
          return (
            <TrainCard
              key={item.ROWID || Math.random()}
              train={item}
              optionsData={optionsForTrain}
              assignedAgentId={currentAgentId}
              agents={agents}
              loadingAssign={loadingAssign}
              assignError={assignError}
              onAssignAgentChange={(agentRowId) =>
                handleAssignedToChange(rowId, agentRowId)
              }
              onAddTrainOptionClick={() => setOptionFormTrain(item)}
              onEditTrainOptionClick={(train, options) =>
                setOptionFormTrain({ ...train, options })
              }
              onAddTicketClick={(train, options) =>
                setOptionFormTrain({ ...train, options })
              }
            />
          );
        });
      }
      case "bus": {
        const busOptions = assoc.Bus_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForBus = busOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          const rowId = item.ROWID;
          const currentAgentId = assignedAgentsByRowId[rowId] || "";
          return (
            <BusCard
              key={item.ROWID || Math.random()}
              bus={item}
              optionsData={optionsForBus}
              assignedAgentId={currentAgentId}
              agents={agents}
              loadingAssign={loadingAssign}
              assignError={assignError}
              onAssignAgentChange={(agentRowId) =>
                handleAssignedToChange(rowId, agentRowId)
              }
              onAddBusOptionClick={() => setOptionFormBus(item)}
              onEditBusOptionClick={(bus, options) =>
                setOptionFormBus({ ...bus, options })
              }
              onAddTicketClick={(bus, options) =>
                setOptionFormBus({ ...bus, options })
              }
            />
          );
        });
      }
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
            {/* <div className="assigned">
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
            </div> */}
          </div>

          {/* Tabs for all modes */}
          <div className="tabs">
            {[...new Set(trip.modesSummary || [])].map((mode) => (
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
          <FlightOptionForm flight={optionFormFlight} onClose={() => setOptionFormFlight(null)} onSave={handlecallApi} submitter={submitterEmail} />
        )}
        {optionFormHotel && (
          <HotelOptions hotel={optionFormHotel} onClose={() => setOptionFormHotel(null)} onSave={handlecallApi} submitter={submitterEmail} />
        )}
        {optionFormTrain && (
          <TrainOptionForm train={optionFormTrain} onClose={() => setOptionFormTrain(null)} onSave={handlecallApi} submitter={submitterEmail} />
        )}
        {optionFormCar && (
          <CarOptionForm car={optionFormCar} onClose={() => setOptionFormCar(null)} onSave={handlecallApi} submitter={submitterEmail} />
        )}

        {optionFormBus && (
          <BusOptionForm bus={optionFormBus} onClose={() => setOptionFormBus(null)} onSave={handlecallApi} submitter={submitterEmail} />
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
