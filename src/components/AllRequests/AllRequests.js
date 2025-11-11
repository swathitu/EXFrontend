import React, { useState, useEffect } from "react";
import "./AllRequests.css";
import OptionForm from "../OptionForm/OptionForm";

const AVAILABLE_ACTION_STATUSES = ["Cancel", "On Hold"];

const getModeAvatar = (mode) => {
  switch (mode.toLowerCase()) {
    case "flight":
      return { avatar: "FL", name: "Flight" };
    case "car":
      return { avatar: "CA", name: "Car" };
    case "train":
      return { avatar: "TR", name: "Train" };
    case "bus":
      return { avatar: "BU", name: "Bus" };
    case "hotel":
      return { avatar: "HO", name: "Hotel" };
    default:
      return { avatar: "??", name: "N/A" };
  }
};

const getItineraryDetails = (associatedData) => {
  if (associatedData.HotelData && associatedData.HotelData.length > 0) {
    const hotel = associatedData.HotelData[0];
    return {
      mode: "Hotel",
      itinerary: `${hotel.HOTEL_DEP_CITY} - ${hotel.HOTEL_ARR_CITY}`,
      startDate: hotel.HOTEL_DEP_DATE,
      subtableRowId: hotel.ROWID,
    };
  }
  if (associatedData.FlightData && associatedData.FlightData.length > 0) {
    const flight = associatedData.FlightData[0];
    return {
      mode: "Flight",
      itinerary: `${flight.FLIGHT_DEP_CITY} - ${flight.FLIGHT_ARR_CITY}`,
      startDate: flight.FLIGHT_DEP_DATE,
      subtableRowId: flight.ROWID,
    };
  }
  if (associatedData.CarData && associatedData.CarData.length > 0) {
    const car = associatedData.CarData[0];
    return {
      mode: "Car",
      itinerary: `${car.CAR_DEP_CITY} - ${car.CAR_ARR_CITY}`,
      startDate: car.CAR_DEP_DATE,
      subtableRowId: car.ROWID,
    };
  }
  if (associatedData.TrainData && associatedData.TrainData.length > 0) {
    const train = associatedData.TrainData[0];
    return {
      mode: "Train",
      itinerary: `${train.TRAIN_DEP_CITY} - ${train.TRAIN_ARR_CITY}`,
      startDate: train.TRAIN_DEP_DATE,
      subtableRowId: train.ROWID,
    };
  }
  if (associatedData.BusData && associatedData.BusData.length > 0) {
    const bus = associatedData.BusData[0];
    return {
      mode: "Bus",
      itinerary: `${bus.BUS_DEP_CITY} - ${bus.BUS_ARR_CITY}`,
      startDate: bus.BUS_DEP_DATE,
      subtableRowId: bus.ROWID,
    };
  }
  return { mode: "N/A", itinerary: "N/A", startDate: "N/A", subtableRowId: null };
};

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    setSavedEmail(emailFromStorage);
    console.log("Saved Email from localStorage:", emailFromStorage);
  }, []);

  // Fetch agents on component mount
  useEffect(() => {
    fetch("/server/getagent_sendmail/agent")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && data.agents) {
          setAgents(data.agents);
        } else {
          console.error("Error fetching agents:", data.message || data);
        }
      })
      .catch((err) => console.error("Failed to fetch agents:", err));
  }, []);

  // Fetch travel requests on component mount
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("/server/travelDesk_data/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const apiData = await response.json();
        const rawData = apiData.data || [];
        const processed = rawData.map((trip) => {
          const details = getItineraryDetails(trip.associatedData);

          const subtableKeys = ["HotelData", "FlightData", "CarData", "TrainData", "BusData"];
          let agentInfo = null;
          for (const key of subtableKeys) {
            if (trip.associatedData[key] && trip.associatedData[key].length > 0) {
              const subtableEntry = trip.associatedData[key][0];
              if (subtableEntry.AGENT_NAME) {
                agentInfo = {
                  agentRowId: subtableEntry.AGENT_ID,
                  agentEmail: subtableEntry.AGENT_EMAIL,
                  agentName: subtableEntry.AGENT_NAME,
                };
                break;
              }
            }
          }

          return {
            id: trip.ROWID,
            subtableRowId: details.subtableRowId,
            requestType: details.mode,
            requestedBy: trip.SUBMITTER_NAME,
            tripNumber: trip.TRIP_NUMBER || "N/A",
            itinerary: details.itinerary,
            startDate: details.startDate,
            apiStatus: trip.STATUS,
            status: "Open",
            assignedTo: agentInfo ? `${agentInfo.agentName} (${agentInfo.agentEmail})` : "Unassigned",
            agentRowId: agentInfo?.agentRowId || null,
            agentEmail: agentInfo?.agentEmail || null,
            agentName: agentInfo?.agentName || null,
          };
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

  const sendApprovalEmail = async (fromEmail, toEmail, payload) => {
    if (!fromEmail || !toEmail) {
      console.error("Both fromEmail and toEmail are required");
      return;
    }
    try {
      const response = await fetch("/server/getagent_sendmail/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_email: fromEmail,
          to_email: toEmail,
          ...payload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email send failed:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Email sent successfully:", data);
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
  };

  const handleRowClick = (request) => {
    console.log("Row clicked:", request);
    setSelectedRequest(request);
  };

  const handleAssignedToChange = async (requestId, agentRowId) => {
    const selectedAgent = agents.find((a) => a.row_id === agentRowId);
    const selectedRequest = requests.find((req) => req.id === requestId);
    if (!selectedAgent || !selectedRequest) return;

    setLoadingRequestId(requestId);

    const payload = {
      ROWID: selectedRequest.subtableRowId,
      tripType: selectedRequest.requestType,
      id: selectedRequest.id,
      requestedBy: selectedRequest.requestedBy,
      tripNumber: selectedRequest.tripNumber,
      itinerary: selectedRequest.itinerary,
      startDate: selectedRequest.startDate,
      apiStatus: selectedRequest.apiStatus,
      status: selectedRequest.status,
      assignedTo: selectedAgent.row_id,
      agentRowId: selectedAgent.row_id,
      agentEmail: selectedAgent.email,
      agentName: selectedAgent.first_name,
    };

    try {
      await sendApprovalEmail(savedEmail, selectedAgent.email, payload);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
              ...req,
              assignedTo: `${selectedAgent.first_name} (${selectedAgent.email})`,
              agentRowId: selectedAgent.row_id,
              agentEmail: selectedAgent.email,
              agentName: selectedAgent.first_name,
            }
            : req
        )
      );
    } catch (error) {
      console.error("Error during agent assignment:", error);
    } finally {
      setLoadingRequestId(null);
    }
  };

  if (loading) return <h5>Loading Requests...</h5>;
  if (!requests.length) return <h5>No pending requests found.</h5>;

  return (
    <div className="all-requests-container">
      <h3>All Requests</h3>
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
              <tr key={item.id}
                onClick={() => handleRowClick(item)}
                style={{ cursor: "pointer" }}
              >
                <td title={`Mode: ${mode.name}`}>
                  <span className="mode-name">{mode.name}</span>
                  <span className="option-available-text">option available</span>
                </td>
                <td>{item.requestedBy}</td>
                <td>{item.tripNumber}</td>
                <td>{item.itinerary}</td>
                <td>{item.startDate}</td>
                <td>
                  {loadingRequestId === item.id ? (
                    <span className="loading-text">Sending...</span>
                  ) : (
                    <select
                      value={item.agentRowId || ""}
                      onChange={(e) => handleAssignedToChange(item.id, e.target.value)}
                      onClick={e => e.stopPropagation()}  // Stop row click here
                      className="assigned-to-select1"
                      disabled={loadingRequestId === item.id}
                    >
                      <option value=""> Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.row_id} value={agent.row_id}>
                          {agent.first_name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>

                <td>
                  <select
                    value={item.status}
                    onClick={e => e.stopPropagation()}  // Also stop row click here
                    onChange={(e) => {
                      // Add inline status update logic here if needed
                      // Example: update locally or send API request
                      // For now, you can console.log or add a handler
                      console.log(`Status changed for request ${item.id}:`, e.target.value);
                    }}
                    className={`status-select status-${item.status.toLowerCase().replace(" ", "-")}`}
                  >
                    <option value="Open">Open</option>
                    <option disabled>––––––––</option>
                    {AVAILABLE_ACTION_STATUSES.filter((o) => o !== item.status).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedRequest && (
        <OptionForm
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default AllRequests;
