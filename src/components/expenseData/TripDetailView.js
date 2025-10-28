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
const FlightIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m483.1 205.6-114-64.2v-26.8c0-41.3-22.5-79.2-58.7-99-33.7-18.4-74-18.5-107.7-.2l-.4.2c-36.5 19.7-59.1 57.7-59.1 99.2v26.4L28.9 205.6C10.6 215.9-.8 235.4-.8 256.5v45.2c0 11.6 9.4 21 21 21h122.9V466l-31.1 2.2c-11.6.8-20.3 10.8-19.5 22.4s10.8 20.3 22.4 19.5l141.2-9.9 140.6 9.9c.5 0 1 .1 1.5.1 10.9 0 20.1-8.5 20.9-19.5.8-11.6-7.9-21.6-19.5-22.4l-30.5-2.1V322.6h122.7c11.6 0 21-9.4 21-21v-45.2c0-21-11.4-40.5-29.7-50.8z" /></svg>);
const HotelIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m463 201.7-94.3-54V64.8c0-17.3-7.8-33.4-21.5-44.1-13.6-10.7-31.1-14.4-48-10.3l-227 56.1c-40.6 10.1-69 46.4-69 88.3v257.4c0 50.2 40.8 91 91 91H417.8c50.2 0 91-40.8 91-91V280.6c0-32.5-17.5-62.8-45.8-78.9z" /></svg>);
const CarIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m462.4 206.4-16.1-147C443.2 31 419.2 9.5 390.6 9.5H305c-3.7-5.9-10.3-9.8-17.8-9.8h-62.4c-7.5 0-14.1 3.9-17.8 9.8h-85.7c-28.6 0-52.5 21.4-55.7 49.9l-16.1 147c-26.2 16.7-43.7 46-43.7 79.4v134c0 30.9 25.1 56 56 56h25.6v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7h253v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7H450c30.9 0 56-25.1 56-56v-134c.1-33.4-17.3-62.7-43.6-79.4z" /></svg>);
const BusIcon = () => (<svg viewBox="0 0 640 512" className="icon"><path d="M80 64C35.8 64 0 99.8 0 144v224c0 17.7 14.3 32 32 32h32c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h32c17.7 0 32-14.3 32-32V144c0-44.2-35.8-80-80-80H80zM64 144c0-8.8 7.2-16 16-16h480c8.8 0 16 7.2 16 16v128H64z" /></svg>);
const TrainIcon = () => (<svg viewBox="0 0 448 512" className="icon"><path d="M96 0C60.7 0 32 28.7 32 64V288c0 35.3 28.7 64 64 64l-32 32v32H160l32-32h64l32 32H384V384l-32-32c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H96zM96 64H352V208H96zM128 416l-32 32 32 32h32l32-32-32-32H128zM320 416H288l-32 32 32 32h32l32-32-32-32z" /></svg>);
const ArrowIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm"><path d="M415.2 230.1l-85.3-51-74.3-44.4c-23.2-13.9-54.4 1-54.4 25.9V221h-84.9c-19.3 0-35 15.7-35 35s15.7 35 35 35h84.9v60.3c0 25 31.2 39.8 54.4 25.9l74.3-44.4 85.3-51c20.6-12.2 20.6-39.4 0-51.7z" /></svg>);
const EditIcon = () => (<svg viewBox="0 0 24 24" className="icon-sm"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>);
const LocationIcon = () => (<svg viewBox="0 0 384 512" className="icon"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></svg>);
/* ---------------- Tabs ---------------- */
const ALL_TABS = [
  { key: "flight", label: "Flight", icon: <FlightIcon /> },
  { key: "hotel", label: "Hotel", icon: <HotelIcon /> },
  { key: "car", label: "Car Rental", icon: <CarIcon /> },
  { key: "bus", label: "Bus", icon: <BusIcon /> },
  { key: "train", label: "Train", icon: <TrainIcon /> },
];
/* ---------------- Helpers: Duration Calculation ---------------- */
const calculateDuration = (depDateStr, depTimeStr, arrDateStr, arrTimeStr) => {
  if (!depDateStr || !depTimeStr || !arrDateStr || !arrTimeStr) return "";
  try {
    const dep = new Date(`${depDateStr}T${depTimeStr}`);
    const arr = new Date(`${arrDateStr}T${arrTimeStr}`);
    const diffMs = arr.getTime() - dep.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "";
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  } catch (e) {
    return ""; // Return empty string on parsing errors
  }
};
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

