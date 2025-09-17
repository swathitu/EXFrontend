import React, { useState } from "react";
import "./RequestForm.css";
import FlightForm from "../FlightForm/FlightForm";
import HotelForm from "../HotelForm/HotelForm";
import CarForm from "../CarForm/CarForm";
import BusForm from "../BusForm/BusForm";
import TrainForm from "../TrainForm/TrainForm";

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
const LabeledDropdown = ({ label, name, value, onChange, options, required = false }) => (
  <div className="form-group1">
    {label && <label>{label}</label>}
    <select name={name} value={value} onChange={onChange} required={required}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// New reusable Radio Group Component
const LabeledRadioGroup = ({ label, name, options, value, onChange }) => (
  <div className="form-group1">
    {label && <label>{label}</label>}
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

// --- Main Form Component (RequestForm) ---
const RequestForm = () => {
  const [tripName, setTripName] = useState("");
  const [travelType, setTravelType] = useState("domestic");
  const [tripStartDate, setTripStartDate] = useState("");
  const [tripEndDate, setTripEndDate] = useState("");
  const [activity, setActivity] = useState("");
  const [donor, setDonor] = useState("");
  const [conditionArea, setConditionArea] = useState("");
  const [location, setLocation] = useState("");
  const [branch, setBranch] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [visaRequired, setVisaRequired] = useState("no");
  const [activeTravelModes, setActiveTravelModes] = useState([]);
  const [flightFormData, setFlightFormData] = useState([]);
  const [hotelFormData, setHotelFormData] = useState([]);
  const [carFormData, setCarFormData] = useState([]);
  const [busFormData, setBusFormData] = useState([]);
  const [trainFormData, setTrainFormData] = useState([]);

  const handleModeToggle = (mode) => {
    setActiveTravelModes((prevModes) =>
      prevModes.includes(mode) ? prevModes.filter((m) => m !== mode) : [...prevModes, mode]
    );
  };

const handleSubmit = async (status) => {
  console.log("Form Submitted!");
  const payload = {
    tripName,
    travelType,
    tripStartDate,
    tripEndDate,
    activity,
    donor,
    conditionArea,
    location,
    branch,
    bookingType,
    status, // The new status field
    ...(travelType === "international" && {
      destinationCountry,
      visaRequired,
    }),
    activeTravelModes,
    flightData: activeTravelModes.includes("flight") ? flightFormData : null,
    hotelData: activeTravelModes.includes("hotel") ? hotelFormData : null,
    carData: activeTravelModes.includes("car") ? carFormData : null,
    busData: activeTravelModes.includes("bus") ? busFormData : null,
    trainData: activeTravelModes.includes("train") ? trainFormData : null,
  };
  
  try {
    const response = await fetch('/server/userForm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

  const handleDraftSubmit = (e) => {
    e.preventDefault();
    handleSubmit("Draft");
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    handleSubmit("Submitted");
  };

  const travelTypeOptions = [
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  const bookingTypeOptions = [
    { value: "", label: "Select Booking Type" },
    { value: "self booking", label: "Self Booking" },
    { value: "vendor booking", label: "Vendor Booking" },
  ];

  const activityOptions = [
    { value: "", label: "Select Activity" },
    { value: "monitoring", label: "Monitoring" },
    { value: "supervisor", label: "Supervisor" },
    { value: "advancy", label: "Advancy" },
  ];

  const donorOptions = [
    { value: "", label: "Select Donor" },
    { value: "donor1", label: "Donor1" },
    { value: "donor2", label: "Donor2" },
    { value: "donor3", label: "Donor3" },
  ];

  const conditionAreaOptions = [
    { value: "", label: "Select Condition Area" },
    { value: "condition1", label: "Condition1" },
    { value: "condition2", label: "Condition2" },
    { value: "condition3", label: "Condition3" },
  ];

  const locationOptions = [
    { value: "", label: "Select Location" },
    { value: "location1", label: "Location1" },
    { value: "location2", label: "Location2" },
    { value: "location3", label: "Location3" },
  ];

  const branchOptions = [
    { value: "", label: "Select Branch" },
    { value: "br1", label: "Br1" },
    { value: "br2", label: "Br2" },
    { value: "br3", label: "Br3" },
  ];

  const countriesOptions = [
    { value: "", label: "Select Country" },
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "FRA", label: "France" },
    { value: "CAN", label: "Canada" },
    { value: "AUS", label: "Australia" },
  ];

  return (
    <div className="form-container">
      <form>
        <section className="common-details">
          <h2>Add Trip Details</h2>
          <LabeledInput
            label="Trip Name"
            type="text"
            name="tripName"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g., Business Trip to London"
            required
          />
          <LabeledRadioGroup
            label="Travel Type"
            name="travelType"
            options={travelTypeOptions}
            value={travelType}
            onChange={(e) => setTravelType(e.target.value)}
          />

          {travelType === "international" && (
            <React.Fragment>
              <LabeledDropdown
                label="Destination Country"
                name="destinationCountry"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                options={countriesOptions}
                required={true}
              />
              <LabeledRadioGroup
                label="Is Visa required?"
                name="visaRequired"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={visaRequired}
                onChange={(e) => setVisaRequired(e.target.value)}
              />
            </React.Fragment>
          )}

          <div className="form-row">
            <LabeledInput
              label="Trip Start Date *"
              type="date"
              name="tripStartDate"
              value={tripStartDate}
              onChange={(e) => setTripStartDate(e.target.value)}
              placeholder="eg: 31 January 2025"
              required
            />
            <LabeledInput
              label="Trip End Date *"
              type="date"
              name="tripEndDate"
              value={tripEndDate}
              onChange={(e) => setTripEndDate(e.target.value)}
              placeholder="eg: 31 January 2025"
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Activity"
              name="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              options={activityOptions}
              required
            />
            <LabeledDropdown
              label="Donor"
              name="donor"
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              options={donorOptions}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Condition Area"
              name="conditionArea"
              value={conditionArea}
              onChange={(e) => setConditionArea(e.target.value)}
              options={conditionAreaOptions}
              required
            />
            <LabeledDropdown
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={locationOptions}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Branch"
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={branchOptions}
              required
            />
            <LabeledDropdown
              label="Booking Type"
              name="bookingType"
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              options={bookingTypeOptions}
              required
            />
          </div>
        </section>

        <section className="mode-selection">
          <h2>Select Travel Modes</h2>
          <div className="checkbox-group">
            {["flight", "hotel", "car", "bus", "train"].map((mode) => (
              <label key={mode}>
                <input
                  type="checkbox"
                  checked={activeTravelModes.includes(mode)}
                  onChange={() => handleModeToggle(mode)}
                />{" "}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </label>
            ))}
          </div>
        </section>

        {activeTravelModes.includes("flight") && <FlightForm onDataChange={setFlightFormData} />}
        {activeTravelModes.includes("hotel") && <HotelForm onDataChange={setHotelFormData} />}
        {activeTravelModes.includes("car") && <CarForm onDataChange={setCarFormData} />}
        {activeTravelModes.includes("bus") && <BusForm onDataChange={setBusFormData} />}
        {activeTravelModes.includes("train") && <TrainForm onDataChange={setTrainFormData} />}

        <div className="button-group">
          <button type="button" onClick={handleDraftSubmit} className="submit-btn">
            Save as Draft
          </button>
          <button type="button" onClick={handleFinalSubmit} className="submit-btn">
            Save and Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;