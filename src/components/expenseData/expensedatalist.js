import React from "react";
import { useNavigate } from "react-router-dom";
import "./expensedatalist.css";

/* ---------- SVG Icon Components ---------- */
const FlightIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>
);
const HotelIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7h-8v6h8v-6zm4-2H5c-1.1 0-2 .9-2 2v14h2v-2h18v2h2V7c0-1.1-.9-2-2-2zM7 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path></svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 .45 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>
);
const BusIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 18H6V6h12v12zm-1.5-5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-9 0c.83 0 1.5.67 1.5 1.5S6.83 15 6 15s-1.5-.67-1.5-1.5S5.17 12 6 12zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15H4v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2z"></path></svg>
);
const TrainIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4.42 0-8 .5-8 4v10c0 2.21 1.79 4 4 4h1a1 1 0 001-1v-3h4v3a1 1 0 001 1h1c2.21 0 4-1.79 4-4V6c0-3.5-3.58-4-8-4zm4 14H8v-5h8v5zm-1.5-8c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm-5 0c-.83 0-1.5-.67-1.5-1.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8z"></path></svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
);

/* ---------- Helpers ---------- */
const unwrap = (elem, innerKey) => {
  if (elem && typeof elem === "object" && innerKey in elem) return elem[innerKey];
  return elem;
};
const getArr = (obj, lcKey, pcKey) => obj?.[lcKey] || obj?.[pcKey] || [];
const collectDates = (a = {}) => {
  const out = [];
  const push = (v) => v && out.push(v);
  getArr(a, "flightDataZoho", "FlightDataZoho").forEach((w) => {
    const f = unwrap(w, "flightDataZoho") || {};
    push(f.flight_dep_date); push(f.flight_arrv_date);
  });
  getArr(a, "hotelDataZoho", "HotelDataZoho").forEach((w) => {
    const h = unwrap(w, "hotelDataZoho") || {};
    push(h.hotel_dep_date); push(h.hotel_arrv_date);
  });
  getArr(a, "carDataZoho", "CarDataZoho").forEach((w) => {
    const c = unwrap(w, "carDataZoho") || {};
    push(c.car_dep_date); push(c.car_arrv_date);
  });
  getArr(a, "trainDataZoho", "TrainDataZoho").forEach((w) => {
    const t = unwrap(w, "trainDataZoho") || {};
    push(t.train_dep_date); push(t.train_arrv_date);
  });
  getArr(a, "busDataZoho", "BusDataZoho").forEach((w) => {
    const b = unwrap(w, "busDataZoho") || {};
    push(b.bus_dep_date); push(b.bus_arrv_date);
  });
  return out.filter(Boolean);
};
const toDisplayDate = (isoOrYmd) => {
  if (!isoOrYmd) return "";
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  const fmt = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return fmt.replace(",", "");
};
const deriveDestination = (a = {}) => {
  for (const [lc, pc, inner, field] of [
    ["flightDataZoho", "FlightDataZoho", "flightDataZoho", "flight_arrv_city"],
    ["carDataZoho", "CarDataZoho", "carDataZoho", "car_arrv_city"],
    ["hotelDataZoho", "HotelDataZoho", "hotelDataZoho", "hotel_arrv_city"],
    ["trainDataZoho", "TrainDataZoho", "trainDataZoho", "train_arrv_city"],
    ["busDataZoho", "BusDataZoho", "busDataZoho", "bus_arrv_city"],
  ]) {
    const arr = getArr(a, lc, pc);
    for (const w of arr) {
      const rec = unwrap(w, inner) || {};
      if (rec[field]) return rec[field];
    }
  }
  return "";
};
const deriveBookingList = (a = {}) => {
  const list = [];
  if (getArr(a, "flightDataZoho", "FlightDataZoho").length) list.push("flight");
  if (getArr(a, "hotelDataZoho", "HotelDataZoho").length) list.push("hotel");
  if (getArr(a, "carDataZoho", "CarDataZoho").length) list.push("car");
  if (getArr(a, "trainDataZoho", "TrainDataZoho").length) list.push("train");
  if (getArr(a, "busDataZoho", "BusDataZoho").length) list.push("bus");
  return list;
};
const BookingIcon = ({ type }) => {
  const map = { flight: <FlightIcon />, hotel: <HotelIcon />, car: <CarIcon />, train: <TrainIcon />, bus: <BusIcon /> };
  return <span className="booking-icon-circle" title={type}>{map[type] || "•"}</span>;
};
const ApproverPill = ({ user }) => (
  <div className={`approver-pill approver-pill--${user?.colorScheme || "gray"}`}>
    <span className="initial-circle">{user?.initial || "U"}</span>
    <span className="approver-name">{user?.name || "User"}</span>
  </div>
);

