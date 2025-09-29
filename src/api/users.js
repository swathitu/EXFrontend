const BASE = "/server/ex_userdata_function";

async function http(path, { method = "GET", body } = {}) {
  console.log("[api] ->", method, path, body || {});
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
 
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("[api] JSON parse failed. Raw response:", text);
  }
  console.log("[api] <-", res.status, data);
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}
export async function listUsers() {
  const res = await fetch(`${BASE}/GetAll`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Users list failed: ${await res.text()}`);
  }
  return res.json();
}

export async function addUser(payload) {
  const res = await fetch(`${BASE}/Add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Create user failed: ${await res.text()}`);
  }
  return res.json();
}

export async function deleteUser(rowId) {
  await fetch(`${BASE}/Delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ROWID: rowId }),
  });
}

//Load userdata from table 

export async function getUser(rowId) {


  const res = await fetch(`${BASE}/Edit?ROWID=${encodeURIComponent(rowId)}&debug=1`);
  const data = await res.json();
  if (res.ok && data.status === "success") {
    return data.data[0]; // directly return the first item
  }
  throw new Error(data.message || "Failed to load user");
}


//Update data to backend 
export async function updateUser(rowId, payload) {
  console.log("coming inside updateuser function");
  const res = await fetch(`${BASE}/Update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, ROWID: rowId }),
  });
  if (!res.ok) throw new Error(`Update failed: ${await res.text()}`);
  return res.json();
}

// get Reporting Manager
export async function getReportingMasters() {
  return http(`${BASE}/ReportingManager?debug=1`, { method: "GET" });
}

//get Department data 
export async function getDepartments() {
  return http(`${BASE}/LoadDepartment?debug=1`, { method: "GET" });
}

//get locations list
export async function getLocations() {
  return http(`${BASE}/LoadLocation?debug=1`, { method: "GET" });
}
