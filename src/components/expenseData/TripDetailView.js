import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TripDetailView.css";
import UpdateTripForm from "./UpdateTripForm";

/* ---------------- Icons ---------------- */
const CloseIcon = () => (
  <svg viewBox="0 0 512 512" className="icon-hover">
    <path d="m285.7 256 198-198c8.2-8.2 8.2-21.5 0-29.7s-21.5-8.2-29.7 0l-198 198-198-198c-8.2-8.2-21.5-8.2-29.7 0s-8.2 21.5 0 29.7l198 198-198 198c-8.2 8.2-8.2 21.5 0 29.7 4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2l198-198 198 198c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.2-8.2 8.2-21.5 0-29.7L285.7 256z" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 512 512" className="icon-xs">
    <path d="M388.5 5.9h-265C58.6 5.9 5.9 58.6 5.9 123.5v265c0 64.8 52.8 117.6 117.6 117.6h265c64.8 0 117.6-52.8 117.6-117.6v-265c0-64.9-52.7-117.6-117.6-117.6zM298 264.3l-9.7 5.1c-1.6.9-2.7 2.6-2.7 4.4v27.1c0 16.8-13.9 30.5-30.8 30-16.3-.4-29.2-14.3-29.2-30.6v-30.2c0-21.9 12-41.9 31.4-52.1l13-6.9c10.2-5.4 16.6-15.9 16.6-27.5 0-16.8-14.2-31-31.1-31-16.8 0-30.9 14.1-31.1 30.9-.1 16.6-13.4 30.2-30 30.2-16.5 0-30-13.3-30-29.8-.1-50.3 40.8-91.2 91.1-91.2 50.2 0 91 40.8 91.1 91 .1 33.9-18.6 64.8-48.6 80.6z" />
  </svg>
);
const FlightIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m483.1 205.6-114-64.2v-26.8c0-41.3-22.5-79.2-58.7-99-33.7-18.4-74-18.5-107.7-.2l-.4.2c-36.5 19.7-59.1 57.7-59.1 99.2v26.4L28.9 205.6C10.6 215.9-.8 235.4-.8 256.5v45.2c0 11.6 9.4 21 21 21h122.9V466l-31.1 2.2c-11.6.8-20.3 10.8-19.5 22.4s10.8 20.3 22.4 19.5l141.2-9.9 140.6 9.9c.5 0 1 .1 1.5.1 10.9 0 20.1-8.5 20.9-19.5.8-11.6-7.9-21.6-19.5-22.4l-30.5-2.1V322.6h122.7c11.6 0 21-9.4 21-21v-45.2c0-21-11.4-40.5-29.7-50.8z"/></svg>);
const HotelIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m463 201.7-94.3-54V64.8c0-17.3-7.8-33.4-21.5-44.1-13.6-10.7-31.1-14.4-48-10.3l-227 56.1c-40.6 10.1-69 46.4-69 88.3v257.4c0 50.2 40.8 91 91 91H417.8c50.2 0 91-40.8 91-91V280.6c0-32.5-17.5-62.8-45.8-78.9z"/></svg>);
const CarIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m462.4 206.4-16.1-147C443.2 31 419.2 9.5 390.6 9.5H305c-3.7-5.9-10.3-9.8-17.8-9.8h-62.4c-7.5 0-14.1 3.9-17.8 9.8h-85.7c-28.6 0-52.5 21.4-55.7 49.9l-16.1 147c-26.2 16.7-43.7 46-43.7 79.4v134c0 30.9 25.1 56 56 56h25.6v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7h253v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7H450c30.9 0 56-25.1 56-56v-134c.1-33.4-17.3-62.7-43.6-79.4z"/></svg>);
const BusIcon  = () => (<svg viewBox="0 0 640 512" className="icon"><path d="M80 64C35.8 64 0 99.8 0 144v224c0 17.7 14.3 32 32 32h32c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h32c17.7 0 32-14.3 32-32V144c0-44.2-35.8-80-80-80H80zM64 144c0-8.8 7.2-16 16-16h480c8.8 0 16 7.2 16 16v128H64z"/></svg>);
const TrainIcon = () => (<svg viewBox="0 0 448 512" className="icon"><path d="M96 0C60.7 0 32 28.7 32 64V288c0 35.3 28.7 64 64 64l-32 32v32H160l32-32h64l32 32H384V384l-32-32c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H96zM96 64H352V208H96zM128 416l-32 32 32 32h32l32-32-32-32H128zM320 416H288l-32 32 32 32h32l32-32-32-32z"/></svg>);
const ArrowIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm"><path d="M415.2 230.1l-85.3-51-74.3-44.4c-23.2-13.9-54.4 1-54.4 25.9V221h-84.9c-19.3 0-35 15.7-35 35s15.7 35 35 35h84.9v60.3c0 25 31.2 39.8 54.4 25.9l74.3-44.4 85.3-51c20.6-12.2 20.6-39.4 0-51.7z"/></svg>);
const EditIcon  = () => (<svg viewBox="0 0 24 24" className="icon-sm"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>);