/* ---------- Pagination Component ---------- */
const TablePagination = ({
  totalCount,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const [showCount, setShowCount] = React.useState(false);
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalCount);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };
  
  if (totalCount === 0) return null;

  return (
    <footer className="table-pagination">
      <div className="pagination-left">
        <button className="total-count-btn" onClick={() => setShowCount(!showCount)}>
          Total Count {showCount && `: ${totalCount}`}
        </button>
      </div>
      <div className="pagination-right">
        <select className="rows-per-page-select" value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
          <option value={200}>200 per page</option>
        </select>
        <span className="page-info">{startItem} - {endItem}</span>
        <div className="nav-arrows">
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            <ArrowLeftIcon />
          </button>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </footer>
  );
};

/* ---------- Main Component ---------- */
export default function ExpenseDataList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("all");
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("server/expenseData/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const normalized = (json?.data || [])
          .map((rec, idx) => {
            const a = rec.associatedData || rec.AsspciatedData || {};
            const dates = collectDates(a);
            const sorted = dates.slice().sort();
            const startISO = sorted[0] || null;
            const endISO = sorted[sorted.length - 1] || null;
            const bookingList = deriveBookingList(a);
            const destination = deriveDestination(a);
            const statusType = String(rec.status || "").toLowerCase() === "completed" ? "completed" : "pending";
            const statusLabel = statusType === "completed" ? "Completed" : "Pending";
            return {
              rowid: rec.ROWID || rec.rowid || idx + 1,
              id: rec.tripNumber || rec.TripId || rec.id,
              title: rec.Activity || rec.title || "Trip",
              startDate: startISO ? toDisplayDate(startISO) : "",
              endDate: endISO ? toDisplayDate(endISO) : "",
              destination,
              status: { label: statusLabel, type: statusType },
              approver: {
                name: rec.RequestedBy || rec.UserName || "User",
                initial: (rec.UserName || rec.RequestedBy || "U")[0]?.toUpperCase() || "U",
                colorScheme: "gray",
              },
              booking: bookingList,
              _raw: rec,
              _subforms: {
                flight: getArr(a, "flightDataZoho", "FlightDataZoho").map((x) => unwrap(x, "flightDataZoho")).filter(Boolean),
                hotel: getArr(a, "hotelDataZoho", "HotelDataZoho").map((x) => unwrap(x, "hotelDataZoho")).filter(Boolean),
                car: getArr(a, "carDataZoho", "CarDataZoho").map((x) => unwrap(x, "carDataZoho")).filter(Boolean),
                train: getArr(a, "trainDataZoho", "TrainDataZoho").map((x) => unwrap(x, "trainDataZoho")).filter(Boolean),
                bus: getArr(a, "busDataZoho", "BusDataZoho").map((x) => unwrap(x, "busDataZoho")).filter(Boolean),
              },
            };
          })
          .sort((a, b) => {
            const numA = parseInt((a.id || "0").split('-')[1] || "0", 10);
            const numB = parseInt((b.id || "0").split('-')[1] || "0", 10);
            return numB - numA;
          });
        setRows(normalized);
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (id) => {
    navigate(`/expenseDataView/${id}`);
  };

  const filteredRows = React.useMemo(() => {
    setCurrentPage(1);
    if (activeTab === "pending") return rows.filter((t) => t.status.type === "pending");
    if (activeTab === "completed") return rows.filter((t) => t.status.type === "completed");
    return rows;
  }, [rows, activeTab]);
  
  const paginatedRows = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const counts = React.useMemo(() => {
    let pending = 0, completed = 0;
    rows.forEach((t) => {
      if (t.status.type === "pending") pending += 1;
      if (t.status.type === "completed") completed += 1;
    });
    return { all: rows.length, pending, completed };
  }, [rows]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loader"></div>
          <span>Loading trips…</span>
        </div>
      </div>
    );
  }
  if (error) return <div className="page-container"><main className="table-wrapper">Error: {error}</main></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-tabs">
          <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            All Trips ({counts.all})
          </button>
          <button className={`tab-item ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending ({counts.pending})
          </button>
          <button className={`tab-item ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
            Completed ({counts.completed})
          </button>
        </div>
      </header>
      <main className="table-wrapper">
        <table className="data-table">
         <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>TRIP#</th>
              <th>TRIP DETAILS</th>
              <th>DESTINATION</th>
              <th>STATUS</th>
              <th>REQUESTED BY</th>
              <th>BOOKING STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "1.5rem", color: "#67748e" }}>No trips in this tab.</td></tr>
            ) : paginatedRows.map((t) => (
              <tr key={t.rowid} className="clickable-row" onClick={() => handleRowClick(t.rowid)}>
                <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                <td className="trip-id">{t.id}</td>
                <td>
                  <a className="trip-link" href="#" onClick={(e) => e.preventDefault()}>{t.title}</a>
                  <div className="trip-dates">
                    {t.startDate} {t.startDate && t.endDate ? " - " : ""}{t.endDate}
                  </div>
                </td>
                <td>{t.destination || "-"}</td>
                <td><span className={`status-pill pill--${t.status.type}`}>{t.status.label}</span></td>
                <td><ApproverPill user={t.approver} /></td>
                <td className="booking-cell">
                  {t.booking?.length ? t.booking.map((b, i) => <BookingIcon key={`${t.rowid}-${b}-${i}`} type={b} />) : <span>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <TablePagination
        totalCount={filteredRows.length}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}