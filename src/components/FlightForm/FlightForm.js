import React, { useState } from "react";
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
}) => (
  <div className={`form-group1 ${className}`}>
    {label && <label>{label}</label>}
    <select name={name} value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// --- FlightForm Component ---
const FlightForm = ({ onDataChange }) => {
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
    { value: "nonVegetarian", label: "Non-Vegetarian" },
    { value: "jain", label: "Jain" },
  ];
  const flightPreferenceOptions = [
    { value: "", label: "Select Class" },
    { value: "economy", label: "Economy" },
    { value: "premium economy", label: "Premium Economy" },
    { value: "business", label: "Business" },
    { value: "first", label: "First" },
  ];
  const timePreferenceOptions = [
    { value: "", label: "Select" },
    { value: "12am - 8am", label: "12AM - 8AM" },
    { value: "8am - 12pm", label: "8AM - 12PM" },
    { value: "12pm - 8pm", label: "12PM - 8PM" },
    { value: "8pm - 12am", label: "8PM - 12AM" },
  ];

  const [flightSegments, setFlightSegments] = useState([
    {
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
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...flightSegments];
    newSegments[index][name] = value;
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleTripTypeChange = (e) => {
    const { value } = e.target;
    if (value === "multiCity") {
      const newSegments = flightSegments.map((segment) => ({
        ...segment,
        tripType: "multiCity",
      }));
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    } else if (value === "oneWay") {
      const newSegments = [
        { ...flightSegments[0], tripType: "oneWay", returnDate: "" },
      ];
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    } else if (value === "roundTrip") {
      const newSegments = [{ ...flightSegments[0], tripType: "roundTrip" }];
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    }
  };

  const handleAddSegment = () => {
    setFlightSegments([
      ...flightSegments,
      {
        tripType: "multiCity",
        seatPreference: "",
        mealPreference: "",
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
      },
    ]);
  };

  const handleGlobalPreferenceChange = (e) => {
    const { name, value } = e.target;
    const newSegments = [...flightSegments];
    newSegments[0][name] = value;
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = flightSegments.filter((_, i) => i !== index);
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const tripType = flightSegments[0]?.tripType || "oneWay";
  const isRoundTrip = tripType === "roundTrip";

  return (
    <section className="travel-mode-section">
      <h3>Flight Details ✈️</h3>
      <div className="flight-options-header">
        <div className="radio-group-horizontal">
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={tripType === "oneWay"}
              onChange={handleTripTypeChange}
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
            />{" "}
            Multi-city
          </label>
        </div>
        <div className="preference-dropdowns">
          <LabeledDropdown
            name="seatPreference"
            value={flightSegments[0]?.seatPreference}
            onChange={handleGlobalPreferenceChange}
            options={seatPreferenceOptions}
            className="inline-dropdown"
          />
          <LabeledDropdown
            name="mealPreference"
            value={flightSegments[0]?.mealPreference}
            onChange={handleGlobalPreferenceChange}
            options={mealPreferenceOptions}
            className="inline-dropdown"
          />
        </div>
      </div>

      {flightSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="flight-segment-row">
            <LabeledDropdown
              label="Depart From*"
              name="departFrom"
              value={segment.departFrom}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select"
            />
            <LabeledDropdown
              label="Arrive At*"
              name="arriveAt"
              value={segment.arriveAt}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select"
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
            />
            {tripType === "roundTrip" && (
              <LabeledInput
                label="Return Date*"
                type="date"
                name="returnDate"
                value={segment.returnDate}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="eg: 05 Feb 2025"
                required={true}
                className="date-input"
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
            />
            {flightSegments.length > 1 && (
              <button
                type="button"
                className="delete-row-btn"
                onClick={() => handleRemoveSegment(index)}
              >
                🗑️
              </button>
            )}
          </div>
        </React.Fragment>
      ))}

      {tripType === "multiCity" && (
        <div className="add-flight-btn-container">
          <button
            type="button"
            onClick={handleAddSegment}
            className="add-flight-btn"
          >
            + Add Another Flight
          </button>
        </div>
      )}

      <div className="flight-bottom-preferences">
        {isRoundTrip ? (
          <>
            <div className="preference-group">
              <span className="preference-heading">Time Preference</span>
              <div className="pref-dropdowns-row">
                <LabeledDropdown
                  label="Departure"
                  name="departureTimePreference"
                  value={flightSegments[0]?.departureTimePreference}
                  onChange={handleGlobalPreferenceChange}
                  options={timePreferenceOptions}
                  className="inline-dropdown-with-label"
                />
                <LabeledDropdown
                  label="Return"
                  name="arrivalTimePreference"
                  value={flightSegments[0]?.arrivalTimePreference}
                  onChange={handleGlobalPreferenceChange}
                  options={timePreferenceOptions}
                  className="inline-dropdown-with-label"
                />
              </div>
            </div>
            <div className="preference-group">
              <span className="preference-heading">Flight Preference</span>
              <div className="pref-dropdowns-row">
                <LabeledDropdown
                  label="Departure"
                  name="departureFlightPreferences"
                  value={flightSegments[0]?.departureFlightPreferences}
                  onChange={handleGlobalPreferenceChange}
                  options={flightPreferenceOptions}
                  className="inline-dropdown-with-label"
                />
                <LabeledDropdown
                  label="Return"
                  name="arrivalFlightPreferences"
                  value={flightSegments[0]?.arrivalFlightPreferences}
                  onChange={handleGlobalPreferenceChange}
                  options={flightPreferenceOptions}
                  className="inline-dropdown-with-label"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="preference-group">
              <span className="preference-heading">Time Preference</span>
              <LabeledDropdown
                label="Departure Time"
                name="timePreference"
                value={flightSegments[0]?.timePreference}
                onChange={handleGlobalPreferenceChange}
                options={timePreferenceOptions}
                className="inline-dropdown"
              />
            </div>
            <div className="preference-group">
              <span className="preference-heading">Flight Preference</span>
              <LabeledDropdown
                label="Departure Flight"
                name="flightPreferences"
                value={flightSegments[0]?.flightPreferences}
                onChange={handleGlobalPreferenceChange}
                options={flightPreferenceOptions}
                className="inline-dropdown"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FlightForm;
