import React, { useState, useEffect, useRef } from "react";
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

const BusForm = ({ onDataChange, busData, isReadOnly = false }) => {
  const mapApiBusDataToSegments = (buses) => {
    if (!Array.isArray(buses) || buses.length === 0) {
      return [
        {
          isNew: true,
          departFrom: "",
          arriveAt: "",
          departureDate: "",
          description: "",
        },
      ];
    }
    return buses.map((bus) => ({
      isNew: false,
      departFrom: bus.BUS_DEP_CITY || "",
      arriveAt: bus.BUS_ARR_CITY || "",
      departureDate: bus.BUS_DEP_DATE || "",
      description: bus.DESCRIPTION || "",
    }));
  };

  const initialized = useRef(false);

  const [busSegments, setBusSegments] = useState(() =>
    mapApiBusDataToSegments(busData || [])
  );

  useEffect(() => {
    if (busData && !initialized.current) {
      const mapped = mapApiBusDataToSegments(busData);
      setBusSegments(mapped);
      initialized.current = true;
    }
  }, [busData]);

  const cityOptions = [
    { value: "", label: "Select or type city" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const isNewSegment = (segment) => {
    return (
      !segment.departFrom &&
      !segment.arriveAt &&
      !segment.departureDate &&
      !segment.description
    );
  };

    const prepareBusDataForParent = (segments) => {
    return segments.map(segment => ({
      ...segment,
      arrivalDate: segment.departureDate,  // arrivalDate set as departureDate
    }));
    };

  const handleSegmentChange = (e, index) => {
    if (isReadOnly && !busSegments[index].isNew) {
      return;
    }
    const { name, value } = e.target;
    const newSegments = [...busSegments];
    newSegments[index][name] = value;
    setBusSegments(newSegments);
    onDataChange(prepareBusDataForParent(newSegments));
  };

  const handleAddSegment = () => {
    const newSegment = {
      isNew: true,
      departFrom: "",
      arriveAt: "",
      departureDate: "",
      description: "",
    };
    const updatedSegments = [...busSegments, newSegment];
    setBusSegments(updatedSegments);
    onDataChange(prepareBusDataForParent(updatedSegments));
  };

  const handleRemoveSegment = (index) => {
    if (isReadOnly && !busSegments[index].isNew) {
      return;
    }
    const newSegments = busSegments.filter((_, i) => i !== index);
    setBusSegments(newSegments);
    onDataChange(prepareBusDataForParent(newSegments));
  };

  return (
    <section className="travel-mode-section">
      <h3>Bus Travel Details 🚌</h3>
      {busSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;
        return (
          <React.Fragment key={index}>
            <div className="bus-segment-row">
              <LabeledDropdown
                label="Depart From*"
                name="departFrom"
                value={segment.departFrom}
                onChange={(e) => handleSegmentChange(e, index)}
                options={cityOptions}
                required={true}
                className="city-select-from"
                disabled={disabled}
              />
              <LabeledDropdown
                label="Arrive At*"
                name="arriveAt"
                value={segment.arriveAt}
                onChange={(e) => handleSegmentChange(e, index)}
                options={cityOptions}
                required={true}
                className="city-select-to"
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
              {busSegments.length > 1 && !disabled && (
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
        );
      })}
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
