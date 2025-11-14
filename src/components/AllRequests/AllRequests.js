import React, { useState, useEffect } from "react";
import "./AllRequests.css";
import OptionForm from "../OptionForm/OptionForm";

const AVAILABLE_ACTION_STATUSES = ["Closed", "On Hold", "Open"];

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

const StatusReasonModal = ({ open, onClose, status, onSubmit }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason(""); // reset input each open
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Reason for changing status</h3>
        <p>Provide a brief description for changing status to <b>{status}</b>:</p>
        <textarea
          autoFocus
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          style={{ width: "100%" }}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={!reason.trim()}
            onClick={() => {
              if (reason.trim()) onSubmit(reason);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingStatusRequestId, setLoadingStatusRequestId] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    request: null,
    newStatus: "",
  });

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

          let subtableStatus = "Open";
          let requestNo = "N/A";

          if (details.mode && trip.associatedData[details.mode + "Data"]) {
            const subtableArray = trip.associatedData[details.mode + "Data"];
            if (subtableArray.length > 0) {
              const firstEntry = subtableArray[0];
              if (firstEntry.STATUS && firstEntry.STATUS.trim() !== "") {
                subtableStatus = firstEntry.STATUS;
              }
              // Extract Request_No if it exists
              if (firstEntry.Request_No || firstEntry.REQUEST_NO || firstEntry.REQUEST_NO === 0) {
                requestNo =
                  firstEntry.Request_No ||
                  firstEntry.REQUEST_NO ||
                  firstEntry.REQUEST_NO.toString();
              }
            }
          }

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
            submitterEmail: trip.SUBMITTER_EMAIL,
            tripNumber: trip.TRIP_NUMBER || "N/A",
            requestNo: requestNo, // Add requestNo here
            itinerary: details.itinerary,
            startDate: details.startDate,
            apiStatus: trip.STATUS,
            status: subtableStatus,
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



  const handleStatusChange = async (item, newStatus) => {
    if (newStatus === "On Hold") {
      // Open the modal and wait for reason
      setStatusModal({ open: true, request: item, newStatus });
      return;
    }
    // For "Cancel" or other direct actions, could customize per your workflow
    const reason = ""; // or provide an input in modal for cancel, too
    await handleStatusUpdate(item, newStatus, reason);
  };

  // Actually send to API and update UI
  const handleStatusUpdate = async (item, newStatus, reason) => {
    setLoadingStatusRequestId(item.id);

    const payload = {
      row_id: item.subtableRowId,
      request_type: item.requestType,
      new_status: newStatus,
      reason: reason,
      from_email: savedEmail,       // logged-in user email
      to_email: item.submitterEmail // submitter email for current request
    };

    try {
      const response = await fetch("/server/change_mode_status/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error updating status");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === item.id
            ? { ...req, status: newStatus }
            : req
        )
      );

    } catch (error) {
      alert(`Failed to update status: ${error.message || "Unknown error"}`);
    } finally {
      setLoadingStatusRequestId(null);
      setStatusModal({ open: false, request: null, newStatus: "" }); // Close modal if open
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
            <th>Request No</th>
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
                <td>{item.requestNo || "N/A"}</td>
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
                  {loadingStatusRequestId === item.id ? (
                    <span className="loading-text">Updating...</span>
                  ) : (
                    <select
                      value={item.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === item.status) return;
                        handleStatusChange(item, newStatus);
                      }}
                      className={`status-select status-${item.status.toLowerCase().replace(" ", "-")}`}
                      disabled={loadingStatusRequestId === item.id}
                    >
                      {/* Always include the current status */}
                      <option value={item.status}>{item.status}</option>

                      <option disabled>––––––––</option>

                      {/* Add all other available statuses except current one */}
                      {AVAILABLE_ACTION_STATUSES.filter((o) => o !== item.status).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </td>


              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Modal for status reason */}
      <StatusReasonModal
        open={statusModal.open}
        status={statusModal.newStatus}
        onClose={() => setStatusModal({ open: false, request: null, newStatus: "" })}
        onSubmit={(reason) => handleStatusUpdate(statusModal.request, statusModal.newStatus, reason)}
      />
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
