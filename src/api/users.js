// src/api/user.js

const BASE = "/server/ex_userdata_function"; // change if your function name/path is different
 
export async function listUsers() {

  const res = await fetch(`${BASE}/User/List`, {

    method: "GET",

    headers: { "Content-Type": "application/json" },

  });

  if (!res.ok) {

    throw new Error(`Users list failed: ${await res.text()}`);

  }

  return res.json(); // { status, code, data: [...] }

}
 
export async function addUser(payload) {

  const res = await fetch(`${BASE}/User/Add`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(payload),

  });

  if (!res.ok) {

    throw new Error(`Create user failed: ${await res.text()}`);

  }

  return res.json(); // { status, code, data: {...} }

}

export async function deleteUser(rowId) {
await fetch(`${BASE}/User/Delete`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rowId })
})
}

 