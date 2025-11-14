import React, { useState, useEffect, useRef } from "react";
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
  disabled = false,
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
        disabled={disabled}
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

const CarForm = ({ onDataChange, carData, isReadOnly = false }) => {
  const mapApiCarDataToSegments = (cars) => {
    if (!Array.isArray(cars) || cars.length === 0) {
      return [
        {
          isNew: true,
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
      ];
    }
    return cars.map((car) => ({
      isNew: false,
      pickUpDate: car.CAR_DEP_DATE || "",
      pickUpTime: car.CAR_DEP_TIME || "",
      dropOffDate: car.CAR_ARR_DATE || "",
      dropOffTime: car.CAR_ARR_TIME || "",
      pickUpLocation: car.CAR_DEP_CITY || "",
      dropOffLocation: car.CAR_ARR_CITY || "",
      carType: car.CAR_TYPE || "",
      driverNeeded: car.CAR_DRIVER || "no",
      description: car.DESCRIPTION || "",
    }));
  };

  const initialized = useRef(false);

  const [carSegments, setCarSegments] = useState(() =>
    mapApiCarDataToSegments(carData || [])
  );

  useEffect(() => {
    if (carData && !initialized.current) {
      const mapped = mapApiCarDataToSegments(carData);
      setCarSegments(mapped);
      initialized.current = true;
    }
  }, [carData]);

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
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "estate", label: "Estate" },
    { value: "premium", label: "Premium" },
    { value: "people carrier", label: "People Carrier" },
    { value: "suv", label: "SUV" },
  ];

  const handleSegmentChange = (e, index) => {
    if (isReadOnly && !carSegments[index].isNew) {
      // Prevent editing existing segment when read-only
      return;
    }
    const { name, value } = e.target;
    const newSegments = [...carSegments];

    if (name.startsWith("driverNeeded-")) {
      newSegments[index].driverNeeded = value;
    } else {
      newSegments[index][name] = value;
    }

    setCarSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    const newSegment = {
      isNew: true,
      pickUpDate: "",
      pickUpTime: "",
      dropOffDate: "",
      dropOffTime: "",
      pickUpLocation: "",
      dropOffLocation: "",
      carType: "",
      driverNeeded: "no",
      description: "",
    };
    setCarSegments([...carSegments, newSegment]);
    onDataChange([...carSegments, newSegment]);
  };

  const handleRemoveSegment = (index) => {
    if (isReadOnly && !carSegments[index].isNew) {
      // Prevent removal of existing segment when read-only
      return;
    }
    const newSegments = carSegments.filter((_, i) => i !== index);
    setCarSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Car Rental Details 🚗</h3>
      {carSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;

        return (
          <React.Fragment key={index}>
            <div className="car-segment-row">
              <div className="pickup-group">
                <div className="datetime-row">
                  <LabeledInput
                    label="Pick-Up Date*"
                    type="date"
                    name="pickUpDate"
                    value={segment.pickUpDate}
                    onChange={(e) => handleSegmentChange(e, index)}
                    placeholder="dd-mm-yyyy"
                    required={true}
                    className="date-input"
                    disabled={disabled}
                  />
                  <LabeledInput
                    label="Time*"
                    type="time"
                    name="pickUpTime"
                    value={segment.pickUpTime}
                    onChange={(e) => handleSegmentChange(e, index)}
                    placeholder="HH:MM"
                    className="time-input"
                    disabled={disabled}
                  />
                </div>
                <LabeledDropdown
                  label="Pick-Up Location*"
                  name="pickUpLocation"
                  value={segment.pickUpLocation}
                  onChange={(e) => handleSegmentChange(e, index)}
                  options={cityOptions}
                  required={true}
                  className="city-select"
                  disabled={disabled}
                />
              </div>
              <div className="dropoff-group">
                <div className="datetime-row">
                  <LabeledInput
                    label="Drop-Off Date*"
                    type="date"
                    name="dropOffDate"
                    value={segment.dropOffDate}
                    onChange={(e) => handleSegmentChange(e, index)}
                    placeholder="dd-mm-yyyy"
                    required={true}
                    className="date-input"
                    disabled={disabled}
                  />
                  <LabeledInput
                    label="Time*"
                    type="time"
                    name="dropOffTime"
                    value={segment.dropOffTime}
                    onChange={(e) => handleSegmentChange(e, index)}
                    placeholder="HH:MM"
                    className="time-input"
                    disabled={disabled}
                  />
                </div>
                <LabeledDropdown
                  label="Drop-Off Location*"
                  name="dropOffLocation"
                  value={segment.dropOffLocation}
                  onChange={(e) => handleSegmentChange(e, index)}
                  options={cityOptions}
                  required={true}
                  className="city-select"
                  disabled={disabled}
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
                disabled={disabled}
              />
              {carSegments.length > 1 && !disabled && (
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
                disabled={disabled}
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
                      disabled={disabled}
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
                      disabled={disabled}
                    />{" "}
                    No
                  </label>
                </div>
              </div>
              <div className="preferences-placeholder"></div>
              {carSegments.length > 1 && <div className="delete-placeholder"></div>}
            </div>
          </React.Fragment>
        );
      })}
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