/* --------- Mappers (include sub-record status with cancellation_charge and refund) --------- */
const mapFlights = (arr = []) =>
  arr.map((w) => unwrap(w, "flightDataZoho"))
    .filter((f) => f && typeof f === "object")
    .map((f) => {
      const depCity = f.flight_dep_city || f.dep_city || "";
      const arrCity = f.flight_arrv_city || f.arrv_city || "";
      const depCode = (depCity || "").slice(0, 3).toUpperCase();
      const arrCode = (arrCity || "").slice(0, 3).toUpperCase();

      const duration = calculateDuration(f.flight_dep_date, f.flight_dep_time, f.flight_arrv_date, f.flight_arrv_time);

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
          time: toTime(f.flight_arrv_time || f.arr_time),
          city: arrCity,
          code: arrCode,
          airport: f.flight_arrv_airport || f.arr_airport || "",
        },
        duration: duration,
        amount: f.bcy_total_amount || 0,
        meal: f.meal || "",
        seat: f.seat || "",
        flightClass: f.flight_class || f.flightClass || "",
        nonStop: !!(f.non_stop || f.nonStop || f.direct_flight),
        rescheduleOrCancel: f.reschedule_OR_Cancel,
        refund_amount: f.refund_amount || 0,
        cancellation_charge: f.cancellation_charge || 0,
        cancel_or_reschedule_reason: f.cancel_or_reschedule_reason || "",
      };
    });

const mapHotels = (arr = []) =>
  arr.map((w) => unwrap(w, "hotelDataZoho"))
    .filter((h) => h && typeof h === "object")
    .map((h) => ({
      subRowId: h.ROWID || h.rowid || h.RowId || "",
      status: h.status,

      merchantName: h.hotel_name || h.merchant_name || "",
      location: h.hotel_arrv_city || h.hotel_dep_city || "",
      roomType: h.room_type || "None",
      amount: h.bcy_total_amount || 0,
      rescheduleOrCancel: h.reschedule_OR_Cancel,
      refund_amount: h.refund_amount || 0,
      cancellation_charge: h.cancellation_charge || 0,
      cancel_or_reschedule_reason: h.cancel_or_reschedule_reason || "",

      checkIn: { date: toDisplayDate(h.hotel_dep_date), time: h.hotel_dep_time || "" },
      checkOut: { date: toDisplayDate(h.hotel_arrv_date), time: h.hotel_arrv_time || "" },
    }));

const mapCars = (arr = []) =>
  arr.map((w) => unwrap(w, "carDataZoho"))
    .filter((c) => c && typeof c === "object")
    .map((c) => ({
      subRowId: c.ROWID || c.rowid || c.RowId || "",
      status: c.status,
      carType: c.car_type || "",
      pickUp: { date: toDisplayDate(c.car_dep_date), time: toTime(c.car_dep_time), location: c.car_dep_city || "" },
      dropOff: { date: toDisplayDate(c.car_arrv_date), time: toTime(c.car_arrv_time), location: c.car_arrv_city || "" },
      amount: c.bcy_total_amount || 0,
      rescheduleOrCancel: c.reschedule_OR_Cancel,
      refund_amount: c.refund_amount || 0,
      cancellation_charge: c.cancellation_charge || 0,
      cancel_or_reschedule_reason: c.cancel_or_reschedule_reason || "",
    }));

const mapBuses = (arr = []) =>
  arr.map((w) => unwrap(w, "busDataZoho"))
    .filter((b) => b && typeof b === "object")
    .map((b) => {
      const depDate = b.bus_dep_date || b.dep_date;
      const arrDate = b.bus_arrv_date || b.arrv_date;
      const depTime = b.bus_dep_time || b.dep_time || "";
      const arrTime = b.bus_arrv_time || b.arrv_time || "";
      const duration = calculateDuration(depDate, depTime, arrDate, arrTime);

      return {
        subRowId: b.ROWID || b.rowid || b.RowId || "",
        status: b.status,
        merchantName: b.merchant_name || b.bus_name || "",
        amount: b.bcy_total_amount || 0,
        from: { city: b.bus_dep_city || b.dep_city || "", date: toDisplayDate(depDate), time: depTime },
        to: { city: b.bus_arrv_city || b.arrv_city || "", date: toDisplayDate(arrDate), time: arrTime },
        duration: duration,
        rescheduleOrCancel: b.reschedule_OR_Cancel,
        refund_amount: b.refund_amount || 0,
        cancellation_charge: b.cancellation_charge || 0,
        cancel_or_reschedule_reason: b.cancel_or_reschedule_reason || "",
      };
    });

