import React, { useState } from "react";
import "./CarForm.css"; // Ensure this CSS file is correctly imported

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
  icon,
}) => (
  <div className={`form-group ${className}`}>
    {label && <label>{label}</label>}
    <div className="input-with-icon">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {icon && <span className="input-icon">{icon}</span>}
    </div>
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
  <div className={`form-group ${className}`}>
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

const CarForm = ({ onDataChange }) => {
  const cityOptions = [
    { value: "", label: "Select or type city" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const carTypeOptions = [
    { value: "", label: "Select" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "van", label: "Van" },
  ];

  const [carSegments, setCarSegments] = useState([
    {
      pickUpDate: "",
      pickUpTime: "",
      dropOffDate: "",
      dropOffTime: "",
      pickUpLocation: "",
      dropOffLocation: "",
      carType: "",
      driverNeeded: "no",
      description: "",
    },
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...carSegments];

    if (name.startsWith('driverNeeded-')) {
        newSegments[index].driverNeeded = value;
    } else {
        newSegments[index][name] = value;
    }

    setCarSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    setCarSegments([
      ...carSegments,
      {
        pickUpDate: "",
        pickUpTime: "",
        dropOffDate: "",
        dropOffTime: "",
        pickUpLocation: "",
        dropOffLocation: "",
        carType: "",
        driverNeeded: "no",
        description: "",
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = carSegments.filter((_, i) => i !== index);
    setCarSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Car Rental Details 🚗</h3>
      {carSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="car-segment-headers">
            <span className="required">PICK-UP *</span>
            <span className="required">DROP-OFF *</span>
            <span>DESCRIPTION</span>
            {carSegments.length > 1 && <span className="header-placeholder"></span>}
          </div>
          <div className="car-segment-row">
            <div className="pickup-group">
              <div className="datetime-row">
                <LabeledInput
                  label="Pick-Up Date" // Added this label
                  type="date"
                  name="pickUpDate"
                  value={segment.pickUpDate}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="dd-mm-yyyy"
                  required={true}
                  className="date-input"
                  icon="🗓️"
                />
                <LabeledInput
                  label="Pick-Up Time" // Added this label
                  type="time"
                  name="pickUpTime"
                  value={segment.pickUpTime}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="HH:MM"
                  className="time-input"
                />
              </div>
              <LabeledDropdown
                label="Pick-Up Location" // Added this label
                name="pickUpLocation"
                value={segment.pickUpLocation}
                onChange={(e) => handleSegmentChange(e, index)}
                options={cityOptions}
                required={true}
                className="city-select"
              />
            </div>
            <div className="dropoff-group">
              <div className="datetime-row">
                <LabeledInput
                  label="Drop-Off Date" // Added this label
                  type="date"
                  name="dropOffDate"
                  value={segment.dropOffDate}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="dd-mm-yyyy"
                  required={true}
                  className="date-input"
                  icon="🗓️"
                />
                <LabeledInput
                  label="Drop-Off Time" // Added this label
                  type="time"
                  name="dropOffTime"
                  value={segment.dropOffTime}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="HH:MM"
                  className="time-input"
                />
              </div>
              <LabeledDropdown
                label="Drop-Off Location" // Added this label
                name="dropOffLocation"
                value={segment.dropOffLocation}
                onChange={(e) => handleSegmentChange(e, index)}
                options={cityOptions}
                required={true}
                className="city-select"
              />
            </div>
            <LabeledInput
              label="Description" // Added this label
              type="text"
              name="description"
              value={segment.description}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="Description"
              className="description-input"
            />
            {carSegments.length > 1 && (
              <button
                type="button"
                className="delete-row-btn"
                onClick={() => handleRemoveSegment(index)}
              >
                🗑️
              </button>
            )}
          </div>
          <div className="car-preferences-row">
            <LabeledDropdown
              label="Car Type"
              name="carType"
              value={segment.carType}
              onChange={(e) => handleSegmentChange(e, index)}
              options={carTypeOptions}
              className="car-type-dropdown"
            />
            <div className="driver-needed-group">
              <span className="driver-needed-label">Driver Needed :</span>
              <div className="radio-group-horizontal">
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`driverNeeded-${index}`}
                    value="yes"
                    checked={segment.driverNeeded === "yes"}
                    onChange={(e) => handleSegmentChange(e, index)}
                  />{" "}
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`driverNeeded-${index}`}
                    value="no"
                    checked={segment.driverNeeded === "no"}
                    onChange={(e) => handleSegmentChange(e, index)}
                  />{" "}
                  No
                </label>
              </div>
            </div>
            <div className="preferences-placeholder"></div>
            {carSegments.length > 1 && <div className="delete-placeholder"></div>}
          </div>
        </React.Fragment>
      ))}
      <div className="add-car-btn-container">
        <button
          type="button"
          onClick={handleAddSegment}
          className="add-car-btn"
        >
          + Add Car Rental
        </button>
      </div>
    </section>
  );
};

export default CarForm;