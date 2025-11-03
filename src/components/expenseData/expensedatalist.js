import React from "react";
import { useNavigate } from "react-router-dom";
import "./expensedatalist.css";
import TripDetailView from "./TripDetailView";

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


const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || "00:00"}:00`);
};

const deriveDestination = (a = {}) => {
  const arrivals = [];
  const departures = [];
  const cancelledArrivals = [];

  const modes = [
    ["flightDataZoho", "flight_arrv_city", "flight_arrv_date", "flight_arrv_time",
      "flight_dep_city", "flight_dep_date", "flight_dep_time", "reschedule_OR_Cancel",
      "unwrap", "flightDataZoho"],

    ["carDataZoho", "car_arrv_city", "car_arrv_date", "car_arrv_time",
      "car_dep_city", "car_dep_date", "car_dep_time", "reschedule_OR_Cancel",
      "unwrap", "carDataZoho"],

    ["hotelDataZoho", "hotel_arrv_city", "hotel_arrv_date", "hotel_arrv_time",
      "hotel_dep_city", "hotel_dep_date", "hotel_dep_time", "reschedule_OR_Cancel",
      "unwrap", "hotelDataZoho"],

    ["trainDataZoho", "train_arrv_city", "train_arrv_date", "train_arrv_time",
      "train_dep_city", "train_dep_date", "train_dep_time", "reschedule_OR_Cancel",
      "unwrap", "trainDataZoho"],

    ["busDataZoho", "bus_arrv_city", "bus_arrv_date", "bus_arrv_time",
      "bus_dep_city", "bus_dep_date", "bus_dep_time", "reschedule_OR_Cancel",
      "unwrap", "busDataZoho"],
  ];

  let modeCount = 0;
  let totalBookings = 0;
  let cancelledBookings = 0;

  for (const [key, arrCityField, arrDateField, arrTimeField, depCityField, depDateField, depTimeField, cancelField, unwrapFnName, inner] of modes) {
    const arr = getArr(a, key, inner);
    if (arr && arr.length > 0) {
      modeCount++;
    }
    for (const w of arr) {
      totalBookings++;
      const rec = unwrap(w, inner) || {};
      if (!rec[arrCityField]) continue;

      const isCancelled = ((rec[cancelField] || "").toLowerCase() === "cancelled");

      const arrivalDateTime = parseDateTime(rec[arrDateField], arrTimeField ? rec[arrTimeField] : null);
      if (!arrivalDateTime) continue;

      if (isCancelled) {
        cancelledBookings++;
        cancelledArrivals.push({ city: rec[arrCityField], date: arrivalDateTime });
      } else {
        arrivals.push({ city: rec[arrCityField], date: arrivalDateTime, index: arrivals.length });
        departures.push({ city: rec[depCityField] || "", date: parseDateTime(rec[depDateField], depTimeField ? rec[depTimeField] : null) });
      }
    }
  }

  if (modeCount === 0) return "";

  // Single mode logic updated for cancellation
  if (modeCount === 1) {
    if (cancelledBookings > 0) {
      // If there are cancelled bookings, destination is arrival city of the latest cancelled booking
      cancelledArrivals.sort((a, b) => b.date - a.date);
      return cancelledArrivals[0].city;
    } else {
      // No cancellation - destination is latest arrival city
      arrivals.sort((a, b) => b.date - a.date);
      return arrivals[0]?.city || "";
    }
  }

  // Multi-mode logic remains same
  if (!arrivals.length) return "";
  arrivals.sort((a, b) => a.date - b.date);

  const firstArrival = arrivals[0];
  const lastArrival = arrivals[arrivals.length - 1];

  if (firstArrival.city === lastArrival.city) {
    const departureCity = departures[lastArrival.index]?.city || "";
    return departureCity || lastArrival.city;
  }

  return lastArrival.city;
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
const TablePagination = ({ totalCount, rowsPerPage, setRowsPerPage, currentPage, setCurrentPage }) => {
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
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [showTripDetail, setShowTripDetail] = React.useState(false);
  const [selectedTripId, setSelectedTripId] = React.useState(null);

  // NEW: Filter dropdown and value state
  const [filterField, setFilterField] = React.useState("id");
  const [filterValue, setFilterValue] = React.useState("");

  const handleRowClick = (id) => {
    setSelectedTripId(id);
    setShowTripDetail(true);
  };

  const handleClose = () => {
    setShowTripDetail(false);
    setSelectedTripId(null);
  };

  const fetchData = React.useCallback(async (page, size) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/server/expenseData/?page=${page}&size=${size}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === "success") {
        const normalized = (json.data || []).map((rec, idx) => {
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
            title: rec.trip_name,
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
        }).sort((a, b) => {
          const numA = parseInt((a.id || "0").split("-")[1] || "0", 10);
          const numB = parseInt((b.id || "0").split("-")[1] || "0", 10);
          return numB - numA;
        });
        setRows(normalized);
        setTotalRecords(json.totalRecords || 0);
      } else {
        throw new Error(json.message || "Failed to fetch data");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData(currentPage, rowsPerPage);
  }, [fetchData, currentPage, rowsPerPage]);

  // Filter data based on dropdown + input value and tab
  const filteredRows = React.useMemo(() => {
    if (!filterValue.trim()) {
      // If no filter, just do tab filtering
      if (activeTab === "pending") return rows.filter((t) => t.status.type === "pending");
      if (activeTab === "completed") return rows.filter((t) => t.status.type === "completed");
      return rows;
    }
    const val = filterValue.trim().toLowerCase();
    const filtered = rows.filter((t) => {
      switch (filterField) {
        case "id":
          return t.id?.toLowerCase().includes(val);
        case "destination":
          return t.destination?.toLowerCase().includes(val);
        case "status": {
          const expected = val.toLowerCase();
          return (
            t._raw.EX_Status &&
            expected.length > 0 &&
            ["approved", "pending", "completed"].includes(t._raw.EX_Status.toLowerCase()) &&
            t._raw.EX_Status.toLowerCase().startsWith(expected)
          );
        }

        case "approver":
          return t.approver?.name?.toLowerCase().includes(val);
        default:
          return true;
      }
    });

    // Then tab filtering
    if (activeTab === "pending") return filtered.filter((t) => t.status.type === "pending");
    if (activeTab === "completed") return filtered.filter((t) => t.status.type === "completed");
    return filtered;
  }, [rows, filterField, filterValue, activeTab]);

  // Handle Clear Filter
  const clearFilter = () => setFilterValue("");

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

  if (error) {
    return (
      <div className="page-container">
        <main className="table-wrapper">Error: {error}</main>
      </div>
    );
  }

  return (
    <>
      {showTripDetail ? (
        <TripDetailView tripId={selectedTripId} onClose={handleClose} />
      ) : (
        <div className="page-container">
          <header className="page-header">
            <div className="header-tabs">
              <button
                className={`tab-item ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Trips ({rows.length})
              </button>
              <button
                className={`tab-item ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({rows.filter(t => t.status.type === "pending").length})
              </button>
              <button
                className={`tab-item ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed ({rows.filter(t => t.status.type === "completed").length})
              </button>
            </div>
            {/* FILTER UI */}
            <div className="filter-container" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: 12 }}>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="id">Trip#</option>
                <option value="destination">Destination</option>
                <option value="status">Status</option>
                <option value="approver">Requested By</option>
              </select>
              <input
                type="text"
                placeholder={`Filter by ${filterField === "id"
                  ? "Trip#"
                  : filterField.charAt(0).toUpperCase() + filterField.slice(1)
                  }`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid #ccc" }}
              />
              {filterValue && (
                <button onClick={clearFilter} style={{
                  padding: "6px 12px", borderRadius: 4, border: "none", backgroundColor: "#aaa",
                  color: "white", cursor: "pointer"
                }}>Clear</button>
              )}
            </div>
          </header>
          <main className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TRIP#</th>
                  <th>TRIP DETAILS</th>
                  <th>DESTINATION</th>
                  <th>STATUS</th>
                  <th>REQUESTED BY</th>
                  <th>BOOKING STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "1.5rem", color: "#67748e" }}>
                      No trips match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((t) => (
                    <tr key={t.rowid} className="clickable-row" onClick={() => handleRowClick(t.rowid)}>
                      <td className="trip-id">{t.id}</td>
                      <td>
                        <a className="trip-link" href="#" onClick={(e) => e.preventDefault()}>
                          {t.title}
                        </a>
                        <div className="trip-dates">
                          {t.startDate} {t.startDate && t.endDate ? " - " : ""} {t.endDate}
                        </div>
                      </td>
                      <td>{t.destination || "-"}</td>
                      <td>
                        <span className={`status-pill pill--${(t._raw.EX_Status || "unknown").toLowerCase()}`}>
                          {t._raw.EX_Status
                            ? t._raw.EX_Status.charAt(0).toUpperCase() + t._raw.EX_Status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td>
                        <ApproverPill user={t.approver} />
                      </td>
                      <td className="booking-cell">
                        {t.booking?.length ? t.booking.map((b, i) => <BookingIcon key={`${t.rowid}-${b}-${i}`} type={b} />) : <span>-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </main>
          <TablePagination
            totalCount={totalRecords}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </>
  );
};