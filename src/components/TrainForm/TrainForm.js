import React, { useState, useEffect, useRef } from "react";
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

const TrainForm = ({ onDataChange, trainData, isReadOnly = false }) => {
  const mapApiTrainDataToSegments = (trains) => {
    if (!Array.isArray(trains) || trains.length === 0) {
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
    return trains.map((train) => ({
      isNew: false,
      departFrom: train.TRAIN_DEP_CITY || "",
      arriveAt: train.TRAIN_ARR_CITY || "",
      departureDate: train.TRAIN_DEP_DATE || "",
      description: train.DESCRIPTION || "",
    }));
  };

  const initialized = useRef(false);

  const [trainSegments, setTrainSegments] = useState(() =>
    mapApiTrainDataToSegments(trainData || [])
  );

  useEffect(() => {
    if (trainData && !initialized.current) {
      const mapped = mapApiTrainDataToSegments(trainData);
      setTrainSegments(mapped);
      initialized.current = true;
    }
  }, [trainData]);

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

  const prepareTrainDataForParent = (segments) => {
  return segments.map(segment => ({
    ...segment,
    arrivalDate: segment.departureDate,  // add arrivalDate same as departureDate here
  }));
  };


  const handleSegmentChange = (e, index) => {
  if (isReadOnly && !trainSegments[index].isNew) {
    return;
  }
  const { name, value } = e.target;
  const newSegments = [...trainSegments];
  newSegments[index][name] = value;
  setTrainSegments(newSegments);
  onDataChange(prepareTrainDataForParent(newSegments));
  };


  const handleAddSegment = () => {
  const newSegment = {
    isNew: true,
    departFrom: "",
    arriveAt: "",
    departureDate: "",
    description: "",
  };
  const updatedSegments = [...trainSegments, newSegment];
  setTrainSegments(updatedSegments);
  onDataChange(prepareTrainDataForParent(updatedSegments));
  };


  const handleRemoveSegment = (index) => {
  if (isReadOnly && !trainSegments[index].isNew) {
    return;
  }
  const newSegments = trainSegments.filter((_, i) => i !== index);
  setTrainSegments(newSegments);
  onDataChange(prepareTrainDataForParent(newSegments));
  };


  return (
    <section className="travel-mode-section">
      <h3>Train Travel Details 🚆</h3>
      {trainSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;
        return (
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
                placeholder="dd-mm-yyyy"
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
              {trainSegments.length > 1 && !disabled && (
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
