import React, { useEffect, useState } from "react";
import "../BusPreviousItineraries/BusPreviousItineraries.css"; // Reusing styling

// --- ICONS ---
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const FlightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M13 5l7 7-7 7"/><path d="M13 5v14"/></svg>); // Placeholder
const ArrowRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const CommentsIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67748e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);

const FlightPreviousItineraries = ({ bookingData, onClose }) => {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/server/trip_reschedule?rowId=${bookingData.rowId}&requestType=flight`);
                const result = await response.json();
                if (result.status === 'success') setHistoryList(result.data);
            } catch (error) { console.error("Failed to load history:", error); } 
            finally { setIsLoading(false); }
        };
        if (bookingData?.rowId) fetchHistory();
    }, [bookingData]);

    return (
        <div className="history-overlay">
            <div className="history-modal">
                <div className="history-header">
                    <h3>Previous Itineraries (Flight)</h3>
                    <button className="close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="history-content">
                    {isLoading ? (<div style={{padding:'40px', textAlign:'center', color:'#666'}}>Loading history...</div>) : 
                    historyList.length === 0 ? (<div style={{padding:'40px', textAlign:'center', color:'#666'}}>No previous itineraries found.</div>) : 
                    (historyList.map((item, idx) => (
                        <div className="history-card" key={idx}>
                            <div className="card-status-row">
                                <span className="status-badge-red">Rescheduled</span>
                                <span className="agent-text">Travel Agent: {item.Travel_Agent || "Yet to be assigned"}</span>
                            </div>
                            <div className="card-details-row">
                                <div className="detail-col left-col">
                                    <div className="info-item"><FlightIcon /><span className="label">Flight Booking</span></div>
                                    <div className="desc-text">{item.DESCRIPTION || "No description"}</div>
                                </div>
                                <div className="detail-col right-col">
                                    <div className="trip-route">
                                        <div className="route-point">
                                            <span className="sub-label">Departure</span>
                                            <div className="date-time-val">{item.FLIGHT_DEP_DATE}, {item.FLIGHT_DEP_TIME}</div>
                                            <div className="city-val">{item.FLIGHT_DEP_CITY}</div>
                                        </div>
                                        <div className="route-arrow"><ArrowRightIcon /></div>
                                        <div className="route-point">
                                            <span className="sub-label">Arrival</span>
                                            <div className="city-val">{item.FLIGHT_ARR_CITY}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {item.Reschedule_Reason && (<div className="card-comments"><CommentsIcon /><span>{item.Reschedule_Reason}</span></div>)}
                        </div>
                    )))}
                </div>
                <div className="history-footer"><button className="btn-close-main" onClick={onClose}>Close</button></div>
            </div>
        </div>
    );
};
export default FlightPreviousItineraries;