import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { listDepartments, deleteDepartment } from "../../api/departments";

import "../masters/styles/List.css";
 
export default function DepartmentList() {

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openMenuRow, setOpenMenuRow] = useState(null);
 
  const navigate = useNavigate();
 
  useEffect(() => {

    (async () => {

      try {

        const data = await listDepartments();

        setRows(Array.isArray(data) ? data : []);

      } catch (e) {

        setError(e.message || "Failed to fetch departments");

      } finally {

        setLoading(false);

      }

    })();

  }, []);
 
  const toggleRowMenu = (rowId) => {

    setOpenMenuRow((prev) => (prev === rowId ? null : rowId));

  };
 
  if (loading) return <div className="list-skeleton">Loading departments…</div>;

  if (error) return <div className="list-error">{error}</div>;
 
  return (
<div className="list-page">

      {/* Header */}
<div className="list-header">
<h1 className="page-title">Departments</h1>
<button

          className="btn btn--primary"

          onClick={() => navigate("/masters/department/new")}
>

          + New Department
</button>
</div>
 
      {/* Table */}
<div className="list-table" role="table" aria-label="Departments">

        {/* Head */}
<div className="list-head row" role="row">
<div className="cell" role="columnheader">Department Name</div>
<div className="cell" role="columnheader">Department Head</div>
<div className="cell" role="columnheader">Total Members</div>
<div className="cell cell--actions" aria-hidden="true"></div>
</div>
 
        {/* Rows */}

        {rows.map((dep) => {

          // Hide ROWID from display, but use it for key, actions, and Edit route

          const id = dep.ROWID;
 
          return (
<div className="list-row row" key={id} role="row">

              {/* Department Name */}
<div className="cell" role="cell">
<div className="location-name">
<div className="name">{dep.Department_Name}</div>

                  {dep.Department_Code ? <div className="address">{dep.Department_Code}</div> : null}
</div>
</div>
 
              {/* Department Head */}
<div className="cell cell--gstin" role="cell">
<span className="gstin-text">

                  {dep.Head_Name || dep.Department_Head || "—"}
</span>
</div>
 
              {/* Total Members */}
<div className="cell" role="cell">

                {typeof dep.Total_Members === "number"

                  ? dep.Total_Members

                  : (dep.Member_Count || "—")}
</div>
 
              {/* Actions */}
<div className="cell cell--actions" role="cell">
<button

                  className="kebab-btn"

                  aria-label="Row actions"

                  aria-haspopup="menu"

                  aria-expanded={openMenuRow === id}

                  onClick={(e) => {

                    e.stopPropagation();

                    toggleRowMenu(id);

                  }}
>

                  ⋮
</button>
 
                <div

                  className={`action-menu ${openMenuRow === id ? "open" : ""}`}

                  role="menu"

                  onClick={(e) => e.stopPropagation()}
>
<button

                    role="menuitem"

                    onClick={() => navigate(`/masters/department/${id}/edit`)}
>

                    Edit
</button>
<button
   role="menuitem"
   className="btn--danger"
   onClick={async () => {
     if (window.confirm("Are you sure you want to delete this department?")) {
       try {
       await deleteDepartment(id);
         setRows((prev) => prev.filter((d) => d.ROWID !== id));
       } catch (e) {
        alert(e.message || "Delete failed");
       }
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

  );

}

 