const mapTrains = (arr = []) =>
  arr.map((w) => unwrap(w, "trainDataZoho"))
    .filter((t) => t && typeof t === "object")
    .map((t) => {
      const depDate = t.train_dep_date || t.dep_date;
      const arrDate = t.train_arrv_date || t.arrv_date;
      const depTime = t.train_dep_time || t.dep_time || "";
      const arrTime = t.train_arrv_time || t.arrv_time || "";

      const duration = calculateDuration(depDate, depTime, arrDate, arrTime);

      return {
        subRowId: t.ROWID || t.rowid || t.RowId || "",
        status: t.status,
        merchantName: t.merchant_name || t.train_name || "",
        amount: t.bcy_total_amount || 0,
        from: { city: t.train_dep_city || t.dep_city || "", date: toDisplayDate(depDate), time: depTime },
        to: { city: t.train_arrv_city || t.arrv_city || "", date: toDisplayDate(arrDate), time: arrTime },
        duration: duration,
        rescheduleOrCancel: t.reschedule_OR_Cancel,
        refund_amount: t.refund_amount || 0,
        cancellation_charge: t.cancellation_charge || 0,
        cancel_or_reschedule_reason: t.cancel_or_reschedule_reason || "",
      };
    });

/* Trip duration from all modes (supports both shapes) */
const deriveDuration = (a = {}) => {
  const dates = [];
  const push = (v) => v && dates.push(v);

  const fl = getArr(a, "flightDataZoho", "FlightDataZoho");
  fl.forEach((w) => { const f = unwrap(w, "flightDataZoho") || {}; push(f.flight_dep_date); push(f.flight_arrv_date); });

  const ho = getArr(a, "hotelDataZoho", "HotelDataZoho");
  ho.forEach((w) => { const h = unwrap(w, "hotelDataZoho") || {}; push(h.hotel_dep_date); push(h.hotel_arrv_date); });

  const ca = getArr(a, "carDataZoho", "CarDataZoho");
  ca.forEach((w) => { const c = unwrap(w, "carDataZoho") || {}; push(c.car_dep_date); push(c.car_arrv_date); });

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
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const FlightDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    const hasExtraDetails = item.meal || item.seat || item.flightClass;
    const itemClassName = `itinerary-item flight-item ${hasExtraDetails ? 'has-extra-details' : ''}`;

    const isCancelled = item.rescheduleOrCancel?.toLowerCase() === "cancelled";

    const showTopRow = item.rescheduleOrCancel || hasExtraDetails;
    return (
      <div className="flight-item-wrapper" key={`flt-${i}`}>
        {/* Top row: tag to the left, extras to the right */}
        {showTopRow && (
          <div className="flight-item-toprow">
            {/* Left side: reschedule/cancel tag */}
            <div className="line-tag" >
              <div className="dot-line"></div>
              {item.rescheduleOrCancel && (
                <span className="mode-tag mode-tag--reschedule-cancel" title={item.rescheduleOrCancel}>
                  {item.rescheduleOrCancel}
                </span>
              )}
              {item.cancel_or_reschedule_reason && (
                <span className="cancel-reschedule-reason" title={item.cancel_or_reschedule_reason}>
                  {item.cancel_or_reschedule_reason}
                </span>
              )}
            </div>
            {/* Right side: extra details */}
            <div>
              {hasExtraDetails && (
                <div className="flight-extra-details">
                  {item.meal && <span>Meal: {item.meal}</span>}
                  {item.seat && <span>Seat: {item.seat}</span>}
                  {item.flightClass && <span>Flight Class: {item.flightClass}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={itemClassName}>
          {/* Departure Column */}
          <div className="itinerary-col">
            <div>{item.dep.date}, {item.dep.time}</div>
            <div className="font-large">{item.dep.city} - {item.dep.code}</div>
          </div>

          {/* Middle Column */}
          <div className="itinerary-col text-center">
            <ArrowIcon />
            <div className="font-xs text-muted">{item.duration}</div>
            <div className="font-xs text-muted">{item.nonStop ? "non-stop" : ""}</div>
          </div>

          {/* Arrival Column */}
          <div className="itinerary-col">
            <div>{item.arr.date}, {item.arr.time}</div>
            <div className="font-large">{item.arr.city} - {item.arr.code}</div>
          </div>

          {/* Amount & Actions Column */}
          <div className="itinerary-col amount-actions-col">
            {allowEdit && (
              <button className="btn-icon" onClick={() => onEdit(item.subRowId, "flight")} title="Edit flight">
                <EditIcon />
              </button>
            )}
            <div className="amount-display">
              Amount: {formatCurrency(item.amount)}
            </div>
          </div>
        </div>
        {isCancelled && (
          <>
            <div className="amount-display" >
              Cancellation Charge: {formatCurrency(item.cancellation_charge)}
            </div>
            <div className="amount-display" >
              Refund Amount: {formatCurrency(item.refund_amount)}
            </div>
          </>
        )}
      </div>
    );
  });


const HotelDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    const showTopRow = item.rescheduleOrCancel;
    const isCancelled = item.rescheduleOrCancel?.toLowerCase() === "cancelled";
    return (
      <div className="hotel-item-wrapper" key={`hot-${i}`}>
        {/* Top row: tag left */}
        {showTopRow && (
          <div className="hotel-item-toprow">
            <div className="line-tag" >
              <div className="dot-line"></div>
              {item.rescheduleOrCancel && (
                <span className="mode-tag mode-tag--reschedule-cancel" title={item.rescheduleOrCancel}>
                  {item.rescheduleOrCancel}
                </span>
              )}
              {item.cancel_or_reschedule_reason && (
                <span className="cancel-reschedule-reason" title={item.cancel_or_reschedule_reason}>
                  {item.cancel_or_reschedule_reason}
                </span>
              )}
            </div>
            <div>{/* Optional right side content or leave empty for spacing */}</div>
          </div>
        )}
        <div className="itinerary-item hotel-item">
          <div className="hotel-info-col hotel-location">
            <LocationIcon />
            <div className="hotel-location-text">
              <div className="hotel-merchant-name">{item.merchantName || item.location}</div>
              {item.merchantName && <div className="font-xs text-muted">{item.location}</div>}
              <div className="font-xs text-muted">Room Type : {item.roomType}</div>
            </div>
          </div>

          <div className="hotel-info-col hotel-checkin">
            <div className="font-xs text-muted">Check-in</div>
            <div>{item.checkIn.date}</div>
            {item.checkIn.time && <div className="font-xs">{item.checkIn.time}</div>}
          </div>

          <div className="hotel-date-separator">-</div>

          <div className="hotel-info-col hotel-checkout">
            <div className="font-xs text-muted">Check-out</div>
            <div>{item.checkOut.date}</div>
            {item.checkOut.time && <div className="font-xs">{item.checkOut.time}</div>}
          </div>

          <div className="item-actions hotel-actions">
            {allowEdit && (
              <button className="btn-icon" onClick={() => onEdit(item.subRowId, "hotel")} title="Edit hotel">
                <EditIcon />
              </button>
            )}
            <div className="amount-display">
              Amount: {formatCurrency(item.amount)}
            </div>
          </div>
        </div>
        {isCancelled && (
          <>
            <div className="amount-display">
              Cancellation Charge: {formatCurrency(item.cancellation_charge)}
            </div>
            <div className="amount-display" >
              Refund Amount: {formatCurrency(item.refund_amount)}
            </div>
          </>
        )}
      </div>
    );
  });

const CarDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    const showTopRow = item.rescheduleOrCancel;
    const isCancelled = item.rescheduleOrCancel?.toLowerCase() === "cancelled";

    return (
      <div className="car-item-wrapper" key={`car-${i}`}>
        {showTopRow && (
          <div className="car-item-toprow">
            <div className="line-tag" >
              <div className="dot-line"></div>
              {item.rescheduleOrCancel && (
                <span className="mode-tag mode-tag--reschedule-cancel" title={item.rescheduleOrCancel}>
                  {item.rescheduleOrCancel}
                </span>
              )}
              {item.cancel_or_reschedule_reason && (
                <span className="cancel-reschedule-reason" title={item.cancel_or_reschedule_reason}>
                  {item.cancel_or_reschedule_reason}
                </span>
              )}
            </div>
            <div>{/* Optional right side content or keep empty */}</div>
          </div>
        )}
        <div className="itinerary-item car-item">
          <div className="car-info-col car-type">
            <CarIcon />
            <div>
              <div className="font-xs text-muted">Car Type</div>
              <div>{item.carType}</div>
            </div>
          </div>

          <div className="car-info-col car-pickup">
            <div className="font-xs text-muted">Pick-Up</div>
            <div>
              {item.pickUp.date}
              {item.pickUp.time && `, ${item.pickUp.time}`}
            </div>
            <div className="font-xs">{item.pickUp.location}</div>
          </div>

          <div className="car-separator">
            <ArrowIcon />
          </div>

          <div className="car-info-col car-dropoff">
            <div className="font-xs text-muted">Drop-Off</div>
            <div>
              {item.dropOff.date}
              {item.dropOff.time && `, ${item.dropOff.time}`}
            </div>
            <div className="font-xs">{item.dropOff.location}</div>
          </div>

          <div className="item-actions">
            {allowEdit && (
              <button className="btn-icon" onClick={() => onEdit(item.subRowId, "car")} title="Edit car">
                <EditIcon />
              </button>
            )}
            <div className="amount-display">
              Amount: {formatCurrency(item.amount)}
            </div>
          </div>
        </div>
        {isCancelled && (
          <>
            <div className="amount-display" >
              Cancellation Charge: {formatCurrency(item.cancellation_charge)}
            </div>
            <div className="amount-display" >
              Refund Amount: {formatCurrency(item.refund_amount)}
            </div>
          </>
        )}
      </div>

    );
  });

const BusDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    const showTopRow = item.rescheduleOrCancel;
    const isCancelled = item.rescheduleOrCancel?.toLowerCase() === "cancelled";

    return (
      <div className="bus-item-wrapper" key={`bus-${i}`}>
        {showTopRow && (
          <div className="bus-item-toprow">
            <div className="line-tag" >
              <div className="dot-line"></div>
              {item.rescheduleOrCancel && (
                <span className="mode-tag mode-tag--reschedule-cancel" title={item.rescheduleOrCancel}>
                  {item.rescheduleOrCancel}
                </span>
              )}
              {item.cancel_or_reschedule_reason && (
                <span className="cancel-reschedule-reason" title={item.cancel_or_reschedule_reason}>
                  {item.cancel_or_reschedule_reason}
                </span>
              )}
            </div>
            <div>{/* Optional right side content or keep empty */}</div>
          </div>
        )}
        <div className="itinerary-item bus-item">
          <div className="bus-info-col bus-label">
            <BusIcon />
            <span>{item.merchantName || "Bus"}</span>
          </div>

          <div className="bus-info-col bus-departure">
            <div className="font-xs text-muted">Departure</div>
            <div>{item.from.date}{item.from.time ? `, ${item.from.time}` : ""}</div>
            <div className="font-xs">{item.from.city}</div>
          </div>

          <div className="bus-separator">
            <ArrowIcon />
            <div className="font-xs text-muted">{item.duration}</div>
          </div>

          <div className="bus-info-col bus-arrival">
            <div className="font-xs text-muted">Arrival</div>
            <div>{item.to.date}{item.to.time ? `, ${item.to.time}` : ""}</div>
            <div className="font-xs">{item.to.city}</div>
          </div>

          <div className="item-actions">
            {allowEdit && (
              <button className="btn-icon" onClick={() => onEdit(item.subRowId, "bus")} title="Edit bus">
                <EditIcon />
              </button>
            )}
            <div className="amount-display">
              Amount: {formatCurrency(item.amount)}
            </div>
          </div>
        </div>
        {isCancelled && (
          <>
            <div className="amount-display" >
              Cancellation Charge: {formatCurrency(item.cancellation_charge)}
            </div>
            <div className="amount-display">
              Refund Amount: {formatCurrency(item.refund_amount)}
            </div>
          </>
        )}
      </div>
    );
  });

