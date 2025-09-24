// src/api/departments.js

const FN = "/server/ex_department_function"; // no trailing slash
  
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
 
// Heads for the Department Head dropdown

export function listDeptHeads() {

  return http(`${FN}/Heads?debug=1`, { method: "GET" });

}
 
// Create Department

export function createDepartment(payload) {

 return http(`${FN}/Add?debug=1`, { method: "POST", body: payload });

}

export async function listDepartments() {

  const FN = "/server/ex_department_function";

  const res = await fetch(`${FN}/GetAll?debug=1`);

  const text = await res.text();
 
  let data = null;

  try { data = text ? JSON.parse(text) : null; }

  catch (e) { console.error("[api] dept JSON parse failed. Raw response:", text); }
 
  if (res.ok && data && (data.status === "success" || Array.isArray(data.data))) {

    return Array.isArray(data.data) ? data.data : data;

  }

  throw new Error((data && data.message) || "Failed to load departments");

}
// Get one department by ROWID
export function getDepartment(rowid) {
  alert("coming to api function");
  return fetch(`${FN}/Get?ROWID=${encodeURIComponent(rowid)}&debug=1`)
    .then((r) => r.json())
    .then((data) => {
      if (data?.status === "success") return data.data;
      throw new Error(data?.message || "Failed to load department");
    });
}

// Update department (requires ROWID)
export function updateDepartment(payload) {
  // payload: { ROWID, department_name, department_code, department_head_id, description }
  const FN = "/server/ex_department_function";
  return fetch(`${FN}/Update?debug=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data?.status === "success") return data;
      throw new Error(data?.message || "Failed to update department");
    });
}
export async function deleteDepartment(rowid) {


  const res = await fetch(`${FN}/Delete?debug=1`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ ROWID: rowid }),

    
  });
 
  const data = await res.json().catch(() => null);

  if (res.ok && data?.status === "success") return data;

  throw new Error(data?.message || "Failed to delete department");

}

 

 
 