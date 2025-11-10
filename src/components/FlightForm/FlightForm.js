import React, { useState, useEffect, useRef } from "react";
import "./FlightForm.css";

// Reusable Input Component
const LabeledInput = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  disabled = false,
}) => (
  <div className={`form-group1 ${className}`}>
    {label && <label>{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
  </div>
);

// Reusable Dropdown Component
const LabeledDropdown = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}) => (
  <div className={`form-group1 ${className}`}>
    {label && <label>{label}</label>}
    <select
      name={name}
      value={JSON.stringify(value)}
      onChange={(e) => onChange({ target: { name: e.target.name, value: JSON.parse(e.target.value) } })}
      disabled={disabled}
    >
      {options.map((option, idx) => (
        <option key={idx} value={JSON.stringify(option)}>
          {option.cityCode === ""
            ? option.cityName // fallback default option label 
            : `${option.cityName} (${option.cityCode})`}
        </option>
      ))}
    </select>
  </div>
);

const FlightForm = ({ onDataChange, flightData, isReadOnly = false }) => {
  // Map API/Backend flight data to UI segments with detailed city info
  const mapApiFlightDataToSegments = (flights) => {
    if (!Array.isArray(flights) || flights.length === 0) {
      return [
        {
          isNew: true,
          tripType: "oneWay",
          seatPreference: "",
          mealPreference: "",
          departFrom: { cityCode: "", cityName: "", airportName: "" },
          arriveAt: { cityCode: "", cityName: "", airportName: "" },
          departureDate: "",
          returnDate: "",
          description: "",
          timePreference: "",
          flightPreferences: "",
          departureTimePreference: "",
          arrivalTimePreference: "",
          departureFlightPreferences: "",
          arrivalFlightPreferences: "",
        },
      ];
    }

    return flights.map((flight) => ({
      isNew: false,
      tripType: flight.TRIP_TYPE || "oneWay",
      seatPreference: flight.SEAT_PREF || "",
      mealPreference: flight.MEAL_PREF || "",
      departFrom: {
        cityCode: flight.DEP_CITY_CODE || "",
        cityName: flight.FLIGHT_DEP_CITY || "",
        airportName: flight.DEP_AIRPORT_NAME || "",
      },
      arriveAt: {
        cityCode: flight.ARR_CITY_CODE || "",
        cityName: flight.FLIGHT_ARR_CITY || "",
        airportName: flight.ARR_AIRPORT_NAME || "",
      },
      departureDate: flight.FLIGHT_DEP_DATE || "",
      returnDate: flight.FLIGHT_ARR_DATE || "",
      description: flight.DESCRIPTION || "",
      timePreference: flight.TIME_PREF || flight.DEPARTURE_TIME_PREFERENCE || "",
      flightPreferences: flight.FLIGHT_PREF || flight.DEPARTURE_FLIGHT_PREFERENCES || "",
      departureTimePreference: flight.FLIGHT_DEP_TIME || "",
      arrivalTimePreference: flight.FLIGHT_ARR_TIME || "",
      departureFlightPreferences: flight.FLIGHT_DEP_PREF || "",
      arrivalFlightPreferences: flight.FLIGHT_ARR_PREF || "",
    }));
  };

  const initialized = useRef(false);

  const [flightSegments, setFlightSegments] = useState(() =>
    mapApiFlightDataToSegments(flightData || [])
  );

  useEffect(() => {
    if (flightData && !initialized.current) {
      const mappedSegments = mapApiFlightDataToSegments(flightData);
      setFlightSegments(mappedSegments);
      initialized.current = true;
    }
  }, [flightData]);

  // City options with code, name, and airport name
  const cityOptions = [
    { cityCode: "", cityName: "Select City", airportName: "" },
    { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
    { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
    { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
    { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
    { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
  ];

  const seatPreferenceOptions = [
    { value: "", label: "Seat preference" },
    { value: "window", label: "Window" },
    { value: "aisle", label: "Aisle" },
    { value: "middle", label: "Middle" },
  ];

  const mealPreferenceOptions = [
    { value: "", label: "Meal preference" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "nonvegetarian", label: "Non-Vegetarian" },
    { value: "jain", label: "Jain" },
  ];

  const flightPreferenceOptions = [
    { value: "", label: "Select Class" },
    { value: "economy", label: "economy" },
    { value: "premium economy", label: "premium economy" },
    { value: "business", label: "business" },
    { value: "first", label: "first" },
  ];

  const timePreferenceOptions = [
    { value: "", label: "Select" },
    { value: "12am - 8am", label: "12am - 8am" },
    { value: "8am - 12pm", label: "8am - 12pm" },
    { value: "12pm - 8pm", label: "12pm - 8pm" },
    { value: "8pm - 12am", label: "8pm - 12am" },
  ];

  const isNewSegment = (segment) =>
    !segment.departFrom.cityCode &&
    !segment.arriveAt.cityCode &&
    !segment.departureDate &&
    !segment.returnDate &&
    !segment.description;

  const isFlightDataEmpty = (segments) => segments.every(isNewSegment);

  const handleSegmentChange = (e, index) => {
    if (isReadOnly && !flightSegments[index].isNew) return;
    const { name, value } = e.target;

    const newSegments = flightSegments.map((segment, i) => {
      if (i === index) {
        let updatedSegment = { ...segment };
        if (name === "departFrom" || name === "arriveAt") {
          updatedSegment[name] = value; // value is an object {cityCode, cityName, airportName}
        } else {
          updatedSegment[name] = value;
        }
        // Sync returnDate with departureDate for oneWay/multiCity trip types
        if (updatedSegment.tripType === "oneWay" || updatedSegment.tripType === "multiCity") {
          updatedSegment.returnDate = updatedSegment.departureDate;
        }
        return updatedSegment;
      }
      return segment;
    });
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleTripTypeChange = (e) => {
    const { value } = e.target;
    let newSegments;

    if (value === "multiCity") {
      newSegments = flightSegments.map((segment) => ({
        ...segment,
        tripType: "multiCity",
        returnDate: segment.departureDate || "",
      }));
    } else if (value === "oneWay") {
      const departureDate = flightSegments[0]?.departureDate || "";
      newSegments = [{ ...flightSegments[0], tripType: "oneWay", returnDate: departureDate }];
    } else if (value === "roundTrip") {
      newSegments = [{ ...flightSegments[0], tripType: "roundTrip" }];
    }

    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    const firstSegment = flightSegments[0] || {};
    const newSegment = {
      isNew: true,
      tripType: "multiCity",
      seatPreference: firstSegment.seatPreference || "",
      mealPreference: firstSegment.mealPreference || "",
      departFrom: { cityCode: "", cityName: "", airportName: "" },
      arriveAt: { cityCode: "", cityName: "", airportName: "" },
      departureDate: "",
      returnDate: "",
      description: "",
      timePreference: "",
      flightPreferences: "",
      departureTimePreference: "",
      arrivalTimePreference: "",
      departureFlightPreferences: "",
      arrivalFlightPreferences: "",
    };
    const newSegments = [...flightSegments, newSegment];
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleGlobalPreferenceChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;

    const newSegments = flightSegments.map((segment) => {
      const updatedSegment = { ...segment, [name]: value };

      if (name === "timePreference") {
        updatedSegment.departureTimePreference = value;
        updatedSegment.arrivalTimePreference = value;
      }
      if (name === "flightPreferences") {
        updatedSegment.departureFlightPreferences = value;
        updatedSegment.arrivalFlightPreferences = value;
      }
      return updatedSegment;
    });

    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleRemoveSegment = (index) => {
    if (isReadOnly && !flightSegments[index].isNew) return;
    const newSegments = flightSegments.filter((_, i) => i !== index);
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const tripType = flightSegments[0]?.tripType || "oneWay";
  const isRoundTrip = tripType === "roundTrip";

  return (
    <section className="travel-mode-section">
      <h3>Flight Details✈️</h3>
      <div className="flight-options-header">
        <div className="radio-group-horizontal">
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={tripType === "oneWay"}
              onChange={handleTripTypeChange}
              disabled={isReadOnly}
            />{" "}
            One Way
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={tripType === "roundTrip"}
              onChange={handleTripTypeChange}
              disabled={isReadOnly}
            />{" "}
            Round Trip
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="multiCity"
              checked={tripType === "multiCity"}
              onChange={handleTripTypeChange}
              disabled={isReadOnly}
            />{" "}
            Multi-city
          </label>
        </div>

        {(tripType === "multiCity" || tripType === "oneWay" || tripType === "roundTrip") && (
          <div className="preference-dropdowns">
            <select
              name="seatPreference"
              value={flightSegments[0]?.seatPreference || ""}
              onChange={handleGlobalPreferenceChange}
              className="inline-dropdown2"
              disabled={isReadOnly}
            >
              {seatPreferenceOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              name="mealPreference"
              value={flightSegments[0]?.mealPreference || ""}
              onChange={handleGlobalPreferenceChange}
              className="inline-dropdown2"
              disabled={isReadOnly}
            >
              {mealPreferenceOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {flightSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;

        return (
          <React.Fragment key={index}>
            <div className="flight-segment-row">
              {/* First row: main inputs */}
              <div
                className="flight-segment-main-row"
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <LabeledDropdown
                  label="Depart From*"
                  name="departFrom"
                  value={segment.departFrom}
                  onChange={(e) => handleSegmentChange(e, index)}
                  options={cityOptions}
                  required={true}
                  className="city-select"
                  disabled={disabled}
                />
                <LabeledDropdown
                  label="Arrive At*"
                  name="arriveAt"
                  value={segment.arriveAt}
                  onChange={(e) => handleSegmentChange(e, index)}
                  options={cityOptions}
                  required={true}
                  className="city-select"
                  disabled={disabled}
                />
                <LabeledInput
                  label="Departure Date*"
                  type="date"
                  name="departureDate"
                  value={segment.departureDate}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="eg: 31 Jan 2025"
                  required={true}
                  className="date-input"
                  disabled={disabled}
                />
                {tripType === "roundTrip" && index === 0 && (
                  <LabeledInput
                    label="Return Date*"
                    type="date"
                    name="returnDate"
                    value={segment.returnDate}
                    onChange={(e) => handleSegmentChange(e, index)}
                    placeholder="eg: 05 Feb 2025"
                    required={true}
                    className="date-input"
                    disabled={disabled}
                  />
                )}
                <LabeledInput
                  label="Description"
                  type="text"
                  name="description"
                  value={segment.description}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="Description"
                  className="description-input"
                  disabled={disabled}
                />

                {flightSegments.length > 1 && !disabled && (
                  <button
                    type="button"
                    className="delete-row-btn"
                    onClick={() => handleRemoveSegment(index)}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Second row: grouped dropdowns */}
              <div
                className="flight-segment-preference-row"
                style={{
                  display: "flex",
                  gap: "2rem",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div className="preference-group-segment" style={{ display: "flex", flexDirection: "column" }}>
                  <span className="preference-heading-segment" style={{ fontWeight: "500", marginBottom: "0.25rem", fontSize:".85rem" }}>
                    Time Preference
                  </span>
                  <div className="pref-dropdowns-row-segment" style={{ display: "flex", gap: "1rem" }}>
                    {tripType === "roundTrip" && index === 0 ? (
                      <>
                        <select
                          name="departureTimePreference"
                          value={segment.departureTimePreference}
                          onChange={(e) => handleSegmentChange(e, index)}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        >
                          {timePreferenceOptions.map((opt, idx) => (
                            <option key={idx} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          name="arrivalTimePreference"
                          value={segment.arrivalTimePreference}
                          onChange={(e) => handleSegmentChange(e, index)}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        >
                          {timePreferenceOptions.map((opt, idx) => (
                            <option key={idx} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <select
                        name="departureTimePreference"
                        value={segment.departureTimePreference}
                        onChange={(e) => handleSegmentChange(e, index)}
                        className="inline-dropdown-with-label"
                        disabled={disabled}
                      >
                        {timePreferenceOptions.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="preference-group-segment" style={{ display: "flex", flexDirection: "column" }}>
                  <span className="preference-heading-segment" style={{ fontWeight: "500", marginBottom: "0.25rem", fontSize:".85rem" }}>
                    Flight Preference
                  </span>
                  <div className="pref-dropdowns-row-segment" style={{ display: "flex", gap: "1rem" }}>
                    {tripType === "roundTrip" && index === 0 ? (
                      <>
                        <select
                          name="departureFlightPreferences"
                          value={segment.departureFlightPreferences}
                          onChange={(e) => handleSegmentChange(e, index)}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        >
                          {flightPreferenceOptions.map((opt, idx) => (
                            <option key={idx} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          name="arrivalFlightPreferences"
                          value={segment.arrivalFlightPreferences}
                          onChange={(e) => handleSegmentChange(e, index)}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        >
                          {flightPreferenceOptions.map((opt, idx) => (
                            <option key={idx} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <select
                        name="departureFlightPreferences"
                        value={segment.departureFlightPreferences}
                        onChange={(e) => handleSegmentChange(e, index)}
                        className="inline-dropdown-with-label"
                        disabled={disabled}
                      >
                        {flightPreferenceOptions.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Add Flight button */}
      {((isFlightDataEmpty(flightSegments) && tripType === "multiCity") ||
        !isFlightDataEmpty(flightSegments)) && (
          <div className="add-flight-btn-container" style={{ marginTop: "1rem" }}>
            <button type="button" onClick={handleAddSegment} className="add-flight-btn" disabled={false}>
              + Add Another Flight
            </button>
          </div>
        )}
    </section>
  );
};

export default FlightForm;
