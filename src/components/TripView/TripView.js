import React, { useState, useEffect, useMemo } from "react";
import "./TripView.css";
import TripOverView from "./TripOverView";

// SVG Icons for booking modes


// Map mode strings to icon components
const modeIcons = {
  plane: <i className="fas fa-plane"></i>,
  hotel: <i className="fas fa-hotel"></i>,
  car: <i className="fas fa-car"></i>,
  bus: <i className="fas fa-bus"></i>,
  train: <i className="fas fa-train"></i>,
};

// Helper function to extract the destination from the new data structure
const getDestination = (trip) => {
  const associatedData = trip.associatedData || {};

  const arrCityKeys = [
    "FLIGHT_ARR_CITY",
    "TRAIN_ARR_CITY",
    "BUS_ARR_CITY",
    "CAR_ARR_CITY",
    "HOTEL_CITY",
  ];

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

  return trip.DESTINATION_COUNTRY || "N/A";
};

// Helper function to extract all relevant dates from a single segment item
const extractDates = (item, prefix) => {
  const dates = [];
  const depDateKey = `${prefix}_DEP_DATE`;
  const arrDateKey = `${prefix}_ARR_DATE`;
  const checkInKey = `${prefix}_CHECK_IN_DATE`;
  const checkOutKey = `${prefix}_CHECK_OUT_DATE`;

  if (item[depDateKey] && item[depDateKey] !== "null") {
    dates.push(item[depDateKey]);
  } else if (item[checkInKey] && item[checkInKey] !== "null") {
    dates.push(item[checkInKey]);
  }

  if (item[arrDateKey] && item[arrDateKey] !== "null") {
    dates.push(item[arrDateKey]);
  } else if (item[checkOutKey] && item[checkOutKey] !== "null") {
    dates.push(item[checkOutKey]);
  }

  return [...new Set(dates.filter((date) => date && date.match(/^\d{4}-\d{2}-\d{2}$/)))];
};

const TripView = ({ onSelectTrip, onOpenForm, onOpenDetail, onCloseDetail }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { name: "All", key: "all" },
    { name: "Draft", key: "draft" },
    { name: "Submitted", key: "submitted" },
    { name: "Approved", key: "approved" },
    { name: "Rejected", key: "rejected" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/server/get_newTripData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();
        let rawTrips = apiData.data || [];

        // Add sorting by CREATEDTIME descending (latest first)
        const parseDate = (dateString) => {
          if (!dateString) return new Date(0);
          const fixedString = dateString.replace(/:(\d{3})$/, '.$1');
          return new Date(fixedString);
        };

        rawTrips.sort((a, b) => {
          const dateA = parseDate(a.CREATEDTIME);
          const dateB = parseDate(b.CREATEDTIME);
          return dateB - dateA;
        });

        const finalGroupedData = rawTrips.map((item) => {
          const tripId = item.ROWID;
          const segmentDataMap = {
            CarData: "CAR",
            FlightData: "FLIGHT",
            TrainData: "TRAIN",
            BusData: "BUS",
            HotelData: "HOTEL",
          };

          const allDates = [];
          const bookingStatus = new Set();

          Object.keys(segmentDataMap).forEach((dataKey) => {
            const prefix = segmentDataMap[dataKey];
            const segments = item.associatedData?.[dataKey] || [];

            segments.forEach((segment) => {
              allDates.push(...extractDates(segment, prefix));

              const normalizedMode = prefix.toLowerCase();
              let displayMode;
              displayMode = normalizedMode === "flight" ? "plane" : normalizedMode;
              bookingStatus.add(displayMode);
            });
          });

          const uniqueDates = [...new Set(allDates)].sort();
          let tripDatesString = "N/A";
          if (uniqueDates.length > 0) {
            const startDate = uniqueDates[0];
            const endDate = uniqueDates[uniqueDates.length - 1];
            tripDatesString = `${startDate} - ${endDate}`;
          }

          return {
            id: tripId,
            tripName: item.TRIP_NAME,
            tripNumber: item.TRIP_NUMBER,
            tripDates: tripDatesString,
            destination: getDestination(item),
            status: item.STATUS,
            approver: item.APPROVER_NAME,
            bookingStatus: [...bookingStatus],
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

  const filteredTrips = useMemo(() => {
    if (activeTab === "all") {
      return trips;
    }
    const targetStatus = activeTab.toUpperCase();

    if (activeTab === "submitted") {
      return trips.filter((trip) => {
        const status = trip.status?.toUpperCase();
        return status !== "DRAFT" && status !== "APPROVED" && status !== "REJECTED";
      });
    }

    return trips.filter((trip) => trip.status?.toUpperCase() === targetStatus);
  }, [trips, activeTab]);

  const handleRowClick = (trip) => {
    console.log("Selected Trip Data:", trip);
    setSelectedTrip(trip);
    if (onSelectTrip) onSelectTrip(trip);
    if (onOpenDetail) onOpenDetail();
  };

  const handleBackToList = () => {
    setSelectedTrip(null);
    if (onCloseDetail) onCloseDetail();
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "status-approved";
      case "DRAFT":
        return "status-draft";
      case "REJECTED":
        return "status-rejected";
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

  if (loading) {
    return (
      <div className="full-page-loading">
        <div className="loader"></div>
        <span style={{ marginLeft: 12 }}>Loading...</span>
      </div>
    );
  }

  if (selectedTrip) {
    return <TripOverView trip={selectedTrip} onOpenForm={onOpenForm} onBack={handleBackToList} />;
  }

  return (
    <>
      <div className="trip-view-container">
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                      <div className="loader" style={{ display: "inline-block", marginRight: 10 }}></div>
                      <span>Loading trip data...</span>
                    </td>
                  </tr>
                ) : filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} onClick={() => handleRowClick(trip)}>
                      <td className="trip-id">{trip.id}</td>
                      <td className="trip-details">
                        <div className="details-group">
                          <span className="trip-name">{trip.tripName}</span>
                          <span className="trip-number">({trip.tripNumber})</span>
                          <span className="trip-dates">{trip.tripDates}</span>
                        </div>
                      </td>
                      <td>{trip.destination}</td>
                      <td>
                        <span className={`status-tag ${getStatusClass(trip.status)}`}>{trip.status}</span>
                      </td>
                      <td>
                        <div className="approver-info">
                          <div className="approver-avatar">{getInitials(trip.approver)}</div>
                          {trip.approver}
                        </div>
                      </td>
                      <td>
                        <div className="booking-status-icons">
                          {trip.bookingStatus.map((item, index) => (
                            <div key={index} className="booking-icon-wrapper">
                              {modeIcons[item] || item}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="loading-row">
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
