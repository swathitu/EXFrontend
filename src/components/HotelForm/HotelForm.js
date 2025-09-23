import React, { useState } from "react";
import "./HotelForm.css";

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

const HotelForm = ({ onDataChange }) => {
  const cityOptions = [
    { value: "", label: "Select City" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const [hotelSegments, setHotelSegments] = useState([
    {
      location: "",
      checkInDate: "",
      checkInTime: "",
      checkOutDate: "",
      checkOutTime: "",
      description: "",
    },
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...hotelSegments];
    newSegments[index][name] = value;
    setHotelSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    setHotelSegments([
      ...hotelSegments,
      {
        location: "",
        checkInDate: "",
        checkInTime: "",
        checkOutDate: "",
        checkOutTime: "",
        description: "",
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = hotelSegments.filter((_, i) => i !== index);
    setHotelSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Hotel Details 🏨</h3>
      {hotelSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="hotel-segment-row">
            <LabeledDropdown
              label="Location*" 
              name="location"
              value={segment.location}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select"
            />
            <div className="datetime-group">
              <LabeledInput
               label="Check-In*"
                type="date"
                name="checkInDate"
                value={segment.checkInDate}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="eg: 31 Jan 2025"
                required={true}
                className="date-input"
              />
              <LabeledInput
                label="In-time*"
                type="time"
                name="checkInTime"
                value={segment.checkInTime}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="HH:MM"
                className="time-input"
              />
            </div>
            <div className="datetime-group">
              <LabeledInput
              label="Check-Out*"
                type="date"
                name="checkOutDate"
                value={segment.checkOutDate}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="eg: 31 Jan 2025"
                required={true}
                className="date-input"
              />
              <LabeledInput
              label="Out-time*"
                type="time"
                name="checkOutTime"
                value={segment.checkOutTime}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="HH:MM"
                className="time-input"
              />
            </div>
            <LabeledInput
              label="Description"
              type="text"
              name="description"
              value={segment.description}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="Description"
              className="description-input"
            />
            {hotelSegments.length > 1 && (
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

      <div className="add-hotel-btn-container">
        <button
          type="button"
          onClick={handleAddSegment}
          className="add-hotel-btn"
        >
          + Add Another Hotel
        </button>
      </div>
    </section>
  );
};

export default HotelForm;