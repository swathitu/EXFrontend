// src/api/trips.js



export async function fetchAllTrips(signal) {
  const FN = "/server/trips_api/"; // no trailing slash
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



export async function fetchTripById(id) {
  alert("cpming to api file");
  const FN = "/server/trips_api/GetData";
  try {
    const res = await fetch(`${FN}?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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

