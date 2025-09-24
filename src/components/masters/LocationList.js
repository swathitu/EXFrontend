// src/components/masters/LocationList.js
 
import React, { useEffect, useState } from "react";

import { listLocations, deleteLocation } from "../../api/locations";

import { useNavigate } from "react-router-dom";

import "../masters/styles/List.css";
 
export default function LocationList() {

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [hoveredRow, setHoveredRow] = useState(null);

  const [openMenuRow, setOpenMenuRow] = useState(null); // which row's menu is open
 
  const navigate = useNavigate();
 
  useEffect(() => {

    (async () => {

      try {

        const data = await listLocations();

        setRows(Array.isArray(data) ? data : []);

      } catch (e) {

        setError(e.message || "Failed to fetch locations");

      } finally {

        setLoading(false);

      }

    })();

  }, []);
 
  const toggleRowMenu = (rowId) => {

    setOpenMenuRow((prev) => (prev === rowId ? null : rowId));

  };
 
  if (loading) return <div>Loading locations…</div>;

  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
 
  return (
<div className="list-page">

      {/* Header */}
<div className="list-header">
<h1 className="page-title">Locations</h1>
<button

          className="btn btn--primary"

          onClick={() => navigate("/masters/location/new")}
>

          + New Location
</button>
</div>
 
      {/* Table */}
<div className="list-table" role="table" aria-label="Locations">

        {/* Head */}
<div className="list-head row" role="row">
<div className="cell" role="columnheader">Location Name</div>
<div className="cell" role="columnheader">GSTIN</div>

          {/* empty header for actions column */}
<div className="cell cell--actions" aria-hidden="true"></div>
</div>
 <div className="list-body">
        {/* Rows */}

        {rows.map((loc) => {

          const id = loc.ROWID;

          return (
<div

              className="list-row row"

              key={id}

              onMouseEnter={() => setHoveredRow(id)}

              onMouseLeave={() => setHoveredRow(null)}

              role="row"
>

              {/* Location column */}
<div className="cell" role="cell">
<div className="location-name">
<div className="name">{loc.Location_Name}</div>
<div className="address">

                    {loc.Street1}, {loc.Street2}, {loc.City}, {loc.State},{" "}

                    {loc.Zip_Code}
</div>
</div>
</div>
 
              {/* GSTIN column */}
<div className="cell cell--gstin" role="cell">
<span className="gstin-text">{loc.GSTIN}</span>
</div>
 
              {/* Actions column */}
<div className="cell cell--actions" role="cell">

                {/* kebab shows on row hover (CSS sets opacity) */}
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
 
                {/* menu appears when kebab clicked */}
<div

                  className={`action-menu ${openMenuRow === id ? "open" : ""}`}

                  role="menu"

                  onClick={(e) => e.stopPropagation()}
>
<button

                    role="menuitem"

                    onClick={() => navigate(`/masters/location/${id}/edit`)}
>

                    Edit
</button>
<button
   role="menuitem"
   className="btn--danger"
   onClick={async () => {
     if (window.confirm("Are you sure you want to delete this location?")) {
       try {
         await deleteLocation(id);
         setRows(prev => prev.filter(r => r.ROWID !== id)); // optimistic update
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
</div>
  );

}

 