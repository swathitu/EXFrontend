

const FN = "/server/ex_location_data_function/"; // Catalyst functio
async function http(path, { method = "GET", body } = {}) {
   console.log("request coming inside");
  const res = await fetch(`${path}`, {

    method,

    headers: { "Content-Type": "application/json" },

    body: body ? JSON.stringify(body) : undefined,
 
    
  });
 
  const text = await res.text();

  const data = text ? JSON.parse(text) : null;
 
  if (!res.ok) {

    const msg = (data && data.message) || res.statusText || "Request failed";

    const err = new Error(msg);

    err.status = res.status;

    err.details = data;

    throw err;

  }

  return data;

}
 
// Create new Location

export function createLocation(payload) {

  return http(`${FN}/Add`, { method: "POST", body: payload });

}
 //list all locations
 export async function listLocations() {
  const res = await fetch(`${FN}/List`); // <-- Add '/List' 
  const data = await res.json();
  if (res.ok && data.status === "success") {
    return data.data;
  }
  throw new Error(data.message || "Failed to load locations");
}

export async function deleteLocation(rowid) {
  
  const res = await fetch(`${FN}/Delete?debug=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ROWID: rowid }),
  });
 
  const data = await res.json().catch(() => null);
  if (res.ok && data?.status === "success") return data;
  throw new Error(data?.message || "Failed to delete location");
}
// Add more later (update, delete)

 