/* ---------------- Tabs ---------------- */
const ALL_TABS = [
  { key: "flight", label: "Flight", icon: <FlightIcon /> },
  { key: "hotel",  label: "Hotel",  icon: <HotelIcon /> },
  { key: "car",    label: "Car Rental", icon: <CarIcon /> },
  { key: "bus",    label: "Bus",    icon: <BusIcon /> },
  { key: "train",  label: "Train",  icon: <TrainIcon /> },
];

/* ---------------- Helpers ---------------- */
const toDisplayDate = (isoOrYmd) => {
  if (!isoOrYmd) return "";
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(",", "");
};
const toTime = (hhmm) => (hhmm ? hhmm : "");

/* Utility: normalize outer arrays (supports new lowercase & old PascalCase) */
const getArr = (obj, lcKey, pcKey) => obj?.[lcKey] || obj?.[pcKey] || [];

/* Utility: unwrap each element (supports wrapped `{flightDataZoho:{...}}` and direct `{...}`) */
const unwrap = (elem, innerKey) => {
  if (elem && typeof elem === "object" && innerKey in elem) return elem[innerKey];
  return elem; // already the record
};

/* --------- Mappers (include sub-record status) --------- */
const mapFlights = (arr = []) =>
  arr.map((w) => unwrap(w, "flightDataZoho"))
     .filter((f) => f && typeof f === "object")
     .map((f) => {
       const depCity = f.flight_dep_city || f.dep_city || "";
       const arrCity = f.flight_arrv_city || f.arrv_city || "";
       const depCode = (depCity || "").slice(0, 3).toUpperCase();
       const arrCode = (arrCity || "").slice(0, 3).toUpperCase();
       return {
         subRowId: f.ROWID || f.rowid || f.RowId || "",
         status: f.status, // used for allowEdit
         dep: {
           date: toDisplayDate(f.flight_dep_date || f.dep_date),
           time: toTime(f.flight_dep_time || f.dep_time),
           city: depCity,
           code: depCode,
           airport: f.flight_dep_airport || f.dep_airport || "",
         },
         arr: {
           date: toDisplayDate(f.flight_arrv_date || f.arrv_date),
           time: toTime(f.flight_arrv_time || f.arrv_time),
           city: arrCity,
           code: arrCode,
           airport: f.flight_arrv_airport || f.arr_airport || "",
         },
         nonStop: !!(f.non_stop || f.nonStop || f.direct_flight),
       };
     });

const mapHotels = (arr = []) =>
  arr.map((w) => unwrap(w, "hotelDataZoho"))
     .filter((h) => h && typeof h === "object")
     .map((h) => ({
       subRowId: h.ROWID || h.rowid || h.RowId || "",
       status: h.status,
       location: h.hotel_arrv_city || h.hotel_dep_city || "",
       checkIn:  { date: toDisplayDate(h.hotel_arrv_date), time: h.hotel_arrv_time || "" },
       checkOut: { date: toDisplayDate(h.hotel_dep_date), time: h.hotel_dep_time || "" },
     }));

const mapCars = (arr = []) =>
  arr.map((w) => unwrap(w, "carDataZoho"))
     .filter((c) => c && typeof c === "object")
     .map((c) => ({
       subRowId: c.ROWID || c.rowid || c.RowId || "",
       status: c.status,
       carType: c.car_type || "",
       driver:  c.driver || "No",
       pickUp:  { date: toDisplayDate(c.car_dep_date), location: c.car_dep_city || "" },
       dropOff: { date: toDisplayDate(c.car_arrv_date), location: c.car_arrv_city || "" },
     }));

