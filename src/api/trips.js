// src/api/trips.js

export async function fetchAllTrips(signal) {
  const FN = "/server/trips_api/";
  try {
    const res = await fetch(FN, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Trips API ${res.status}: ${text || res.statusText}`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("[fetchAllTrips] Error:", error);
    throw error;
  }
}

export async function fetchAgentTrips(signal, agentEmail) {
  alert("coming to trip api function");
  // Points to the new route 'agent_trips'
  const FN = `/server/trips_api/agent_trips?agent_email=${encodeURIComponent(agentEmail)}`;
  
  try {
    const res = await fetch(FN, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Agent Trips API ${res.status}: ${text || res.statusText}`);
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("[fetchAgentTrips] Error:", error);
    throw error;
  }
}

export async function fetchTripById(id, signal) {
  const FN = "/server/trips_api/GetData";
  try {
    const res = await fetch(`${FN}?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal, // Pass signal for cancellation
    });
    const json = await res.json();
    if (!res.ok || !json.data) {
      throw new Error(json.error || "Trip not found");
    }
    return json.data;
  } catch (error) {
    console.error("[fetchTripById] Error:", error);
    throw error;
  }
}

//Approve Action API Call 
export const approveTrip = async (tripId) => {
  try {
    // We'll replace this with your actual backend function URL later
    const functionUrl = `/server/trips_api/approve`; 

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: tripId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Approval successful:", result);
    return result;

  } catch (error) {
    console.error("Failed to approve trip:", error);
    throw error; // Re-throw the error so the component can handle it
  }
};


// --- NEW: Reject Action API Call ---
export const rejectTrip = async (tripId, reason) => {
  try {
    // Define the backend function URL for rejection
    const functionUrl = `/server/trips_api/reject`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send both the ID and the reason in the body
      body: JSON.stringify({ id: tripId, reason: reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Rejection successful:", result);
    return result;

  } catch (error) {
    console.error("Failed to reject trip:", error);
    throw error; // Re-throw for the component to handle
  }
};