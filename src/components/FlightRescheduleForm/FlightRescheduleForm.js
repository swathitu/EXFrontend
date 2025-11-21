import React, { useState } from "react";
import "./FlightRescheduleForm.css";

// --- ICONS ---
const CalendarIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#999'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const ArrowRightCircleIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="#1f2937" stroke="none"></circle><line x1="8" y1="12" x2="16" y2="12" stroke="#fff"></line><polyline points="12 8 16 12 12 16" stroke="#fff"></polyline></svg>);
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const ArrowRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);

// --- SHARED DATA ---
const cityOptions = [
    { cityCode: "", cityName: "Select City" },
    { cityCode: "NYC", cityName: "New York" }, { cityCode: "LON", cityName: "London" },
    { cityCode: "PAR", cityName: "Paris" }, { cityCode: "DXB", cityName: "Dubai" },
    { cityCode: "TYO", cityName: "Tokyo" }, { cityCode: "BLR", cityName: "Bangalore Urban" },
    { cityCode: "DEL", cityName: "New Delhi" }
];

// Ensure these values match EXACTLY what is saved in your DB
const departureTimeOptions = [
    { value: "", label: "Select Time" },
    { value: "12am - 8am", label: "12AM - 8AM" },
    { value: "8am - 12pm", label: "8AM - 12PM" },
    { value: "12pm - 8pm", label: "12PM - 8PM" },
    { value: "8am - 12am", label: "8PM - 12AM" }
];

const FlightRescheduleForm = ({ bookingData, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Debug Log to see incoming data
  console.log("FlightRescheduleForm Data:", bookingData);

  const getSmartCityCode = (val) => {
    if (!val) return "";
    const byCode = cityOptions.find((c) => c.cityCode === val);
    if (byCode) return byCode.cityCode;
    const byName = cityOptions.find((c) => c.cityName === val);
    if (byName) return byName.cityCode;
    return ""; 
  };

  const getCityHeaderDisplay = (val) => {
      if (!val) return "";
      const code = getSmartCityCode(val);
      const city = cityOptions.find(c => c.cityCode === code);
      return city ? city.cityName : val;
  };

  const [formData, setFormData] = useState({
    // 1. Date
    depDate: bookingData?.FLIGHT_DEP_DATE || "",
    
    // 2. FIX: Map 'depTime' (from Frontend Mapper) or 'FLIGHT_DEP_TIME' (from DB)
    departureTimeRange: bookingData?.depTime || bookingData?.FLIGHT_DEP_TIME || "",
    
    // 3. Cities
    fromLoc: getSmartCityCode(bookingData?.FLIGHT_DEP_CITY || bookingData?.depCity),
    toLoc: getSmartCityCode(bookingData?.FLIGHT_ARR_CITY || bookingData?.arrCity),
    
    description: bookingData?.description || "",
    rescheduleReason: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.rescheduleReason) {
        alert("Please provide a reason for rescheduling.");
        return;
    }
    setIsLoading(true);
    const payload = {
        ...formData,
        tripId: bookingData.Trip_ID || bookingData.tripId,
        rowId: bookingData.rowId,
        requestType: 'flight' 
    };

    console.log("Sending Flight Reschedule Payload:", payload);

    fetch('/server/trip_reschedule/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            if (onSave) onSave();
            onClose();
        } else { throw new Error(data.message || "Failed"); }
    })
    .catch(err => { console.error(err); alert("Error: " + err.message); })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="reschedule-overlay">
      <div className="reschedule-modal">
        <div className="reschedule-header-summary">
            <div className="summary-left">
                <div className="summary-item">
                    <span className="summary-date">{bookingData?.depDate}</span>
                    <span className="summary-loc">{getCityHeaderDisplay(bookingData?.depCity)}</span>
                </div>
                <div className="summary-arrow"><ArrowRightIcon /></div>
                <div className="summary-item">
                    <span className="summary-date">{bookingData?.depDate}</span>
                    <span className="summary-loc">{getCityHeaderDisplay(bookingData?.arrCity)}</span>
                </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="reschedule-body">
            <div className="flight-grid-row">
                <div className="grid-col">
                    <label className="field-label">Departure date</label>
                    <div className="input-wrapper-border">
                        <input type="date" name="depDate" value={formData.depDate} onChange={handleChange} />
                        <CalendarIcon />
                    </div>
                </div>
                <div className="grid-col">
                    <label className="field-label">From</label>
                    <div className="select-wrapper-border">
                        <select name="fromLoc" value={formData.fromLoc} onChange={handleChange} className="full-width-select">
                            {cityOptions.map((opt) => (<option key={opt.cityCode} value={opt.cityCode}>{opt.cityName}</option>))}
                        </select>
                    </div>
                </div>
                <div className="grid-arrow"><ArrowRightCircleIcon /></div>
                <div className="grid-col">
                    <label className="field-label">To</label>
                    <div className="select-wrapper-border">
                        <select name="toLoc" value={formData.toLoc} onChange={handleChange} className="full-width-select">
                            {cityOptions.map((opt) => (<option key={opt.cityCode} value={opt.cityCode}>{opt.cityName}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <label className="field-label">Description</label>
                <input type="text" name="description" className="simple-input" value={formData.description} onChange={handleChange} />
            </div>

            <div className="form-row" style={{width:'50%'}}>
                <label className="field-label">Departure Time :</label>
                <div className="select-wrapper-border">
                    <select name="departureTimeRange" value={formData.departureTimeRange} onChange={handleChange} className="full-width-select">
                        {departureTimeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                </div>
            </div>
        </div>

        <div className="reason-section">
            <label className="reason-label">Reason for rescheduling <span className="required">*</span></label>
            <textarea className="reason-textarea" placeholder="Max 250 characters" name="rescheduleReason" value={formData.rescheduleReason} onChange={handleChange}></textarea>
        </div>

        <div className="reschedule-footer">
            <button className="btn-reschedule" onClick={handleSave} disabled={isLoading} style={{opacity: isLoading ? 0.7 : 1}}>
                {isLoading ? "Rescheduling..." : "Reschedule"}
            </button>
            <button className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default FlightRescheduleForm;