import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AgentTripList.css";
import { fetchAgentTrips } from "../../api/trips";

/* ---------- Icons and Helpers (Keep these as they are) ---------- */
const FlightIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>);
const HotelIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7h-8v6h8V7zm4-2H5c-1.1 0-2 .9-2 2v14h2v-2h18v2h2V7c0-1.1-.9-2-2-2zM7 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>);
const CarIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>);
const BusIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 18H6V6h12v12zm-1.5-5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5-1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5S6.83 15 6 15s-1.5-.67-1.5-1.5S5.17 12 6 12zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15H4v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2z"></path></svg>);
const TrainIcon = () => (<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4.42 0-8 .5-8 4v10c0 2.21 1.79 4 4 4h1a1 1 0 001-1v-3h4v3a1 1 0 001 1h1c2.21 0 4-1.79 4-4V6c0-3.5-3.58-4-8-4zm4 14H8v-5h8v5zm-1.5-8c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm-5 0c-.83 0-1.5-.67-1.5-1.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8z"></path></svg>);
const ArrowLeftIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>);
const ArrowRightIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>);

const toDisplayDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return "";
    let s = dateString;
    const lastColon = s.lastIndexOf(':');
    if (lastColon > s.lastIndexOf('.')) s = s.substring(0, lastColon) + '.' + s.substring(lastColon + 1);
    const d = new Date(s.replace(' ', 'T'));
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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

const getDestination = (trip) => {
    const a = trip.associatedData || {};
    const keys = ["FLIGHT_ARRV_CITY", "TRAIN_ARRV_CITY", "BUS_ARRV_CITY", "CAR_ARRV_CITY", "HOTEL_ARRV_CITY"];
    const find = (arr) => {
        if (!Array.isArray(arr)) return null;
        for (const item of arr) for (const k of keys) if (item[k]) return item[k];
        return null;
    };
    return find(a.CarData) || find(a.FlightData) || find(a.TrainData) || find(a.BusData) || find(a.HotelData) || trip.destination || "N/A";
};

const getDisplayStatus = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING" || s === "SUBMITTED") return "Awaiting Approval";
    return status;
};

/* ---------- Subcomponents ---------- */
const UserPill = ({ user, secondaryText }) => (
    <div className="user-pill-wrapper">
        <div className="approver-pill">
            <span className="initial-circle" style={{ backgroundColor: user?.color }}>{user?.initials || "?"}</span>
            <span className="approver-name">{user?.name || "User"}</span>
        </div>
        {secondaryText && <div className="trip-dates">{secondaryText}</div>}
    </div>
);

const BookingIcons = ({ types = [] }) => {
    if (!Array.isArray(types) || types.length === 0) return <span>-</span>;
    const iconMap = { flight: <FlightIcon />, hotel: <HotelIcon />, car: <CarIcon />, bus: <BusIcon />, train: <TrainIcon /> };
    return types.map((t, i) => <span key={i} className="booking-icon-circle" title={t}>{iconMap[t]}</span>);
};

const TablePagination = ({ totalCount, rowsPerPage, setRowsPerPage, currentPage, setCurrentPage }) => {
    if (totalCount === 0) return null;
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalCount);

    return (
        <footer className="table-pagination">
            <span className="page-info">Total Trips: {totalCount}</span>
            <div className="pagination-right">
                <select className="rows-per-page-select" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
                <span>{start} - {end}</span>
                <div className="nav-arrows">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ArrowLeftIcon /></button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ArrowRightIcon /></button>
                </div>
            </div>
        </footer>
    );
};

/* ---------- Main Component ---------- */
// 1. Accept userEmail as a prop
const AgentTripList = ({ userEmail }) => {
    const navigate = useNavigate();
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // 2. Fetch Data
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            // Wait for userEmail to be available
            if (!userEmail) {
                setLoading(true);
                return;
            }

            setLoading(true);
            try {
                // 1. Get Raw Data from API
                const rawData = await fetchAgentTrips(controller.signal, userEmail);

                // ---------------------------------------------------------
                // 2. NEW: Frontend Filtering Logic
                // Only keep trips where the logged-in Agent's email exists 
                // in at least one associatedData item (Flight, Hotel, etc.)
                // ---------------------------------------------------------
                const filteredData = rawData.filter(trip => {
                    const ad = trip.associatedData || {};
                    const targetEmail = userEmail.toLowerCase().trim();

                    // Iterate over every category (FlightData, HotelData, etc.)
                    // Object.values(ad) gives us [[{...}, {...}], [{...}]]
                    return Object.values(ad).some(categoryList => {
                        if (!Array.isArray(categoryList)) return false;

                        // Check if ANY item in this list has the matching AGENT_EMAIL
                        return categoryList.some(item =>
                            item.AGENT_EMAIL &&
                            item.AGENT_EMAIL.toLowerCase().trim() === targetEmail
                        );
                    });
                });

                // 3. Map/Normalize the FILTERED data
                const normalized = filteredData.map(rec => {
                    const dates = collectDates(rec.associatedData);
                    const sorted = dates.slice().sort();
                    return {
                        ...rec,
                        destination: getDestination(rec),
                        status: String(rec.status || "PENDING").toUpperCase(),
                        startDate: sorted[0] ? toDisplayDate(sorted[0]) : "",
                        endDate: sorted[sorted.length - 1] ? toDisplayDate(sorted[sorted.length - 1]) : "",
                    };
                });

                setAllRows(normalized);
            } catch (e) {
                if (e.name !== "AbortError") setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [userEmail]);

    // ... (Keep existing Pagination Logic)
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return allRows.slice(start, start + rowsPerPage);
    }, [allRows, currentPage, rowsPerPage]);

    // ... (Keep existing Render)
    if (loading) return <div className="agent-trips-page"><div className="loading-container"><div className="loader"></div><span>Loading trips...</span></div></div>;
    if (error) return <div className="agent-trips-page"><div className="table-wrapper" style={{ padding: "20px" }}>Error: {error}</div></div>;

    return (
        <div className="agent-trips-page">
            <div className="agent-card">
                <main className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SUBMITTER</th>
                                <th>TRIP#</th>
                                <th>TRIP DETAILS</th>
                                <th>DESTINATION</th>
                                <th>STATUS</th>
                                <th>BOOKING</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allRows.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No trips found for {userEmail}.</td></tr>
                            ) : paginatedRows.map((t) => (
                                <tr
                                    key={t.id}
                                    className="clickable-row"
                                    // CHANGE THIS LINE:
                                    onClick={() => navigate(`/agent-trip-data/${t.id}`)}
                                >
                                    <td className="td--align-top">
                                        <UserPill user={t.submitter} secondaryText={`on: ${toDisplayDate(t.createdOn)}`} />
                                    </td>
                                    <td className="td--align-top trip-number-cell">{t.trip_number}</td>
                                    <td className="td--align-top">
                                        <div className="trip-details-group">
                                            <a className="trip-link" href="#" onClick={(e) => e.preventDefault()}>{t.tripName}</a>
                                            <div className="trip-dates">{t.startDate}{t.startDate && t.endDate && ' - '}{t.endDate}</div>
                                        </div>
                                    </td>
                                    <td>{t.destination}</td>
                                    <td>
                                        <span className={`status-pill pill--${t.status.toLowerCase()}`}>
                                            {getDisplayStatus(t.status)}
                                        </span>
                                    </td>
                                    <td className="booking-cell"><BookingIcons types={t.booking} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
                <TablePagination
                    totalCount={allRows.length}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default AgentTripList;