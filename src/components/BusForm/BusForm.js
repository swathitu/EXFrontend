import React, { useState } from "react";
import "./BusForm.css";

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
  <div className={`form-group1 ${className}`}>
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

const BusForm = ({ onDataChange }) => {
  const cityOptions = [
    { value: "", label: "Select or type city" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const [busSegments, setBusSegments] = useState([
    {
      departFrom: "",
      arriveAt: "",
      departureDate: "",
      description: "",
    },
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...busSegments];
    newSegments[index][name] = value;
    setBusSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    setBusSegments([
      ...busSegments,
      {
        departFrom: "",
        arriveAt: "",
        departureDate: "",
        description: "",
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = busSegments.filter((_, i) => i !== index);
    setBusSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Bus Travel Details 🚌</h3>
      {busSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="bus-segment-row">
            <LabeledDropdown
              label="Depart From*" // Added this label}
              name="departFrom"
              value={segment.departFrom}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select-from"
            />
            <LabeledDropdown
              label="Arrive At*" // Added this label
              name="arriveAt"
              value={segment.arriveAt}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select-to"
            />
            <LabeledInput
              label="Departure Date*" // Added this label
              type="date"
              name="departureDate"
              value={segment.departureDate}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="eg: 31 Jan 2025"
              required={true}
              className="date-input"
            />
            <LabeledInput
              label="Description" // Added this label
              type="text"
              name="description"
              value={segment.description}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="Description"
              className="description-input"
            />
            {busSegments.length > 1 && (
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
      <div className="add-bus-btn-container">
        <button
          type="button"
          onClick={handleAddSegment}
          className="add-bus-btn"
        >
          + Add Bus
        </button>
      </div>
    </section>
  );
};

export default BusForm;
