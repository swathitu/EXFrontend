import React, { useEffect, useState } from "react";
import "./FlightSelectionOptions.css";


const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];

const formatDate = (isoDateStr) => {
  if (!isoDateStr) return "";
  const dateObj = new Date(isoDateStr);
  if (isNaN(dateObj)) return isoDateStr; // fallback if invalid date
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
// FlightItinerary renders inside selected flight card
const FlightItinerary = ({ itineraryData }) => {
  return (
    <div className="itinerary-container">
      <div className="itinerary-header">
        <span className="itinerary-title">Flight Itinerary</span>
      </div>

      <h3 className="route">
        {itineraryData.route.from} → {itineraryData.route.to}
      </h3>

      {itineraryData.segments.map((segment, index) => (
        <div key={index} className="segment">
          <div className="segment-details">
            <div className="right-info">
              <div className="airline">
                ✈ {segment.airline} {segment.flightNumber}
              </div>
              <div className="class-bagge">Class: {segment.class}</div>
              <div className="class-bagge">Baggage: {segment.baggage}</div>
            </div>
            <div className="first-div">
              <div className="departure">
                <div className="city-time">
                  <span className="city">{segment.departure.city} </span>
                  <span className="time">{segment.departure.time}</span>
                </div>
                <div className="date">{formatDate(segment.departure.date)}</div>
                <div className="airport">{segment.departure.airport}</div>
              </div>

              <div className="duration">
                <span className="clock-icon">🕒</span> {segment.duration}
              </div>

              <div className="arrival">
                <div className="city-time">
                  <span className="city">{segment.arrival.city} </span>
                  <span className="time">{segment.arrival.time}</span>
                </div>
                <div className="date">{formatDate(segment.arrival.date)}</div>
                <div className="airport">{segment.arrival.airport}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FlightSelectionOptions = ({ flight, onClose, tripId, onConfirmSuccess }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [lowestFare, setLowestFare] = useState(null);
  const [selectedOptionDetails, setSelectedOptionDetails] = useState({
    tripId: null,
    optionId: null,
    rowId: null,
    type: null,
    Trip_Line_Item_ID: null,
  });
  const [openItineraryOptionId, setOpenItineraryOptionId] = useState(null); // track which card's itinerary is open

  const tripType = flight?.type || "Flight";

  useEffect(() => {
    if (!tripId || !tripType) return;

    setLoading(true);
    setError(null);
    setOpenItineraryOptionId(null);
    const apiUrl = `/server/trip_options_crud?tripId=${tripId}&type=${tripType}`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setOptions(data.data || []);
          let lowestAmount = null;
          data.data.forEach((item) => {
            const amt = parseFloat(item.Amount);
            if (lowestAmount === null || amt < lowestAmount) {
              lowestAmount = amt;
            }
          });

          // Store min amount for tagging
          setLowestFare(lowestAmount);
        } else {
          setError(data.message || "Failed to fetch flight options");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId, tripType]);

  // Group options by Option_Id
  const groupedOptions = options.reduce((acc, option) => {
    (acc[option.Option_Id] = acc[option.Option_Id] || []).push(option);
    return acc;
  }, {});

  const onSelectOption = (tripId, rowId, optionId, type, Trip_Line_Item_ID) => {
    console.log("Selected:", { tripId, optionId, rowId, type, Trip_Line_Item_ID });
    setSelectedOptionId(optionId);
    setSelectedOptionDetails({ tripId, optionId, rowId, type, Trip_Line_Item_ID });
  };

  const onConfirmSelection = () => {
    if (!selectedOptionId) {
      alert("Please select an option before confirming.");
      return;
    }

    // Prepare payload
    const payload = {
      tripId: selectedOptionDetails.tripId,
      optionId: selectedOptionDetails.optionId,
      rowId: selectedOptionDetails.rowId,
      type: selectedOptionDetails.type,
      Trip_Line_Item_ID: selectedOptionDetails.Trip_Line_Item_ID,
    };

    fetch("/server/trip_option_select/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          alert("Option selection confirmed successfully.");
          if (onConfirmSuccess) {
            onConfirmSuccess(); // Notify parent to refresh data
          }
          onClose();
        } else {
          alert(`Failed to confirm selection: ${data.message || "Unknown error"}`);
        }
      })
      .catch((err) => {
        console.error("Error confirming option selection:", err);
        alert(`Error confirming selection: ${err.message}`);
      });
  };

  // Toggle itinerary view per card (in card, not separate component)
  const toggleItinerary = (optionId) => {
    setOpenItineraryOptionId((prev) => (prev === optionId ? null : optionId));
  };

  // Helpers for duration
  const getDurationInMinutes = (depDate, depTime, arrDate, arrTime) => {
    try {
      const dep = new Date(`${depDate}T${depTime}`);
      const arr = new Date(`${arrDate}T${arrTime}`);
      if (isNaN(dep) || isNaN(arr)) return 0;
      let diffMs = arr - dep;
      if (diffMs < 0) diffMs += 24 * 3600 * 1000;
      return Math.floor(diffMs / 60000);
    } catch {
      return 0;
    }
  };
  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Render City option for selects
  const renderCityOptions = () =>
    cityOptions.map((opt) => (
      <option key={opt.cityCode} value={opt.cityCode}>
        {opt.cityName} - {opt.cityCode}
      </option>
    ));

  return (
    <div className="flight-container">
      {/* Header */}
      <div className="flight-header">
        <div>
          <div className="flight-date">{formatDate(flight.depDate)}</div>
          <div className="flight-route">
            <span>{flight.depCity}</span> - <span>{flight.arrCity}</span>
          </div>
        </div>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Title */}
      <h3 className="select-title">
        Select an Option <span className="info-icon">ⓘ</span>
      </h3>

      {/* Table Header */}
      <div className="table-header">
        <span>Select</span>
        <span>Airline Name</span>
        <span>Departure</span>
        <span>Arrival</span>
        <span className="span4">Duration</span>
        <span className="span4">Notes</span>
        <span className="span4">Price</span>
      </div>

      {/* Loading/Error/Empty */}
      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
          Loading options...
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && options.length === 0 && <div>No flight options found.</div>}

      {/* Flight Cards */}
      {!loading &&
        !error &&
        Object.entries(groupedOptions).map(([optionId, group]) => {
          const isSelected = selectedOptionId === optionId;
          const isItineraryOpen = openItineraryOptionId === optionId;

          const firstFlight = group[0];
          const lastFlight = group[group.length - 1];
          const totalMinutes = group.reduce(
            (sum, f) =>
              sum +
              getDurationInMinutes(
                f.FLIGHT_DEP_DATE || f.Departure_Date,
                f.FLIGHT_DEP_TIME || f.Departure_Time,
                f.FLIGHT_ARR_DATE || f.Arrival_Date,
                f.FLIGHT_ARR_TIME || f.Arrival_Time
              ),
            0
          );

          // Calculate option amount from first flight's Amount field
          const optionAmount = parseFloat(firstFlight.Amount) || 0;
          const isLowFare = lowestFare !== null && optionAmount === lowestFare;

          // Build itineraryData for FlightItinerary UI inside the card
          const itineraryData = {
            route: {
              from: firstFlight.FLIGHT_DEP_CITY || firstFlight.Departure_City || "",
              to: lastFlight.FLIGHT_ARR_CITY || lastFlight.Arrival_City || "",
            },
            segments: group.map((flight) => ({
              airline: flight.Merchant_Name || flight.MerchantName || "Unknown Airline",
              flightNumber: flight.Flight_Number || flight.FlightNumber || "-",
              departure: {
                city: flight.FLIGHT_DEP_CITY || flight.Departure_City || "",
                time: flight.FLIGHT_DEP_TIME || flight.Departure_Time || "",
                date: flight.FLIGHT_DEP_DATE || flight.Departure_Date || "",
                airport: flight.DEP_AIRPORT_NAME || flight.Departure_Airport || "",
              },
              arrival: {
                city: flight.FLIGHT_ARR_CITY || flight.Arrival_City || "",
                time: flight.FLIGHT_ARR_TIME || flight.Arrival_Time || "",
                date: flight.FLIGHT_ARR_DATE || flight.Arrival_Date || "",
                airport: flight.ARR_AIRPORT_NAME || flight.Arrival_Airport || "",
              },
              duration: (() => {
                try {
                  const dep = new Date(
                    `${flight.FLIGHT_DEP_DATE || flight.Departure_Date}T${flight.FLIGHT_DEP_TIME || flight.Departure_Time}`
                  );
                  const arr = new Date(
                    `${flight.FLIGHT_ARR_DATE || flight.Arrival_Date}T${flight.FLIGHT_ARR_TIME || flight.Arrival_Time}`
                  );
                  let diffMs = arr - dep;
                  if (diffMs < 0) diffMs += 24 * 3600 * 1000;
                  const minutes = Math.floor(diffMs / 60000);
                  const h = Math.floor(minutes / 60);
                  const m = minutes % 60;
                  return `${h}h ${m}m`;
                } catch {
                  return "–";
                }
              })(),
              class: flight.Flight_Class || flight.FlightClass || "Unknown",
              baggage: flight.Baggage_Details || flight.Baggage || "-",
            })),
          };

          return (
            <div key={optionId} className={`flight-card3 ${isSelected ? "selected" : ""}`}>
              {/* Main row */}
              <div className="main-row" style={{ display: "contents" }}>
                <input
                  type="radio"
                  className="radio-btn"
                  onClick={() =>
                    onSelectOption(
                      tripId,           // tripId
                      firstFlight?.ROWID, // rowId
                      optionId,           // optionId
                      tripType,           // type
                      firstFlight?.Trip_Line_Item_ID // Trip_Line_Item_ID
                    )
                  }
                />
                  {/* {isSelected ? "●" : "○"}
                </div> */}
                <div className="airline-name">
                  <span className="airline-icon">✈</span>
                  {firstFlight.Merchant_Name || "Unknown Airline"}
                  <div
                    className="itinerary-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItinerary(optionId);
                    }}
                  >
                    Flight Itinerary {isItineraryOpen ? "▾" : "▸"}
                  </div>
                </div>
                <div className="departure">{firstFlight.FLIGHT_DEP_CITY}</div>
                <div className="arrival">{lastFlight.FLIGHT_ARR_CITY}</div>
                <div className="duration">{formatDuration(totalMinutes)}</div>
                <div className="notes">{firstFlight.Notes || "-"}</div>
                <div className="price">
                  {firstFlight.Currency_id}:{firstFlight.Amount || "0.00"}
                  <div>({firstFlight.Refund_Type || "Non Refundable"})</div>
                  {isLowFare && <span className="low-fare-tag">LOW-FARE</span>}
                </div>
              </div>

              {/* Expanded itinerary below */}
              {isItineraryOpen && (
                <div className="itinerary-wrapper">
                  <FlightItinerary itineraryData={itineraryData} />
                </div>
              )}
            </div>
          );
        })}

      {/* Footer Buttons */}
      <div className="footer-buttons">
        <button className="confirm-btn" onClick={onConfirmSelection}>
          Confirm Selection
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FlightSelectionOptions;
