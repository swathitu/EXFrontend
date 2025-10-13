import React, { useState, useEffect } from "react";
import "./RequestForms.css";
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
const LabeledDropdown = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
}) => (
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

const LabeledDropdown1 = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
}) => (
  <div className="form-group2">
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

// New Pop-up Modal Component
const ManagerPopup = ({ manager, onClose, onConfirm }) => (
  <div className="popup-overlay">
    <div className="popup-content">
      <h2>Confirm Submission</h2>
      <p>Your travel request will be submitted to the following manager for approval:</p>
      <div className="manager-details">
        <strong>Name:</strong> {manager.first_name}
        <br />
        <strong>Email:</strong> {manager.email}
      </div>
      <div className="popup-actions">
        <button onClick={onClose} className="cancel-btn">Cancel</button>
        <button onClick={onConfirm} className="confirm-btn">Confirm & Submit</button>
      </div>
    </div>
  </div>
);

// --- Main Form Component (RequestForm) ---
const RequestForms = ({ onFormClose }) => {
  const [tripName, setTripName] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [travelType, setTravelType] = useState("domestic");
  const [activity, setActivity] = useState("");
  const [donor, setDonor] = useState("");
  const [conditionArea, setConditionArea] = useState("");
  const [location, setLocation] = useState("");
  const [branch, setBranch] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [visaRequired, setVisaRequired] = useState("no");
  const [activeTravelModes, setActiveTravelModes] = useState([]);
  const [flightFormData, setFlightFormData] = useState([]);
  const [hotelFormData, setHotelFormData] = useState([]);
  const [carFormData, setCarFormData] = useState([]);
  const [busFormData, setBusFormData] = useState([]);
  const [trainFormData, setTrainFormData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [managerData, setManagerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  // New state for the popup
  const [showPopup, setShowPopup] = useState(false);
  const [apiData, setApiData] = useState({
    activities: [],
    donors: [],
    conditionAreas: [],
    locations: [],
    branches: [],
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch("/server/insertData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const customDataArray = result.data.map(item => item.customData);

        // Helper to format data and prepend a default placeholder
        const formatAndPrepend = (dataArray, label) => {
          const uniqueValues = [...new Set(dataArray)].filter(val => val); // Filter out potential null/empty strings
          const options = uniqueValues.map(val => ({ value: val, label: val }));
          // Prepend the placeholder option
          return [{ value: "", label: `Select ${label}` }, ...options];
        };

        const activitiesArray = customDataArray.map(item => item.Activity);
        const donorsArray = customDataArray.map(item => item.Donor);
        const conditionAreasArray = customDataArray.map(item => item.conditionArea);
        const locationsArray = customDataArray.map(item => item.Location);
        const branchesArray = customDataArray.map(item => item.Branch); // Keep track of this one

        setApiData({
          activities: formatAndPrepend(activitiesArray, "Activity"),
          donors: formatAndPrepend(donorsArray, "Donor"),
          conditionAreas: formatAndPrepend(conditionAreasArray, "Condition Area"),
          locations: formatAndPrepend(locationsArray, "Location"),
          branches: formatAndPrepend(branchesArray, "Branch"),
        });

        // FIX: Also, ensure the initial state is set to an empty string for all
        // to match the default placeholder's value: ""
        setActivity("");
        setDonor("");
        setConditionArea("");
        setLocation("");
        setBranch(""); // Set all to "" to be consistent

      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleModeToggle = (mode) => {
    setActiveTravelModes((prevModes) =>
      prevModes.includes(mode)
        ? prevModes.filter((m) => m !== mode)
        : [...prevModes, mode]
    );
  };

  const handleSubmit = async (
    status,
    ApproverId = null,
    ApproverName = null,
    ApproverEmail = null,
    SubmitterId = null,
    SubmitterName = null,
    SubmitterEmail = null
  ) => {
    console.log(`Form Submitted with status: ${status}`);
    const payload = {
      tripName,
      businessPurpose,
      travelType,
      activity,
      donor,
      conditionArea,
      location,
      branch,
      status,
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

      // Conditional inclusion of Approver details
      ...(ApproverId && { ApproverId }),
      ...(ApproverName && { ApproverName }),
      ...(ApproverEmail && { ApproverEmail }),

      // Conditional inclusion of Submitter details
      ...(SubmitterId && { SubmitterId }),
      ...(SubmitterName && { SubmitterName }),
      ...(SubmitterEmail && { SubmitterEmail }),
    };

    console.log("Payload to be sent:", payload);

    try {
      const response = await fetch("/server/userForm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      setStatusMessage("Data submitted successfully! Please close the form. ✅");

      if (onFormClose) {
        onFormClose();
      }
    } catch (error) {
      console.error("Error:", error);

    }
    setIsLoading(false);
  };

  const handleDraftSubmit = (e) => {
    e.preventDefault();
    handleSubmit("Draft");
  };

  const userEmail = "srikanth.thanniru@gurujana.com"

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("");
    setUserData(null);
    setManagerData(null);

    // Check if any travel mode is selected
    if (activeTravelModes.length === 0) {
      setStatusMessage("Please select at least one travel mode.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Call the new API to check user access and get manager ID
      const checkAccessResponse = await fetch("/server/find_userDetails/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, action: 'check_access' }),
      });

      const checkAccessResult = await checkAccessResponse.json();

      if (!checkAccessResponse.ok || checkAccessResult.status !== 'success') {
        setStatusMessage(checkAccessResult.message || 'An unknown error occurred during access check.');
        setIsLoading(false);
        return;
      }

      // Store the entire data object (submitter details)
      const submitterData = checkAccessResult.data;
      setUserData(submitterData);

      const { role, reporting_manager_id } = submitterData;

      // Step 2: If the user is a 'user' and has a reporting_manager_id, get manager details and show popup
      if (role === 'submitter' && reporting_manager_id) {
        const getManagerResponse = await fetch("/server/find_userDetails/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: 'get_manager', reporting_manager_id }),
        });

        const getManagerResult = await getManagerResponse.json();
        console.log("Manager Result:", getManagerResult)

        if (getManagerResponse.ok && getManagerResult.status === 'success') {
          // Store the full manager result object
          setManagerData(getManagerResult);
          // Show the popup with manager details
          setShowPopup(true);
          setIsLoading(false)
        } else {
          setStatusMessage(getManagerResult.message || 'Could not retrieve manager details.');
          setIsLoading(false);
        }
      } else {
        setStatusMessage('User details retrieved successfully. Submitting form...');
        // Proceed with main form submission if no manager is needed
        const sId = submitterData.row_id;
        const sName = submitterData.first_name;
        const sEmail = submitterData.email;
        handleSubmit("Submitted", null, null, null, sId, sName, sEmail); // Pass null for approver details
      }
    } catch (error) {
      console.error("API call failed:", error);
      setStatusMessage("Network error. Could not connect to the API.");
      setIsLoading(false);
    }
  };
  // New handler for confirming submission from the popup

  const triggerMail = async (submitterEmail, approverEmail) => {
    console.log(`Attempting to send mail: From ${submitterEmail} to ${approverEmail}`);
    try {
      const mailPayload = {
        // RENAMED KEYS to match server expectation (submitterEmail/approverEmail)
        submitterEmail: submitterEmail,
        approverEmail: approverEmail,
        // Include other fields the server might need
        subject: "New Travel Request for Approval",
      };

      const response = await fetch("/server/mail_trigger/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mailPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Mail Trigger Success:", result);
      } else {
        console.error(`Mail Trigger Failed: HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error triggering mail API:", error);
    }
  };

  const handlePopupConfirm = async () => {
    setShowPopup(false);
    setIsLoading(true);

    if (managerData && managerData.data && userData) {
      // Approver Details
      // Assuming manager's ID is the row_id from their details object
      const approverId = userData.reporting_manager_id;
      console.log(approverId);
      const approverName = managerData.data.first_name;
      const approverEmail = managerData.data.email;

      // Submitter Details (from the first API call)
      const submitterId = userData.row_id;
      const submitterName = userData.first_name;
      const submitterEmail = userData.email;

      // Call handleSubmit with all required details
      await handleSubmit(
        "Submitted",
        approverId,
        approverName,
        approverEmail,
        submitterId,
        submitterName,
        submitterEmail
      );

      triggerMail(submitterEmail, approverEmail);

    } else {
      setStatusMessage("Manager or Submitter data is incomplete. Submission cancelled.");
      setIsLoading(false);
    }
  };

  const travelTypeOptions = [
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  const countriesOptions = [
    { value: "UMI", label: "United States Minor Outlying Islands" },
    { value: "USA", label: "United States of America" }
  ];

  return (
    <div className="form-container">
      <form>
        <section className="common-details">
          <h2>Add Trip Details</h2>
          <LabeledInput
            label="Trip Name*"
            type="text"
            name="tripName"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g., Business Trip to London"
            required
          />
          <LabeledInput
            label="Business Purpose*"
            type="text"
            name="businessPurpose"
            value={businessPurpose}
            onChange={(e) => setBusinessPurpose(e.target.value)}
            placeholder="Business Purpose"
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
            <LabeledDropdown
              label="Activity"
              name="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              options={apiData.activities}
              placeholder="Select Activity"
              required
            />
            <LabeledDropdown
              label="Donor"
              name="donor"
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              options={apiData.donors}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Condition Area"
              name="conditionArea"
              value={conditionArea}
              onChange={(e) => setConditionArea(e.target.value)}
              options={apiData.conditionAreas}
              required
            />
            <LabeledDropdown
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={apiData.locations}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown1
              label="Branch"
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={apiData.branches}
              className="half-width"
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

        {activeTravelModes.includes("flight") && (
          <FlightForm onDataChange={setFlightFormData} />
        )}
        {activeTravelModes.includes("hotel") && (
          <HotelForm onDataChange={setHotelFormData} />
        )}
        {activeTravelModes.includes("car") && (
          <CarForm onDataChange={setCarFormData} />
        )}
        {activeTravelModes.includes("bus") && (
          <BusForm onDataChange={setBusFormData} />
        )}
        {activeTravelModes.includes("train") && (
          <TrainForm onDataChange={setTrainFormData} />
        )}

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <div className="button-group">
          <button
            type="button"
            onClick={handleDraftSubmit}
            className="submit-btn"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Save and Submit"}
          </button>
        </div>
      </form>

      {showPopup && managerData && (
        <ManagerPopup
          manager={managerData.data}
          onClose={() => setShowPopup(false)}
          onConfirm={handlePopupConfirm}
        />
      )}
    </div>
  );
};

export default RequestForms;
