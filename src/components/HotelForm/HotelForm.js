import React, { useState, useEffect, useRef } from "react";
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

const HotelForm = ({ onDataChange, hotelData, isReadOnly = false }) => {
  const mapApiHotelDataToSegments = (hotels) => {
    if (!Array.isArray(hotels) || hotels.length === 0) {
      return [
        {
          isNew: true,
          location: "",
          checkInDate: "",
          checkInTime: "",
          checkOutDate: "",
          checkOutTime: "",
          description: "",
        },
      ];
    }
    return hotels.map((hotel) => ({
      isNew: false,
      location: hotel.HOTEL_DEP_CITY || hotel.HOTEL_ARR_CITY || "",
      checkInDate: hotel.HOTEL_DEP_DATE || "",
      checkInTime: hotel.HOTEL_DEP_TIME || "",
      checkOutDate: hotel.HOTEL_ARR_DATE || "",
      checkOutTime: hotel.HOTEL_ARR_TIME || "",
      description: hotel.DESCRIPTION || "",
    }));
  };

  const initialized = useRef(false);

  const [hotelSegments, setHotelSegments] = useState(() => {
    return mapApiHotelDataToSegments(hotelData || []);
  });

  useEffect(() => {
    if (hotelData && !initialized.current) {
      const mapped = mapApiHotelDataToSegments(hotelData);
      setHotelSegments(mapped);
      initialized.current = true;
    }
  }, [hotelData]);

  const cityOptions = [
    { value: "", label: "Select City" },
    { value: "NYC", label: "New York" },
    { value: "LON", label: "London" },
    { value: "PAR", label: "Paris" },
    { value: "DXB", label: "Dubai" },
    { value: "TYO", label: "Tokyo" },
  ];

  const isNewSegment = (segment) => {
    return (
      !segment.location &&
      !segment.checkInDate &&
      !segment.checkInTime &&
      !segment.checkOutDate &&
      !segment.checkOutTime &&
      !segment.description
    );
  };

  const handleSegmentChange = (e, index) => {
    if (isReadOnly && !hotelSegments[index].isNew) {
      // Prevent editing existing segment when read-only
      return;
    }
    const { name, value } = e.target;
    const newSegments = [...hotelSegments];
    newSegments[index][name] = value;
    setHotelSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleAddSegment = () => {
    const newSegment = {
      isNew: true,
      location: "",
      checkInDate: "",
      checkInTime: "",
      checkOutDate: "",
      checkOutTime: "",
      description: "",
    };
    setHotelSegments([...hotelSegments, newSegment]);
    onDataChange([...hotelSegments, newSegment]);
  };

  const handleRemoveSegment = (index) => {
    if (isReadOnly && !hotelSegments[index].isNew) {
      // Prevent removal of existing segment when read-only
      return;
    }
    const newSegments = hotelSegments.filter((_, i) => i !== index);
    setHotelSegments(newSegments);
    onDataChange(newSegments);
  };

  return (
    <section className="travel-mode-section">
      <h3>Hotel Details 🏨</h3>
      {hotelSegments.map((segment, index) => {
        const disabled = isReadOnly && !segment.isNew;

        return (
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
                disabled={disabled}
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
                  disabled={disabled}
                />
                <LabeledInput
                  label="In-time*"
                  type="time"
                  name="checkInTime"
                  value={segment.checkInTime}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="HH:MM"
                  className="time-input"
                  disabled={disabled}
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
                  disabled={disabled}
                />
                <LabeledInput
                  label="Out-time*"
                  type="time"
                  name="checkOutTime"
                  value={segment.checkOutTime}
                  onChange={(e) => handleSegmentChange(e, index)}
                  placeholder="HH:MM"
                  className="time-input"
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
              {hotelSegments.length > 1 && !disabled && (
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
