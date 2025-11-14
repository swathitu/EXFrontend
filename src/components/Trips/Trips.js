import React, { useState, useEffect } from "react";
import "./Trips.css";
import OptionForm from "../OptionForm/OptionForm";

// Icon helpers for booking status
const modeIcons = {
  plane: <i className="fas fa-plane" />,
  hotel: <i className="fas fa-hotel" />,
  car: <i className="fas fa-car" />,
  bus: <i className="fas fa-bus" />,
  train: <i className="fas fa-train" />,
};

// Helper: map a mode string to a compact label
const modeToLabel = (mode) => {
  const m = (mode || "").toLowerCase();
  switch (m) {
    case "flight":
      return "plane";
    case "hotel":
      return "hotel";
    case "car":
      return "car";
    case "bus":
      return "bus";
    case "train":
      return "train";
    default:
      return "unknown";
  }
};

// Helper: destination extraction from associatedData
const getDestination = (trip) => {
  const associatedData = trip.associatedData || {};
  const arrCityKeys = ["FLIGHT_ARR_CITY", "TRAIN_ARR_CITY", "BUS_ARR_CITY", "CAR_ARR_CITY", "HOTEL_CITY"];

  const findArrCity = (dataArray) => {
    if (!Array.isArray(dataArray)) return null;
    for (const item of dataArray) {
      for (const key of arrCityKeys) {
        if (item[key]) return item[key];
      }
    }
    return null;
  };

  const sources = ["CarData", "FlightData", "TrainData", "BusData", "HotelData"];
  for (const key of sources) {
    const arr = associatedData[key];
    if (arr && arr.length > 0) {
      const city = findArrCity(arr);
      if (city) return city;
    }
  }

  return trip.DESTINATION_COUNTRY || "N/A";
};

// Helper: extract relevant dates from a segment
const extractDates = (item, prefix) => {
  const dates = [];
  const depDateKey = `${prefix}_DEP_DATE`;
  const arrDateKey = `${prefix}_ARR_DATE`;
  const checkInKey = `${prefix}_CHECK_IN_DATE`;
  const checkOutKey = `${prefix}_CHECK_OUT_DATE`;

  if (item[depDateKey] && item[depDateKey] !== "null") dates.push(item[depDateKey]);
  else if (item[checkInKey] && item[checkInKey] !== "null") dates.push(item[checkInKey]);

  if (item[arrDateKey] && item[arrDateKey] !== "null") dates.push(item[arrDateKey]);
  else if (item[checkOutKey] && item[checkOutKey] !== "null") dates.push(item[checkOutKey]);

  return [...new Set(dates.filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(d)))];
};