const mapBuses = (arr = []) =>
  arr.map((w) => unwrap(w, "busDataZoho"))
     .filter((b) => b && typeof b === "object")
     .map((b) => ({
       subRowId: b.ROWID || b.rowid || b.RowId || "",
       status: b.status,
       from: { city: b.bus_dep_city || b.dep_city || "",  date: toDisplayDate(b.bus_dep_date || b.dep_date),  time: b.bus_dep_time || b.dep_time || "" },
       to:   { city: b.bus_arrv_city || b.arrv_city || "", date: toDisplayDate(b.bus_arrv_date || b.arrv_date), time: b.bus_arrv_time || b.arrv_time || "" },
     }));

const mapTrains = (arr = []) =>
  arr.map((w) => unwrap(w, "trainDataZoho"))
     .filter((t) => t && typeof t === "object")
     .map((t) => ({
       subRowId: t.ROWID || t.rowid || t.RowId || "",
       status: t.status,
       from: { city: t.train_dep_city || t.dep_city || "",  date: toDisplayDate(t.train_dep_date || t.dep_date),  time: t.train_dep_time || t.dep_time || "" },
       to:   { city: t.train_arrv_city || t.arrv_city || "", date: toDisplayDate(t.train_arrv_date || t.arrv_date), time: t.train_arrv_time || t.arrv_time || "" },
     }));

/* Trip duration from all modes (supports both shapes) */
const deriveDuration = (a = {}) => {
  const dates = [];
  const push = (v) => v && dates.push(v);

  const fl = getArr(a, "flightDataZoho", "FlightDataZoho");
  fl.forEach((w) => { const f = unwrap(w, "flightDataZoho") || {}; push(f.flight_dep_date); push(f.flight_arrv_date); });

  const ho = getArr(a, "hotelDataZoho", "HotelDataZoho");
  ho.forEach((w) => { const h = unwrap(w, "hotelDataZoho") || {}; push(h.hotel_dep_date);  push(h.hotel_arrv_date);  });

  const ca = getArr(a, "carDataZoho", "CarDataZoho");
  ca.forEach((w) => { const c = unwrap(w, "carDataZoho") || {}; push(c.car_dep_date);    push(c.car_arrv_date);    });

  const bu = getArr(a, "busDataZoho", "BusDataZoho");
  bu.forEach((w) => { const b = unwrap(w, "busDataZoho") || {}; push(b.bus_dep_date || b.dep_date); push(b.bus_arrv_date || b.arrv_date); });

  const tr = getArr(a, "trainDataZoho", "TrainDataZoho");
  tr.forEach((w) => { const t = unwrap(w, "trainDataZoho") || {}; push(t.train_dep_date || t.dep_date); push(t.train_arrv_date || t.arrv_date); });

  if (!dates.length) return "";
  const sorted = dates.slice().sort();
  const start = sorted[0], end = sorted.at(-1);
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
  return `${toDisplayDate(start)} - ${toDisplayDate(end)} (${days} ${days > 1 ? "Days" : "Day"})`;
};

