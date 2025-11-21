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
const FlightCard = ({
  flight,
  optionsData = [],
  onAddOptionClick,
  onEditOptionClick,
  onAddTicketClick,
}) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!flight) return null;

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (optionsData.length === 0 || optionsData.every(opt => !opt.Option_Status)) {
    statusText = "Waiting for Options";
    buttonType = "add";
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "booked")) {
    statusText = "Ticket booked";
    buttonType = "view";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "selected")) {
    statusText = "Booking pending";
    buttonType = "ticket";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "added")) {
    statusText = "Yet to select options";
    buttonType = "edit";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
  }

  // Override flight fields by option data if available
  const mergedFlight = {
    FLIGHT_DEP_DATE: displayOption?.FLIGHT_DEP_DATE || flight.FLIGHT_DEP_DATE || flight.depDate,
    FLIGHT_DEP_TIME: displayOption?.FLIGHT_DEP_TIME || flight.FLIGHT_DEP_TIME || flight.depTime,
    FLIGHT_ARR_DATE: displayOption?.FLIGHT_ARR_DATE || flight.FLIGHT_ARR_DATE || flight.arrDate,
    FLIGHT_ARR_TIME: displayOption?.FLIGHT_ARR_TIME || flight.FLIGHT_ARR_TIME || flight.arrTime,
    FLIGHT_DEP_CITY: displayOption?.FLIGHT_DEP_CITY || flight.FLIGHT_DEP_CITY || flight.depCity,
    FLIGHT_ARR_CITY: displayOption?.FLIGHT_ARR_CITY || flight.FLIGHT_ARR_CITY || flight.arrCity,
    DEP_CITY_CODE: displayOption?.DEP_CITY_CODE || flight.DEP_CITY_CODE || flight.depCityCode,
    ARR_CITY_CODE: displayOption?.ARR_CITY_CODE || flight.ARR_CITY_CODE || flight.arrCityCode,
    DEP_AIRPORT_NAME: displayOption?.DEP_AIRPORT_NAME || flight.DEP_AIRPORT_NAME || flight.depAirpot,
    ARR_AIRPORT_NAME: displayOption?.ARR_AIRPORT_NAME || flight.ARR_AIRPORT_NAME || flight.arrAirpot,
  };

  return (
    <div className="flight-card1">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
      </div>

      <div className="flight-details">
        <div className="flight-date">
          <FaCalendarAlt className="icon" />
          <div>
            <div className="date">{mergedFlight.FLIGHT_DEP_DATE}</div>
            <div className="preferred-time">Preferred Time: {mergedFlight.FLIGHT_DEP_TIME}</div>
          </div>
        </div>

        <div className="flight-route">
          <div className="from">
            <div className="city">
              {mergedFlight.FLIGHT_DEP_CITY} - {mergedFlight.DEP_CITY_CODE}
            </div>
            <div className="subtext">{mergedFlight.DEP_AIRPORT_NAME}</div>
          </div>
          <div className="arrow">→</div>
          <div className="to">
            <div className="city">
              {mergedFlight.FLIGHT_ARR_CITY} - {mergedFlight.ARR_CITY_CODE}
            </div>
            <div className="subtext">{mergedFlight.ARR_AIRPORT_NAME}</div>
          </div>
        </div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            {buttonType === "add" && (
              <button onClick={() => onAddOptionClick(flight)}>Add Option</button>
            )}
            {buttonType === "edit" && (
              <button onClick={() => onEditOptionClick(flight, optionsData)}>Edit Option</button>
            )}
            {buttonType === "ticket" && (
              <button onClick={() => onAddTicketClick(flight, optionsData)}>Add Ticket</button>
            )}
            {buttonType === "view" && (
              <button onClick={() => alert("View Ticket clicked")}>View Ticket</button>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => {
                setShowMenuOptions((v) => !v);
                setShowAddOptions(false);
              }}
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
const HotelCard = ({
  hotel,
  optionsData = [],
  onAddHotelOptionClick,
  onEditHotelOptionClick,
  onAddTicketClick,
}) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!hotel) return null;

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (optionsData.length === 0 || optionsData.every(opt => !opt.Option_Status)) {
    statusText = "Waiting for Options";
    buttonType = "add";
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "booked")) {
    statusText = "Ticket booked";
    buttonType = "view";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "selected")) {
    statusText = "Booking pending";
    buttonType = "ticket";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "added")) {
    statusText = "Yet to select options";
    buttonType = "edit";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
  }

  const mergedHotel = {
    HOTEL_DEP_CITY: displayOption?.HOTEL_DEP_CITY || hotel.HOTEL_DEP_CITY || hotel.depCity,
    HOTEL_ARR_DATE: displayOption?.HOTEL_ARR_DATE || hotel.HOTEL_ARR_DATE || hotel.arrDate,
    HOTEL_ARR_TIME: displayOption?.HOTEL_ARR_TIME || hotel.HOTEL_ARR_TIME || hotel.arrTime,
    HOTEL_DEP_DATE: displayOption?.HOTEL_DEP_DATE || hotel.HOTEL_DEP_DATE || hotel.depDate,
    HOTEL_DEP_TIME: displayOption?.HOTEL_DEP_TIME || hotel.HOTEL_DEP_TIME || hotel.depTime,
  };

  return (
    <div className="hotel-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
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
            <span className="date">
              {mergedHotel.HOTEL_DEP_DATE || "N/A"}, {mergedHotel.HOTEL_DEP_TIME || "N/A"}
            </span>
          </div>
          <span className="separator">-</span>
          <div className="check-out">
            <span className="label">Check-out</span>
            <span className="date">
              {mergedHotel.HOTEL_ARR_DATE || "N/A"}, {mergedHotel.HOTEL_ARR_TIME || "N/A"}
            </span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            {buttonType === "add" && (
              <button onClick={() => onAddHotelOptionClick(hotel)}>Add Option</button>
            )}
            {buttonType === "edit" && (
              <button onClick={() => onEditHotelOptionClick(hotel, optionsData)}>Edit Option</button>
            )}
            {buttonType === "ticket" && (
              <button onClick={() => onAddTicketClick(hotel, optionsData)}>Add Ticket</button>
            )}
            {buttonType === "view" && (
              <button onClick={() => alert("View Ticket clicked")}>View Ticket</button>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => {
                setShowMenuOptions((v) => !v);
                setShowAddOptions(false);
              }}
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
const CarCard = ({
  car,
  optionsData = [],
  onAddCarOptionClick,
  onEditCarOptionClick,
  onAddTicketClick,
}) => {
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const [showMenuOptions, setShowMenuOptions] = React.useState(false);
  const addRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!car) return null;

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (optionsData.length === 0 || optionsData.every(opt => !opt.Option_Status)) {
    statusText = "Waiting for Options";
    buttonType = "add";
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "booked")) {
    statusText = "Ticket booked";
    buttonType = "view";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "selected")) {
    statusText = "Booking pending";
    buttonType = "ticket";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "added")) {
    statusText = "Yet to select options";
    buttonType = "edit";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
  }

  // Merge trip option data into car fields, override existing where applicable, else fallback
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

  const merchantName = displayOption?.Merchant_Name || "";

  return (
    <div className="car-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
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
            <span className="location">
              {mergedCar.CAR_DEP_CITY || mergedCar.pickUpLocation || "N/A"}
            </span>
          </div>
          <span className="arrow">→</span>
          <div className="dropoff">
            <span className="label">Drop-Off</span>
            <span className="date">
              {mergedCar.CAR_ARR_DATE || mergedCar.dropOffDate || "N/A"},{" "}
              {mergedCar.CAR_ARR_TIME || mergedCar.dropOffTime || "N/A"}
            </span>
            <span className="location">
              {mergedCar.CAR_ARR_CITY || mergedCar.dropOffLocation || "N/A"}
            </span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            {buttonType === "add" && (
              <button onClick={() => onAddCarOptionClick(car)}>Add Option</button>
            )}
            {buttonType === "edit" && (
              <button onClick={() => onEditCarOptionClick(car, optionsData)}>Edit Option</button>
            )}
            {buttonType === "ticket" && (
              <button onClick={() => onAddTicketClick(car, optionsData)}>Add Ticket</button>
            )}
            {buttonType === "view" && (
              <button
                onClick={() => {
                  alert("View Ticket clicked");
                  // Implement view ticket logic here
                }}
              >
                View Ticket
              </button>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => {
                setShowMenuOptions((v) => !v);
                setShowAddOptions(false);
              }}
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
const TrainCard = ({
  train,
  optionsData = [],
  onAddTrainOptionClick,
  onEditTrainOptionClick,
  onAddTicketClick,
}) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!train) return null;

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (optionsData.length === 0 || optionsData.every(opt => !opt.Option_Status)) {
    statusText = "Waiting for Options";
    buttonType = "add";
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "booked")) {
    statusText = "Ticket booked";
    buttonType = "view";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "selected")) {
    statusText = "Booking pending";
    buttonType = "ticket";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "added")) {
    statusText = "Yet to select options";
    buttonType = "edit";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
  }

  const mergedTrain = {
    TRAIN_DEP_DATE: displayOption?.TRAIN_DEP_DATE || train.TRAIN_DEP_DATE || train.date,
    TRAIN_DEP_CITY: displayOption?.TRAIN_DEP_CITY || train.TRAIN_DEP_CITY || train.departure,
    TRAIN_ARR_CITY: displayOption?.TRAIN_ARR_CITY || train.TRAIN_ARR_CITY || train.arrival,
  };

  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
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

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            {buttonType === "add" && (
              <button onClick={() => onAddTrainOptionClick(train)}>Add Option</button>
            )}
            {buttonType === "edit" && (
              <button onClick={() => onEditTrainOptionClick(train, optionsData)}>Edit Option</button>
            )}
            {buttonType === "ticket" && (
              <button onClick={() => onAddTicketClick(train, optionsData)}>Add Ticket</button>
            )}
            {buttonType === "view" && (
              <button onClick={() => alert("View Ticket clicked")}>View Ticket</button>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => {
                setShowMenuOptions((v) => !v);
                setShowAddOptions(false);
              }}
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


const BusCard = ({
  bus,
  optionsData = [],
  onAddBusOptionClick,
  onEditBusOptionClick,
  onAddTicketClick,
}) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const addRef = useRef(null);
  const menuRef = useRef(null);

  useOnClickOutside(addRef, () => setShowAddOptions(false));
  useOnClickOutside(menuRef, () => setShowMenuOptions(false));

  if (!bus?.item) return null;

  let statusText = "Waiting for Options";
  let buttonType = "add";
  let displayOption = null;

  if (optionsData.length === 0 || optionsData.every(opt => !opt.Option_Status)) {
    statusText = "Waiting for Options";
    buttonType = "add";
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "booked")) {
    statusText = "Ticket booked";
    buttonType = "view";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "booked");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "selected")) {
    statusText = "Booking pending";
    buttonType = "ticket";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "selected");
  } else if (optionsData.some(opt => (opt.Option_Status || "").toLowerCase() === "added")) {
    statusText = "Yet to select options";
    buttonType = "edit";
    displayOption = optionsData.find(opt => (opt.Option_Status || "").toLowerCase() === "added");
  }

  const mergedBus = {
    BUS_DEP_DATE: displayOption?.BUS_DEP_DATE || bus.item?.BUS_DEP_DATE || bus.item?.date,
    BUS_DEP_CITY: displayOption?.BUS_DEP_CITY || bus.item?.BUS_DEP_CITY || bus.item?.departure,
    BUS_ARR_CITY: displayOption?.BUS_ARR_CITY || bus.item?.BUS_ARR_CITY || bus.item?.arrival,
  };

  return (
    <div className="transfer-card">
      <div className="status-section">
        <span className="status-badge">{statusText}</span>
        <span className="travel-agent">Travel Agent: Yet to be assigned</span>
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

        <div className="menu-icon" style={{ position: "relative", display: "flex", gap: 8 }}>
          <div ref={addRef}>
            {buttonType === "add" && (
              <button onClick={() => onAddBusOptionClick(bus)}>Add Option</button>
            )}
            {buttonType === "edit" && (
              <button onClick={() => onEditBusOptionClick(bus, optionsData)}>Edit Option</button>
            )}
            {buttonType === "ticket" && (
              <button onClick={() => onAddTicketClick(bus, optionsData)}>Add Ticket</button>
            )}
            {buttonType === "view" && (
              <button onClick={() => alert("View Ticket clicked")}>View Ticket</button>
            )}
          </div>

          <div ref={menuRef}>
            <FaEllipsisH
              onClick={() => {
                setShowMenuOptions((v) => !v);
                setShowAddOptions(false);
              }}
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
        // Compute default agentId...
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
      case "flight": {
        const flightOptions = assoc.Flight_Trip_Options || [];
        return subitems.map((item) => {
          const optionsForFlight = flightOptions.filter(
            (opt) => String(opt.Trip_Line_Item_ID) === String(item.ROWID)
          );
          return (
            <FlightCard
              key={item.ROWID || Math.random()}
              flight={item}
              optionsData={optionsForFlight}
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
          return (
            <HotelCard
              key={item.ROWID || Math.random()}
              hotel={item}
              optionsData={optionsForHotel}
              onAddHotelOptionClick={() => setOptionFormHotel(item)}
              onEditHotelOptionClick={(hotel, options) =>
                setOptionFormHotel({ ...hotel, options })
              }
              onAddTicketClick={(hotel, options) =>
                setOptionFormHotel({ ...hotel, options })
              }
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

          return (
            <CarCard
              key={item.ROWID || Math.random()}
              car={item}
              optionsData={optionsForCar}
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
          return (
            <TrainCard
              key={item.ROWID || Math.random()}
              train={item}
              optionsData={optionsForTrain}
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
          return (
            <BusCard
              key={item.ROWID || Math.random()}
              bus={{ item }}
              optionsData={optionsForBus}
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
          <FlightOptionForm flight={optionFormFlight} onClose={() => setOptionFormFlight(null)} onSave={handlecallApi} />
        )}
        {optionFormHotel && (
          <HotelOptions hotel={optionFormHotel} onClose={() => setOptionFormHotel(null)} onSave={handlecallApi} />
        )}
        {optionFormTrain && (
          <TrainOptionForm train={optionFormTrain} onClose={() => setOptionFormTrain(null)}  onSave={handlecallApi}/>
        )}
        {optionFormCar && (
          <CarOptionForm car={optionFormCar} onClose={() => setOptionFormCar(null)} onSave={handlecallApi} />
        )}

        {optionFormBus && (
          <BusOptionForm bus={optionFormBus} onClose={() => setOptionFormBus(null)} onSave={handlecallApi} />
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