const Trips = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch travel requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("/server/travelDesk_data/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const apiData = await response.json();
        const rawData = apiData.data || [];
        const processed = rawData.map((trip) => {
          const details = (() => {
            if (trip.associatedData?.HotelData?.length > 0) {
              const h = trip.associatedData.HotelData[0];
              return { mode: "Hotel", itinerary: `${h.HOTEL_DEP_CITY} - ${h.HOTEL_ARR_CITY}`, startDate: h.HOTEL_DEP_DATE, subtableRowId: h.ROWID };
            }
            if (trip.associatedData?.FlightData?.length > 0) {
              const f = trip.associatedData.FlightData[0];
              return { mode: "Flight", itinerary: `${f.FLIGHT_DEP_CITY} - ${f.FLIGHT_ARR_CITY}`, startDate: f.FLIGHT_DEP_DATE, subtableRowId: f.ROWID };
            }
            if (trip.associatedData?.CarData?.length > 0) {
              const c = trip.associatedData.CarData[0];
              return { mode: "Car", itinerary: `${c.CAR_DEP_CITY} - ${c.CAR_ARR_CITY}`, startDate: c.CAR_DEP_DATE, subtableRowId: c.ROWID };
            }
            if (trip.associatedData?.TrainData?.length > 0) {
              const t = trip.associatedData.TrainData[0];
              return { mode: "Train", itinerary: `${t.TRAIN_DEP_CITY} - ${t.TRAIN_ARR_CITY}`, startDate: t.TRAIN_DEP_DATE, subtableRowId: t.ROWID };
            }
            if (trip.associatedData?.BusData?.length > 0) {
              const b = trip.associatedData.BusData[0];
              return { mode: "Bus", itinerary: `${b.BUS_DEP_CITY} - ${b.BUS_ARR_CITY}`, startDate: b.BUS_DEP_DATE, subtableRowId: b.ROWID };
            }
            return { mode: "N/A", itinerary: "N/A", startDate: "N/A", subtableRowId: null };
          })();

          // Determine subtable status and requestNo (existing logic)
          let subtableStatus = "Open";
          let requestNo = "N/A";
          if (details.mode && trip.associatedData[details.mode + "Data"]) {
            const subtableArray = trip.associatedData[details.mode + "Data"];
            if (subtableArray.length > 0) {
              const firstEntry = subtableArray[0];
              if (firstEntry.STATUS && firstEntry.STATUS.trim() !== "") subtableStatus = firstEntry.STATUS;
              if (firstEntry.Request_No || firstEntry.REQUEST_NO || firstEntry.REQUEST_NO === 0) {
                requestNo = firstEntry.Request_No ?? firstEntry.REQUEST_NO ?? firstEntry.REQUEST_NO.toString();
              }
            }
          }

          const subtableKeys = ["HotelData", "FlightData", "CarData", "TrainData", "BusData"];
          let agentInfo = null;
          for (const key of subtableKeys) {
            if (trip.associatedData[key] && trip.associatedData[key].length > 0) {
              const sub = trip.associatedData[key][0];
              if (sub.AGENT_NAME) {
                agentInfo = { agentRowId: sub.AGENT_ID, agentEmail: sub.AGENT_EMAIL, agentName: sub.AGENT_NAME };
                break;
              }
            }
          }

          // Main-field based values (new)
          const mainStatus = trip.STATUS || "Open";
          const mainApproverName = trip.APPROVER_NAME || null;
          const mainApproverEmail = trip.APPROVER_EMAIL || null;

          // Build the new shape
          const tripObj = {
            id: trip.ROWID,
            subtableRowId: details.subtableRowId,
            requestType: details.mode,
            requestedBy: trip.SUBMITTER_NAME,
            submitterEmail: trip.SUBMITTER_EMAIL,
            tripNumber: trip.TRIP_NUMBER || "N/A",
            requestNo: requestNo,
            itinerary: details.itinerary,
            startDate: details.startDate,
            apiStatus: trip.STATUS,
            // Use main status for display, with fallback to subtable if needed
            status: mainStatus,
            // Approver display from main table, with fallback to subtable-derived if missing
            approverName: mainApproverName,
            approverEmail: mainApproverEmail,
            assignedTo: agentInfo ? `${agentInfo.agentName} (${agentInfo.agentEmail})` : "Unassigned",
            agentRowId: agentInfo?.agentRowId || null,
            agentEmail: agentInfo?.agentEmail || null,
            agentName: agentInfo?.agentName || null,
            // new fields for UI
            tripName: trip.TRIP_NAME,
            tripDates: "N/A", // will be replaced after computing dates if needed
            destination: getDestination(trip),
            bookingStatus: [], // fill below
            // Backward-compat: keep a copy of main approver for any logic that expected it
            _mainApproverName: mainApproverName,
            _mainApproverEmail: mainApproverEmail,
          };

          // Compute tripDates and bookingStatus (as before, leveraging existing logic)
          const segments = trip.associatedData || {};
          const bookingSet = new Set();

          const mapToPrefix = {
            CarData: "CAR",
            FlightData: "FLIGHT",
            TrainData: "TRAIN",
            BusData: "BUS",
            HotelData: "HOTEL",
          };

          Object.keys(mapToPrefix).forEach((k) => {
            const prefix = mapToPrefix[k];
            const segs = segments[k] || [];
            segs.forEach((seg) => {
              const ds = extractDates(seg, prefix);
              ds.forEach((d) => {
                // collect unique dates (future use)
              });
              // displayMode aligns with previous logic
              const displayMode = prefix.toLowerCase() === "flight" ? "plane" : prefix.toLowerCase();
              bookingSet.add(displayMode);
            });
          });

          const allDates = Array.from(bookingSet);
          tripObj.bookingStatus = Array.from(bookingSet);
          // Naive: set tripDates to first-to-last if dates collected
          tripObj.tripDates = tripObj.startDate || "N/A";

          return tripObj;
        });

        setRequests(processed);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleRowClick = (request) => {
    setSelectedRequest(request);
    console.log('selectedrow', request)
  };

  // Render helpers and modal (unchanged)
  if (loading) return <h5>Loading Requests...</h5>;
  if (!requests.length) return <h5>No pending requests found.</h5>;

  // Row component for the new design
  const TripRow = ({ item }) => (
    <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: "pointer" }}>
      <td className="col-submitter" title={item.submitterEmail}>
        {item.requestedBy || item.submitterEmail || "N/A"}
      </td>

      <td className="col-trip-no">{item.tripNumber || "N/A"}</td>

      <td className="col-trip-details" title={item.itinerary}>
        <div className="trip-details-top">
          <strong>{item.tripName || ""}</strong>
        </div>
        <div className="trip-details-sub" style={{ color: "#555", fontSize: "12px" }}>
          {item.itinerary} • {item.tripDates}
        </div>
      </td>

      <td className="col-destination">{item.destination}</td>

      <td className={`col-status ${(item.status).toLowerCase().replace(" ", "-")}`}>
        {item.status}
      </td>

      <td className="col-approver">
        {item.approverName || item.assignedTo?.split(" (")[0] || item.submitterEmail}
      </td>

      <td className="col-booking-status">
        <span className="booking-status-stack" aria-label="booking-status">
          {Array.from(new Set(item.bookingStatus || [])).map((m) => (
            <span key={m} className="booking-status-pill" title={m}>
              {modeIcons[m] ?? <span>❓</span>}
            </span>
          ))}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="all-requests-container">
      <h3>Approved Requests</h3>

      <table className="requests-table new-design">
        <thead>
          <tr>
            <th>SUBMITTER</th>
            <th>TRIP#</th>
            <th>TRIP DETAILS</th>
            <th>DESTINATION</th>
            <th>STATUS</th>
            <th>APPROVER</th>
            <th>BOOKING STATUS</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <TripRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>

      {selectedRequest && (
        <OptionForm request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}
    </div>
  );
};

export default Trips;
