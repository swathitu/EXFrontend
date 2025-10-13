import React, { useState, useEffect, useMemo } from "react";
import "./TripView.css";
import TripOverView from "./TripOverView";

// Helper function to extract the destination from the new data structure
const getDestination = (trip) => {
  // Check the associatedData for any arrival city
  const associatedData = trip.associatedData || {};

  // Define an array of keys to check for arrival city in order of preference
  const arrCityKeys = [
    "FLIGHT_ARR_CITY",
    "TRAIN_ARR_CITY",
    "BUS_ARR_CITY",
    "CAR_ARR_CITY",
    "HOTEL_CITY", // Assuming hotel city can be a destination
  ];

  // Function to find the first non-null/non-empty arrival city
  const findArrCity = (dataArray) => {
    if (!Array.isArray(dataArray)) return null;
    for (const item of dataArray) {
      for (const key of arrCityKeys) {
        if (item[key]) {
          return item[key];
        }
      }
    }
    return null;
  };

  // Check all associated data arrays
  const carDest = findArrCity(associatedData.CarData);
  if (carDest) return carDest;

  const flightDest = findArrCity(associatedData.FlightData);
  if (flightDest) return flightDest;

  const trainDest = findArrCity(associatedData.TrainData);
  if (trainDest) return trainDest;

  const busDest = findArrCity(associatedData.BusData);
  if (busDest) return busDest;

  const hotelDest = findArrCity(associatedData.HotelData);
  if (hotelDest) return hotelDest;

  // Fallback to the top-level DESTINATION_COUNTRY if no segment data is found
  return trip.DESTINATION_COUNTRY || "N/A";
};

// Helper function to extract all relevant dates from a single segment item
const extractDates = (item, prefix) => {
  const dates = [];
  const depDateKey = `${prefix}_DEP_DATE`;
  const arrDateKey = `${prefix}_ARR_DATE`;
  const checkInKey = `${prefix}_CHECK_IN_DATE`; // For Hotel
  const checkOutKey = `${prefix}_CHECK_OUT_DATE`; // For Hotel

  // Check departure/check-in date
  if (item[depDateKey] && item[depDateKey] !== "null") {
    dates.push(item[depDateKey]);
  } else if (item[checkInKey] && item[checkInKey] !== "null") {
    dates.push(item[checkInKey]);
  }

  // Check arrival/check-out date
  if (item[arrDateKey] && item[arrDateKey] !== "null") {
    dates.push(item[arrDateKey]);
  } else if (item[checkOutKey] && item[checkOutKey] !== "null") {
    dates.push(item[checkOutKey]);
  }

  // Filter out duplicates and ensure we only have valid date strings (YYYY-MM-DD format)
  return [
    ...new Set(
      dates.filter((date) => date && date.match(/^\d{4}-\d{2}-\d{2}$/))
    ),
  ];
};


