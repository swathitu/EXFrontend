import React, { useState } from "react";
import "./CancelItineraryModal.css";

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- NEW: Date Formatter Helper ---
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  
  // 1. If it's already formatted (e.g. "13 Nov 2025"), it will have a space. Return as is.
  if (dateStr.includes(" ")) return dateStr;

  // 2. If it's Raw (e.g. "2025-11-13"), convert it.
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CancelItineraryModal = ({ bookingData, onClose, onConfirm }) => {
  const [cancelReason, setCancelReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Helper to extract and FORMAT display data ---
  const getSummary = () => {
    // 1. Get Raw or Formatted values from props
    const rawStart = bookingData.depDate || bookingData.pickUpDate || bookingData.checkInDate || bookingData.BUS_DEP_DATE || bookingData.CAR_DEP_DATE || bookingData.TRAIN_DEP_DATE || bookingData.FLIGHT_DEP_DATE || bookingData.HOTEL_ARR_DATE || "";
    const rawEnd = bookingData.arrDate || bookingData.dropOffDate || bookingData.checkOutDate || bookingData.BUS_ARR_DATE || bookingData.CAR_ARR_DATE || bookingData.TRAIN_ARR_DATE || bookingData.FLIGHT_ARR_DATE || bookingData.HOTEL_DEP_DATE || "";

    // 2. Get Locations
    const from = bookingData.depCity || bookingData.pickUpLocation || bookingData.locationCity || bookingData.BUS_DEP_CITY || bookingData.CAR_DEP_CITY || bookingData.TRAIN_DEP_CITY || bookingData.FLIGHT_DEP_CITY || bookingData.HOTEL_ARR_CITY || "";
    const to = bookingData.arrCity || bookingData.dropOffLocation || bookingData.BUS_ARR_CITY || bookingData.CAR_ARR_CITY || bookingData.TRAIN_ARR_CITY || bookingData.FLIGHT_ARR_CITY || "";

    // 3. Return FORMATTED dates
    return { 
        startDate: formatDate(rawStart), 
        endDate: formatDate(rawEnd), 
        from, 
        to 
    };
  };
  
  const summary = getSummary();

  const handleConfirm = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    setIsLoading(true);
    await onConfirm(bookingData, cancelReason);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="cancel-overlay">
      <div className="cancel-modal">
        
        <div className="cancel-header">
            <h3>Cancel Itinerary</h3>
            <button className="close-btn" onClick={onClose}>
                <CloseIcon />
            </button>
        </div>

        <div className="cancel-body">
            
            {/* --- ITINERARY SUMMARY BOX --- */}
            <div className="cancel-summary-box">
                {/* Row 1: Dates */}
                <div className="summary-dates">
                    {summary.startDate}
                    {/* Show Arrow + EndDate if EndDate exists */}
                    {summary.endDate && (
                        <> <span className="arrow">➔</span> {summary.endDate} </>
                    )}
                </div>
                
                {/* Row 2: Route */}
                <div className="summary-route">
                    {summary.from}
                    {summary.to && (
                        <> <span className="arrow">➔</span> {summary.to} </>
                    )}
                </div>
            </div>

            {/* --- REASON INPUT --- */}
            <div className="form-group">
                <label className="reason-label-red">
                    Reason for Cancellation <span className="required">*</span>
                </label>
                <textarea 
                    className="reason-textarea"
                    placeholder="Max 250 characters"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                />
            </div>

            <p className="warning-text">
                Note: Once you cancel an itinerary, you will not be able to undo it.
            </p>
        </div>

        {/* --- FOOTER --- */}
        <div className="cancel-footer">
            <button 
                className="btn-confirm-cancel" 
                onClick={handleConfirm} 
                disabled={isLoading}
                style={{opacity: isLoading ? 0.7 : 1}}
            >
                {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
            <button className="btn-dont-cancel" onClick={onClose} disabled={isLoading}>
                Don't Cancel
            </button>
        </div>

      </div>
    </div>
  );
};

export default CancelItineraryModal;