import React, { useState } from "react";
import "./TrainRescheduleForm.css";

// --- ICONS ---
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#999'}}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const ArrowRightCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="#1f2937" stroke="none"></circle>
        <line x1="8" y1="12" x2="16" y2="12" stroke="#fff"></line><polyline points="12 8 16 12 12 16" stroke="#fff"></polyline>
    </svg>
);
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// --- SHARED DATA ---
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

const TrainRescheduleForm = ({ bookingData, onClose, onSave }) => {
  
  const [isLoading, setIsLoading] = useState(false);

  // Helper for Smart City Lookup
  const getSmartCityCode = (val) => {
    if (!val) return "";
    const byName = cityOptions.find((c) => c.cityName === val);
    if (byName) return byName.cityCode;
    const byCode = cityOptions.find((c) => c.cityCode === val);
    if (byCode) return byCode.cityCode;
    return ""; 
  };

  // Helper for Header Display
  const getCityHeaderDisplay = (val) => {
    if (!val) return "";
    const code = getSmartCityCode(val);
    const city = cityOptions.find(c => c.cityCode === code);
    return city ? city.cityName : val;
  };

  // Initialize State using TRAIN keys
  const [formData, setFormData] = useState({
    // Map DB Keys: TRAIN_DEP_DATE, TRAIN_DEP_CITY, etc.
    depDate: bookingData?.TRAIN_DEP_DATE || "", 
    
    // Auto-select From/To based on DB values
    fromLoc: getSmartCityCode(bookingData?.TRAIN_DEP_CITY || bookingData?.depCity),
    toLoc: getSmartCityCode(bookingData?.TRAIN_ARR_CITY || bookingData?.arrCity),
    
    description: bookingData?.description || "",
    rescheduleReason: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.rescheduleReason) {
        alert("Please provide a reason for rescheduling.");
        return;
    }

    setIsLoading(true);

    const payload = {
        ...formData,
        tripId: bookingData.Trip_ID || bookingData.tripId,
        rowId: bookingData.rowId,
        requestType: 'train' // <--- IMPORTANT: Tells backend this is TRAIN
    };

    console.log("Sending Train Reschedule Payload:", payload);

    try {
        const response = await fetch('/server/trip_reschedule/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to reschedule");
        }

        const result = await response.json();
        console.log("Reschedule Success:", result);
        
        if (onSave) onSave(); 
        onClose(); 

    } catch (error) {
        console.error("Reschedule Error:", error);
        alert("Error: " + error.message);
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
                    <span className="summary-date">{bookingData?.depDate}</span>
                    <span className="summary-loc">{getCityHeaderDisplay(bookingData?.TRAIN_DEP_CITY || bookingData?.depCity)}</span>
                </div>
                <div className="summary-arrow">
                    <ArrowRightIcon />
                </div>
                <div className="summary-item">
                    <span className="summary-date">{bookingData?.depDate}</span>
                    <span className="summary-loc">{getCityHeaderDisplay(bookingData?.TRAIN_ARR_CITY || bookingData?.arrCity)}</span>
                </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
                <CloseIcon />
            </button>
        </div>

        <div className="reschedule-body">
            
            {/* --- 3-Column Grid: Date | From | To --- */}
            <div className="train-grid-row">
                
                {/* Departure Date */}
                <div className="grid-col">
                    <label className="field-label">Departure date</label>
                    <div className="input-wrapper-border">
                        <input 
                            type="date" 
                            name="depDate" 
                            value={formData.depDate} 
                            onChange={handleChange} 
                        />
                        <CalendarIcon />
                    </div>
                </div>

                {/* From Location */}
                <div className="grid-col">
                    <label className="field-label">From</label>
                    <div className="select-wrapper-border">
                         <select name="fromLoc" value={formData.fromLoc} onChange={handleChange}>
                            {cityOptions.map((opt) => (
                                <option key={opt.cityCode} value={opt.cityCode}>{opt.cityName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Arrow Connector (Visual) */}
                <div className="grid-arrow">
                     <ArrowRightCircleIcon />
                </div>

                {/* To Location */}
                <div className="grid-col">
                    <label className="field-label">To</label>
                     <div className="select-wrapper-border">
                         <select name="toLoc" value={formData.toLoc} onChange={handleChange}>
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
                <input 
                    type="text" 
                    name="description" 
                    className="simple-input"
                    value={formData.description} 
                    onChange={handleChange} 
                />
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
                disabled={isLoading}
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

export default TrainRescheduleForm;