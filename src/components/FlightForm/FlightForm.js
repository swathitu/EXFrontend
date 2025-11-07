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
    <select name={name} value={value} onChange={onChange} disabled={disabled}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FlightForm = ({ onDataChange, flightData, isReadOnly = false }) => {
  const mapApiFlightDataToSegments = (flights) => {
    if (!Array.isArray(flights) || flights.length === 0) {
      return [
        {
          isNew: true,
          tripType: "oneWay",
          seatPreference: "",
          mealPreference: "",
          departFrom: "",
          arriveAt: "",
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
      departFrom: flight.FLIGHT_DEP_CITY || "",
      arriveAt: flight.FLIGHT_ARR_CITY || "",
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

  const cityOptions = [
    { value: "", label: "Select City" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
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
    !segment.departFrom &&
    !segment.arriveAt &&
    !segment.departureDate &&
    !segment.returnDate &&
    !segment.description;

  const isFlightDataEmpty = (segments) => segments.every(isNewSegment);

  const handleSegmentChange = (e, index) => {
    if (isReadOnly && !flightSegments[index].isNew) return;
    const { name, value } = e.target;
    const newSegments = flightSegments.map((segment, i) => {
      if (i === index) {
        const updatedSegment = { ...segment, [name]: value, isNew: segment.isNew };
        // Sync returnDate with departureDate for oneWay/multiCity
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
      // For multiCity, set tripType and for each segment set returnDate = departureDate
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
    departFrom: "",
    arriveAt: "",
    departureDate: "",
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

  // Update all flight segments with the new preference value
  const newSegments = flightSegments.map((segment) => {
    const updatedSegment = { ...segment, [name]: value };

    // Optional: sync related departure/arrival preferences for timePreference & flightPreferences
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
            <LabeledDropdown
              name="seatPreference"
              value={flightSegments[0]?.seatPreference}
              onChange={handleGlobalPreferenceChange}
              options={seatPreferenceOptions}
              className="inline-dropdown"
              disabled={isReadOnly}
            />
            <LabeledDropdown
              name="mealPreference"
              value={flightSegments[0]?.mealPreference}
              onChange={handleGlobalPreferenceChange}
              options={mealPreferenceOptions}
              className="inline-dropdown"
              disabled={isReadOnly}
            />
          </div>
        )}
      </div>

      {flightSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;

        return (
          <React.Fragment key={index}>
            <div className="flight-segment-row">
              {/* First row: main inputs */}
              <div className="flight-segment-main-row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.5rem" }}>
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
              <div className="flight-segment-preference-row" style={{display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "1rem"}}>
                <div className="preference-group-segment" style={{display: "flex", flexDirection: "column"}}>
                  <span className="preference-heading-segment" style={{fontWeight: "600", marginBottom: "0.25rem"}}>
                    Time Preference
                  </span>
                  <div className="pref-dropdowns-row-segment" style={{display: "flex", gap: "1rem"}}>
                    {tripType === "roundTrip" && index === 0 ? (
                      <>
                        <LabeledDropdown
                          label="Departure"
                          name="departureTimePreference"
                          value={segment.departureTimePreference}
                          onChange={(e) => handleSegmentChange(e, index)}
                          options={timePreferenceOptions}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        />
                        <LabeledDropdown
                          label="Return"
                          name="arrivalTimePreference"
                          value={segment.arrivalTimePreference}
                          onChange={(e) => handleSegmentChange(e, index)}
                          options={timePreferenceOptions}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        />
                      </>
                    ) : (
                      <LabeledDropdown
                        label="Departure"
                        name="departureTimePreference"
                        value={segment.departureTimePreference}
                        onChange={(e) => handleSegmentChange(e, index)}
                        options={timePreferenceOptions}
                        className="inline-dropdown-with-label"
                        disabled={disabled}
                      />
                    )}
                  </div>
                </div>

                <div className="preference-group-segment" style={{display: "flex", flexDirection: "column"}}>
                  <span className="preference-heading-segment" style={{fontWeight: "600", marginBottom: "0.25rem"}}>
                    Flight Preference
                  </span>
                  <div className="pref-dropdowns-row-segment" style={{display: "flex", gap: "1rem"}}>
                    {tripType === "roundTrip" && index === 0 ? (
                      <>
                        <LabeledDropdown
                          label="Departure"
                          name="departureFlightPreferences"
                          value={segment.departureFlightPreferences}
                          onChange={(e) => handleSegmentChange(e, index)}
                          options={flightPreferenceOptions}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        />
                        <LabeledDropdown
                          label="Return"
                          name="arrivalFlightPreferences"
                          value={segment.arrivalFlightPreferences}
                          onChange={(e) => handleSegmentChange(e, index)}
                          options={flightPreferenceOptions}
                          className="inline-dropdown-with-label"
                          disabled={disabled}
                        />
                      </>
                    ) : (
                      <LabeledDropdown
                        label="Departure"
                        name="departureFlightPreferences"
                        value={segment.departureFlightPreferences}
                        onChange={(e) => handleSegmentChange(e, index)}
                        options={flightPreferenceOptions}
                        className="inline-dropdown-with-label"
                        disabled={disabled}
                      />
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
          <button
            type="button"
            onClick={handleAddSegment}
            className="add-flight-btn"
            disabled={false}
          >
            + Add Another Flight
          </button>
        </div>
      )}
    </section>
  );
};

export default FlightForm;
