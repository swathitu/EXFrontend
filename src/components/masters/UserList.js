// src/components/masters/UserList.js

import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { listUsers, deleteUser } from "../../api/users";

import "../masters/styles/List.css"; // your existing stylesheet
 
function initials(first = "", last = "") {

  const a = (first || "").trim()[0] || "";

  const b = (last || "").trim()[0] || "";

  return (a + b).toUpperCase();

}

function hashHue(s = "") {

  let h = 0;

  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;

  return h % 360;

}

function Avatar({ name, size = 36 }) {

  const hue = useMemo(() => hashHue(name || ""), [name]);

  const style = {

    width: size,

    height: size,

    borderRadius: "50%",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 600,

    fontSize: size > 32 ? 12 : 11,

    background: `hsl(${hue} 80% 90%)`,

    color: `hsl(${hue} 70% 30%)`,

    flex: "0 0 auto",

  };

  const parts = (name || "").trim().split(/\s+/);

  const ini = ((parts[0] || "").charAt(0) + (parts[1] || "").charAt(0)).toUpperCase();

  return <div style={style} aria-hidden="true">{ini || "?"}</div>;

}
 
export default function UserList() {

  const [rows, setRows]   = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError]     = useState("");

  const [openMenuRow, setOpenMenuRow] = useState(null);
 
  const navigate = useNavigate();
 
  useEffect(() => {

    (async () => {

      try {

        const res = await listUsers();
      
        const data = Array.isArray(res) ? res : (res?.data || []);

        setRows(data);

      } catch (e) {

        setError(e.message || "Failed to fetch users");

      } finally {

        setLoading(false);

      }

    })();

  }, []);
 
  // Fallback mapping for manager name if backend didn’t enrich

  const usersById = useMemo(() => {

    const m = new Map();

    rows.forEach(u => m.set(u.ROWID, u));

    return m;

  }, [rows]);
 
  const getManagerName = (u) => {

    if (u.ManagerName) return u.ManagerName;

    const mgr = usersById.get(u.Reporting_Manager);

    if (!mgr) return null;

    const fn = (mgr.First_Name || "").trim();

    const ln = (mgr.Last_Name || "").trim();

    return (fn + " " + ln).trim() || null;

  };
 
  const kebabBtn = (id) => (
<button

      className="kebab-btn"

      aria-label="Row actions"

      aria-haspopup="menu"

      aria-expanded={openMenuRow === id}

      onClick={(e) => { e.stopPropagation(); setOpenMenuRow(prev => prev === id ? null : id); }}
>⋮</button>

  );
 
  if (loading) return <div>Loading users…</div>;

  if (error)   return <div style={{ color: "crimson" }}>{error}</div>;
 
  return (
<div className="list-page">

      {/* Header */}
<div className="list-header">
<h1 className="page-title">Users</h1>
<button className="btn btn--primary" onClick={() => navigate("/masters/users/new")}>+ New User</button>
</div>
 
      {/* Table */}
<div className="list-table" role="table" aria-label="Users">

        {/* Head */}
<div className="list-head row" role="row">
<div className="cell" role="columnheader">User details</div>
<div className="cell" role="columnheader">Role</div>
<div className="cell" role="columnheader">Policy</div>
<div className="cell" role="columnheader">Submits to</div>
<div className="cell cell--actions" aria-hidden="true"></div>
</div>
 
        {/* Rows */}
<div className="list-body">
        {rows.map((u) => {

          const id   = u.ROWID || `${u.Email || ""}-${u.First_Name || ""}-${u.Last_Name || ""}`;

          const name = `${u.First_Name || ""} ${u.Last_Name || ""}`.trim() || "-";

          const email = u.Email || "-";

          const role  = (u.Role || "").toString().trim() || "-";

          const policy = u.PolicyName || u.Policy || u.Department_Name || u.Dept_Name || u.Name || "-";

          const managerName = getManagerName(u);
 
          return (
<div className="list-row row" key={id} role="row">

              {/* User details */}
<div className="cell" role="cell">
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<Avatar name={name} />
<div className="location-name">
<div className="name" style={{ fontWeight: 600 }}>{name}</div>
<div className="address" style={{ color: "#6b7280" }}>{email}</div>
</div>
</div>
</div>
 
              {/* Role */}
<div className="cell" role="cell">
<span style={{

                  display: "inline-block",

                  padding: "2px 8px",

                  borderRadius: 999,

                  background: "#f3f4f6",

                  fontSize: 12,

                  fontWeight: 600,

                  textTransform: "uppercase",

                }}>{role}</span>
</div>
 
              {/* Policy */}
<div className="cell" role="cell">
<span style={{

                  display: "inline-block",

                  padding: "2px 10px",

                  borderRadius: 999,

                  background: "#eef6ff",

                  color: "#1d4ed8",

                  fontSize: 12,

                  fontWeight: 600,

                }}>{policy || "-"}</span>
</div>
 
              {/* Submits to */}
<div className="cell" role="cell">

                {managerName ? (
<div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
<Avatar name={managerName} size={28} />
<span style={{ fontWeight: 500 }}>{managerName}</span>
</div>

                ) : <span>-</span>}
</div>
 
              {/* Actions */}
<div className="cell cell--actions" role="cell">

                {kebabBtn(id)}
<div

                  className={`action-menu ${openMenuRow === id ? "open" : ""}`}

                  role="menu"

                  onClick={(e) => e.stopPropagation()}
>
<button role="menuitem" onClick={() => navigate(`/masters/user/${u.ROWID}/edit`)}>Edit</button>
<button
  role="menuitem"
  className="btn--danger"
  onClick={async () => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(u.ROWID);
      setRows(prev => prev.filter(r => r.ROWID !== u.ROWID)); // optimistic remove
      setOpenMenuRow(null);
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }}
>
  Delete
</button>
</div>
</div>
</div>

          );

        })}
</div>
</div>
</div>

  );

}

 