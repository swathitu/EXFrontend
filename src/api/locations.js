const BASE =

  "https://expense-management-60046787871.development.catalystserverless.in";

const FN = "/server/ex_location_data_function/"; // Catalyst function

alert("API URL: " + BASE); 
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
 
// Add more later (update, delete, list…)

 