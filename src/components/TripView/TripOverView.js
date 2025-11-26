import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaEllipsisH, FaMapMarkerAlt, FaUser, FaCar } from "react-icons/fa";
import "./TripOverView.css"
import FlightSelectionOptions from '../FlightSelectionOptions/FlightSelectionOptions';
import HotelSelectionOptions from '../HotelSelectionOptions/HotelSelectionOptions';
import CarSelectionOptions from '../CarSelectionOptions/CarSelectionOptions';
import BusSelectionOptions from '../BusSelectionOptions/BusSelectionOptions';
import TrainSelectionOptions from '../TrainSelectionOptions/TrainSelectionOptions';
import HotelRescheduleForm from '../HotelRescheduleForm/HotelRescheduleForm';
import HotelPreviousItineraries from '../HotelPreviousItineraries/HotelPreviousItineraries';
import CancelItineraryModal from '../CancelItineraryModal/CancelItineraryModal';
import FlightRescheduleForm from '../FlightRescheduleForm/FlightRescheduleForm';
import FlightPreviousItineraries from '../FlightPreviousItineraries/FlightPreviousItineraries';
import CarRescheduleForm from '../CarRescheduleForm/CarRescheduleForm';
import CarPreviousItineraries from '../CarPreviousItineraries/CarPreviousItineraries';
import TrainRescheduleForm from '../TrainRescheduleForm/TrainRescheduleForm';
import TrainPreviousItineraries from '../TrainPreviousItineraries/TrainPreviousItineraries';
import BusRescheduleForm from '../BusRescheduleForm/BusRescheduleForm';
import BusPreviousItineraries from '../BusPreviousItineraries/BusPreviousItineraries';


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
                        arrDate: segmentData.FLIGHT_ARR_DATE || 'Date N/A',
                        from: getCityData(segmentData.FLIGHT_DEP_CITY),
                        to: getCityData(segmentData.FLIGHT_ARR_CITY),
                        id: segmentData.ROWID,

                        // Flight-specific fields matching your mapFlights keys
                        depDate: segmentData.FLIGHT_DEP_DATE || 'N/A',
                        depTime: segmentData.FLIGHT_DEP_TIME || '',
                        depCity: segmentData.FLIGHT_DEP_CITY || 'N/A',
                        depAirport: segmentData.DEP_AIRPORT_NAME || 'Airport',
                        depCode: segmentData.DEP_CITY_CODE || (segmentData.FLIGHT_DEP_CITY ? segmentData.FLIGHT_DEP_CITY.substring(0, 3).toUpperCase() : ''),

                        arrCity: segmentData.FLIGHT_ARR_CITY || 'N/A',
                        arrAirport: segmentData.ARR_AIRPORT_NAME || 'Airport',
                        arrCode: segmentData.ARR_CITY_CODE || (segmentData.FLIGHT_ARRV_CITY ? segmentData.FLIGHT_ARRV_CITY.substring(0, 3).toUpperCase() : ''),

                        seatPref: segmentData.SEAT_PREF || '',
                        mealPref: segmentData.MEAL_PREF || '',
                        description: segmentData.DESCRIPTION || '',
                        rescheduleStatus: segmentData.Reschedule_Status || '',
                        cancelStatus: segmentData.Cancel_Status || '',

                        comments: `Departure: ${segmentData.FLIGHT_DEP_TIME || 'N/A'}`,  // keep as summary if needed
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
                        id: segmentData.ROWID,
                        description: segmentData.DESCRIPTION,
                        to: getCityData(segmentData.HOTEL_ARR_CITY),
                        comments: 'Hotel stay segment',
                        checkInTime: segmentData.HOTEL_DEP_TIME,
                        checkOutTime: segmentData.HOTEL_ARR_TIME,
                        locationCity: segmentData.HOTEL_ARR_CITY,
                        rescheduleStatus: segmentData.Reschedule_Status || '',
                        cancelStatus: segmentData.Cancel_Status || '',

                    });
                }
                break;

            case 'car':
                if (segmentData.CAR_DEP_CITY && segmentData.CAR_ARR_CITY) {
                    segments.push({
                        type: 'Car',
                        date: segmentData.CAR_DEP_DATE || 'Date N/A',
                        from: getCityData(segmentData.CAR_DEP_CITY),
                        id: segmentData.ROWID,
                        to: getCityData(segmentData.CAR_ARR_CITY),
                        carType: segmentData.CAR_TYPE,
                        comments: 'Car rental segment details',
                        carDepTime: segmentData.CAR_DEP_TIME,
                        carArrTime: segmentData.CAR_ARR_TIME,
                        description: segmentData.DESCRIPTION || '',
                        rescheduleStatus: segmentData.Reschedule_Status || '',
                        cancelStatus: segmentData.Cancel_Status || '',
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
                        id: segmentData.ROWID,
                        comments: 'Bus travel segment details',
                        description: segmentData.DESCRIPTION || '',
                        rescheduleStatus: segmentData.Reschedule_Status || '',
                        cancelStatus: segmentData.Cancel_Status || '',
                    });
                }
                break;

            case 'train':
                if (segmentData.TRAIN_DEP_CITY && segmentData.TRAIN_ARR_CITY) {
                    segments.push({
                        type: 'Train',
                        date: segmentData.TRAIN_DEP_DATE || 'Date N/A',
                        fromDate: segmentData.TRAIN_ARR_DATE || 'Date N/A',
                        from: getCityData(segmentData.TRAIN_DEP_CITY),
                        id: segmentData.ROWID,
                        to: getCityData(segmentData.TRAIN_ARR_CITY),
                        comments: 'Train travel segment details',
                        description: segmentData.DESCRIPTION || '',
                        rescheduleStatus: segmentData.Reschedule_Status || '',
                        cancelStatus: segmentData.Cancel_Status || '',
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
        tripId: rawTrip.TRIP_NUMBER || 'N/A', // Assuming ROWID is the trip ID in this payload
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
    const [associatedData, setAssociatedData] = useState({});
    const [selectedFlightSegment, setSelectedFlightSegment] = useState(null);
    const [selectedHotelSegment, setSelectedHotelSegment] = useState(null);
    const [selectedCarSegment, setSelectedCarSegment] = useState(null);
    const [selectedBusSegment, setSelectedBusSegment] = useState(null);
    const [selectedTrainSegment, setSelectedTrainSegment] = useState(null);
    const [rescheduleHotelBooking, setRescheduleHotelBooking] = React.useState(null);
    const [viewHistoryHotelBooking, setViewHistoryHotelBooking] = React.useState(null);
    const [cancelBookingItem, setCancelBookingItem] = React.useState(null);
    const [rescheduleFlightBooking, setRescheduleFlightBooking] = React.useState(null);
    const [viewHistoryFlightBooking, setViewHistoryFlightBooking] = React.useState(null);
    const [rescheduleCarBooking, setRescheduleCarBooking] = React.useState(null);
    const [viewHistoryCarBooking, setViewHistoryCarBooking] = React.useState(null);
    const [rescheduleTrainBooking, setRescheduleTrainBooking] = React.useState(null);
    const [viewHistoryTrainBooking, setViewHistoryTrainBooking] = React.useState(null);
    const [rescheduleBusBooking, setRescheduleBusBooking] = React.useState(null);
    const [viewHistoryBusBooking, setViewHistoryBusBooking] = React.useState(null);




    const handleViewOptionsClick = (flightSeg) => {
        setSelectedFlightSegment(flightSeg);
        // Additional logic: open modal, drawer, etc.
    };

    const handleViewOptionsClickHotel = (hotelSeg) => {
        setSelectedHotelSegment(hotelSeg);
    }

    const handleViewOptionsClickCar = (carSeg) => {
        setSelectedCarSegment(carSeg);
    };

    const handleViewOptionsClickBus = (busSeg) => {
        setSelectedBusSegment(busSeg);
    };

    const handleViewOptionsClickTrain = (trainSeg) => {
        setSelectedTrainSegment(trainSeg);
    };

    const handleRescheduleHotel = (bookingData) => {
        setRescheduleHotelBooking({
            ...bookingData,
            tripId: extractedTripId,
            rowId: bookingData.ROWID || bookingData.id,
        });
    };


    const handleRescheduleFlight = (item) => {
        setRescheduleFlightBooking({
            ...item,
            tripId: extractedTripId,
            rowId: item.ROWID || item.rowId || item.id  // ensure consistency on naming
        });
    };


    const handleRescheduleCar = (item) => {
        setRescheduleCarBooking({
            ...item,
            tripId: extractedTripId,
            rowId: item.ROWID || item.rowId || item.id  // ensure consistency on naming
        });
    };


    const handleRescheduleTrain = (item) => {
        setRescheduleTrainBooking({
            ...item,
            tripId: extractedTripId,
            rowId: item.ROWID || item.rowId  // ensure consistency on naming
        });
    }

    const handleRescheduleBus = (item) => {
        setRescheduleBusBooking({
            ...item,
            tripId: extractedTripId,
            rowId: item.ROWID || item.rowId  // ensure consistency on naming
        });
    }


    const handleViewHistoryHotel = (item) => {
        setViewHistoryHotelBooking({
            ...item,
            tripId: extractedTripId,    // your trip id from context/scope
            rowId: item.ROWID || item.rowId  // ensure consistency on naming
        });
    };


    const handleViewHistoryFlight = (item) => {
        setViewHistoryFlightBooking({
            ...item,
            tripId: extractedTripId,    // your trip id from context/scope
            rowId: item.ROWID || item.rowId || item.id // ensure consistency on naming
        });
    };


    const handleViewHistoryCar = (item) => {
        setViewHistoryCarBooking({
            ...item,
            tripId: extractedTripId,    // your trip id from context/scope
            rowId: item.ROWID || item.rowId || item.id // ensure consistency on naming
        });
    }


    const handleViewHistoryTrain = (item) => {
        setViewHistoryTrainBooking({
            ...item,
            tripId: extractedTripId,    // your trip id from context/scope
            rowId: item.ROWID || item.rowId  // ensure consistency on naming
        });
    }


    const handleViewHistoryBus = (item) => {
        setViewHistoryBusBooking({
            ...item,
            tripId: extractedTripId,    // your trip id from context/scope
            rowId: item.ROWID || item.rowId  // ensure consistency on naming
        });
    }


    const handleCancelClick = (item, type) => {
        setCancelBookingItem({ ...item, requestType: type });
    };


    const handleConfirmCancel = async (item, reason) => {
        try {
            const payload = {
                rowId: item.rowId || item.ROWID || item.id,
                requestType: item.requestType, // e.g., 'car', 'bus', 'train', etc.
                reason: reason,
            };

            console.log("Sending Cancel Payload:", payload);

            const response = await fetch('/server/trip_cancelation/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.status === 'success') {
                fetchAndSetData(extractedTripId); // refresh page or fetch latest
                alert("Booking cancelled successfully");
                setCancelBookingItem(null); // close modal after success
            } else {
                alert("Failed to cancel: " + result.message);
            }
        } catch (error) {
            console.error("Cancel error:", error);
            alert("Error during cancellation.");
        }
    };



    //  NEW STATE: Tracks the index of the segment whose menu is open.
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

    // Main data fetching logic
    const fetchAndSetData = async (currentTripId) => {
        if (!currentTripId) {
            setError("No Trip ID found in the provided data structure (trip.id is missing).");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const apiUrl = `/server/get_tripNumberData?trip_id=${currentTripId}`;

        try {
            const response = await fetchWithRetry(apiUrl);
            const result = await response.json();

            if (result && result.data) {
                const transformedData = transformApiData(result.data);
                setTripData(transformedData);
                setAssociatedData(result.data.associatedData || {});

                if (transformedData.bookingStatus.length > 0) {
                    const firstMode = transformedData.bookingStatus[0].charAt(0).toUpperCase() + transformedData.bookingStatus[0].slice(1);
                    setActiveTab(firstMode);
                }
            } else {
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


    useEffect(() => {
        fetchAndSetData(extractedTripId);
    }, [extractedTripId]);



    const data = tripData || {};
    const segmentsFiltered = data.segments ? data.segments.filter(s => s.type === activeTab) : [];

    // Check if the selected tab is present in the trip's actual travel modes
    const isTabActive = data.bookingStatus?.includes(activeTab.toLowerCase());

    const modeToOptionsMap = {
        flight: "Flight_Trip_Options",
        hotel: "Hotel_Trip_Options",
        car: "Car_Trip_Options",
        bus: "Bus_Trip_Options",
        train: "Train_Trip_Options"
    };

    const optionsKey = modeToOptionsMap[activeTab.toLowerCase()];
    // Get the options array from associated data or empty array fallback
    const optionsArray = associatedData[optionsKey] || [];

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




    const FlightCard = ({
        flight,
        optionsData = [],
        bookingPending,
        index,
        onViewOptions,
        openDropdownIndex,
        setOpenDropdownIndex,
        onReschedule,
        onViewHistory,
        onCancelClick,
    }) => {
        if (!flight) return null;

        const rescheduleStatus = flight.rescheduleStatus || '';
        const cancelStatus = flight.cancelStatus || '';

        const normalizedRescheduleStatus = rescheduleStatus.trim();
        const normalizedCancelStatus = cancelStatus.trim().toLowerCase();

        const seatPref = flight.seatPref || '';
        const mealPref = flight.mealPref || '';
        const hasPrefs = seatPref || mealPref;

        const hasAddedOptions = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'added');
        bookingPending = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const isBooked = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'booked');
        const hasOptionsLocal = optionsData.length > 0;

        const selectedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const bookedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'booked');

        const statusText = normalizedCancelStatus === 'cancelled'
            ? "Cancelled"
            : bookingPending
                ? "Booking pending"
                : isBooked
                    ? "Ticket booked"
                    : hasAddedOptions
                        ? "Select the options"
                        : "Waiting for Options";

        const merchantName = (bookingPending && selectedOptions.length > 0)
            ? selectedOptions[0].Merchant_Name
            : (isBooked && bookedOptions.length > 0)
                ? bookedOptions[0].Merchant_Name
                : null;

        const toggleDropdown = () => {
            if (openDropdownIndex === index) {
                setOpenDropdownIndex(null);
            } else {
                setOpenDropdownIndex(index);
            }
        };

        const isReschedule = normalizedRescheduleStatus === 'Reschedule';
        const isCancelled = normalizedCancelStatus === 'cancelled';

        return (
            <div className="flight-card1">
                {hasPrefs && (
                    <div className="preferences">
                        <span>Preferences:</span>
                        {seatPref && <span className="pref-item">Seat: {seatPref}</span>}
                        {mealPref && <span className="pref-item">Meal: {mealPref}</span>}
                    </div>
                )}

                <div className="status-section">
                    <span className="status-badge">{statusText}</span>
                    <span className="travel-agent">Travel Agent: Yet to be assigned</span>
                </div>

                <div className="flight-details">
                    <div className="flight-date">
                        <FaCalendarAlt className="icon" />
                        <div>
                            <div className="date">{flight.depDate}</div>
                            <div className="preferred-time">Preferred Time: {flight.depTime}</div>
                        </div>
                    </div>

                    <div className="flight-route">
                        <div className="from">
                            <div className="city">{flight.depCity} - {flight.depCode}</div>
                            <div className="subtext">{flight.depAirport}</div>
                        </div>
                        <div className="arrow">→</div>
                        <div className="to">
                            <div className="city">{flight.arrCity} - {flight.arrCode}</div>
                            <div className="subtext">{flight.arrAirport}</div>
                        </div>
                    </div>

                    <div className="menu-icon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        {merchantName && (
                            <span style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                                {merchantName}
                            </span>
                        )}

                        {/* {bookingPending && selectedOptions.length > 0 && (
                            <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedOptions.map((opt, i) => (
                                    <div key={i} style={{
                                        padding: "5px",
                                        color: "#353232",
                                        borderRadius: "4px",
                                        width: "fit-content",
                                        userSelect: "none",
                                        fontSize: "12px",
                                    }}>
                                        Amount: {opt.Currency_id}{opt.Amount}
                                    </div>
                                ))}
                            </div>
                        )} */}

                        {isBooked && bookedOptions.length > 0 && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                    <button
                                        className="view-ticket-btn"
                                        onClick={() => {
                                            // handle view ticket click
                                        }}
                                    >
                                        View Ticket
                                    </button>
                                    <div style={{ position: "relative" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={toggleDropdown}
                                        />
                                        {openDropdownIndex === index && (
                                            <div style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}>
                                                <button
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px 12px",
                                                        textAlign: "left",
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        // handle download ticket action
                                                    }}
                                                >
                                                    Download Ticket
                                                </button>

                                                {isCancelled ? (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(flight);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                ) : isReschedule ? (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(flight);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(flight, "flight");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(flight);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(flight);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(flight, "flight");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {bookedOptions.map((opt, i) => (
                                        <div key={i} style={{
                                            padding: "5px",
                                            color: "#353232",
                                            borderRadius: "4px",
                                            width: "fit-content",
                                            userSelect: "none",
                                            fontSize: "12px",
                                            backgroundColor: "#ddd",
                                        }}>
                                            Amount: {opt.Currency_id}{opt.Amount}
                                        </div>
                                    ))}
                                </div> */}
                            </>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {(!bookingPending && !isBooked && hasAddedOptions) && (
                                <button className="view-options-btn" onClick={onViewOptions}>
                                    View Option
                                </button>
                            )}

                            {!isBooked && !bookingPending && (hasAddedOptions || !hasOptionsLocal) && (
                                <div style={{ position: "relative", marginTop: "4px" }}>
                                    <FaEllipsisH
                                        style={{ cursor: "pointer", color: "#555" }}
                                        onClick={toggleDropdown}
                                    />
                                    {openDropdownIndex === index && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}
                                        >
                                            {isCancelled ? (
                                                <button className='reschedle-cancel'
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        if (onViewHistory) onViewHistory(flight);
                                                    }}
                                                >
                                                    View Previous Itineraries
                                                </button>
                                            ) : isReschedule ? (
                                                <>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onReschedule) onReschedule(flight);
                                                        }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onCancelClick) onCancelClick(flight, "flight");
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(flight);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onReschedule) onReschedule(flight);
                                                        }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onCancelClick) onCancelClick(flight, "flight");
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const HotelCard = ({
        hotel,
        optionsData = [],
        bookingPending,
        index,
        onViewOptions,
        openDropdownIndex,
        setOpenDropdownIndex,
        onReschedule,
        onViewHistory,
        onCancelClick,
    }) => {
        if (!hotel) return null;
        const rescheduleStatus = hotel.rescheduleStatus || '';
        const cancelStatus = hotel.cancelStatus || '';

        // Analyze options data for status
        const hasAddedOptions = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'added');
        bookingPending = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const isBooked = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'booked');
        const hasOptionsLocal = optionsData.length > 0;

        const selectedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const bookedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'booked');

        // Status text based on options and cancel status
        let statusText = "";
        if (cancelStatus.toLowerCase() === 'cancelled') {
            statusText = "Cancelled";
        } else if (bookingPending) {
            statusText = "Booking pending";
        } else if (isBooked) {
            statusText = "Ticket booked";
        } else if (hasAddedOptions) {
            statusText = "Select the options";
        } else {
            statusText = "Waiting for Options";
        }

        // Merchant name from booking or selection if exists
        const merchantName =
            (bookingPending && selectedOptions.length > 0)
                ? selectedOptions[0].Merchant_Name
                : (isBooked && bookedOptions.length > 0)
                    ? bookedOptions[0].Merchant_Name
                    : null;

        // Dropdown toggle handler
        const toggleDropdown = () => {
            if (openDropdownIndex === index) {
                setOpenDropdownIndex(null);
            } else {
                setOpenDropdownIndex(index);
            }
        };

        return (
            <div className="hotel-card1">
                {/* Status Section */}
                <div className="status-section">
                    <span className="status-badge">{statusText}</span>
                    <span className="travel-agent">Travel Agent: Yet to be assigned</span>
                </div>

                {/* Booking Details */}
                <div className="booking-details">
                    {/* Left: Hotel Name and Merchant */}
                    <div className="hotel-name">
                        <FaMapMarkerAlt className="icon" />
                        <span>{hotel.name}</span>
                        {merchantName && (
                            <span style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                                {merchantName}
                            </span>
                        )}
                    </div>

                    <div className="divider"></div>

                    {/* Center: Check-in / Check-out Dates */}
                    <div className="check-info">
                        <div className="check-in">
                            <span className="label">Check-in</span>
                            <span className="date">{hotel.checkIn}, {hotel.checkInTime}</span>
                        </div>
                        <span className="separator">-</span>
                        <div className="check-out">
                            <span className="label">Check-out</span>
                            <span className="date">{hotel.checkOut}, {hotel.checkOutTime}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Right: View Options Button and Dropdown */}
                    <div className="menu-icon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        {bookingPending && selectedOptions.length > 0 && (
                            <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedOptions.map((opt, i) => (
                                    <div key={i} style={{
                                        padding: "5px",
                                        color: "#353232",
                                        borderRadius: "4px",
                                        width: "fit-content",
                                        userSelect: "none",
                                        fontSize: "12px",
                                    }}>
                                        Amount: {opt.Currency_id}{opt.Amount}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isBooked && bookedOptions.length > 0 && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                    <button
                                        className="view-ticket-btn"
                                        onClick={() => { /* handle view ticket click */ }}
                                    >
                                        View Ticket
                                    </button>
                                    <div style={{ position: "relative" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={toggleDropdown}
                                        />
                                        {openDropdownIndex === index && (
                                            <div style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}>

                                                <button className='reschedle-cancel'
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        // handle download ticket action
                                                    }}
                                                >
                                                    Download Ticket
                                                </button>

                                                {cancelStatus.toLowerCase() !== 'cancelled' && (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) {
                                                                    onReschedule(hotel);
                                                                }
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>

                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) {
                                                                    onCancelClick(hotel, "hotel");
                                                                }
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}

                                                {(rescheduleStatus === 'Reschedule' || cancelStatus.toLowerCase() === 'cancelled') && (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) {
                                                                onViewHistory(hotel);
                                                            }
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {bookedOptions.map((opt, i) => (
                                        <div key={i} style={{
                                            padding: "5px",
                                            color: "#353232",
                                            borderRadius: "4px",
                                            width: "fit-content",
                                            userSelect: "none",
                                            fontSize: "12px",
                                            backgroundColor: "#ddd",
                                        }}>
                                            Amount: {opt.Currency_id}{opt.Amount}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {(!bookingPending && !isBooked && hasAddedOptions) && (
                                <button className="view-options-btn" onClick={onViewOptions}>
                                    View Option
                                </button>
                            )}

                            {!isBooked && !bookingPending && (hasAddedOptions || !hasOptionsLocal) && (
                                <div style={{ position: "relative", marginTop: "4px" }}>
                                    <FaEllipsisH
                                        style={{ cursor: "pointer", color: "#555" }}
                                        onClick={toggleDropdown}
                                    />
                                    {openDropdownIndex === index && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "100px",
                                                padding: "5px 0"
                                            }}
                                        >
                                            {cancelStatus.toLowerCase() !== 'cancelled' && (
                                                <>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onReschedule) {
                                                                onReschedule(hotel);
                                                            }
                                                        }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onCancelClick) {
                                                                onCancelClick(hotel, "hotel");
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                            {cancelStatus.toLowerCase() === 'cancelled' && (
                                                <button className='reschedle-cancel'
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        if (onViewHistory) {
                                                            onViewHistory(hotel);
                                                        }
                                                    }}
                                                >
                                                    View Previous Itineraries
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };




    const CarCard = ({
        car,
        optionsData = [],
        bookingPending,
        index,
        onViewOptions,
        openDropdownIndex,
        setOpenDropdownIndex,
        onReschedule,
        onViewHistory,
        onCancelClick,
    }) => {
        if (!car) return null;

        const rescheduleStatus = car.rescheduleStatus || '';
        console.log("rescheduleStatus:", rescheduleStatus);
        const cancelStatus = car.cancelStatus || '';

        const normalizedRescheduleStatus = rescheduleStatus.trim();
        const normalizedCancelStatus = cancelStatus.trim().toLowerCase();

        const hasAddedOptions = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'added');
        bookingPending = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const isBooked = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'booked');
        const hasOptionsLocal = optionsData.length > 0;

        const selectedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const bookedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'booked');

        const statusText = normalizedCancelStatus === 'cancelled'
            ? "Cancelled"
            : bookingPending
                ? "Booking pending"
                : isBooked
                    ? "Ticket booked"
                    : hasAddedOptions
                        ? "Select the options"
                        : "Waiting for Options";


        const merchantName = (bookingPending && selectedOptions.length > 0)
            ? selectedOptions[0].Merchant_Name
            : (isBooked && bookedOptions.length > 0)
                ? bookedOptions[0].Merchant_Name
                : null;

        const toggleDropdown = () => {
            if (openDropdownIndex === index) {
                setOpenDropdownIndex(null);
            } else {
                setOpenDropdownIndex(index);
            }
        };

        const isReschedule = normalizedRescheduleStatus === 'Reschedule';
        const isCancelled = normalizedCancelStatus === 'cancelled';


        return (
            <div className="car-card1">
                <div className="status-section">
                    <span className="status-badge">{statusText}</span>
                    <span className="travel-agent">Travel Agent: Yet to be assigned</span>
                </div>

                <div className="booking-details">
                    <div className="car-info">
                        {merchantName && (
                            <span style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                                {merchantName}
                            </span>
                        )}
                        <div className="car-type" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCar className="icon" />
                            <span>Car Type: {car.type}</span>
                        </div>
                        {!bookingPending && !isBooked && (
                            <div className="driver-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaUser className="icon" />
                                <span>Driver: {car.driver}</span>
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    <div className="pickup-dropoff">
                        <div className="pickup">
                            <span className="label">Pick-Up</span>
                            <span className="date">{car.pickUpDate}, {car.pickUpTime}</span>
                            <span className="location">{car.pickUpLocation}</span>
                        </div>
                        <span className="arrow">→</span>
                        <div className="dropoff">
                            <span className="label">Drop-Off</span>
                            <span className="date">{car.dropOffDate}, {car.dropOffTime}</span>
                            <span className="location">{car.dropOffLocation}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="menu-icon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <div>
                            {/* Booking pending selected options list */}
                            {bookingPending && selectedOptions.length > 0 && (
                                <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {selectedOptions.map((opt, i) => (
                                        <div key={i} style={{
                                            padding: "5px",
                                            color: "#353232",
                                            borderRadius: "4px",
                                            width: "fit-content",
                                            userSelect: "none",
                                            fontSize: "12px",
                                        }}>
                                            Amount: {opt.Currency_id}{opt.Amount}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Booked options section with dropdown */}
                            {isBooked && bookedOptions.length > 0 && (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                        <button
                                            className="view-ticket-btn"
                                            onClick={() => {
                                                // handle view ticket click
                                            }}
                                        >
                                            View Ticket
                                        </button>
                                        <div style={{ position: "relative" }}>
                                            <FaEllipsisH
                                                style={{ cursor: "pointer", color: "#555" }}
                                                onClick={toggleDropdown}
                                            />
                                            {openDropdownIndex === index && (
                                                <div style={{
                                                    position: "absolute",
                                                    top: "24px",
                                                    right: 0,
                                                    backgroundColor: "white",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                    zIndex: 1000,
                                                    minWidth: "140px",
                                                    padding: "5px 0"
                                                }}>
                                                    <button
                                                        style={{
                                                            width: "100%",
                                                            padding: "8px 12px",
                                                            textAlign: "left",
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                        }}
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            // handle download ticket action
                                                        }}
                                                    >
                                                        Download Ticket
                                                    </button>

                                                    {isCancelled ? (
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(car);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    ) : isReschedule ? (
                                                        <>
                                                            <button className='reschedle-cancel'
                                                                onClick={() => {
                                                                    setOpenDropdownIndex(null);
                                                                    if (onReschedule) onReschedule(car);
                                                                }}
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button className='reschedle-cancel'
                                                                onClick={() => {
                                                                    setOpenDropdownIndex(null);
                                                                    if (onCancelClick) onCancelClick(car, "car");
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button className='reschedle-cancel'
                                                                onClick={() => {
                                                                    setOpenDropdownIndex(null);
                                                                    if (onViewHistory) onViewHistory(car);
                                                                }}
                                                            >
                                                                View Previous Itineraries
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className='reschedle-cancel'
                                                                onClick={() => {
                                                                    setOpenDropdownIndex(null);
                                                                    if (onReschedule) onReschedule(car);
                                                                }}
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button className='reschedle-cancel'
                                                                onClick={() => {
                                                                    setOpenDropdownIndex(null);
                                                                    if (onCancelClick) onCancelClick(car, "car");
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {bookedOptions.map((opt, i) => (
                                            <div key={i} style={{
                                                padding: "5px",
                                                color: "#353232",
                                                borderRadius: "4px",
                                                width: "fit-content",
                                                userSelect: "none",
                                                fontSize: "12px",
                                                backgroundColor: "#ddd",
                                            }}>
                                                Amount: {opt.Currency_id}{opt.Amount}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {(!bookingPending && !isBooked && hasAddedOptions) && (
                                <button className="view-options-btn" onClick={onViewOptions}>
                                    View Option
                                </button>
                            )}

                            {!isBooked && !bookingPending && (hasAddedOptions || !hasOptionsLocal) && (
                                <div style={{ position: "relative", marginTop: "4px" }}>
                                    <FaEllipsisH
                                        style={{ cursor: "pointer", color: "#555" }}
                                        onClick={toggleDropdown}
                                    />
                                    {openDropdownIndex === index && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}
                                        >
                                            {isCancelled ? (
                                                <button className='reschedle-cancel'
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        if (onViewHistory) onViewHistory(car);
                                                    }}
                                                >
                                                    View Previous Itineraries
                                                </button>
                                            ) : isReschedule ? (
                                                <>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onReschedule) onReschedule(car);
                                                        }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onCancelClick) onCancelClick(car, "car");
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(car);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onReschedule) onReschedule(car);
                                                        }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onCancelClick) onCancelClick(car, "car");
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    const TrainCard = ({
        train,
        optionsData = [],
        bookingPending,
        index,
        onViewOptions,
        openDropdownIndex,
        setOpenDropdownIndex,
        onReschedule,
        onViewHistory,
        onCancelClick,
    }) => {
        if (!train) return null;

        const rescheduleStatus = train.rescheduleStatus || '';
        const cancelStatus = train.cancelStatus || '';

        const normalizedRescheduleStatus = rescheduleStatus.trim();
        const normalizedCancelStatus = cancelStatus.trim().toLowerCase();

        // Analyze option statuses
        const hasAddedOptions = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'added');
        bookingPending = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const isBooked = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'booked');
        const hasOptionsLocal = optionsData.length > 0;

        const selectedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const bookedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'booked');

        const statusText = normalizedCancelStatus === 'cancelled'
            ? "Cancelled"
            : bookingPending
                ? "Booking pending"
                : isBooked
                    ? "Ticket booked"
                    : hasAddedOptions
                        ? "Select the options"
                        : "Waiting for Options";

        const merchantName = (bookingPending && selectedOptions.length > 0)
            ? selectedOptions[0].Merchant_Name
            : (isBooked && bookedOptions.length > 0)
                ? bookedOptions[0].Merchant_Name
                : null;

        const toggleDropdown = () => {
            if (openDropdownIndex === index) {
                setOpenDropdownIndex(null);
            } else {
                setOpenDropdownIndex(index);
            }
        };

        const isReschedule = normalizedRescheduleStatus === 'Reschedule';
        const isCancelled = normalizedCancelStatus === 'cancelled';

        return (
            <div className="transfer-card">
                {/* Status Section */}
                <div className="status-section">
                    <span className="status-badge">{statusText}</span>
                    <span className="travel-agent">Travel Agent: Yet to be assigned</span>
                </div>

                {/* Booking Details */}
                <div className="booking-details">
                    <div className="transfer-date1">
                        <div>
                            {merchantName && (
                                <span style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                                    {merchantName}
                                </span>
                            )}
                        </div>
                        <div className="transfer-date">
                            <FaCalendarAlt className="icon" />
                            <span>{train.date}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="transfer-route">
                        <div className="departure">
                            <span className="label">Departure</span>
                            <span className="location">{train.departure}</span>
                        </div>
                        <span className="arrow">→</span>
                        <div className="arrival">
                            <span className="label">Arrival</span>
                            <span className="location">{train.arrival}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Options, Merchant and Dropdown */}
                    <div className="menu-icon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>

                        {/* Booking pending selected options list */}
                        {bookingPending && selectedOptions.length > 0 && (
                            <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedOptions.map((opt, i) => (
                                    <div key={i} style={{
                                        padding: "5px",
                                        color: "#353232",
                                        borderRadius: "4px",
                                        width: "fit-content",
                                        userSelect: "none",
                                        fontSize: "12px",
                                    }}>
                                        Amount: {opt.Currency_id}{opt.Amount}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Booked options section with dropdown */}
                        {isBooked && bookedOptions.length > 0 && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                    <button
                                        className="view-ticket-btn"
                                        onClick={() => {
                                            // handle view ticket click
                                        }}
                                    >
                                        View Ticket
                                    </button>
                                    <div style={{ position: "relative" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={toggleDropdown}
                                        />
                                        {openDropdownIndex === index && (
                                            <div style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}>
                                                <button
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px 12px",
                                                        textAlign: "left",
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        // handle download ticket action
                                                    }}
                                                >
                                                    Download Ticket
                                                </button>

                                                {isCancelled ? (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(train);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                ) : isReschedule ? (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(train);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(train, "train");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(train);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(train);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(train, "train");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {bookedOptions.map((opt, i) => (
                                        <div key={i} style={{
                                            padding: "5px",
                                            color: "#353232",
                                            borderRadius: "4px",
                                            width: "fit-content",
                                            userSelect: "none",
                                            fontSize: "12px",
                                            backgroundColor: "#ddd",
                                        }}>
                                            Amount: {opt.Currency_id}{opt.Amount}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {(!bookingPending && !isBooked && hasAddedOptions && !isCancelled) && (
                                <button className="view-options-btn" onClick={onViewOptions}>
                                    View Option
                                </button>
                            )}

                            {
                                !isBooked && !bookingPending && (hasAddedOptions || !hasOptionsLocal) && (
                                    <div style={{ position: "relative", marginTop: "4px" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={() => toggleDropdown()}
                                        />
                                        {openDropdownIndex === index && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "24px",
                                                    right: 0,
                                                    backgroundColor: "white",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                    zIndex: 1000,
                                                    minWidth: "140px",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                {isCancelled ? (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(train);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                ) : isReschedule ? (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(train);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(train, "train");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(train);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(train);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(train, "train");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const BusCard = ({
        bus,
        optionsData = [],
        bookingPending,
        index,
        onViewOptions,
        openDropdownIndex,
        setOpenDropdownIndex,
        onReschedule,
        onViewHistory,
        onCancelClick,
    }) => {
        if (!bus) return null;

        const rescheduleStatus = bus.rescheduleStatus || '';
        const cancelStatus = bus.cancelStatus || '';

        const normalizedRescheduleStatus = rescheduleStatus.trim();
        const normalizedCancelStatus = cancelStatus.trim().toLowerCase();

        // Analyze option statuses
        const hasAddedOptions = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'added');
        bookingPending = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const isBooked = optionsData.some(opt => (opt.Option_Status || '').toLowerCase() === 'booked');
        const hasOptionsLocal = optionsData.length > 0;

        const selectedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'selected');
        const bookedOptions = optionsData.filter(opt => (opt.Option_Status || '').toLowerCase() === 'booked');

        const statusText = normalizedCancelStatus === 'cancelled'
            ? "Cancelled"
            : bookingPending
                ? "Booking pending"
                : isBooked
                    ? "Ticket booked"
                    : hasAddedOptions
                        ? "Select the options"
                        : "Waiting for Options";

        const merchantName = (bookingPending && selectedOptions.length > 0)
            ? selectedOptions[0].Merchant_Name
            : (isBooked && bookedOptions.length > 0)
                ? bookedOptions[0].Merchant_Name
                : null;

        const toggleDropdown = () => {
            if (openDropdownIndex === index) {
                setOpenDropdownIndex(null);
            } else {
                setOpenDropdownIndex(index);
            }
        };

        const isReschedule = normalizedRescheduleStatus === 'Reschedule';
        const isCancelled = normalizedCancelStatus === 'cancelled';

        return (
            <div className="transfer-card">
                {/* Status Section */}
                <div className="status-section">
                    <span className="status-badge">{statusText}</span>
                    <span className="travel-agent">Travel Agent: Yet to be assigned</span>
                </div>

                {/* Booking Details */}
                <div className="booking-details">
                    <div className="transfer-date1">
                        <div>
                            {merchantName && (
                                <span style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                                    {merchantName}
                                </span>
                            )}
                        </div>
                        <div className="transfer-date">
                            <FaCalendarAlt className="icon" />
                            <span>{bus.date}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="transfer-route">
                        <div className="departure">
                            <span className="label">Departure</span>
                            <span className="location">{bus.departure}</span>
                        </div>
                        <span className="arrow">→</span>
                        <div className="arrival">
                            <span className="label">Arrival</span>
                            <span className="location">{bus.arrival}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Options, Merchant and Dropdown */}
                    <div className="menu-icon" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        {/* Booking pending selected options list */}
                        {bookingPending && selectedOptions.length > 0 && (
                            <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedOptions.map((opt, i) => (
                                    <div key={i} style={{
                                        padding: "5px",
                                        color: "#353232",
                                        borderRadius: "4px",
                                        width: "fit-content",
                                        userSelect: "none",
                                        fontSize: "12px",
                                    }}>
                                        Amount: {opt.Currency_id}{opt.Amount}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Booked options section with dropdown */}
                        {isBooked && bookedOptions.length > 0 && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                    <button
                                        className="view-ticket-btn"
                                        onClick={() => {
                                            // handle view ticket click
                                        }}
                                    >
                                        View Ticket
                                    </button>
                                    <div style={{ position: "relative" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={toggleDropdown}
                                        />
                                        {openDropdownIndex === index && (
                                            <div style={{
                                                position: "absolute",
                                                top: "24px",
                                                right: 0,
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                minWidth: "140px",
                                                padding: "5px 0"
                                            }}>
                                                <button
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px 12px",
                                                        textAlign: "left",
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                    onClick={() => {
                                                        setOpenDropdownIndex(null);
                                                        // handle download ticket action
                                                    }}
                                                >
                                                    Download Ticket
                                                </button>

                                                {isCancelled ? (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(bus);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                ) : isReschedule ? (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(bus);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(bus, "bus");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(bus);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(bus);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(bus, "bus");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="booking-options-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {bookedOptions.map((opt, i) => (
                                        <div key={i} style={{
                                            padding: "5px",
                                            color: "#353232",
                                            borderRadius: "4px",
                                            width: "fit-content",
                                            userSelect: "none",
                                            fontSize: "12px",
                                            backgroundColor: "#ddd",
                                        }}>
                                            Amount: {opt.Currency_id}{opt.Amount}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {(!bookingPending && !isBooked && hasAddedOptions && !isCancelled) && (
                                <button className="view-options-btn" onClick={onViewOptions}>
                                    View Option
                                </button>
                            )}

                            {/* Show ellipsis if booked (covered above), OR if options are ADDED, OR if there are NO options at all (Waiting for Options), with added !bookingPending */}
                            {
                                !isBooked && !bookingPending && (hasAddedOptions || !hasOptionsLocal) && (
                                    <div style={{ position: "relative", marginTop: "4px" }}>
                                        <FaEllipsisH
                                            style={{ cursor: "pointer", color: "#555" }}
                                            onClick={() => toggleDropdown()}
                                        />
                                        {openDropdownIndex === index && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "24px",
                                                    right: 0,
                                                    backgroundColor: "white",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                    zIndex: 1000,
                                                    minWidth: "140px",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                {isCancelled ? (
                                                    <button className='reschedle-cancel'
                                                        onClick={() => {
                                                            setOpenDropdownIndex(null);
                                                            if (onViewHistory) onViewHistory(bus);
                                                        }}
                                                    >
                                                        View Previous Itineraries
                                                    </button>
                                                ) : isReschedule ? (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(bus);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(bus, "bus");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onViewHistory) onViewHistory(bus);
                                                            }}
                                                        >
                                                            View Previous Itineraries
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onReschedule) onReschedule(bus);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button className='reschedle-cancel'
                                                            onClick={() => {
                                                                setOpenDropdownIndex(null);
                                                                if (onCancelClick) onCancelClick(bus, "bus");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setOpenDropdownIndex(null);
    };

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
                        {segmentsFiltered.length === 0 && isTabActive && (
                            <div className="empty-segment-box">
                                No detailed data found for the <b>{activeTab}</b> segment, but the mode is included in the trip request.
                            </div>
                        )}

                        {!isTabActive && (
                            <div className="empty-segment-box">
                                This trip does not include <b>{activeTab}</b> segments.
                            </div>
                        )}

                        {!isTabActive && (
                            <div className="empty-segment-box">
                                This trip does not include <b>{activeTab}</b> segments.
                            </div>
                        )}

                        {isTabActive && segmentsFiltered.length > 0 && (
                            <>
                                {activeTab === 'Flight' && segmentsFiltered.map((flightSeg, idx) => {
                                    const currentFlightRowId = flightSeg.ROWID || flightSeg.id;
                                    const optionsForThisFlight = (associatedData.Flight_Trip_Options || []).filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(currentFlightRowId)
                                    );
                                    const segmentOptions = optionsArray.filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(flightSeg.id)
                                    );
                                    const bookingPendingForThisFlight = optionsForThisFlight.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'selected'
                                    );
                                    const isBookedForThisFlight = optionsForThisFlight.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'booked'
                                    );
                                    const hasOptionsForThisFlight = optionsForThisFlight.length > 0;


                                    return (
                                        <FlightCard
                                            key={idx}
                                            flight={flightSeg}
                                            hasOptions={hasOptionsForThisFlight}
                                            bookingPending={bookingPendingForThisFlight}
                                            optionsData={segmentOptions}
                                            onViewOptions={() => handleViewOptionsClick(flightSeg)}
                                            index={idx}
                                            openDropdownIndex={openDropdownIndex}
                                            setOpenDropdownIndex={setOpenDropdownIndex}
                                            onReschedule={handleRescheduleFlight}
                                            onViewHistory={handleViewHistoryFlight}
                                            onCancelClick={(item, type) => handleCancelClick(item, type)}
                                        />
                                    );
                                })}

                                {activeTab === 'Hotel' && segmentsFiltered.map((hotelSeg, idx) => {
                                    const currentHotelRowId = hotelSeg.ROWID || hotelSeg.id;
                                    const optionsForThisHotel = (associatedData.Hotel_Trip_Options || []).filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(currentHotelRowId)
                                    );
                                    const segmentOptions = optionsArray.filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(hotelSeg.id)
                                    );
                                    const bookingPendingForThisHotel = optionsForThisHotel.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'selected'
                                    );
                                    const isBookedForThisHotel = optionsForThisHotel.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'booked'
                                    );
                                    const hasOptionsForThisHotel = optionsForThisHotel.length > 0;

                                    const hotel = {
                                        name: hotelSeg.from?.cityName || 'Hotel Name',
                                        checkIn: hotelSeg.date?.split(' To ')[0] || 'Check-in Date',
                                        checkOut: hotelSeg.date?.split(' To ')[1] || 'Check-out Date',
                                        checkInTime: hotelSeg.checkInTime,
                                        checkOutTime: hotelSeg.checkOutTime,
                                        ROWID: currentHotelRowId,
                                        description: hotelSeg.description || 'No description available',
                                        locationCity: hotelSeg.locationCity || 'Unknown City',
                                        rescheduleStatus: hotelSeg.rescheduleStatus || '',
                                        cancelStatus: hotelSeg.cancelStatus || '',

                                    };

                                    return (
                                        <HotelCard
                                            key={idx}
                                            hotel={hotel}
                                            hasOptions={hasOptionsForThisHotel}
                                            bookingPending={bookingPendingForThisHotel}
                                            optionsData={segmentOptions}
                                            index={idx}
                                            openDropdownIndex={openDropdownIndex}
                                            setOpenDropdownIndex={setOpenDropdownIndex}
                                            onViewOptions={() => handleViewOptionsClickHotel(hotelSeg)}
                                            onReschedule={handleRescheduleHotel}
                                            onViewHistory={handleViewHistoryHotel}
                                            onCancelClick={(item, type) => handleCancelClick(item, type)}

                                        />
                                    );
                                })}

                                {activeTab === 'Car' && segmentsFiltered.map((carSeg, idx) => {
                                    const currentCarRowId = carSeg.ROWID || carSeg.id;
                                    const optionsForThisCar = (associatedData.Car_Trip_Options || []).filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(currentCarRowId)
                                    );
                                    const segmentOptions = optionsArray.filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(carSeg.id)
                                    );
                                    const bookingPendingForThisCar = optionsForThisCar.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'selected'
                                    );
                                    const isBookedForThisCar = optionsForThisCar.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'booked'
                                    );
                                    const hasOptionsForThisCar = optionsForThisCar.length > 0;

                                    const car = {
                                        type: carSeg.carType || 'N/A',
                                        driver: carSeg.driverNeeded || 'No',
                                        pickUpDate: carSeg.date || 'Pick-Up Date',
                                        pickUpLocation: carSeg.from?.cityName || 'Pick-Up Location',
                                        dropOffDate: carSeg.date || 'Drop-Off Date',
                                        dropOffLocation: carSeg.to?.cityName || 'Drop-Off Location',
                                        pickUpTime: carSeg.carDepTime,
                                        dropOffTime: carSeg.carArrTime,
                                        description: carSeg.description || 'No description available',
                                        ROWID: currentCarRowId,
                                        rescheduleStatus: carSeg.rescheduleStatus || '',
                                        cancelStatus: carSeg.cancelStatus || '',
                                    };

                                    return (
                                        <CarCard
                                            key={idx}
                                            car={car}
                                            hasOptions={hasOptionsForThisCar}
                                            bookingPending={bookingPendingForThisCar}
                                            optionsData={segmentOptions}
                                            index={idx}
                                            openDropdownIndex={openDropdownIndex}
                                            setOpenDropdownIndex={setOpenDropdownIndex}
                                            onViewOptions={() => handleViewOptionsClickCar(carSeg)}
                                            onReschedule={handleRescheduleCar}
                                            onViewHistory={handleViewHistoryCar}
                                            onCancelClick={(item, type) => handleCancelClick(item, type)}
                                        />
                                    );
                                })}

                                {activeTab === 'Bus' && segmentsFiltered.map((busSeg, idx) => {
                                    const currentBusRowId = busSeg.ROWID || busSeg.id;
                                    const optionsForThisBus = (associatedData.Bus_Trip_Options || []).filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(currentBusRowId)
                                    );
                                    const segmentOptions = optionsArray.filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(busSeg.id)
                                    );
                                    const bookingPendingForThisBus = optionsForThisBus.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'selected'
                                    );
                                    const isBookedForThisBus = optionsForThisBus.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'booked'
                                    );
                                    const hasOptionsForThisBus = optionsForThisBus.length > 0;


                                    const bus = {
                                        date: busSeg.date || 'Date N/A',
                                        departure: busSeg.from?.cityName || 'Unknown',
                                        arrival: busSeg.to?.cityName || 'Unknown',
                                        ROWID: currentBusRowId,
                                        description: busSeg.description || 'No description available',
                                        rescheduleStatus: busSeg.rescheduleStatus || '',
                                        cancelStatus: busSeg.cancelStatus || '',
                                    };

                                    return (
                                        <BusCard
                                            key={idx}
                                            bus={bus}
                                            hasOptions={hasOptionsForThisBus}
                                            bookingPending={bookingPendingForThisBus}
                                            optionsData={segmentOptions}
                                            index={idx}
                                            openDropdownIndex={openDropdownIndex}
                                            setOpenDropdownIndex={setOpenDropdownIndex}
                                            onViewOptions={() => handleViewOptionsClickBus(busSeg)}
                                            onReschedule={handleRescheduleBus}
                                            onViewHistory={handleViewHistoryBus}
                                            onCancelClick={(item, type) => handleCancelClick(item, type)}
                                        />
                                    );
                                })}

                                {activeTab === 'Train' && segmentsFiltered.map((trainSeg, idx) => {
                                    const currentTrainRowId = trainSeg.ROWID || trainSeg.id;
                                    const optionsForThisTrain = (associatedData.Train_Trip_Options || []).filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(currentTrainRowId)
                                    );
                                    const segmentOptions = optionsArray.filter(
                                        (opt) => String(opt.Trip_Line_Item_ID) === String(trainSeg.id)
                                    );
                                    const bookingPendingForThisTrain = optionsForThisTrain.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'selected'
                                    );
                                    const isBookedForThisTrain = optionsForThisTrain.some(
                                        (opt) => (opt.Option_Status || '').toLowerCase() === 'booked'
                                    );
                                    const hasOptionsForThisTrain = optionsForThisTrain.length > 0;

                                    const train = {
                                        date: trainSeg.date || 'Date N/A',
                                        departure: trainSeg.from?.cityName || 'Unknown',
                                        arrival: trainSeg.to?.cityName || 'Unknown',
                                        rescheduleStatus: trainSeg.rescheduleStatus || '',
                                        cancelStatus: trainSeg.cancelStatus || '',
                                        ROWID: currentTrainRowId,
                                        description: trainSeg.description || 'No description available',
                                    };

                                    return (
                                        <TrainCard
                                            key={idx}
                                            train={train}
                                            hasOptions={hasOptionsForThisTrain}
                                            bookingPending={bookingPendingForThisTrain}
                                            optionsData={segmentOptions}
                                            index={idx}
                                            openDropdownIndex={openDropdownIndex}
                                            setOpenDropdownIndex={setOpenDropdownIndex}
                                            onViewOptions={() => handleViewOptionsClickTrain(trainSeg)}
                                            onReschedule={handleRescheduleTrain}
                                            onViewHistory={handleViewHistoryTrain}
                                            onCancelClick={(item, type) => handleCancelClick(item, type)}
                                        />
                                    );
                                })}
                            </>
                        )}

                    </div>
                </div>

                {selectedFlightSegment && (
                    <FlightSelectionOptions
                        flight={selectedFlightSegment}
                        tripId={extractedTripId}  // use your actual ID field name here
                        onClose={() => setSelectedFlightSegment(null)}
                        onConfirmSuccess={() => fetchAndSetData(extractedTripId)}

                    />
                )}


                {selectedHotelSegment && (
                    <HotelSelectionOptions
                        hotel={selectedHotelSegment}
                        tripId={extractedTripId}  // use your actual ID field name here
                        onClose={() => setSelectedHotelSegment(null)}
                        onConfirmSuccess={() => fetchAndSetData(extractedTripId)}

                    />
                )}

                {selectedCarSegment && (
                    <CarSelectionOptions
                        car={selectedCarSegment}
                        tripId={extractedTripId}  // use your actual ID field name here
                        onClose={() => setSelectedCarSegment(null)}
                        onConfirmSuccess={() => fetchAndSetData(extractedTripId)}

                    />
                )}


                {selectedBusSegment && (
                    <BusSelectionOptions
                        bus={selectedBusSegment}
                        tripId={extractedTripId}
                        onClose={() => setSelectedBusSegment(null)}
                        onConfirmSuccess={() => fetchAndSetData(extractedTripId)}

                    />
                )}



                {selectedTrainSegment && (
                    <TrainSelectionOptions
                        train={selectedTrainSegment}
                        tripId={extractedTripId}  // use your actual ID field name here
                        onClose={() => setSelectedTrainSegment(null)}
                        onConfirmSuccess={() => fetchAndSetData(extractedTripId)}
                    />
                )}


                {rescheduleHotelBooking && (
                    <HotelRescheduleForm
                        bookingData={rescheduleHotelBooking}
                        onClose={() => setRescheduleHotelBooking(null)}
                        onSave={() => fetchAndSetData(extractedTripId)}
                    />
                )}


                {rescheduleFlightBooking && (
                    <FlightRescheduleForm
                        bookingData={rescheduleFlightBooking}
                        onClose={() => setRescheduleFlightBooking(null)}
                        onSave={() => fetchAndSetData(extractedTripId)}
                    />
                )}

                {rescheduleCarBooking && (
                    <CarRescheduleForm
                        bookingData={rescheduleCarBooking}
                        onClose={() => setRescheduleCarBooking(null)}
                        onSave={() => fetchAndSetData(extractedTripId)}
                    />
                )}

                {rescheduleTrainBooking && (
                    <TrainRescheduleForm
                        bookingData={rescheduleTrainBooking}
                        onClose={() => setRescheduleTrainBooking(null)}
                        onSave={() => fetchAndSetData(extractedTripId)}
                    />
                )}

                {rescheduleBusBooking && (
                    <BusRescheduleForm
                        bookingData={rescheduleBusBooking}
                        onClose={() => setRescheduleBusBooking(null)}
                        onSave={() => fetchAndSetData(extractedTripId)}
                    />
                )}



                {viewHistoryHotelBooking && (
                    <HotelPreviousItineraries
                        bookingData={viewHistoryHotelBooking}
                        onClose={() => setViewHistoryHotelBooking(null)}
                    />
                )}

                {viewHistoryFlightBooking && (
                    <FlightPreviousItineraries
                        bookingData={viewHistoryFlightBooking}
                        onClose={() => setViewHistoryFlightBooking(null)}
                    />
                )}

                {viewHistoryCarBooking && (
                    <CarPreviousItineraries
                        bookingData={viewHistoryCarBooking}
                        onClose={() => setViewHistoryCarBooking(null)}
                    />
                )}


                {viewHistoryTrainBooking && (
                    <TrainPreviousItineraries
                        bookingData={viewHistoryTrainBooking}
                        onClose={() => setViewHistoryTrainBooking(null)}
                    />
                )}

                {viewHistoryBusBooking && (
                    <BusPreviousItineraries
                        bookingData={viewHistoryBusBooking}
                        onClose={() => setViewHistoryBusBooking(null)}
                    />
                )}

                



                {cancelBookingItem && (
                    <CancelItineraryModal
                        bookingData={cancelBookingItem}
                        onClose={() => setCancelBookingItem(null)}
                        onConfirm={handleConfirmCancel}
                    />
                )}



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