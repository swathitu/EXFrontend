import React, { useState, useEffect } from "react";
import "./BusDesk.css";
import OptionForm from "../OptionForm/OptionForm";

const AVAILABLE_ACTION_STATUSES = ["Cancel", "On Hold"];
const ASSIGNED_TO_OPTIONS = ["Unassigned", "Swathi", "Suresh", "Admin Team", "Finance"];

const getModeAvatar = (mode) => {
  switch (mode.toLowerCase()) {
    case 'flight': return { avatar: 'FL', name: 'Flight' };
    case 'car': return { avatar: 'CA', name: 'Car' };
    case 'train': return { avatar: 'TR', name: 'Train' };
    case 'bus': return { avatar: 'BU', name: 'Bus' };
    case 'hotel': return { avatar: 'HO', name: 'Hotel' };
    default: return { avatar: '??', name: 'N/A' };
  }
};

const getItineraryDetails = (associatedData) => {
  if (associatedData.BusData && associatedData.BusData.length > 0) {
    const bus = associatedData.BusData[0];
    return {
      mode: 'Bus',
      itinerary: `${bus.BUS_DEP_CITY} - ${bus.BUS_ARR_CITY}`,
      startDate: bus.BUS_DEP_DATE,
      subtableRowId: bus.ROWID,
      agentRowId: bus.AGENT_ID || null,
      agentEmail: bus.AGENT_EMAIL || null,
      agentName: bus.AGENT_NAME || null
    };
  }
  return { mode: 'N/A', itinerary: 'N/A', startDate: 'N/A', subtableRowId: null };
};

const BusDesk = () => {
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [savedEmail, setSavedEmail] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    setSavedEmail(emailFromStorage);
  }, []);

  useEffect(() => {
    fetch("/server/getagent_sendmail/agent")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.status === "success" && data.agents) {
          setAgents(data.agents);
        } else {
          console.error("Error fetching agents:", data.message || data);
        }
      })
      .catch(err => console.error("Failed to fetch agents:", err));
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/server/travelDesk_data/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const apiData = await response.json();
        const rawData = apiData.data || [];

        const busRequests = rawData.filter(trip =>
          trip.associatedData &&
          trip.associatedData.BusData &&
          trip.associatedData.BusData.length > 0
        );

        const processedData = busRequests.map(trip => {
          const details = getItineraryDetails(trip.associatedData);
          return {
            id: trip.ROWID,
            requestType: details.mode,
            requestedBy: trip.SUBMITTER_NAME || "N/A",
            tripNumber: trip.TRIP_NUMBER || 'N/A',
            itinerary: details.itinerary,
            startDate: details.startDate,
            apiStatus: trip.STATUS || "N/A",
            status: "Open",
            assignedTo: details.agentName ? `${details.agentName} (${details.agentEmail})` : "Unassigned",
            agentRowId: details.agentRowId,
            agentEmail: details.agentEmail,
            agentName: details.agentName,
            subtableRowId: details.subtableRowId,
          };
        });
        setRequests(processedData);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
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
    setSelectedRequest(request);
  };

  const handleAssignedToChange = async (requestId, agentRowId) => {
    const selectedAgent = agents.find(a => a.row_id === agentRowId);
    const selectedRequest = requests.find(req => req.id === requestId);
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

      setRequests(prev =>
        prev.map(req => req.id === requestId
          ? {
            ...req,
            assignedTo: `${selectedAgent.first_name} (${selectedAgent.email})`,
            agentRowId: selectedAgent.row_id,
            agentEmail: selectedAgent.email,
            agentName: selectedAgent.first_name,
          }
          : req)
      );
    } catch (error) {
      console.error("Error during agent assignment:", error);
    } finally {
      setLoadingRequestId(null);
    }
  };

  if (loading) return <h5>Loading Bus Requests...</h5>;
  if (requests.length === 0) return <h5>No pending Bus requests found.</h5>;

  return (
    <div className="all-requests-container">
      <h3>Bus Requests 🚌</h3>
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
          {requests.map(item => {
            const mode = getModeAvatar(item.requestType);
            return (
              <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: "pointer" }}>
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
                      className="assigned-to-select"
                      disabled={loadingRequestId === item.id}
                    >
                      <option value="">Unassigned</option>
                      {agents.map(agent => (
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
                    onChange={(e) => {
                      // Handle status change if needed
                    }}
                    className={`status-select status-${item.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Open">Open</option>
                    <option disabled>––––––––</option>
                    {AVAILABLE_ACTION_STATUSES.filter(o => o !== item.status).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedRequest && (
        <OptionForm request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}
    </div>
  );
};

export default BusDesk;
