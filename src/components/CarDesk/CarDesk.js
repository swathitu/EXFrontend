import React, { useState, useEffect } from "react";
import "./CarDesk.css";

// --- Constant Dropdown Options (Unchanged) ---
const AVAILABLE_ACTION_STATUSES = ["Cancel", "On Hold"];
const ASSIGNED_TO_OPTIONS = ["Unassigned", "Swathi", "Suresh", "Admin Team", "Finance"];

// --- Helper Functions (Unchanged) ---
const getModeAvatar = (mode) => {
    switch (mode.toLowerCase()) {
        case 'flight':
            return { avatar: 'FL', name: 'Flight' }; 
        case 'car':
            return { avatar: 'CA', name: 'Car' }; // This is what we expect to see
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

// --- MODIFIED: Helper Function to Extract Itinerary Details (Now prioritizing Car) ---
const getItineraryDetails = (associatedData) => {
    // ⭐ MODIFIED: Check for CarData and return Car details
    if (associatedData.CarData && associatedData.CarData.length > 0) {
        const car = associatedData.CarData[0];
        return {
            mode: 'Car',
            itinerary: `${car.CAR_DEP_CITY} - ${car.CAR_ARR_CITY}`,
            startDate: car.CAR_DEP_DATE
        };
    }
    
    // Keeping this section clean since this desk should only focus on CarData
    return { mode: 'N/A', itinerary: 'N/A', startDate: 'N/A' };
};

// ---------------------------------------------
// --- React Component: CarDesk 
// ---------------------------------------------
const CarDesk = () => { 
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

                // ⭐ MODIFIED CORE LOGIC: Filter data to keep ONLY requests with CarData
                const carRequests = rawData.filter(trip => 
                    trip.associatedData && 
                    trip.associatedData.CarData && // Check for CarData instead of BusData
                    trip.associatedData.CarData.length > 0
                );
                
                // Process ONLY the filtered Car requests
                const processedData = carRequests.map(trip => {
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
        // ⭐ MODIFIED: Loading message
        return <h5>Loading Car Requests...</h5>;
    }

    if (requests.length === 0) {
        // ⭐ MODIFIED: No requests message
        return <h5>No pending **Car** requests found.</h5>; 
    }

    return (
        <div className="all-requests-container">
            {/* ⭐ MODIFIED: Heading */}
            <h3>Car Requests 🚗</h3>
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

export default CarDesk;