const TrainDetails = ({ bookings, onEdit, mainStatusLower }) =>
  bookings.map((item, i) => {
    const allowEdit = mainStatusLower === "pending" && String(item.status || "").trim() !== "completed";
    const showTopRow = item.rescheduleOrCancel;
    const isCancelled = item.rescheduleOrCancel?.toLowerCase() === "cancelled";

    return (
      <div className="train-item-wrapper" key={`train-${i}`}>
        {showTopRow && (
          <div className="train-item-toprow">
            <div style={{ display: "flex", gap: "8px" }}>
              {item.rescheduleOrCancel && (
                <span className="mode-tag mode-tag--reschedule-cancel" title={item.rescheduleOrCancel}>
                  {item.rescheduleOrCancel}
                </span>
              )}
              {item.cancel_or_reschedule_reason && (
                <span className="cancel-reschedule-reason" title={item.cancel_or_reschedule_reason}>
                  {item.cancel_or_reschedule_reason}
                </span>
              )}
            </div>
            <div>{/* Optional right side content or keep empty */}</div>
          </div>
        )}
        <div className="itinerary-item train-item">
          <div className="train-info-col train-label">
            <TrainIcon />
            <span>{item.merchantName || "Train"}</span>
          </div>

          <div className="train-info-col train-departure">
            <div className="font-xs text-muted">Departure</div>
            <div>{item.from.date}{item.from.time ? `, ${item.from.time}` : ""}</div>
            <div className="font-xs">{item.from.city}</div>
          </div>

          <div className="train-separator">
            <ArrowIcon />
            <div className="font-xs text-muted">{item.duration}</div>
          </div>

          <div className="train-info-col train-arrival">
            <div className="font-xs text-muted">Arrival</div>
            <div>{item.to.date}{item.to.time ? `, ${item.to.time}` : ""}</div>
            <div className="font-xs">{item.to.city}</div>
          </div>

          <div className="item-actions">
            {allowEdit && (
              <button className="btn-icon" onClick={() => onEdit(item.subRowId, "train")} title="Edit train">
                <EditIcon />
              </button>
            )}
            <div className="amount-display">
              Amount: {formatCurrency(item.amount)}
            </div>
          </div>
        </div>
        {isCancelled && (
          <>
            <div className="amount-display" >
              Cancellation Charge: {formatCurrency(item.cancellation_charge)}
            </div>
            <div className="amount-display">
              Refund Amount: {formatCurrency(item.refund_amount)}
            </div>
          </>
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

  const handleUpdated = () => {
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
        const hotels = mapHotels(getArr(a, "hotelDataZoho", "HotelDataZoho"));
        const cars = mapCars(getArr(a, "carDataZoho", "CarDataZoho"));
        const buses = mapBuses(getArr(a, "busDataZoho", "BusDataZoho"));
        const trains = mapTrains(getArr(a, "trainDataZoho", "TrainDataZoho"));

        const durationText = deriveDuration(a);

        const mainStatusLower = String(rec.status || rec.statusType || "").trim().toLowerCase();
        const mainStatusLabel = mainStatusLower === "completed" ? "Completed" : "Pending";
        const exStatus = rec.EX_Status || rec.Ex_Status || rec.ex_status || "";


        const rawTripId = rec.TripId || rec.ROWID || rowid;
        const displayTripId = rec.tripNumber || rawTripId;
        const tripName = rec.trip_name || "Trip";

        const detail = {
          id: displayTripId,
          rawId: rawTripId,
          title: tripName,
          duration: durationText,
          mainStatusLower,
          mainStatusLabel,
          exStatus,
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
        <div className="ze-loading-container">
          <div className="ze-loader"></div>
          <span>Loading Trip Details...</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="ze-detail-view">
        <header className="ze-detail-header">
          <div className="ze-header-left">
            {rowid ? (
              <a
                href={`https://expense.zoho.in/app/60024300150#/trips/${rowid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trip-id trip-link"
                title="Open trip in Zoho Expense"
                style={{ color: '#0d6efd', textDecoration: 'none' }}
              >
                {rowid}
              </a>
            ) : (
              <div className="trip-id">{"—"}</div>
            )}
          </div>
        </header>
        <div className="ze-detail-content" style={{ color: "#b91c1c" }}>Error: {err}</div>
      </div>
    );
  }

  if (!trip) return null;

  const linkStyle = `
    .trip-id.trip-link {
      color: #0d6efd;
      text-decoration: none;
      margin:auto;
    }
    .trip-id.trip-link:hover {
      text-decoration: underline;
      color: #0a58ca;
    }
  `;

  return (
    <>
      <style>{linkStyle}</style>

      <div className="ze-detail-view">
        <header className="ze-detail-header">
          <div className="ze-header-left">

            <a
              href={`https://expense.zoho.in/app/60024300150#/trips/${trip.rawId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="trip-id trip-link"
              title="Open trip in Zoho Expense"
            >
              {trip.id}
            </a>

            <span className={`status-pill1 pill--${trip.mainStatusLower}`} >
              {trip.exStatus}
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