const TripView = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  // *** MODIFICATION 4: New state for the active tab ***
  const [activeTab, setActiveTab] = useState("all"); 

  // Define the tabs for easy rendering and mapping
  // 'submitter' is a placeholder for a status that might be represented by user context later, 
  // but for now, we'll keep it as a tab option. We'll show all non-Rejected/Draft/Approved trips under it for simplicity.
  const tabs = [
    { name: "All", key: "all" },
    { name: "Submitted", key: "submitted" }, // Changed 'submitter' to 'submitted' for clarity on status
    { name: "Rejected", key: "rejected" },
    { name: "Draft", key: "draft" },
    { name: "Approved", key: "approved" },
  ];


  // Main data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // *** MODIFICATION 1: Change API endpoint ***
        const response = await fetch("/server/get_newTripData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        // The new API structure returns an array of trip objects, each containing its segments.
        const rawTrips = apiData.data || [];

        // STEP 1: Process each top-level trip item
        const finalGroupedData = rawTrips.map((item) => {
          // *** MODIFICATION 2: Use ROWID as Trip ID ***
          const tripId = item.ROWID;

          // Helper object to map data keys to their prefixes
          const segmentDataMap = {
            CarData: "CAR",
            FlightData: "FLIGHT",
            TrainData: "TRAIN",
            BusData: "BUS",
            HotelData: "HOTEL",
          };

          const allDates = [];
          const bookingStatus = new Set(); // Use a Set to collect unique modes

          // Iterate through all associated data types (segments)
          Object.keys(segmentDataMap).forEach((dataKey) => {
            const prefix = segmentDataMap[dataKey];
            const segments = item.associatedData?.[dataKey] || [];

            segments.forEach((segment) => {
              // Collect dates from the segment
              allDates.push(...extractDates(segment, prefix));

              // Add travel mode to booking status based on the key
              const normalizedMode = prefix.toLowerCase(); // e.g., 'car', 'flight'
              // Normalize to the intended names: plane, bus, car, train, hotel
              let displayMode;
              if (normalizedMode === 'flight') displayMode = 'plane';
              else displayMode = normalizedMode;
              
              bookingStatus.add(displayMode);
            });
          });

          // Process Dates
          const uniqueDates = [...new Set(allDates)].sort(); // Deduplicate and sort dates

          let tripDatesString = "N/A";
          if (uniqueDates.length > 0) {
            // Earliest date is the first element, latest date is the last element
            const startDate = uniqueDates[0];
            const endDate = uniqueDates[uniqueDates.length - 1];
            tripDatesString = `${startDate} - ${endDate}`;
          }

          return {
            id: tripId,
            tripName: item.TRIP_NAME,
            // Calculated tripDates using the earliest dep and latest arr date
            tripDates: tripDatesString,
            destination: getDestination(item),
            status: item.STATUS, // *** MODIFICATION 3: Status key is now 'STATUS' ***
            approver: item.APPROVER_NAME,
            bookingStatus: [...bookingStatus], // Convert Set back to Array
          };
        });

        setTrips(finalGroupedData);
      } catch (error) {
        console.error("Failed to fetch trip data:", error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // *** MODIFICATION 5: Filter trips based on the activeTab using useMemo ***
  const filteredTrips = useMemo(() => {
    if (activeTab === "all") {
      return trips;
    }

    // Standardize the status names to lowercase for comparison
    const targetStatus = activeTab.toUpperCase(); 

    // Handle the 'submitted' tab which captures trips that are not Draft, Approved, or Rejected
    if (activeTab === "submitted") {
      return trips.filter((trip) => {
        const status = trip.status?.toUpperCase();
        return status !== "DRAFT" && status !== "APPROVED" && status !== "REJECTED";
      });
    }

    return trips.filter(
      (trip) => trip.status?.toUpperCase() === targetStatus
    );
  }, [trips, activeTab]);


  // Handler for row clicks
  const handleRowClick = (trip) => {
    console.log('Selected Trip Data:', trip); 
    setSelectedTrip(trip);
    
  };

  // Handler for "Back" button in the detailed view
  const handleBackToList = () => {
    setSelectedTrip(null);
  };


  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "status-approved";
      case "DRAFT":
        return "status-draft";
      case "REJECTED":
        return "status-rejected"; // Added rejected status style
      default:
        return "status-default";
    }
  };

  const getInitials = (name) => {
    if (!name) return "-";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "-";
  };


  if (selectedTrip) {
    return <TripOverView trip={selectedTrip} onBack={handleBackToList} />;
  }


  return (
    <>
      <div className="trip-view-container">
        {/* *** MODIFICATION 6: Add the Tabs component *** */}
        <div className="trip-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        {/* --- */}
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="trip-table">
              <thead>
                <tr>
                  <th>TRIP#</th>
                  <th>TRIP DETAILS</th>
                  <th>DESTINATION</th>
                  <th>STATUS</th>
                  <th>APPROVER</th>
                  <th>BOOKING STATUS</th>
                  {/* <th className="action-column">
                    ACTION
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-row">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTrips.length > 0 ? (
                  // *** MODIFICATION 7: Render filteredTrips instead of trips ***
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} onClick={() => handleRowClick(trip)}>
                      
                      <td className="trip-id">{trip.id}</td>
                      <td className="trip-details">
                        <div className="details-group">
                          <span className="trip-name">{trip.tripName}</span>
                          <span className="trip-dates">{trip.tripDates}</span>
                        </div>
                      </td>
                      <td>{trip.destination}</td>
                      <td>
                        <span
                          className={`status-tag ${getStatusClass(
                            trip.status
                          )}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td>
                        <div className="approver-info">
                          <div className="approver-avatar">
                            {getInitials(trip.approver)}
                          </div>
                          {trip.approver}
                        </div>
                      </td>
                      <td>
                        <div className="booking-status-icons">
                          {trip.bookingStatus.map((item, index) => (
                            <div key={index} className="booking-icon-wrapper">
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                      {/* <td className="action-column">
                        <button className="action-button">
                          ...
                        </button>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="loading-row">
                      No trips found for the status: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TripView;