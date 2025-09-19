// src/api/departments.js

const FN = "/server/ex_department_function"; // no trailing slash
 
async function http(path, { method = "GET", body } = {}) {

  const res = await fetch(path, {

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
 
// Heads for the Department Head dropdown

export function listDeptHeads() {

  return http(`${FN}/Heads`, { method: "GET" });

}
 
// Create Department

export function createDepartment(payload) {

  return http(`${FN}/Add`, { method: "POST", body: payload });

}

 