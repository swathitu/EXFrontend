import React, { useState, useEffect } from "react";
import "./RequestForms.css";
import FlightForm from "../FlightForm/FlightForm";
import HotelForm from "../HotelForm/HotelForm";
import CarForm from "../CarForm/CarForm";
import BusForm from "../BusForm/BusForm";
import TrainForm from "../TrainForm/TrainForm";

// Reusable Input Component
const LabeledInput = ({ label, type, name, value, onChange, placeholder, required, className }) => (
  <div className={`form-group1 ${className}`}>
    {label && <label>{label}</label>}
    <input
      type={type}
      name={name}
      value={value ?? ""}
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
const RequestForms = ({ onFormClose, tripId }) => {
  const [formData, setFormData] = useState(null);
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
  const initialFlightDataLoaded = React.useRef(false);
  const initialHotelDataLoaded = React.useRef(false);
  const initialCarDataLoaded = React.useRef(false);
  const initialBusDataLoaded = React.useRef(false);
  const initialTrainDataLoaded = React.useRef(false);
  const [isFlightReadOnly, setIsFlightReadOnly] = useState(false);
  const [isHotelReadOnly, setIsHotelReadOnly] = useState(false);
  const [isCarReadOnly, setIsCarReadOnly] = useState(false);
  const [isBusReadOnly, setIsBusReadOnly] = useState(false);
  const [isTrainReadOnly, setIsTrainReadOnly] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);


  // New state for the popup
  const [showPopup, setShowPopup] = useState(false);
  const [apiData, setApiData] = useState({
    activities: [],
    donors: [],
    conditionAreas: [],
    locations: [],
    branches: [],
  });



  const mapApiDataToFormState = (data) => {
    return {
      tripName: data.TRIP_NAME || "",
      businessPurpose: data.BUSINESS_PURPOSE || "",
      travelType: data.TRAVEL_TYPE || "domestic",
      activity: data.CF_ACTIVITY || "",
      donor: data.CF_DONOR || "",
      conditionArea: data.CF_CONDITION_AREA || "",
      location: data.CF_LOCATION || "",
      branch: data.CF_BRANCH || "",
      destinationCountry: data.DESTINATION_COUNTRY || "",
      visaRequired: data.VISA_REQUIRED || "no",
      activeTravelModes: Array.isArray(data.modesSummary)
        ? data.modesSummary.map((m) => m.toLowerCase())
        : [],
      flightFormData: data.associatedData?.FlightData || [],
      hotelFormData: data.associatedData?.HotelData || [],
      carFormData: data.associatedData?.CarData || [],
      busFormData: data.associatedData?.BusData || [],
      trainFormData: data.associatedData?.TrainData || [],
      status: data.STATUS || "",
    };
  };

  useEffect(() => {
    if (!tripId) return;

    const fetchTripData = async () => {
      try {
        setIsLoadingData(true);
        await new Promise(r => setTimeout(r, 2000));
        const response = await fetch(`/server/get_tripNumberData?trip_id=${tripId}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const result = await response.json();
        if (result && result.data) {
          const mapped = mapApiDataToFormState(result.data);
          console.log("Mapped form data:", mapped);
          setFormData(mapped);  // Save mapped form data
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingData(false);
        
      }
    };

    fetchTripData();
  }, [tripId]);

  // 3. Sync state values when formData and apiData options both are ready
  useEffect(() => {
    if (formData && apiData.donors.length > 0) {
      setTripName(formData.tripName);
      setBusinessPurpose(formData.businessPurpose);
      setTravelType(formData.travelType);
      setActivity(formData.activity);

      // Set dropdown-selected states only if options contain the values
      if (apiData.donors.find(opt => opt.value === formData.donor)) setDonor(formData.donor);
      if (apiData.branches.find(opt => opt.value === formData.branch)) setBranch(formData.branch);
      if (apiData.locations.find(opt => opt.value === formData.location)) setLocation(formData.location);

      setConditionArea(formData.conditionArea);
      setDestinationCountry(formData.destinationCountry);
      setVisaRequired(formData.visaRequired);
      setActiveTravelModes(formData.activeTravelModes);

      if (!initialFlightDataLoaded.current) {
        setFlightFormData(formData.flightFormData);
        initialFlightDataLoaded.current = true;
      }

      if (!initialHotelDataLoaded.current) {
        setHotelFormData(formData.hotelFormData);
        initialHotelDataLoaded.current = true;
      }

      if (!initialCarDataLoaded.current) {
        setCarFormData(formData.carFormData);
        initialCarDataLoaded.current = true;
      }

      if (!initialBusDataLoaded.current) {
        setBusFormData(formData.busFormData);
        initialBusDataLoaded.current = true;
      }

      if (!initialTrainDataLoaded.current) {
        setTrainFormData(formData.trainFormData);
        initialTrainDataLoaded.current = true;
      }

      if (formData) {
        const readOnly = formData.status === "Submitted" || formData.status === "Approved";
        setIsFlightReadOnly(readOnly);
      }

      if (formData) {
        const readOnly = formData.status === "Submitted" || formData.status === "Approved";
        setIsHotelReadOnly(readOnly);
      }

      if (formData) {
        const readOnly = formData.status === "Submitted" || formData.status === "Approved";
        setIsCarReadOnly(readOnly);
      }

      if (formData) {
        const readOnly = formData.status === "Submitted" || formData.status === "Approved";
        setIsBusReadOnly(readOnly);
      }

      if (formData) {
        const readOnly = formData.status === "Submitted" || formData.status === "Approved";
        setIsTrainReadOnly(readOnly);
      }


    }
  }, [formData, apiData]);



  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoadingData(true); // show loading before API call
        const response = await fetch("/server/insertData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const customDataArray = result.data.map(item => item.customData);

        const formatAndPrepend = (dataArray, label) => {
          const uniqueValues = [...new Set(dataArray)].filter(val => val);
          const options = uniqueValues.map(val => ({ value: val, label: val }));
          return [{ value: "", label: `Select ${label}` }, ...options];
        };

        const activitiesArray = customDataArray.map(item => item.Activity);
        const donorsArray = customDataArray.map(item => item.Donor);
        const conditionAreasArray = customDataArray.map(item => item.conditionArea);
        const locationsArray = customDataArray.map(item => item.Location);
        const branchesArray = customDataArray.map(item => item.Branch);

        setApiData({
          activities: formatAndPrepend(activitiesArray, "Activity"),
          donors: formatAndPrepend(donorsArray, "Donor"),
          conditionAreas: formatAndPrepend(conditionAreasArray, "Condition Area"),
          locations: formatAndPrepend(locationsArray, "Location"),
          branches: formatAndPrepend(branchesArray, "Branch"),
        });

        // Clear form dropdown states (optional)
        setActivity("");
        setDonor("");
        setConditionArea("");
        setLocation("");
        setBranch("");

      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setIsLoadingData(false); // hide loading after API call
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

  const handleDraftSubmit = (e) => {
    e.preventDefault();
    const payload = buildNewPayload("Draft");
    sendPayload(payload);
    if (onFormClose) onFormClose();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onFormClose) onFormClose();
  };

  // Handler for final submit — decides between new or update by presence of tripId
  // Centralized submit function
  const handleSubmit = async (
    status,
    ApproverId = null,
    ApproverName = null,
    ApproverEmail = null,
    SubmitterId = null,
    SubmitterName = null,
    SubmitterEmail = null
  ) => {
    let payload;
    if (tripId) {
      payload = buildUpdatePayload(
        status,
        ApproverId,
        ApproverName,
        ApproverEmail,
        SubmitterId,
        SubmitterName,
        SubmitterEmail
      );
    } else {
      payload = buildNewPayload(
        status,
        ApproverId,
        ApproverName,
        ApproverEmail,
        SubmitterId,
        SubmitterName,
        SubmitterEmail
      );
    }
    await sendPayload(payload);
  };


  // Handler for explicit update button
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await handleSubmit("Updated");
    setIsLoading(false);
    if (onFormClose) onFormClose();
  };

  const filterNewData = (dataArray) =>
    Array.isArray(dataArray) ? dataArray.filter(item => item.isNew === true) : [];

  // Build payload for new submissions (send full data)
  const buildNewPayload = (
    status,
    ApproverId = null,
    ApproverName = null,
    ApproverEmail = null,
    SubmitterId = null,
    SubmitterName = null,
    SubmitterEmail = null
  ) => ({
    tripName,
    businessPurpose,
    travelType,
    activity,
    donor,
    conditionArea,
    location,
    branch,
    status,
    ...(travelType === "international" && { destinationCountry, visaRequired }),

    activeTravelModes,
    flightData: activeTravelModes.includes("flight") ? flightFormData : null,
    hotelData: activeTravelModes.includes("hotel") ? hotelFormData : null,
    carData: activeTravelModes.includes("car") ? carFormData : null,
    busData: activeTravelModes.includes("bus") ? busFormData : null,
    trainData: activeTravelModes.includes("train") ? trainFormData : null,

    ...(ApproverId && { ApproverId }),
    ...(ApproverName && { ApproverName }),
    ...(ApproverEmail && { ApproverEmail }),

    ...(SubmitterId && { SubmitterId }),
    ...(SubmitterName && { SubmitterName }),
    ...(SubmitterEmail && { SubmitterEmail }),
  });

  // Build payload for updates (tripId included, only new travel mode data)
  const buildUpdatePayload = (
    status,
    ApproverId = null,
    ApproverName = null,
    ApproverEmail = null,
    SubmitterId = null,
    SubmitterName = null,
    SubmitterEmail = null
  ) => ({
    tripId,
    tripName,
    businessPurpose,
    travelType,
    activity,
    donor,
    conditionArea,
    location,
    branch,
    status,
    ...(travelType === "international" && { destinationCountry, visaRequired }),

    activeTravelModes,
    flightData: activeTravelModes.includes("flight") ? filterNewData(flightFormData) : null,
    hotelData: activeTravelModes.includes("hotel") ? filterNewData(hotelFormData) : null,
    carData: activeTravelModes.includes("car") ? filterNewData(carFormData) : null,
    busData: activeTravelModes.includes("bus") ? filterNewData(busFormData) : null,
    trainData: activeTravelModes.includes("train") ? filterNewData(trainFormData) : null,

    ...(ApproverId && { ApproverId }),
    ...(ApproverName && { ApproverName }),
    ...(ApproverEmail && { ApproverEmail }),

    ...(SubmitterId && { SubmitterId }),
    ...(SubmitterName && { SubmitterName }),
    ...(SubmitterEmail && { SubmitterEmail }),
  });

  // Function to send payload to backend
  const sendPayload = async (payload) => {
    setIsLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch("/server/userForm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setStatusMessage("Data submitted successfully! Please close the form. ✅");
      if (onFormClose) onFormClose();
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("Failed to submit data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Your existing handleFinalSubmit with approver/submitter API calls integrated
  const userEmail = "srikanth.thanniru@gurujana.com"; // your user email

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("");
    setUserData(null);
    setManagerData(null);

    if (activeTravelModes.length === 0) {
      setStatusMessage("Please select at least one travel mode.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Check user access and get submitter data
      const checkAccessResponse = await fetch("/server/find_userDetails/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, action: "check_access" }),
      });
      const checkAccessResult = await checkAccessResponse.json();

      if (!checkAccessResponse.ok || checkAccessResult.status !== "success") {
        setStatusMessage(checkAccessResult.message || "An unknown error occurred during access check.");
        setIsLoading(false);
        return;
      }

      const submitterData = checkAccessResult.data;
      setUserData(submitterData);
      const { role, reporting_manager_id } = submitterData;

      // Step 2: If submitter has reporting manager, fetch manager info and show popup for confirmation
      if (role === "submitter" && reporting_manager_id) {
        const getManagerResponse = await fetch("/server/find_userDetails/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_manager", reporting_manager_id }),
        });

        const getManagerResult = await getManagerResponse.json();

        if (getManagerResponse.ok && getManagerResult.status === "success") {
          setManagerData(getManagerResult);
          setShowPopup(true);
          setIsLoading(false);
        } else {
          setStatusMessage(getManagerResult.message || "Could not retrieve manager details.");
          setIsLoading(false);
        }
      } else {
        // No manager needed: proceed with submission directly
        setStatusMessage("User details retrieved successfully. Submitting form...");
        const sId = submitterData.row_id;
        const sName = submitterData.first_name;
        const sEmail = submitterData.email;

        // Decide payload by presence of tripId
        let payload;
        if (tripId) {
          payload = buildUpdatePayload("Submitted", null, null, null, sId, sName, sEmail);
        } else {
          payload = buildNewPayload("Submitted", null, null, null, sId, sName, sEmail);
        }
        await sendPayload(payload);
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
      if (onFormClose) onFormClose();   // Close AFTER submission via popup confirm
      setIsLoading(false);

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
      {isLoadingData ? (
        <div className="loading-overlay">
          <p>Loading trip data...</p>
        </div>
      ) : (
        <form>
          <section className="common-details">
            <h2>Add Trip Details</h2>
            <LabeledInput
              label="Trip Name*"
              type="text"
              name="tripName"
              value={tripName || ""}
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
              <>
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
              </>
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
                  />
                  {" "}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
          </section>
          {activeTravelModes.includes("flight") && (
            <FlightForm flightData={flightFormData} onDataChange={setFlightFormData} isReadOnly={isFlightReadOnly} />
          )}
          {activeTravelModes.includes("hotel") && (
            <HotelForm hotelData={hotelFormData} onDataChange={setHotelFormData} isReadOnly={isHotelReadOnly} />
          )}
          {activeTravelModes.includes("car") && (
            <CarForm carData={carFormData} onDataChange={setCarFormData} isReadOnly={isCarReadOnly} />
          )}
          {activeTravelModes.includes("bus") && (
            <BusForm busData={busFormData} onDataChange={setBusFormData} isReadOnly={isBusReadOnly} />
          )}
          {activeTravelModes.includes("train") && (
            <TrainForm trainData={trainFormData} onDataChange={setTrainFormData} isReadOnly={isTrainReadOnly} />
          )}
          {statusMessage && <div className="status-message">{statusMessage}</div>}
          <div className="button-group">
          {formData && formData.status === "Draft" ? (
            <>
              <button
                type="button"
                onClick={handleDraftSubmit}
                className="submit-btn"
                disabled={isLoading}
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
              <button
                type="button"
                onClick={handleCancel}
                className="submit-btn"
              >
                Cancel
              </button>
            </>
          ) : formData ? (
            <button
              type="button"
              onClick={handleUpdate}
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDraftSubmit}
                className="submit-btn"
                disabled={isLoading}
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
              <button
                type="button"
                onClick={handleCancel}
                className="submit-btn"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        </form>
      )}
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
