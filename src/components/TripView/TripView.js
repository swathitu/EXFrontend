import React, { useState, useEffect } from 'react';
import './TripView.css';



const getDestination = (trip) => {
  const arr = trip.FLIGHT_ARR_CITY || trip.TRAIN_ARR_CITY || trip.BUS_ARR_CITY || trip.CAR_ARR_CITY;
  return arr || 'N/A';
};

const TripView = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetching data from the API endpoint as requested
        const response = await fetch('/server/get_TripData/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        const groupedData = apiData.data.reduce((acc, item) => {
          const tripNumber = item.TRIP_NUMBER;

          if (!acc[tripNumber]) {
            acc[tripNumber] = {
              id: item.TRIP_NUMBER,
              tripName: item.TRIP_NAME,
              tripDates: `${item.CF_TRIP_START_DATE} - ${item.CF_TRIP_END_DATE}`,
              destination: getDestination(item),
              status: item.STATUS_OF_REQUEST,
              approver: item.APPROVER_NAME,
              bookingStatus: [],
            };
          }

          const travelMode = (item.TRAVEL_MODE || '').trim().toLowerCase();
          if (travelMode) {
            let normalizedMode;
            if (travelMode === 'flight') normalizedMode = 'plane';
            else if (travelMode === 'bus') normalizedMode = 'bus';
            else if (travelMode === 'car') normalizedMode = 'car';
            else if (travelMode === 'train') normalizedMode = 'train';
            else if (travelMode === 'hotel') normalizedMode = 'hotel';
            else normalizedMode = travelMode;

            if (!acc[tripNumber].bookingStatus.includes(normalizedMode)) {
              acc[tripNumber].bookingStatus.push(normalizedMode);
            }
          }

          return acc;
        }, {});

        setTrips(Object.values(groupedData));
      } catch (error) {
        console.error("Failed to fetch trip data:", error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'status-approved';
      case 'DRAFT':
        return 'status-draft';
      default:
        return 'status-default';
    }
  };

  const getInitials = (name) => {
    if (!name) return '-';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '-';
  };

  return (
    <>
      
      <div className="trip-view-container">
        <div className="table-wrapper">

          <div className="table-responsive">
            <table className="trip-table">
              <thead>
                <tr>
                  <th>
                    TRIP#
                  </th>
                  <th>
                    TRIP DETAILS
                  </th>
                  <th>
                    DESTINATION
                  </th>
                  <th>
                    STATUS
                  </th>
                  <th>
                    APPROVER
                  </th>
                  <th>
                    BOOKING STATUS
                  </th>
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
                    <tr key={trip.id}>
                      <td className="trip-id">
                        {trip.id}
                      </td>
                      <td className="trip-details">
                        <div className="details-group">
                          <span className="trip-name">{trip.tripName}</span>
                          <span className="trip-dates">{trip.tripDates}</span>
                        </div>
                      </td>
                      <td>
                        {trip.destination}
                      </td>
                      <td>
                        <span className={`status-tag ${getStatusClass(trip.status)}`}>
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
