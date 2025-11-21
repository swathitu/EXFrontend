import React, { useState } from "react";
import "./CarRescheduleForm.css";

// ... (Keep all your Icons: CalendarIcon, ClockIcon, etc. exactly as they are) ...
// ... (Keep cityOptions and carTypes arrays exactly as they are) ...

// --- ICONS (Paste your existing icons here) ---
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#999'}}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#999'}}>
    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const CircleArrowIcon = () => (
    <div className="circle-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    </div>
);
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const cityOptions = [
    { cityCode: "", cityName: "Select City", airportName: "" },
    { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
    { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
    { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
    { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
    { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
    { cityCode: "BLR", cityName: "Bangalore Urban", airportName: "BLR" },
    { cityCode: "BLR_R", cityName: "Bangalore Rural", airportName: "BLR" } 
];
  
const carTypes = [
    { value: "", label: "Select Car Type" },
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Luxury", label: "Luxury" },
    { value: "Van", label: "Van" },
    { value: "Medium", label: "Medium" },
    { value: "Small", label: "Small" }, 
    { value: "Large", label: "Large" }  
];

const CarRescheduleForm = ({ bookingData, onClose, onSave }) => {
  
  // 1. Add Loading State
  const [isLoading, setIsLoading] = useState(false);

  const getCarType = (val) => {
      if(!val) return "";
      const match = carTypes.find(ct => ct.value.toLowerCase() === val.toLowerCase());
      return match ? match.value : val; 
  };

  const getCityCodeByName = (name) => {
    if (!name) return "";
    const found = cityOptions.find((c) => c.cityName === name);
    return found ? found.cityCode : ""; 
  };

  const getSmartCityCode = (val) => {
    if (!val) return "";
    const byName = cityOptions.find((c) => c.cityName === val);
    if (byName) return byName.cityCode;
    const byCode = cityOptions.find((c) => c.cityCode === val);
    if (byCode) return byCode.cityCode;
    return ""; 
  };

  const getCityHeaderDisplay = (code) => {
      if (!code) return "";
      const city = cityOptions.find(c => c.cityCode === code);
      return city ? `${city.cityName} (${city.cityCode})` : code;
  };

  const [formData, setFormData] = useState({
    pickupDate: bookingData?.CAR_DEP_DATE || "", 
    pickupTime: bookingData?.CAR_DEP_TIME || "", 
    pickupLoc: getSmartCityCode(bookingData?.CAR_DEP_CITY || bookingData?.pickUpLocation),
    
    dropDate: bookingData?.CAR_ARR_DATE || "", 
    dropTime: bookingData?.CAR_ARR_TIME || "", 
    dropLoc: getSmartCityCode(bookingData?.CAR_ARR_CITY || bookingData?.dropOffLocation),
    
    description: bookingData?.description || "",
    carType: getCarType(bookingData?.CAR_TYPE || bookingData?.carType),
    driverNeeded: (bookingData?.CAR_DRIVER || bookingData?.driver || "").toLowerCase() === "yes" ? "Yes" : "No",
    
    rescheduleReason: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 2. UPDATED HANDLE SAVE FUNCTION ---
  const handleSave = async () => {
    // Basic Validation
    if (!formData.rescheduleReason) {
        alert("Please provide a reason for rescheduling.");
        return;
    }

    setIsLoading(true);

    const payload = {
        ...formData,
        tripId: bookingData.Trip_ID || bookingData.tripId,
        rowId: bookingData.rowId, // Trip_Line_Item_ID
        requestType: 'car' // Tells backend to use reschedule_car logic
    };

    console.log("Sending Reschedule Payload:", payload);

    try {
        // Call the new backend function
        const response = await fetch('/server/trip_reschedule/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to reschedule");
        }

        const result = await response.json();
        console.log("Reschedule Success:", result);
        
        // Trigger parent refresh (this reloads ApproverTripDataView)
        if (onSave) onSave(); 
        onClose(); // Close Modal

    } catch (error) {
        console.error("Reschedule Error:", error);
        alert("Error submitting reschedule: " + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="reschedule-overlay">
      <div className="reschedule-modal">
        
        {/* Header Summary */}
        <div className="reschedule-header-summary">
            <div className="summary-left">
                <div className="summary-item">
                    <span className="summary-date">
                        {bookingData?.CAR_DEP_DATE} {bookingData?.CAR_DEP_TIME}
                    </span>
                    <span className="summary-loc">
                        {getCityHeaderDisplay(bookingData?.CAR_DEP_CITY)}
                    </span>
                </div>
                <div className="summary-arrow">
                    <ArrowRightIcon />
                </div>
                <div className="summary-item">
                    <span className="summary-date">
                        {bookingData?.CAR_ARR_DATE} {bookingData?.CAR_ARR_TIME}
                    </span>
                    <span className="summary-loc">
                        {getCityHeaderDisplay(bookingData?.CAR_ARR_CITY)}
                    </span>
                </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
                <CloseIcon />
            </button>
        </div>

        <div className="reschedule-body">
             {/* ... (Route Container logic stays exactly the same as previous) ... */}
             <div className="route-container">
                {/* Pick Up */}
                <div className="route-box">
                    <label className="field-label">Pick-Up</label>
                    <div className="input-group-combined">
                        <div className="input-wrapper date-wrapper">
                            <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} />
                            <CalendarIcon /> 
                        </div>
                        <div className="vertical-divider"></div>
                        <div className="input-wrapper time-wrapper">
                            <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange} />
                            <ClockIcon />
                        </div>
                    </div>
                    <div className="location-select-wrapper">
                        <select name="pickupLoc" value={formData.pickupLoc} onChange={handleChange} className="full-width-select">
                            {cityOptions.map((opt) => (
                                <option key={opt.cityCode} value={opt.cityCode}>{opt.cityName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="route-connector"><CircleArrowIcon /></div>

                {/* Drop Off */}
                <div className="route-box">
                    <label className="field-label">Drop-Off</label>
                    <div className="input-group-combined">
                        <div className="input-wrapper date-wrapper">
                            <input type="date" name="dropDate" value={formData.dropDate} onChange={handleChange} />
                            <CalendarIcon />
                        </div>
                        <div className="vertical-divider"></div>
                        <div className="input-wrapper time-wrapper">
                            <input type="time" name="dropTime" value={formData.dropTime} onChange={handleChange} />
                            <ClockIcon />
                        </div>
                    </div>
                    <div className="location-select-wrapper">
                        <select name="dropLoc" value={formData.dropLoc} onChange={handleChange} className="full-width-select">
                            {cityOptions.map((opt) => (
                                <option key={opt.cityCode} value={opt.cityCode}>{opt.cityName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="form-row">
                <label className="field-label">Description</label>
                <input type="text" name="description" className="simple-input" value={formData.description} onChange={handleChange} />
            </div>

            {/* Car Type & Driver */}
            <div className="form-row car-details-row">
                <div className="car-type-group">
                    <span className="inline-label">Car Type :</span>
                    <select name="carType" value={formData.carType} onChange={handleChange} className="inline-select">
                        {carTypes.map((ct) => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                    </select>
                </div>
                <div className="driver-group">
                    <span className="inline-label">Driver Needed :</span>
                    <label className="radio-label">
                        <input type="radio" name="driverNeeded" value="Yes" checked={formData.driverNeeded === "Yes"} onChange={handleChange} />
                        <span className="radio-text">Yes</span>
                    </label>
                    <label className="radio-label">
                        <input type="radio" name="driverNeeded" value="No" checked={formData.driverNeeded === "No"} onChange={handleChange} />
                        <span className="radio-text">No</span>
                    </label>
                </div>
            </div>
        </div>

        {/* Reason Section */}
        <div className="reason-section">
            <label className="reason-label">Reason for rescheduling <span className="required">*</span></label>
            <textarea 
                className="reason-textarea" 
                placeholder="Max 250 characters"
                name="rescheduleReason"
                value={formData.rescheduleReason}
                onChange={handleChange}
            ></textarea>
        </div>

        {/* Footer Buttons */}
        <div className="reschedule-footer">
            <button 
                className="btn-reschedule" 
                onClick={handleSave}
                disabled={isLoading} // Disable to prevent double clicks
                style={{opacity: isLoading ? 0.7 : 1}}
            >
                {isLoading ? "Rescheduling..." : "Reschedule"}
            </button>
            <button className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
        </div>

      </div>
    </div>
  );
};

export default CarRescheduleForm;