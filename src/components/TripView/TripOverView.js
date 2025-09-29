import React, { useState, useEffect } from 'react';


const style = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
    
    .trip-overview-container {
        display: flex;
        min-height: 100vh;
        background-color: #f9fafb; /* bg-gray-50 */
        color: #1f2937; /* text-gray-900 */
        font-family: 'Inter', sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-radius: 0.75rem; /* rounded-xl */
        max-width: 1280px; /* max-w-7xl */
        margin: 1.5rem auto; /* mx-auto my-6 */
        overflow: hidden;
    }
    .main-content {
        flex-grow: 1;
        padding: 2rem;
        width: 75%; /* Equivalent to max-w-75% when in flex */
        background-color: white;
    }
    .sidebar1 {
        width: 25%;
        background-color: white;
        border-left: 1px solid #e5e7eb; /* border-gray-200 */
        padding: 2rem;
        box-shadow: -2px 0 5px -2px rgba(0, 0, 0, 0.05);
    }
    .header1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
    }
    .trip-id {
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        color: #4338ca; /* indigo-700 */
    }
    .status-badge {
        margin-left: 1rem;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    .status-badge.Draft { background-color: #fef3c7; color: #b45309; } /* amber */
    .status-badge.Approved { background-color: #d1fae5; color: #065f46; } /* green */
    .status-badge.Error { background-color: #fee2e2; color: #991b1b; } /* red */

    .header1-actions button {
        background-color: white;
        border: 1px solid #e5e7eb;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.15s;
        font-size: 0.875rem;
        font-weight: 500;
        margin-left: 0.5rem;
    }
    .header1-actions button:hover {
        background-color: #f9fafb;
    }
    .header1-actions .dropdown {
        color: #4b5563; /* gray-700 */
        font-size: 1.25rem;
        padding: 0.35rem 0.75rem;
    }
    .header1-actions .close-btn {
        background-color: #fff;
        color: #dc2626; /* red-600 */
        border-color: #fecaca; /* red-200 */
        margin-left: 0.5rem;
        font-size: 1.125rem;
        padding: 0.5rem 0.75rem;
    }
    .header1-actions .close-btn:hover {
        background-color: #fef2f2; /* red-50 */
    }
    .trip-info h1 {
        font-size: 1.875rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    .trip-info .details {
        color: #6b7280;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
    }
    .trip-info .details i {
        margin-right: 0.5rem;
    }
    .modes-of-travel {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    .modes-of-travel .title {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
    }
    .modes-of-travel .icons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.25rem;
    }
    .tabs {
        display: flex;
        border-bottom: 2px solid #e5e7eb;
        margin-bottom: 1.5rem;
    }
    .tab-item {
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        font-weight: 600;
        color: #6b7280; /* text-gray-500 */
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
    }
    .tab-item i { margin-right: 0.5rem; }
    .tab-item:hover {
        color: #4f46e5;
    }
    .tab-item.active {
        color: #4f46e5; /* indigo-600 */
        border-bottom-color: #4f46e5;
    }

    .content-section {
        background-color: #f9fafb; /* gray-50 */
        padding: 1rem;
        border-radius: 0.5rem;
        flex-grow: 1;
    }
    .status-message-box {
        background-color: #eff6ff; /* blue-50 */
        color: #1e40af; /* blue-800 */
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #bfdbfe; /* blue-200 */
        margin-bottom: 1rem;
        font-weight: 500;
        font-size: 0.875rem;
    }
    .status-message-box .agent-info {
        font-size: 0.75rem;
        color: #2563eb; /* blue-600 */
        margin-top: 0.25rem;
    }
    .empty-segment-box {
        background-color: #fef2f2; /* red-50 */
        color: #991b1b; /* red-800 */
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #fecaca; /* red-200 */
    }

    .travel-info-card {
        background-color: white;
        border: 1px solid #e5e7eb;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
    }
    .date-info {
        display: flex;
        align-items: center;
        color: #4f46e5; /* indigo-600 */
    }
    .date-info span {
        margin-left: 0.25rem;
        font-weight: 700;
    }
    .route-details {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
    }
    .cities {
        text-align: center;
    }
    .cities .code {
        font-size: 1.5rem;
        font-weight: 700;
    }
    .cities .name {
        font-size: 0.75rem;
        color: #6b7280; /* gray-500 */
    }
    .arrow {
        font-size: 1.5rem;
        color: #d1d5db; /* gray-300 */
    }
    .more-options-btn {
        margin-left: auto;
        color: #9ca3af; /* gray-400 */
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
    }
    .more-options-btn:hover {
        color: #4b5563; /* gray-600 */
    }
    .notes-section {
        font-size: 0.75rem;
        color: #9ca3af; /* gray-400 */
        margin-top: 0.75rem;
        border-top: 1px solid #e5e7eb;
        padding-top: 0.5rem;
    }

    .booking-status-icon {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
        font-size: 0.8rem;
    }
    .booking-status-icon.flight { background-color: #3b82f6; } /* blue */
    .booking-status-icon.hotel { background-color: #10b981; } /* emerald */
    .booking-status-icon.car { background-color: #f59e0b; } /* amber */
    .booking-status-icon.bus { background-color: #6366f1; } /* indigo */
    .booking-status-icon.train { background-color: #ef4444; } /* red */

    /* Sidebar styles */
    .sidebar-section {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    .sidebar-section-title {
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    .sidebar-section-value {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
    }
    .approver-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .approver-avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
    }
    .approver-details .name {
        font-weight: 600;
    }
    .approver-details .view-flow {
        font-size: 0.75rem;
        color: #6b7280;
        cursor: pointer;
        transition: color 0.15s;
    }
    .approver-details .view-flow:hover {
        color: #3730a3;
    }

    /* Loading/Error View Fix */
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
        background-color: #f9fafb;
    }
    .loader-box {
        font-size: 1.25rem;
        font-weight: 600;
        text-align: center;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        background-color: white;
        width: 24rem;
    }
    .loader-box .loading-text {
        color: #4f46e5; /* indigo-600 */
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .loader-box .error-text {
        color: #b91c1c; /* red-700 */
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .loader-box .back-button {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
        cursor: pointer;
        background: none;
        border: none;
        text-decoration: none;
    }
    .loader-box .back-button:hover {
        color: #4f46e5;
        text-decoration: underline;
    }


    @media (max-width: 1024px) {
        .trip-overview-container { flex-direction: column; }
        .main-content, .sidebar1 { width: 100%; border-left: none; border-bottom: 1px solid #e5e7eb; max-width: none; }
        .route-details { flex-wrap: wrap; }
        .header1-actions .hidden { display: none; }
    }
`;


const getInitials = (name) => {
    if (!name) return '-';
    return name.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
};

/**
 * Calculates the duration of the trip in days.
 * @param {Array<Object>} rawTripArray - The array of objects returned from the API (all segments).
 * @returns {string} The duration string, e.g., "5 days (2024-01-10 - 2024-01-15)".
 */
const calculateTripDuration = (rawTripArray) => {
    if (!rawTripArray || rawTripArray.length === 0) return 'N/A';

    const dates = [];
    const modePrefixes = ["FLIGHT", "TRAIN", "BUS", "CAR", "HOTEL"];

    // 1. Extract all valid dates across all segments
    rawTripArray.forEach(item => {
        modePrefixes.forEach((prefix) => {
            // Check for departure date
            const depDate = item[`${prefix}_DEP_DATE`];
            if (depDate && depDate !== "null" && depDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dates.push(new Date(depDate));
            }
            // Check for arrival date (Hotel uses ARR/DEP, others may use ARR)
            const arrDate = item[`${prefix}_ARR_DATE`];
            if (arrDate && arrDate !== "null" && arrDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dates.push(new Date(arrDate));
            }
        });
    });

    if (dates.length === 0) return 'N/A';

    // 2. Find the earliest and latest dates
    const sortedDates = dates.sort((a, b) => a - b);
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    // 3. Calculate the duration in days (inclusive: +1 day)
    const timeDiff = endDate.getTime() - startDate.getTime();
    // Convert ms to days, rounding up to ensure a one-day trip is counted as 1 day.
    // If timeDiff is 0 (same day), it's 0, so we add 1 for inclusive days.
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const durationDays = dayDiff > 0 ? dayDiff + 1 : 1; // Minimum 1 day for any trip

    // Format the date strings for output
    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    return `${durationDays} day(s) (${startDateStr} - ${endDateStr})`;
};


/**
 * Transforms the raw API data (an array of segments) into the component's structured format.
 * @param {Array<Object>} rawTripArray - The array of objects returned from the API.
 */
const transformApiData = (rawTripArray) => {
    if (!rawTripArray || rawTripArray.length === 0) return null;

    const rawTrip = rawTripArray[0]; 
    const segments = [];
    const travelModes = [];
    const approverName = rawTrip.APPROVER_NAME || 'N/A';

    const getCityData = (code) => ({ cityCode: code || 'N/A', cityName: code || 'N/A' });

    // Calculate duration using the new function
    const calculatedDuration = calculateTripDuration(rawTripArray);

    // ... (Existing segment extraction logic remains here, unchanged) ...
    rawTripArray.forEach(segmentData => {
        const mode = segmentData.TRAVEL_MODE ? segmentData.TRAVEL_MODE.toLowerCase() : null;
        if (!mode) return; 
        travelModes.push(mode);

        switch (mode) {
            case 'flight':
                if (segmentData.FLIGHT_DEP_CITY && segmentData.FLIGHT_ARR_CITY) {
                    segments.push({
                        type: 'Flight',
                        date: segmentData.FLIGHT_DEP_DATE || 'Date N/A',
                        from: getCityData(segmentData.FLIGHT_DEP_CITY),
                        to: getCityData(segmentData.FLIGHT_ARR_CITY),
                        comments: `Departure: ${segmentData.FLIGHT_DEP_TIME || 'N/A'}`,
                    });
                }
                break;

            case 'hotel':
                if (segmentData.HOTEL_ARR_CITY) {
                    const checkInDate = segmentData.HOTEL_ARR_DATE || 'Date N/A';
                    const checkOutDate = segmentData.HOTEL_DEP_DATE || 'Date N/A'; 
                    segments.push({
                        type: 'Hotel',
                        date: `${checkInDate} - ${checkOutDate}`,
                        from: getCityData(segmentData.HOTEL_ARR_CITY),
                        to: getCityData(segmentData.HOTEL_ARR_CITY),
                        comments: 'Hotel stay segment',
                    });
                }
                break;
                
            case 'car':
                if (segmentData.CAR_DEP_CITY && segmentData.CAR_ARR_CITY) {
                    segments.push({
                        type: 'Car',
                        date: segmentData.CAR_DEP_DATE || 'Date N/A',
                        from: getCityData(segmentData.CAR_DEP_CITY),
                        to: getCityData(segmentData.CAR_ARR_CITY),
                        comments: 'Car rental segment details',
                    });
                }
                break;
                
            case 'bus':
                if (segmentData.BUS_DEP_CITY && segmentData.BUS_ARR_CITY) {
                    segments.push({
                        type: 'Bus',
                        date: segmentData.BUS_DEP_DATE || 'Date N/A',
                        from: getCityData(segmentData.BUS_DEP_CITY),
                        to: getCityData(segmentData.BUS_ARR_CITY),
                        comments: 'Bus travel segment details',
                    });
                }
                break;
                
            case 'train':
                if (segmentData.TRAIN_DEP_CITY && segmentData.TRAIN_ARR_CITY) {
                    segments.push({
                        type: 'Train',
                        date: segmentData.TRAIN_DEP_DATE || 'Date N/A',
                        from: getCityData(segmentData.TRAIN_DEP_CITY),
                        to: getCityData(segmentData.TRAIN_ARR_CITY),
                        comments: 'Train travel segment details',
                    });
                }
                break;
            default:
                break;
        }
    });
    // ... (End of segment extraction logic) ...

    const validModes = ['flight', 'hotel', 'car', 'bus', 'train'];
    const uniqueTravelModes = [...new Set(travelModes.filter(m => validModes.includes(m)))];

    return {
        tripId: rawTrip.TRIP_NUMBER || 'N/A',
        status: rawTrip.STATUS_OF_REQUEST || 'Draft',
        tripName: rawTrip.TRIP_NAME || 'Unnamed Trip',
        // ✅ UPDATED: Use the calculated duration
        duration: calculatedDuration,
        bookingStatus: uniqueTravelModes, 
        approver: {
            initials: getInitials(approverName),
            name: approverName,
        },
        policy: rawTrip.CF_BRANCH || 'N/A',
        destination: rawTrip.FLIGHT_ARR_CITY || rawTrip.HOTEL_ARR_CITY || 'N/A',
        businessPurpose: rawTrip.CF_ACTIVITY || 'N/A',
        budgeAmount: 'N/A (Budget Field Missing)',
        bookingType: rawTrip.BOOKING_TYPE || 'N/A',
        segments: segments,
        statusMessage: `Current Status: ${rawTrip.STATUS_OF_REQUEST}`,
        travelAgent: 'Yet to be assigned',
    };
};

/**
 * Executes a fetch request with exponential backoff for transient error handling.
 */
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.warn(`Fetch attempt ${i + 1} failed for ${url}: ${error.message}`);
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Maximum fetch retries exceeded.");
};

// ====================================================================
// 3. COMPONENT IMPLEMENTATION
// ====================================================================

const getIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'flight':
            return <i className="fas fa-plane"></i>;
        case 'hotel':
            return <i className="fas fa-hotel"></i>;
        case 'car':
            return <i className="fas fa-car"></i>;
        case 'bus':
            return <i className="fas fa-bus"></i>;
        case 'train':
            return <i className="fas fa-train"></i>;
        default:
            return <i className="far fa-calendar-alt"></i>;
    }
};

/**
 * TripOverView Component
 */
const TripOverView = ({ trip, onBack = () => console.log('Back clicked') }) => {
    const extractedTripId = trip?.id;
    
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Flight');

    // Main data fetching logic (from user's prompt)
    useEffect(() => {
        const fetchAndSetData = async (currentTripId) => {
            if (!currentTripId) {
                setError("No Trip ID found in the provided data structure (trip.id is missing).");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            
            // This URL is assumed for demonstration, replace with your actual API endpoint
            const apiUrl = `/server/get_tripNumberData?trip_number=${currentTripId}`;
            
            try {
                const response = await fetchWithRetry(apiUrl);
                const result = await response.json();

                if (result && result.data && result.data.length > 0) {
                    // ✅ CHANGE 1: Pass the entire array to the transformation function
                    const transformedData = transformApiData(result.data);
                    setTripData(transformedData);
                    
                    // Set default active tab to the first travel mode found
                    if (transformedData.bookingStatus.length > 0) {
                        const firstMode = transformedData.bookingStatus[0].charAt(0).toUpperCase() + transformedData.bookingStatus[0].slice(1);
                        setActiveTab(firstMode);
                    }
                } else {
                    setError(`Trip ID ${currentTripId} data not found or API response was empty.`);
                    setTripData(null);
                }
            } catch (err) {
                setError(`Failed to fetch data: ${err.message}.`);
                setTripData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSetData(extractedTripId);
        
    }, [extractedTripId]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    
    const data = tripData || {};
    const segmentsFiltered = data.segments ? data.segments.filter(s => s.type === activeTab) : [];
    
    // Check if the selected tab is present in the trip's actual travel modes
    const isTabActive = data.bookingStatus?.includes(activeTab.toLowerCase());

    // --- NEW: Render Loader/Error in Center ---
    const renderLoaderOrError = () => (
        <div className="loader-container">
            <div className="loader-box">
                {loading && (
                    <div className="loading-text">
                        <i className="fas fa-spinner fa-spin mr-2"></i> Loading details for **{extractedTripId || '...'}**...
                    </div>
                )}
                {error && (
                    <div className="error-text">
                        <i className="fas fa-exclamation-triangle mr-2"></i> {error}
                    </div>
                )}
                <button 
                    onClick={onBack} 
                    className="back-button"
                >
                    &larr; Back to List
                </button>
            </div>
        </div>
    );

    if (loading || error || !tripData) {
        return (
            <>
                {/* Only include necessary CSS and Font Awesome for icons */}
                <style>{style}</style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
                {renderLoaderOrError()}
            </>
        );
    }

    return (
        <>
            <style>{style}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

            <div className="trip-overview-container">
                {/* Main Content Area */}
                <div className="main-content">
                    
                    {/* Header */}
                    <div className="header1">
                        <div className="trip-id">
                            {data.tripId}
                            <span className={`status-badge ${data.status}`}>{data.status}</span>
                        </div>
                        <div className="header1-actions flex">
                            <button className="hidden sm:inline-block">Update</button>
                            <button className="dropdown">...</button>
                            <button onClick={onBack} className="close-btn">
                                &#x2715;
                            </button>
                        </div>
                    </div>

                    {/* Trip Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div className="trip-info">
                            <h1>{data.tripName}</h1>
                            <div className="details">
                                <i className="far fa-calendar-alt"></i> Duration: **{data.duration}**
                            </div>
                        </div>
                        <div className="modes-of-travel">
                            <div className="title">Modes of Travel</div>
                            <div className="icons">
                                {data.bookingStatus?.map((type, index) => (
                                    <div key={index} className={`booking-status-icon ${type}`}>
                                        {getIcon(type)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        {['Flight', 'Hotel', 'Car', 'Bus', 'Train'].map((tab) => (
                            data.bookingStatus?.includes(tab.toLowerCase()) && (
                                <div
                                    key={tab}
                                    className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => handleTabClick(tab)}
                                >
                                    {getIcon(tab)} {tab}
                                </div>
                            )
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="content-section">
                        <div className="status-message-box">
                            {data.statusMessage}
                            <div className="agent-info">Travel Agent: {data.travelAgent}</div>
                        </div>
                        
                        {segmentsFiltered.length === 0 && isTabActive && (
                            <div className="empty-segment-box">
                                No detailed data found for the **{activeTab}** segment, but the mode is included in the trip request.
                            </div>
                        )}
                        
                        {!isTabActive && (
                            <div className="empty-segment-box">
                                This trip does not include **{activeTab}** segments.
                            </div>
                        )}

                        {segmentsFiltered.length > 0 && segmentsFiltered.map((segment, index) => (
                            <div key={index} className="travel-info-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div className="date-info">
                                        {getIcon(segment.type)} <span>{segment.type.toUpperCase()}</span> - {segment.date}
                                    </div>
                                </div>
                                
                                <div className="route-details">
                                    <div className="cities">
                                        <div className="code">{segment.from.cityCode}</div>
                                        <div className="name">{segment.from.cityName}</div>
                                    </div>
                                    <div className="arrow">&#x27A4;</div>
                                    <div className="cities">
                                        <div className="code">{segment.to.cityCode}</div>
                                        <div className="name">{segment.to.cityName}</div>
                                    </div>
                                    <button className="more-options-btn">
                                        <i className="fas fa-ellipsis-h"></i>
                                    </button>
                                </div>
                                <div className="notes-section">Notes: {segment.comments || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="sidebar1">
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Approver:</div>
                        <div className="approver-info">
                            <div className="approver-avatar">{data.approver.initials}</div>
                            <div className="approver-details">
                                <div className="name">{data.approver.name}</div>
                                <div className="view-flow">View approval flow</div>
                            </div>
                        </div>
                    </div>
                 
                </div>
            </div>
        </>
    );
};

export default TripOverView;