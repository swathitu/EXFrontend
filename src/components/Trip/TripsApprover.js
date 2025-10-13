import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TripsApprover.css";

import { fetchAllTrips } from "../../api/trips"; // adjust path
 
const TABS = [

  { key: "all", label: "All" },

  { key: "awaiting", label: "Awaiting Approval" },

  { key: "approved", label: "Approved" },

  { key: "rejected", label: "Rejected" },

];
 
const STATUS = {

  APPROVED: "APPROVED",

  CANCELLED: "CANCELLED",

  PENDING: "PENDING",

  REJECTED: "REJECTED",

};
 
function Th({ children, className }) {

  return (
<th className={`th ${className || ""}`}>
<span className="th__label">{children}</span>
</th>

  );

}

function Td({ children, className }) {

  return <td className={`td ${className || ""}`}>{children}</td>;

}
 
function Pill({ type, children }) {

  const cls = `pill pill--${String(type || "").toLowerCase()}`;

  return <span className={cls}>{children}</span>;

}
 
function PersonChip({ name, initials, color, asLink = false }) {

  const base = (
<span className="chip">
<span className="chip__circle" style={{ background: color || "#EEE" }}>

        {initials}
</span>
<span className="chip__label">{name}</span>
</span>

  );

  if (asLink) {

    return (
<a href="#" className="chip chip--link" title={name}>
<span className="chip__circle" style={{ background: color || "#EEE" }}>

          {initials}
</span>
<span className="chip__label">{name}</span>
</a>

    );

  }

  return base;

}
 
function BookingIcons({ status }) {

  if (!status || status === "-") return <span>-</span>;

  if (status === "Booked") return <span title="Booked">🏨 ✈️</span>;

  if (status === "Partially Booked") return <span title="Partially Booked">🏨 •</span>;

  return <span>-</span>;

}
 
function EmptyRow({ children }) {

  return (
<tr>
<td className="td" colSpan={8} style={{ textAlign: "center" }}>

        {children}
</td>
</tr>

  );

}
 
function TripsTable({ rows, loading, error,navigate }) {

  return (
<div className="table-container">
<table className="trips-table">
<thead>
<tr>
<th className="th th--checkbox">
<input type="checkbox" aria-label="Select all trips" />
</th>
<Th>SUBMITTER</Th>
<Th>TRIP#</Th>
<Th>TRIP DETAILS</Th>
<Th>DESTINATION</Th>
<Th>STATUS</Th>
<Th>APPROVER</Th>
<Th>BOOKING STATUS</Th>
</tr>
</thead>
<tbody>

          {loading && <EmptyRow>Loading trips…</EmptyRow>}

          {error && <EmptyRow style={{ color: "red" }}>{error}</EmptyRow>}

          {!loading && !error && rows.length === 0 && (
<EmptyRow>No trips found.</EmptyRow>

          )}

          {!loading &&

            !error &&

            rows.map((t) => (


<tr
  key={t.id}
  onClick={() => navigate(`/approver-trip-data/${t.id}`)}
  style={{ cursor: "pointer" }}
>


<td className="td td--center">
<input type="checkbox" aria-label={`Select ${t.id}`} />
</td>
<Td>
<div className="submitter">
<PersonChip {...t.submitter} asLink />
<span className="submitter__meta">on: {t.createdOn}</span>
</div>
</Td>
<Td className="td--mono">{t.trip_number}</Td>
<Td>
<a href={t.tripLink || "#"} className="link">

                    {t.tripName}
</a>
<div className="muted">{t.period}</div>
</Td>
<Td>{t.destination}</Td>
<Td><Pill type={t.status}>{t.status}</Pill></Td>
<Td><PersonChip {...t.approver} /></Td>
<Td><BookingIcons status={t.booking} /></Td>
</tr>

            ))}
</tbody>
</table>
</div>

  );

}
 
export default function TripsApprover() {
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const [allRows, setAllRows] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
 
  // ONE CALL on mount

  useEffect(() => {

    const controller = new AbortController();

    (async () => {

      setLoading(true);

      setError("");

      try {

        const data = await fetchAllTrips(controller.signal);

        setAllRows(Array.isArray(data) ? data : []);

      } catch (e) {

        if (e.name !== "AbortError") setError(e.message || "Failed to load trips");

      } finally {

        setLoading(false);

      }

    })();

    return () => controller.abort();

  }, []);
 
  // Client-side filtering by tab

  const rows = useMemo(() => {

    if (activeTab === "approved") return allRows.filter(r => r.status === STATUS.APPROVED);

    if (activeTab === "awaiting") return allRows.filter(r => r.status === STATUS.PENDING);

    if (activeTab === "rejected") return allRows.filter(r => r.status === STATUS.REJECTED || r.status === STATUS.CANCELLED);

    return allRows; // All

  }, [activeTab, allRows]);
 
  return (
<div className="trips">
<header className="trips__header">
<h1 className="trips__title">Trips</h1>
</header>
 
      <nav className="tabs" role="tablist" aria-label="Trip filters">

        {TABS.map((t) => {

          const active = activeTab === t.key;

          return (
<button

              key={t.key}

              role="tab"

              aria-selected={active}

              aria-controls={`panel-${t.key}`}

              id={`tab-${t.key}`}

              onClick={() => setActiveTab(t.key)}

              className={`tab ${active ? "is-active" : ""}`}
>

              {t.label}
</button>

          );

        })}
<button className="tab tab--more" title="More" aria-disabled>…</button>
</nav>
 
      <section id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
<div className="table-shell">
<TripsTable rows={rows} loading={loading} error={error} navigate={navigate} />
</div>
</section>
</div>

  );

}

 