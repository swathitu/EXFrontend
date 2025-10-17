import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TripsApprover.css";
import { fetchAllTrips } from "../../api/trips";

/* ---------- SVG Icon Components ---------- */
const FlightIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>);
const HotelIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7h-8v6h8V7zm4-2H5c-1.1 0-2 .9-2 2v14h2v-2h18v2h2V7c0-1.1-.9-2-2-2zM7 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>);
const CarIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>);
const BusIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 18H6V6h12v12zm-1.5-5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5-1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5S6.83 15 6 15s-1.5-.67-1.5-1.5S5.17 12 6 12zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15H4v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2z"></path></svg>);
const TrainIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4.42 0-8 .5-8 4v10c0 2.21 1.79 4 4 4h1a1 1 0 001-1v-3h4v3a1 1 0 001 1h1c2.21 0 4-1.79 4-4V6c0-3.5-3.58-4-8-4zm4 14H8v-5h8v5zm-1.5-8c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm-5 0c-.83 0-1.5-.67-1.5-1.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8z"></path></svg>);

/* ---------- Helper Functions ---------- */

const toDisplayDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return "";
  let correctedString = dateString;
  const lastColonIndex = correctedString.lastIndexOf(':');
  if (lastColonIndex > correctedString.lastIndexOf('.')) {
      correctedString = correctedString.substring(0, lastColonIndex) + '.' + correctedString.substring(lastColonIndex + 1);
  }
  const compliantDateString = correctedString.replace(' ', 'T');
  const date = new Date(compliantDateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const collectDates = (a = {}) => {
  const out = [];
  const push = (v) => v && out.push(v);
  (a.FlightData || []).forEach(f => { push(f.FLIGHT_DEP_DATE); push(f.FLIGHT_ARRV_DATE); });
  (a.HotelData || []).forEach(h => { push(h.HOTEL_DEP_DATE); push(h.HOTEL_ARRV_DATE); });
  (a.CarData || []).forEach(c => { push(c.CAR_DEP_DATE); push(c.CAR_ARRV_DATE); });
  (a.TrainData || []).forEach(t => { push(t.TRAIN_DEP_DATE); push(t.TRAIN_ARRV_DATE); });
  (a.BusData || []).forEach(b => { push(b.BUS_DEP_DATE); push(b.BUS_ARRV_DATE); });
  return out.filter(Boolean);
};

/**
 * NEW: Derives the primary destination from sub-forms with a set priority.
 * Priority: Flight -> Car -> Hotel -> Train -> Bus
 */
const deriveDestination = (a = {}) => {
  const priorityOrder = [
    { key: 'FlightData', field: 'FLIGHT_ARRV_CITY' },
    { key: 'CarData',    field: 'CAR_ARRV_CITY' },
    { key: 'HotelData',  field: 'HOTEL_ARRV_CITY' },
    { key: 'TrainData',  field: 'TRAIN_ARRV_CITY' },
    { key: 'BusData',    field: 'BUS_ARRV_CITY' },
  ];

  for (const { key, field } of priorityOrder) {
    const records = a[key] || [];
    for (const rec of records) {
      if (rec && rec[field]) {
        return rec[field]; // Return the first one found
      }
    }
  }
  return ""; // Fallback if no destination is found
};


/* ---------- Constants ---------- */
const TABS = [
  { key: "all", label: "All Trips" },
  { key: "awaiting", label: "Awaiting Approval" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS = {
  APPROVED: "APPROVED", CANCELLED: "CANCELLED",
  PENDING: "PENDING", REJECTED: "REJECTED",
};

/* ---------- Subcomponents ---------- */
const UserPill = ({ user, secondaryText }) => (
  <div className="user-pill-wrapper">
    <div className="approver-pill approver-pill--gray">
      <span className="initial-circle" style={{ backgroundColor: user?.color }}>{user?.initials || "?"}</span>
      <span className="approver-name">{user?.name || "User"}</span>
    </div>
    {secondaryText && <div className="trip-dates">{secondaryText}</div>}
  </div>
);

const BookingIcon = ({ type }) => {
    const iconMap = {
        flight: <FlightIcon />, hotel: <HotelIcon />, car: <CarIcon />,
        bus: <BusIcon />, train: <TrainIcon />
    };
    return <span className="booking-icon-circle" title={type}>{iconMap[type]}</span>;
};

const BookingIcons = ({ types = [] }) => {
    if (!Array.isArray(types) || types.length === 0) return <span>-</span>;
    return types.map((type, index) => <BookingIcon key={index} type={type} />);
};

/* ---------- Main Component ---------- */
export default function TripsApprover() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllTrips(controller.signal);
        
        const normalized = data.map(rec => {
            const dates = collectDates(rec.associatedData);
            const sorted = dates.slice().sort();
            const startISO = sorted[0] || null;
            const endISO = sorted[sorted.length - 1] || null;

            // NEW: Derive destination using the helper function
            const destination = deriveDestination(rec.associatedData);

            return {
                ...rec,
                // Override original destination with the derived one
                destination: destination || rec.destination,
                status: String(rec.status || STATUS.PENDING).toUpperCase(),
                startDate: startISO ? toDisplayDate(startISO) : "",
                endDate: endISO ? toDisplayDate(endISO) : "",
            };
        });
        setAllRows(normalized);

      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const filteredRows = useMemo(() => {
    if (activeTab === "approved") return allRows.filter(r => r.status === STATUS.APPROVED);
    if (activeTab === "awaiting") return allRows.filter(r => r.status === STATUS.PENDING);
    if (activeTab === "rejected") return allRows.filter(r => r.status === STATUS.REJECTED || r.status === STATUS.CANCELLED);
    return allRows;
  }, [activeTab, allRows]);

  const counts = useMemo(() => {
    const awaiting = allRows.filter(r => r.status === STATUS.PENDING).length;
    const approved = allRows.filter(r => r.status === STATUS.APPROVED).length;
    const rejected = allRows.filter(r => r.status === STATUS.REJECTED || r.status === STATUS.CANCELLED).length;
    return { all: allRows.length, awaiting, approved, rejected };
  }, [allRows]);

  if (loading) {
    return (
       <div className="page-container trips-approver-page"><div className="loading-container"><div className="loader"></div><span>Loading trips…</span></div></div>
    );
  }
  if (error) return <div className="page-container trips-approver-page"><main className="table-wrapper">Error: {error.toString()}</main></div>;

  return (
    <div className="page-container trips-approver-page">
      <header className="page-header">
        <div className="header-tabs">
          {TABS.map((tab) => (
            <button key={tab.key} className={`tab-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label} ({counts[tab.key] ?? counts.all})
            </button>
          ))}
        </div>
      </header>
      <main className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>SUBMITTER</th><th>TRIP#</th><th>TRIP DETAILS</th>
              <th>DESTINATION</th><th>STATUS</th><th>APPROVER</th><th>BOOKING STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "1.5rem", color: "#67748e" }}>No trips in this tab.</td></tr>
            ) : filteredRows.map((t) => (
              <tr key={t.id} className="clickable-row" onClick={() => navigate(`/approver-trip-data/${t.id}`)}>
                <td className="td--align-top"><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                <td className="td--align-top">
                  <UserPill 
                    user={t.submitter} 
                    secondaryText={`on: ${toDisplayDate(t.createdOn)}`} 
                  />
                </td>
                <td className="td--align-top">{t.trip_number}</td>
                <td className="td--align-top">
                  <a className="trip-link" href="#" onClick={(e) => e.preventDefault()}>{t.tripName}</a>
                  <div className="trip-dates">
                    {t.startDate}{t.startDate && t.endDate && ' - '}{t.endDate}
                  </div>
                </td>
                <td>{t.destination}</td>
                <td><span className={`status-pill pill--${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td><UserPill user={t.approver} /></td>
                <td className="booking-cell"><BookingIcons types={t.booking} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}