/* -------- API (object/array friendly) -------- */
async function fetchDetailByRowId(rowid) {
  const res = await fetch(`/server/expenseData/?tripId=${encodeURIComponent(rowid)}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const d = json?.data;
  return Array.isArray(d) ? (d[0] || null) : (d || null);
}

/* ---------------- Subcomponents ---------------- */
const FlightDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    return (
      <div className="itinerary-item flight-item" key={`flt-${i}`}>
        <div className="itinerary-leg">
          <div className="date-block">
            <div className="font-xs text-muted">Departure</div>
            <div>{item.dep.date}{item.dep.time ? `, ${item.dep.time}` : ""}</div>
            <div>{item.dep.city}{item.dep.code ? ` - ${item.dep.code}` : ""}</div>
            {item.dep.airport ? <div className="font-xs text-muted">{item.dep.airport}</div> : null}
          </div>
          <div className="arrow"><ArrowIcon /></div>
          <div className="date-block">
            <div className="font-xs text-muted">Arrival</div>
            <div>{item.arr.date}{item.arr.time ? `, ${item.arr.time}` : ""}</div>
            <div>{item.arr.city}{item.arr.code ? ` - ${item.arr.code}` : ""}</div>
            {item.arr.airport ? <div className="font-xs text-muted">{item.arr.airport}</div> : null}
          </div>
        </div>
        {item.nonStop ? <div className="font-xs text-muted">non-stop</div> : null}
        {allowEdit && (
          <div className="item-actions">
            <button className="btn-icon" onClick={() => onEdit(item.subRowId, "flight")} title="Edit flight">
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    );
  });

const HotelDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    return (
      <div className="itinerary-item hotel-item" key={`hot-${i}`}>
        <div className="itinerary-date"><HotelIcon /> {item.location}</div>
        <div className="itinerary-leg">
          <div className="date-block">
            <div className="font-xs text-muted">Check-in</div>
            <div>{item.checkIn.date}</div>
            <div>{item.checkIn.time}</div>
          </div>
          <div className="arrow">-</div>
          <div className="date-block">
            <div className="font-xs text-muted">Check-out</div>
            <div>{item.checkOut.date}</div>
            <div>{item.checkOut.time}</div>
          </div>
        </div>
        {allowEdit && (
          <div className="item-actions">
            <button className="btn-icon" onClick={() => onEdit(item.subRowId, "hotel")} title="Edit hotel">
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    );
  });

const CarDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    return (
      <div className="itinerary-item car-item" key={`car-${i}`}>
        <div className="itinerary-date">
          <div className="font-xs text-muted">Car Type : {item.carType}</div>
          <div className="font-xs text-muted">Driver : {item.driver}</div>
        </div>
        <div className="itinerary-leg">
          <div className="date-block">
            <div className="font-xs text-muted">Pick-Up</div>
            <div>{item.pickUp.date}</div>
            <div>{item.pickUp.location}</div>
          </div>
          <div className="arrow"><ArrowIcon /></div>
          <div className="date-block">
            <div className="font-xs text-muted">Drop-Off</div>
            <div>{item.dropOff.date}</div>
            <div>{item.dropOff.location}</div>
          </div>
        </div>
        {allowEdit && (
          <div className="item-actions">
            <button className="btn-icon" onClick={() => onEdit(item.subRowId, "car")} title="Edit car">
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    );
  });

const BusDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    return (
      <div className="itinerary-item bus-item" key={`bus-${i}`}>
        <div className="itinerary-date"><BusIcon /> Bus</div>
        <div className="itinerary-leg">
          <div className="date-block">
            <div className="font-xs text-muted">Departure</div>
            <div>{item.from.date}</div>
            <div>{item.from.time}</div>
            <div className="font-xs text-muted">{item.from.city}</div>
          </div>
          <div className="arrow"><ArrowIcon /></div>
          <div className="date-block">
            <div className="font-xs text-muted">Arrival</div>
            <div>{item.to.date}</div>
            <div>{item.to.time}</div>
            <div className="font-xs text-muted">{item.to.city}</div>
          </div>
        </div>
        {allowEdit && (
          <div className="item-actions">
            <button className="btn-icon" onClick={() => onEdit(item.subRowId, "bus")} title="Edit bus">
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    );
  });

const TrainDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    return (
      <div className="itinerary-item train-item" key={`train-${i}`}>
        <div className="itinerary-date"><TrainIcon /> Train</div>
        <div className="itinerary-leg">
          <div className="date-block">
            <div className="font-xs text-muted">Departure</div>
            <div>{item.from.date}</div>
            <div>{item.from.time}</div>
            <div className="font-xs text-muted">{item.from.city}</div>
          </div>
          <div className="arrow"><ArrowIcon /></div>
          <div className="date-block">
            <div className="font-xs text-muted">Arrival</div>
            <div>{item.to.date}</div>
            <div>{item.to.time}</div>
            <div className="font-xs text-muted">{item.to.city}</div>
          </div>
        </div>
        {allowEdit && (
          <div className="item-actions">
            <button className="btn-icon" onClick={() => onEdit(item.subRowId, "train")} title="Edit train">
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    );
  });

/* ---------------- Main Component ---------------- */
export default function TripDetailView() {
  const navigate = useNavigate();
  const { rowid } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCtx, setEditCtx] = useState({ subRowId: "", tripType: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBack = () => navigate(-1);
  const handleOpenForm = (subRowId, tripType) => {
    setEditCtx({ subRowId, tripType });
    setIsFormOpen(true);
  };
  const handleCloseForm = () => setIsFormOpen(false);

    const handleUpdated = () => {                      // ✅ close + trigger refetch
    setIsFormOpen(false);
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        if (!rowid) throw new Error("No :rowid in route");

        const rec = await fetchDetailByRowId(rowid);
        if (!rec) throw new Error("Trip not found");

        const a = rec.associatedData || rec.AsspciatedData || {};

        const flights = mapFlights(getArr(a, "flightDataZoho", "FlightDataZoho"));
        const hotels  = mapHotels(getArr(a, "hotelDataZoho",  "HotelDataZoho"));
        const cars    = mapCars(getArr(a, "carDataZoho",    "CarDataZoho"));
        const buses   = mapBuses(getArr(a, "busDataZoho",   "BusDataZoho"));
        const trains  = mapTrains(getArr(a, "trainDataZoho", "TrainDataZoho"));

        const durationText = deriveDuration(a);

        // 👇 compute and store both label & lower
        const mainStatusLower = String(rec.status || rec.statusType || "").trim().toLowerCase();
        const mainStatusLabel = mainStatusLower === "completed" ? "Completed" : "Pending";

        const detail = {
          id: rec.tripNumber || rec.TripId || rec.ROWID || rowid,
          title: rec.Activity || "Trip",
          duration: durationText,
          mainStatusLower,
          mainStatusLabel,
          bookings: { flight: flights, hotel: hotels, car: cars, bus: buses, train: trains },
        };

        if (!cancelled) setTrip(detail);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
 }, [rowid, refreshKey]);

  const availableTabs = useMemo(() => {
    if (!trip) return [];
    return ALL_TABS.filter((t) => Array.isArray(trip.bookings[t.key]) && trip.bookings[t.key].length > 0);
  }, [trip]);

  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) setActiveTab(availableTabs[0].key);
  }, [availableTabs, activeTab]);

  if (loading) {
    return (
      <div className="ze-detail-view">
        <header className="ze-detail-header">
          <div className="ze-header-left"><div className="trip-id">{rowid || "—"}</div></div>
        </header>
        <div className="ze-detail-content">Loading…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="ze-detail-view">
        <header className="ze-detail-header">
          <div className="ze-header-left"><div className="trip-id">{rowid || "—"}</div></div>
        </header>
        <div className="ze-detail-content" style={{ color: "#b91c1c" }}>Error: {err}</div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <>
      <div className="ze-detail-view">
        <header className="ze-detail-header">
          <div className="ze-header-left">
            <div className="trip-id">{trip.id}</div>
            {/* 👇 STATUS PILL IN HEADER */}
            <span className={`status-pill pill--${trip.mainStatusLower}`} style={{ marginLeft: 8 }}>
              {trip.mainStatusLabel}
            </span>
          </div>
          <div className="ze-header-right">
            <button className="btn btn-icon" onClick={handleBack}><CloseIcon /></button>
          </div>
        </header>

        <div className="ze-detail-content">
          <section className="trip-summary">
            <h1 className="report-title">{trip.title}</h1>
            {trip.duration && (
              <div className="text-muted font-small">
                Duration <InfoIcon /> : {trip.duration}
              </div>
            )}
          </section>

          <section className="trip-itinerary">
            <div className="details-nav-tab">
              {availableTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div>
              {activeTab === "flight" && (
                <FlightDetails
                  bookings={trip.bookings.flight}
                  onEdit={handleOpenForm}
                  mainStatusLower={trip.mainStatusLower}
                />
              )}
              {activeTab === "hotel" && (
                <HotelDetails
                  bookings={trip.bookings.hotel}
                  onEdit={handleOpenForm}
                  mainStatusLower={trip.mainStatusLower}
                />
              )}
              {activeTab === "car" && (
                <CarDetails
                  bookings={trip.bookings.car}
                  onEdit={handleOpenForm}
                  mainStatusLower={trip.mainStatusLower}
                />
              )}
              {activeTab === "bus" && (
                <BusDetails
                  bookings={trip.bookings.bus}
                  onEdit={handleOpenForm}
                  mainStatusLower={trip.mainStatusLower}
                />
              )}
              {activeTab === "train" && (
                <TrainDetails
                  bookings={trip.bookings.train}
                  onEdit={handleOpenForm}
                  mainStatusLower={trip.mainStatusLower}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {isFormOpen && (
        <UpdateTripForm
          subRowId={editCtx.subRowId}
          tripType={editCtx.tripType}
          onClose={handleCloseForm}
          onSuccess={handleUpdated}
        />
      )}
    </>
  );
}
