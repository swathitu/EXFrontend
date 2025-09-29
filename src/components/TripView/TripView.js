import React, { useState, useEffect } from "react";
import "./TripView.css";
import TripOverView from "./TripOverView";


const getDestination = (trip) => {
  const arr =
    trip.FLIGHT_ARR_CITY ||
    trip.TRAIN_ARR_CITY ||
    trip.BUS_ARR_CITY ||
    trip.CAR_ARR_CITY;
  return arr || "N/A";
};

const TripView = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);


  // Helper function to extract all relevant dates from a single trip item
  const extractDates = (item) => {
    const dates = [];
    const modePrefixes = ["FLIGHT", "TRAIN", "BUS", "CAR", "HOTEL"];

    modePrefixes.forEach((prefix) => {
      const depDateKey = `${prefix}_DEP_DATE`;
      const arrDateKey = `${prefix}_ARR_DATE`;

      // Check departure date
      if (item[depDateKey] && item[depDateKey] !== "null") {
        dates.push(item[depDateKey]);
      }

      // Check arrival date
      if (item[arrDateKey] && item[arrDateKey] !== "null") {
        dates.push(item[arrDateKey]);
      }
    });

    // Filter out duplicates and ensure we only have valid date strings
    return [
      ...new Set(
        dates.filter((date) => date && date.match(/^\d{4}-\d{2}-\d{2}$/))
      ),
    ];
  };

  // Main data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetching data from the API endpoint as requested
        const response = await fetch("/server/get_TripData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        // STEP 1: Group all raw data items (segments) by TRIP_NUMBER
        const groupedByTripNumber = apiData.data.reduce((acc, item) => {
          const tripNumber = item.TRIP_NUMBER;
          if (!acc[tripNumber]) {
            // Initialize the structure to hold all segments and basic trip info
            acc[tripNumber] = {
              // Store the first item's details as the base (they should be the same across segments)
              representativeItem: item,
              segments: [],
              allDates: [], // Collects all dates across all segments for min/max calculation
              bookingStatus: [],
            };
          }

          // Add the current item's segment data
          acc[tripNumber].segments.push(item);

          // Collect dates from this segment
          acc[tripNumber].allDates.push(...extractDates(item));

          // Collect travel mode for booking status
          const travelMode = (item.TRAVEL_MODE || "").trim().toLowerCase();
          if (travelMode) {
            let normalizedMode;
            if (travelMode === "flight") normalizedMode = "plane";
            else if (travelMode === "bus") normalizedMode = "bus";
            else if (travelMode === "car") normalizedMode = "car";
            else if (travelMode === "train") normalizedMode = "train";
            else if (travelMode === "hotel") normalizedMode = "hotel";
            else normalizedMode = travelMode;

            if (!acc[tripNumber].bookingStatus.includes(normalizedMode)) {
              acc[tripNumber].bookingStatus.push(normalizedMode);
            }
          }

          return acc;
        }, {});

        // STEP 2: Map the grouped data to the final desired trip structure
        const finalGroupedData = Object.values(groupedByTripNumber).map(
          (tripData) => {
            const item = tripData.representativeItem;
            const uniqueDates = [...new Set(tripData.allDates)].sort(); // Deduplicate and sort dates

            let tripDatesString = "N/A";
            if (uniqueDates.length > 0) {
              // Earliest date is the first element, latest date is the last element
              const startDate = uniqueDates[0];
              const endDate = uniqueDates[uniqueDates.length - 1];
              tripDatesString = `${startDate} - ${endDate}`;
            }

            return {
              id: item.TRIP_NUMBER,
              tripName: item.TRIP_NAME,
              // Calculated tripDates using the earliest dep and latest arr date
              tripDates: tripDatesString,
              destination: getDestination(item), // Assuming getDestination is defined elsewhere
              status: item.STATUS_OF_REQUEST,
              approver: item.APPROVER_NAME,
              bookingStatus: tripData.bookingStatus,
            };
          }
        );

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



   // Handler for row clicks
  const handleRowClick = (trip) => {
    console.log('Selected Trip Data:', trip); 
    setSelectedTrip(trip);
    
  };

  // Handler for "Back" button in the detailed view
  const handleBackToList = () => {
    setSelectedTrip(null);
  };


  // Note: Ensure getDestination function is defined somewhere in your component scope.

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "status-approved";
      case "DRAFT":
        return "status-draft";
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
                ) : trips.length > 0 ? (
                  trips.map((trip) => (
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
                      No trips found.
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
