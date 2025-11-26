import React, { useEffect, useState } from "react";
import "./HotelPreviousItineraries.css";

// --- ICONS ---
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const HotelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path>
    <path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const CommentsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67748e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const HotelPreviousItineraries = ({ bookingData, onClose }) => {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const rowId = bookingData?.ROWID || bookingData?.rowId


    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch Hotel history
                const response = await fetch(`/server/trip_reschedule?rowId=${rowId}&requestType=hotel`);
                const result = await response.json();
                
                if (result.status === 'success') {
                    setHistoryList(result.data);
                }
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (rowId) {
            fetchHistory();
        }
    }, [bookingData]);

    return (
        <div className="history-overlay">
            <div className="history-modal">
                
                {/* Header */}
                <div className="history-header">
                    <h3>Previous Itineraries (Hotel)</h3>
                    <button className="close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="history-content">
                    {isLoading ? (
                        <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Loading history...</div>
                    ) : historyList.length === 0 ? (
                        <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>No previous itineraries found.</div>
                    ) : (
                        historyList.map((item, idx) => (
                            <div className="history-card" key={idx}>
                                {/* Status Header */}
                                <div className="card-status-row">
                                    <span className="status-badge-red">Rescheduled</span>
                                    <span className="agent-text">
                                        Travel Agent: {item.Travel_Agent ? item.Travel_Agent : "Yet to be assigned"}
                                    </span>
                                </div>

                                {/* Main Info Row */}
                                <div className="card-details-row">
                                    {/* Left: Hotel Info */}
                                    <div className="detail-col left-col">
                                        <div className="info-item">
                                            <HotelIcon />
                                            <span className="label">Hotel Booking</span>
                                        </div>
                                        {/* Location is often stored in City field for hotels */}
                                        <div className="desc-text" style={{fontWeight:'500', color:'#333'}}>
                                            {item.HOTEL_ARR_CITY || item.HOTEL_DEP_CITY || ""}
                                        </div>
                                        <div className="desc-text">{item.DESCRIPTION || "No description"}</div>
                                    </div>

                                    {/* Right: Check-in / Check-out */}
                                    <div className="detail-col right-col">
                                        <div className="trip-route">
                                            <div className="route-point">
                                                <span className="sub-label">Check-In</span>
                                                <div className="date-time-val">
                                                    {item.HOTEL_ARR_DATE}, {item.HOTEL_ARR_TIME}
                                                </div>
                                            </div>

                                            <div className="route-arrow">
                                                <ArrowRightIcon />
                                            </div>

                                            <div className="route-point">
                                                <span className="sub-label">Check-Out</span>
                                                <div className="date-time-val">
                                                    {item.HOTEL_DEP_DATE}, {item.HOTEL_DEP_TIME}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments (Reschedule Reason) */}
                                {item.Reschedule_Reason && (
                                    <div className="card-comments">
                                        <CommentsIcon />
                                        <span>{item.Reschedule_Reason}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="history-footer">
                    <button className="btn-close-main" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default HotelPreviousItineraries;