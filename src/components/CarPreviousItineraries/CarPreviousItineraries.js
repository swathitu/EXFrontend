import React, { useEffect, useState } from "react";
import "./CarPreviousItineraries.css"; // We will create this next

// --- ICONS (Reused) ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const CarIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>); // Simplified placeholder
const DriverIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21h13a2 2 0 002-2v-3a5 5 0 00-5-5h-5a5 5 0 00-5 5v3a2 2 0 002 2z"/></svg>); // Simplified placeholder
const ArrowRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const CommentsIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67748e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);


const CarPreviousItineraries = ({ bookingData, onClose }) => {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const rowId = bookingData?.ROWID || bookingData?.rowId

    // --- FETCH HISTORY ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Calling the new GET endpoint we added to trip_reschedule
                const response = await fetch(`/server/trip_reschedule?rowId=${rowId}&requestType=car`);
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
                    <h3>Previous Itineraries</h3>
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
                                    <span className="agent-text">Travel Agent: {item.Travel_Agent ? item.Travel_Agent : "Yet to be assigned"}</span>
                                </div>

                                {/* Main Info Row */}
                                <div className="card-details-row">
                                    {/* Left: Car Info */}
                                    <div className="detail-col left-col">
                                        <div className="info-item">
                                            <CarIcon />
                                            <span className="label">Car Type :</span>
                                            <span className="value">{item.CAR_TYPE}</span>
                                        </div>
                                        <div className="info-item">
                                            <DriverIcon />
                                            <span className="label">Driver :</span>
                                            <span className="value">{item.CAR_DRIVER}</span>
                                        </div>
                                        <div className="desc-text">{item.DESCRIPTION || "No description"}</div>
                                    </div>

                                    {/* Right: Dates & Locations */}
                                    <div className="detail-col right-col">
                                        <div className="trip-route">
                                            <div className="route-point">
                                                <span className="sub-label">Pick-Up</span>
                                                <div className="date-time-val">
                                                    {item.CAR_DEP_DATE}, {item.CAR_DEP_TIME}
                                                </div>
                                                <div className="city-val">{item.CAR_DEP_CITY}</div>
                                            </div>

                                            <div className="route-arrow">
                                                <ArrowRightIcon />
                                            </div>

                                            <div className="route-point">
                                                <span className="sub-label">Drop-Off</span>
                                                <div className="date-time-val">
                                                    {item.CAR_ARR_DATE}, {item.CAR_ARR_TIME}
                                                </div>
                                                <div className="city-val">{item.CAR_ARR_CITY}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section (Reschedule Reason) */}
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

export default CarPreviousItineraries;