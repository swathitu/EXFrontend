import React, { useState, useEffect } from "react";
import "./BusDesk.css";

// --- Constant Dropdown Options (Unchanged) ---
const AVAILABLE_ACTION_STATUSES = ["Cancel", "On Hold"];
const ASSIGNED_TO_OPTIONS = ["Unassigned", "Swathi", "Suresh", "Admin Team", "Finance"];

// --- Helper Functions (Unchanged) ---
const getModeAvatar = (mode) => {
    switch (mode.toLowerCase()) {
        case 'flight':
            return { avatar: 'FL', name: 'Flight' }; 
        case 'car':
            return { avatar: 'CA', name: 'Car' };
        case 'train':
            return { avatar: 'TR', name: 'Train' };
        case 'bus':
            return { avatar: 'BU', name: 'Bus' };
        case 'hotel':
            return { avatar: 'HO', name: 'Hotel' };
        default:
            return { avatar: '??', name: 'N/A' };
    }
};

const getItineraryDetails = (associatedData) => {
    // Only BusData is relevant here, but keeping the structure intact 
    // for future use, prioritizing Bus if it exists.
    if (associatedData.BusData && associatedData.BusData.length > 0) {
        const bus = associatedData.BusData[0];
        return {
            mode: 'Bus',
            itinerary: `${bus.BUS_DEP_CITY} - ${bus.BUS_ARR_CITY}`,
            startDate: bus.BUS_DEP_DATE
        };
    }
    // Fallback logic for safety, though filtered data should always have Bus
    return { mode: 'N/A', itinerary: 'N/A', startDate: 'N/A' };
};

// ---------------------------------------------
// --- React Component: BusDesk 
// ---------------------------------------------
const BusDesk = () => { 
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('/server/travelDesk_data/'); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiData = await response.json();
                const rawData = apiData.data || [];

                // ⭐ CORE LOGIC: Filter data to keep ONLY requests with BusData
                const busRequests = rawData.filter(trip => 
                    trip.associatedData && 
                    trip.associatedData.BusData && 
                    trip.associatedData.BusData.length > 0
                );
                
                // Process ONLY the filtered Bus requests
                const processedData = busRequests.map(trip => {
                    const details = getItineraryDetails(trip.associatedData);
                    return {
                        id: trip.ROWID,
                        requestType: details.mode,
                        requestedBy: trip.SUBMITTER_NAME, 
                        tripNumber: trip.TRIP_NUMBER || 'N/A',
                        itinerary: details.itinerary,
                        startDate: details.startDate,
                        
                        apiStatus: trip.STATUS, 
                        status: 'Open', 
                        assignedTo: 'Unassigned', 
                    };
                });
                
                setRequests(processedData);
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRequests();
    }, []);

    const handleDropdownChange = (id, field, value) => {
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === id ? { ...req, [field]: value } : req
            )
        );
        console.log(`Updated Request ID ${id} - ${field}: ${value}`);
    };

    if (loading) {
        return <h5>Loading Bus Requests...</h5>;
    }

    if (requests.length === 0) {
        // Specific message for the filtered view
        return <h5>No pending **Bus** requests found.</h5>; 
    }

    return (
        <div className="all-requests-container">
            <h3>Bus Requests 🚌</h3>
            <table className="requests-table">
                <thead>
                    <tr>
                        <th>Request Type</th>
                        <th>Requested By</th>
                        <th>Trip #</th>
                        <th>Itinerary</th>
                        <th>Start Date</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((item) => {
                        const mode = getModeAvatar(item.requestType);
                        return (
                            <tr key={item.id}>
                                <td className="request-type-cell" title={`Mode: ${mode.name}`}>
                                    {/* <span className={`mode-avatar mode-avatar-${item.requestType.toLowerCase()}`}>
                                        {mode.avatar}
                                    </span> */}
                                    <span className="mode-name">
                                        {mode.name}
                                    </span>
                                    <span className="option-available-text">
                                        option available
                                    </span>
                                </td>
                                
                                <td>{item.requestedBy}</td>
                                <td>{item.tripNumber}</td>
                                <td>{item.itinerary}</td>
                                <td>{item.startDate}</td>

                                {/* Assigned To Dropdown (Unchanged) */}
                                <td>
                                    <select 
                                        value={item.assignedTo} 
                                        onChange={(e) => handleDropdownChange(item.id, 'assignedTo', e.target.value)}
                                        className="assigned-to-select"
                                    >
                                        {ASSIGNED_TO_OPTIONS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* Status Dropdown (Unchanged) */}
                                <td>
                                    <select 
                                        value={item.status} 
                                        onChange={(e) => handleDropdownChange(item.id, 'status', e.target.value)}
                                        className={`status-select status-${item.status.toLowerCase().replace(' ', '-')}`}
                                    >
                                        <option value="Open">Open</option>
                                        <option disabled>––––––––</option> 

                                        {AVAILABLE_ACTION_STATUSES
                                            .filter(option => option !== item.status) 
                                            .map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                    </select>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BusDesk;