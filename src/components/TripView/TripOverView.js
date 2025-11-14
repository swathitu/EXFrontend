import React, { useState, useEffect } from 'react';
import "./TripOverView.css"


// Helper function remains unchanged
const getInitials = (name) => {
    if (!name) return '-';
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// ... calculateTripDuration function remains unchanged ...
const calculateTripDuration = (allSegments) => {
    if (!allSegments || allSegments.length === 0) return 'N/A';

    const dates = [];
    // Only check for prefixes that contain date fields in segments
    const modePrefixes = ["FLIGHT", "TRAIN", "BUS", "CAR", "HOTEL"];

    // 1. Extract all valid dates across all segments
    allSegments.forEach(item => {
        modePrefixes.forEach((prefix) => {
            // Check for departure date fields
            const depDate = item[`${prefix}_DEP_DATE`];
            if (depDate && depDate !== "null" && depDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dates.push(new Date(depDate));
            }
            // Check for arrival/check-in date fields
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
    // Calculate inclusive days: Math.ceil(timeDiff / msInDay) + 1, or just 1 for a same-day trip.
    const oneDay = 1000 * 60 * 60 * 24;
    const dayDiff = Math.round(timeDiff / oneDay); // Use round to handle time-zone discrepancies close to midnight
    const durationDays = dayDiff > 0 ? dayDiff + 1 : 1; // Minimum 1 day for any trip

    // Format the date strings for output
    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    return `${durationDays} day(s) (${startDateStr} To ${endDateStr})`;
};


// ... transformApiData function remains unchanged ...
const transformApiData = (rawTripData) => {
    if (!rawTripData) return null;

    const rawTrip = rawTripData;
    const associatedData = rawTrip.associatedData || {};

    // 🛑 CHANGE 2: Consolidate all segment data into a single array for duration calculation and iteration
    const allSegments = [
        ...(associatedData.FlightData || []).map(s => ({ ...s, TRAVEL_MODE: 'flight' })),
        ...(associatedData.HotelData || []).map(s => ({ ...s, TRAVEL_MODE: 'hotel' })),
        ...(associatedData.CarData || []).map(s => ({ ...s, TRAVEL_MODE: 'car' })),
        ...(associatedData.BusData || []).map(s => ({ ...s, TRAVEL_MODE: 'bus' })),
        ...(associatedData.TrainData || []).map(s => ({ ...s, TRAVEL_MODE: 'train' })),
    ];

    const segments = [];
    const travelModes = [];
    const approverName = rawTrip.APPROVER_NAME || 'N/A';

    const getCityData = (code) => ({ cityCode: code || 'N/A', cityName: code || 'N/A' });

    // ✅ UPDATED: Calculate duration using the new function and the consolidated array
    const calculatedDuration = calculateTripDuration(allSegments);

    // 🛑 CHANGE 3: Iterate over the consolidated 'allSegments' array
    allSegments.forEach(segmentData => {
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
                        date: `${checkInDate} To ${checkOutDate}`,
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

    // 🛑 CHANGE 4: Use rawTripData for main fields, use the 'modesSummary' if available, otherwise fallback to collected travelModes
    const uniqueTravelModes = rawTrip.modesSummary?.map(m => m.toLowerCase()) ||
        [...new Set(travelModes.filter(m => ['flight', 'hotel', 'car', 'bus', 'train'].includes(m)))];

    return {
        // Main trip fields are directly under rawTrip
        tripId: rawTrip.ROWID || 'N/A', // Assuming ROWID is the trip ID in this payload
        status: rawTrip.STATUS || 'Draft',
        tripName: rawTrip.TRIP_NAME || 'Unnamed Trip',
        duration: calculatedDuration,
        bookingStatus: uniqueTravelModes,
        approver: {
            initials: getInitials(approverName),
            name: approverName,
        },
        policy: rawTrip.CF_BRANCH || 'N/A',
        destination: rawTrip.CF_LOCATION || 'N/A', // Changed to use CF_LOCATION as a more general destination field
        businessPurpose: rawTrip.CF_ACTIVITY || 'N/A',
        budgeAmount: 'N/A (Budget Field Missing)',
        bookingType: rawTrip.TRAVEL_TYPE || 'N/A',
        segments: segments,
        statusMessage: `Current Status: ${rawTrip.STATUS}`,
        travelAgent: 'Yet to be assigned',
    };
};

// ... fetchWithRetry and getIcon functions remain unchanged ...
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

const TripOverView = ({ trip, onBack, onUpdate, onOpenForm }) => {

    const extractedTripId = trip?.id || trip?.tripId;

    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Flight');

    //  NEW STATE: Tracks the index of the segment whose menu is open.
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

    //  NEW HANDLER: Toggles the menu for a specific index.
    const toggleDropdown = (index) => {
        // If the same index is clicked, close it (set to null), otherwise open the new index.
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };


    // Main data fetching logic
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
            const apiUrl = `/server/get_tripNumberData?trip_id=${currentTripId}`;

            try {
                const response = await fetchWithRetry(apiUrl);
                const result = await response.json();

                // 🛑 CHANGE 5: Check 'result.data' directly, which is the single trip object.
                if (result && result.data) {
                    // ✅ CHANGE 6: Pass the single trip object to the transformation function
                    const transformedData = transformApiData(result.data);
                    setTripData(transformedData);

                    // Set default active tab to the first travel mode found
                    if (transformedData.bookingStatus.length > 0) {
                        const firstMode = transformedData.bookingStatus[0].charAt(0).toUpperCase() + transformedData.bookingStatus[0].slice(1);
                        setActiveTab(firstMode);
                    }
                } else {
                    // 🛑 CHANGED error message to reflect the new structure
                    setError(`Trip ID ${currentTripId} data not found or API response was empty/invalid.`);
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

    // ... handleTabClick and rendering logic remains unchanged ...
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const data = tripData || {};
    const segmentsFiltered = data.segments ? data.segments.filter(s => s.type === activeTab) : [];

    // Check if the selected tab is present in the trip's actual travel modes
    const isTabActive = data.bookingStatus?.includes(activeTab.toLowerCase());

    // --- NEW: Render Loader/Error in Center ---
    const renderLoaderOrError = () => (
        <div className="loader-container" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            flexDirection: "column",
            gap: "12px",
        }}>
            <div className="spinner" style={{
                border: "6px solid #f3f3f3",
                borderTop: "6px solid #3498db", // blue color spinner
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                animation: "spin 1.2s linear infinite",
            }} />
            <div style={{ fontWeight: "600", fontSize: "16px", color: "#555" }}>
                Loading trip details...
            </div>

            {!loading && error && (
                <div style={{ marginTop: 12, color: "red" }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>
                    {error}
                </div>
            )}

            <button onClick={onBack} className="back-button" style={{
                marginTop: "20px",
                backgroundColor: "#3498db",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
            }}>
                &larr; Back to List
            </button>

            <style>
                {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
            </style>
        </div>
    );

    if (loading || error || !tripData) {
        // This is the correct gate. It stops rendering the main view 
        // when loading, or when an error occurs, or if data is null/empty.
        return (
            <>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
                {renderLoaderOrError()}
            </>
        );
    }


    return (
        <>
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
                            <button
                                onClick={() => {
                                    const tripId = trip?.id || trip?.tripId;
                                    if (onOpenForm) {
                                        onOpenForm(tripId); // pass tripId to parent
                                    } else {
                                        console.warn('onOpenForm not provided');
                                    }
                                }}
                            >
                                Update
                            </button>





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
                                <i className="far fa-calendar-alt"></i> Duration: {data.duration}
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

                        {segmentsFiltered.length > 0 && segmentsFiltered.map((segment, index) => {
                            return (
                                <div key={index} className="travel-info-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div className="date-info">
                                            {getIcon(segment.type)} <span>{segment.type.toUpperCase()}</span>  {segment.date}
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

                                        {/* 👇 CORRECTED DROPDOWN BLOCK */}
                                        <div className="dropdown-container">
                                            <button
                                                className="more-options-btn"
                                                // Use the index from the map function
                                                onClick={() => toggleDropdown(index)}
                                            >
                                                <i className="fas fa-ellipsis-h"></i>
                                            </button>

                                            {/* Conditionally render the menu using the state */}
                                            {openDropdownIndex === index && (
                                                <div className="dropdown-menu">
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => {
                                                            console.log(`Action: Reschedule/Cancel for segment ${index}`);
                                                            // Close the menu after clicking
                                                            setOpenDropdownIndex(null);
                                                        }}
                                                    >
                                                        Reschedule/Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* 👆 END OF CORRECTED DROPDOWN BLOCK */}

                                    </div>
                                    <div className="notes-section">Notes: {segment.comments || 'N/A'}</div>
                                </div>
                            );
                        })}
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