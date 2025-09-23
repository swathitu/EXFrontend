import React, { useState } from "react";
import "./TrainForm.css";

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

const TrainForm = ({ onDataChange }) => {
  const cityOptions = [
    { value: "", label: "Select or type city" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const [trainSegments, setTrainSegments] = useState([
    {
      departFrom: "",
      arriveAt: "",
      departureDate: "",
      description: "",
    },
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...trainSegments];
    newSegments[index][name] = value;
    setTrainSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    setTrainSegments([
      ...trainSegments,
      {
        departFrom: "",
        arriveAt: "",
        departureDate: "",
        description: "",
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = trainSegments.filter((_, i) => i !== index);
    setTrainSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Train Travel Details 🚆</h3>
      {trainSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="train-segment-row">
            <LabeledDropdown
              label="Depart From*"
              name="departFrom"
              value={segment.departFrom}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select-from"
            />
            <LabeledDropdown
              label="Arrive At*"
              name="arriveAt"
              value={segment.arriveAt}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select-to"
            />
            <LabeledInput
              label="Departure Date*"
              type="date"
              name="departureDate"
              value={segment.departureDate}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="dd-mm-yyyy"
              required={true}
              className="date-input"
            />
            <LabeledInput
              label="Description"
              type="text"
              name="description"
              value={segment.description}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="Description"
              className="description-input"
            />
            {trainSegments.length > 1 && (
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
      <div className="add-train-btn-container">
        <button
          type="button"
          onClick={handleAddSegment}
          className="add-train-btn"
        >
          + Add Train
        </button>
      </div>
    </section>
  );
};

export default TrainForm;