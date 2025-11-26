import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Ensure this CSS path is correct for your project
import "../ApproverTripDataView/ApproverTripDataView.css"; 
import { fetchTripById } from "../../api/trips";

// --- Modal Imports ---
import CarOptionForm from "../CarOptionForm/CarOptionForm";
import FlightOptionForm from "../FlightOptionForm/FlightOptionForm";
import TrainOptionForm from "../TrainOptionForm/TrainOptionForm";
import HotelOptions from "../HotelOptionForm/HotelOptionForm";
import BusOptionForm from "../BusOptionForm/BusOptionForm";

import CarRescheduleForm from "../CarRescheduleForm/CarRescheduleForm";
import BusRescheduleForm from "../BusRescheduleForm/BusRescheduleForm";
import TrainRescheduleForm from "../TrainRescheduleForm/TrainRescheduleForm";
import HotelRescheduleForm from "../HotelRescheduleForm/HotelRescheduleForm";
import FlightRescheduleForm from "../FlightRescheduleForm/FlightRescheduleForm";

import CarPreviousItineraries from "../CarPreviousItineraries/CarPreviousItineraries";
import BusPreviousItineraries from "../BusPreviousItineraries/BusPreviousItineraries";
import TrainPreviousItineraries from "../TrainPreviousItineraries/TrainPreviousItineraries";
import HotelPreviousItineraries from "../HotelPreviousItineraries/HotelPreviousItineraries";
import FlightPreviousItineraries from "../FlightPreviousItineraries/FlightPreviousItineraries";

import CancelItineraryModal from "../CancelItineraryModal/CancelItineraryModal";

/* -------------------------------------------------------------------------- */
/* LOCAL ICONS                                */
/* -------------------------------------------------------------------------- */
const CloseIcon = () => (<svg viewBox="0 0 512 512" className="icon-hover"><path d="m285.7 256 198-198c8.2-8.2 8.2-21.5 0-29.7s-21.5-8.2-29.7 0l-198 198-198-198c8.2-8.2-21.5-8.2-29.7 0s-8.2 21.5 0 29.7l198 198-198 198c-8.2 8.2-8.2 21.5 0 29.7 4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2l198-198 198 198c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.2-8.2 8.2-21.5 0-29.7L285.7 256z" /></svg>);
const InfoIcon = () => (<svg viewBox="0 0 512 512" className="icon-xs"><path d="M388.5 5.9h-265C58.6 5.9 5.9 58.6 5.9 123.5v265c0 64.8 52.8 117.6 117.6 117.6h265c64.8 0 117.6-52.8 117.6-117.6v-265c0-64.9-52.7-117.6-117.6-117.6zM298 264.3l-9.7 5.1c-1.6.9-2.7 2.6-2.7 4.4v27.1c0 16.8-13.9 30.5-30.8 30-16.3-.4-29.2-14.3-29.2-30.6v-30.2c0-21.9 12-41.9 31.4-52.1l13-6.9c10.2-5.4 16.6-15.9 16.6-27.5 0-16.8-14.2-31-31.1-31-16.8 0-30.9 14.1-31.1 30.9-.1 16.6-13.4 30.2-30 30.2-16.5 0-30-13.3-30-29.8-.1-50.3 40.8-91.2 91.1-91.2 50.2 0 91 40.8 91.1 91 .1 33.9-18.6 64.8-48.6 80.6z" /></svg>);
const FlightIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m483.1 205.6-114-64.2v-26.8c0-41.3-22.5-79.2-58.7-99-33.7-18.4-74-18.5-107.7-.2l-.4.2c-36.5 19.7-59.1 57.7-59.1 99.2v26.4L28.9 205.6C10.6 215.9-.8 235.4-.8 256.5v45.2c0 11.6 9.4 21 21 21h122.9V466l-31.1 2.2c-11.6.8-20.3 10.8-19.5 22.4s10.8 20.3 22.4 19.5l141.2-9.9 140.6 9.9c.5 0 1 .1 1.5.1 10.9 0 20.1-8.5 20.9-19.5.8-11.6-7.9-21.6-19.5-22.4l-30.5-2.1V322.6h122.7c11.6 0 21-9.4 21-21v-45.2c0-21-11.4-40.5-29.7-50.8z" /></svg>);
const HotelIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m463 201.7-94.3-54V64.8c0-17.3-7.8-33.4-21.5-44.1-13.6-10.7-31.1-14.4-48-10.3l-227 56.1c-40.6 10.1-69 46.4-69 88.3v257.4c0 50.2 40.8 91 91 91H417.8c50.2 0 91-40.8 91-91V280.6c0-32.5-17.5-62.8-45.8-78.9z" /></svg>);
const CarIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m462.4 206.4-16.1-147C443.2 31 419.2 9.5 390.6 9.5H305c-3.7-5.9-10.3-9.8-17.8-9.8h-62.4c-7.5 0-14.1 3.9-17.8 9.8h-85.7c-28.6 0-52.5 21.4-55.7 49.9l-16.1 147c-26.2 16.7-43.7 46-43.7 79.4v134c0 30.9 25.1 56 56 56h25.6v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7h253v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7H450c30.9 0 56-25.1 56-56v-134c.1-33.4-17.3-62.7-43.6-79.4z" /></svg>);
const BusIcon = () => (<svg viewBox="0 0 640 512" className="icon"><path d="M80 64C35.8 64 0 99.8 0 144v224c0 17.7 14.3 32 32 32h32c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h32c17.7 0 32-14.3 32-32V144c0-44.2-35.8-80-80-80H80zM64 144c0-8.8 7.2-16 16-16h480c8.8 0 16 7.2 16 16v128H64z" /></svg>);
const TrainIcon = () => (<svg viewBox="0 0 448 512" className="icon"><path d="M96 0C60.7 0 32 28.7 32 64V288c0 35.3 28.7 64 64 64l-32 32v32H160l32-32h64l32 32H384V384l-32-32c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H96zM96 64H352V208H96zM128 416l-32 32 32 32h32l32-32-32-32H128zM320 416H288l-32 32 32 32h32l32-32-32-32z" /></svg>);
const ArrowIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm"><path d="M415.2 230.1l-85.3-51-74.3-44.4c-23.2-13.9-54.4 1-54.4 25.9V221h-84.9c-19.3 0-35 15.7-35 35s15.7 35 35 35h84.9v60.3c0 25 31.2 39.8 54.4 25.9l74.3-44.4 85.3-51c20.6-12.2 20.6-39.4 0-51.7z" /></svg>);
const CalendarIcon = () => (<svg viewBox="0 0 448 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M128 0c17.7 0 32 14.3 32 32v32h128V32c0-17.7 14.3-32 32-32s32 14.3 32 32v32h48c26.5 0 48 21.5 48 48v48H0v-48c0-26.5 21.5-48 48-48h48V32c0-17.7 14.3-32 32-32zM0 192h448v272c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192z" /></svg>);
const CommentsIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 401.5 32 440 32 440c0 8.8 7.2 16 16 16c5.5 0 10.7-2.8 13.9-7.3c27.1-37.1 55.4-60.6 77.4-75.1c31.3 10.3 64.9 15.9 99.8 15.9c141.4 0 256-93.1 256-208S397.4 32 256 32z" /></svg>);
const WindowSeatIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M384 32H128c-35.3 0-64 28.7-64 64v224c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM160 288c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32zm192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" /></svg>);
const MealIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.9 0-208-93.1-208-208S141.1 48 256 48s208 93.1 208 208s-93.1 208-208 208zm-72-208c0 39.8 32.2 72 72 72s72-32.2 72-72s-32.2-72-72-72s-72 32.2-72 72z" /></svg>);
const LocationPinIcon = () => (<svg viewBox="0 0 384 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67a24 24 0 01-43.464 0zM192 256a64 64 0 100-128 64 64 0 000 128z" /></svg>);
const CarTypeIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M18.61 199.39l75.43 14.2c2.47 6.42 7.77 11.72 14.2 14.2l14.2 75.43c2.46 13.06 15.3 21.05 28.36 18.59l259.61-48.79c13.06-2.46 21.05-15.3 18.59-28.36l-14.2-75.43c-2.47-6.42-7.77-11.72-14.2-14.2l-75.43-14.2c-13.06-2.46-21.05-15.3-18.59-28.36l14.2-75.43c2.46-13.06-5.52-25.9-18.59-28.36L132.4 1c-13.06-2.46-25.9 5.52-28.36 18.59l-75.43 399.2c-2.46 13.06 5.52 25.9 18.59 28.36l48.79 9.18c13.06 2.46 25.9-5.52 28.36-18.59l11.79-62.61-40.38-7.59c-13.06-2.46-21.05-15.3-18.59-28.36zM320 224a32 32 0 100-64 32 32 0 000 64zm-128-64a32 32 0 10-64 0 32 32 0 0064 0z" /></svg>);
const DriverIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm" style={{ color: '#67748e' }}><path d="M256 0c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128S326.69 0 256 0zm0 224c-53.02 0-96-42.98-96-96s42.98-96 96-96 96 42.98 96 96-42.98 96-96 96zm240 256h-16c-18.51 0-34.61-12.27-39.22-30.08C430.82 402.04 391.82 384 352 384h-16v-32h16c26.47 0 50.73 8.35 70.31 23.01C427.7 348.6 448 316.51 448 280c0-61.75-50.25-112-112-112h-160c-61.75 0-112 50.25-112 112 0 36.51 20.3 68.6 51.69 95.01C139.27 360.35 163.53 352 192 352h16v32h-16c-39.82 0-78.82 18.04-108.78 65.92C78.61 467.73 62.51 480 44 480H28c-15.46 0-28 12.54-28 28v2c0 1.69.14 3.36.4 5 1.48 9.25 9.77 15 19.6 15h432c9.83 0 18.12-5.75 19.6-15 .26-1.64.4-3.31.4-5v-2c0-15.46-12.54-28-28-28z" /></svg>);
const ChevronDownIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path fillRule="evenodd" d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"></path></svg>);
const ThreeDotsIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M9.5 13a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0-5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0-5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path></svg>);

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                  */
/* -------------------------------------------------------------------------- */
const ALL_TABS = [
    { key: "flight", label: "Flight", icon: <FlightIcon /> },
    { key: "hotel", label: "Hotel", icon: <HotelIcon /> },
    { key: "car", label: "Car Rental", icon: <CarIcon /> },
    { key: "bus", label: "Bus", icon: <BusIcon /> },
    { key: "train", label: "Train", icon: <TrainIcon /> },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                    */
/* -------------------------------------------------------------------------- */
const toDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const _initials = (name) => {
    name = (name || "").trim();
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] || "") + (parts[parts.length - 1][0] || "");
    }
    return name[0].toUpperCase();
};

const getStatusLabel = (status) => {
    if (!status) return "Waiting for Options";
    const s = String(status).toLowerCase().trim();
    if (s === 'added' || s === 'options added') return "Yet to Select an Option";
    if (s === 'selected' || s === 'option selected') return "Booking Pending";
    return status;
};

const deriveDuration = (a = {}) => {
    const dates = [];
    const push = (v) => v && dates.push(v);
    (a.FlightData || []).forEach(f => { push(f.FLIGHT_DEP_DATE); push(f.FLIGHT_ARRV_DATE); });
    (a.HotelData || []).forEach(h => { push(h.HOTEL_DEP_DATE); push(h.HOTEL_ARRV_DATE); });
    (a.CarData || []).forEach(c => { push(c.CAR_DEP_DATE); push(c.CAR_ARRV_DATE); });
    (a.BusData || []).forEach(b => { push(b.BUS_DEP_DATE); push(b.BUS_ARRV_DATE); });
    (a.TrainData || []).forEach(t => { push(t.TRAIN_DEP_DATE); push(t.TRAIN_ARRV_DATE); });
    if (!dates.length) return "";
    const sorted = dates.filter(Boolean).slice().sort();
    if (!sorted.length) return "";
    const start = sorted[0], end = sorted[sorted.length - 1];
    const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
    return `${toDisplayDate(start)} - ${toDisplayDate(end)} (${days} ${days > 1 ? "Days" : "Day"})`;
};

/* -------------------------------------------------------------------------- */
/* SUB COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

/* --- 1. Action Button Component --- */
const BookingActionButtons = ({ item, onAddOptions, openMenu, toggleMenu, menuId }) => {
    const status = (item.Option_Status || "").toLowerCase().trim();
    const cancelStatus = (item.Cancel_Status || "").toLowerCase().trim();

    if (cancelStatus === 'cancelled') return null;

    if (status === 'added' || status === 'options added' || status === 'option added') {
        return (
            <button
                className="btn btn-secondary"
                style={{ border: '1px solid #d1d5db' }}
                onClick={() => onAddOptions(item)}
            >
                Edit Options
            </button>
        );
    }

    if (status === 'selected') {
        return (
            <button
                className="btn-add-options main"
                style={{ borderRadius: '6px', width: '100%' }}
                onClick={(e) => { e.preventDefault(); }}
            >
                + Add Ticket
            </button>
        );
    }

    return (
        <div className="dropdown-wrapper">
            <div className="btn-dropdown-group">
                <button className="btn-add-options main" onClick={() => onAddOptions(item)}>
                    Add Options
                </button>
                <button className="btn-add-options toggle" onClick={() => toggleMenu(menuId)}>
                    <ChevronDownIcon />
                </button>
            </div>
            {openMenu === menuId && (
                <div className="dropdown-menu">
                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onAddOptions(item); }}>
                        + Add Options
                    </a>
                    <a href="#" className="dropdown-item" onClick={(e) => e.preventDefault()}>
                        + Add Ticket
                    </a>
                </div>
            )}
        </div>
    );
};

/* --- 2. Agent Header (No Approver Buttons) --- */
const AgentHeader = ({ trip, onBack }) => {
    if (!trip) return null;

    const submitterName = trip.submitter?.name || "User";
    const submitterInitials = trip.submitter?.initials || submitterName.charAt(0) || '?';
    const submitterEmail = trip.submitter?.email || "";
    const tripNumber = trip.trip_number || "";

    const tripStatus = (trip.status || "PENDING").toUpperCase();
    let tripStatusText = tripStatus;
    if (tripStatus === "PENDING" || tripStatus === "SUBMITTED") {
        tripStatusText = "AWAITING APPROVAL";
    }

    return (
        <div className="submitter-header">
            <div className="submitter-main-left-block">
                <div className="submitter-info-block">
                    <span className="initial-circle">{submitterInitials}</span>
                    <div className="submitter-details">
                        <span className="submitter-name">{submitterName}</span>
                        <span className="submitter-email">{submitterEmail}</span>
                    </div>
                </div>
                <div className="header-divider"></div>
                <div className="trip-summary-status">
                    <span className="trip-id-header">{tripNumber}</span>
                    <span className={`status-pill pill--${(tripStatus === 'PENDING' || tripStatus === 'SUBMITTED') ? 'pending' : tripStatus.toLowerCase()}`}>
                        {tripStatusText}
                    </span>
                </div>
            </div>

            <div className="header-actions">
                <button className="btn btn-icon" onClick={onBack} title="Close">
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
};
/* ---------------- Mappers ---------------- */
const mapFlights = (arr = []) => arr.map((f) => ({
    ...f,
    rowId: f.ROWID,
    depDate: toDisplayDate(f.FLIGHT_DEP_DATE),
    depTime: f.FLIGHT_DEP_TIME || "",
    depCity: f.FLIGHT_DEP_CITY || "N/A",
    depAirport: f.DEP_AIRPORT_NAME || "Airport",
    depCode: f.DEP_CITY_CODE || (f.FLIGHT_DEP_CITY ? f.FLIGHT_DEP_CITY.substring(0, 3).toUpperCase() : ""),
    arrCity: f.FLIGHT_ARR_CITY || "N/A",
    arrAirport: f.ARR_AIRPORT_NAME || "Airport",
    arrCode: f.ARR_CITY_CODE || (f.FLIGHT_ARRV_CITY ? f.FLIGHT_ARRV_CITY.substring(0, 3).toUpperCase() : ""),
    seatPref: f.SEAT_PREF || "",
    mealPref: f.MEAL_PREF || "",
    description: f.DESCRIPTION || "",
    agentName: f.AGENT_NAME || null,
    agentInitials: f.AGENT_NAME ? _initials(f.AGENT_NAME) : null,
    agentEmail: f.AGENT_EMAIL,
    Option_Status: f.Option_Status,
    Cancel_Status: f.Cancel_Status,
    Reschedule_Status: f.Reschedule_Status,
    requestType: 'flight'
}));

const mapHotels = (arr = []) => arr.map((h) => ({
    ...h,
    rowId: h.ROWID,
    locationCity: h.HOTEL_ARR_CITY || "N/A",
    checkInDate: toDisplayDate(h.HOTEL_ARR_DATE),
    checkInTime: h.HOTEL_ARR_TIME || "00:00",
    checkOutDate: toDisplayDate(h.HOTEL_DEP_DATE),
    checkOutTime: h.HOTEL_DEP_TIME || "00:00",
    description: h.DESCRIPTION || "",
    agentName: h.AGENT_NAME || null,
    agentInitials: h.AGENT_NAME ? _initials(h.AGENT_NAME) : null,
    agentEmail: h.AGENT_EMAIL,
    Option_Status: h.Option_Status,
    Cancel_Status: h.Cancel_Status,
    Reschedule_Status: h.Reschedule_Status,
    requestType: 'hotel'
}));

const mapCars = (arr = []) => arr.map((c) => ({
    ...c,
    rowId: c.ROWID,
    carType: c.CAR_TYPE || "N/A",
    driver: c.CAR_DRIVER ? (c.CAR_DRIVER.toLowerCase() === 'yes' ? 'Yes' : 'No') : 'N/A',
    description: c.DESCRIPTION || "",
    pickUpDate: toDisplayDate(c.CAR_DEP_DATE),
    pickUpTime: c.CAR_DEP_TIME || "00:00",
    pickUpLocation: c.CAR_DEP_CITY || "",
    dropOffDate: toDisplayDate(c.CAR_ARR_DATE),
    dropOffTime: c.CAR_ARR_TIME || "00:00",
    dropOffLocation: c.CAR_ARR_CITY || "",
    agentName: c.AGENT_NAME || null,
    agentInitials: c.AGENT_NAME ? _initials(c.AGENT_NAME) : null,
    agentEmail: c.AGENT_EMAIL,
    Option_Status: c.Option_Status,
    Cancel_Status: c.Cancel_Status,
    Reschedule_Status: c.Reschedule_Status,
    requestType: 'car'
}));

const mapBuses = (arr = []) => arr.map((b) => ({
    ...b,
    rowId: b.ROWID,
    depDate: toDisplayDate(b.BUS_DEP_DATE),
    depCity: b.BUS_DEP_CITY || "N/A",
    arrCity: b.BUS_ARR_CITY || "N/A",
    description: b.DESCRIPTION || "",
    agentName: b.AGENT_NAME || null,
    agentInitials: b.AGENT_NAME ? _initials(b.AGENT_NAME) : null,
    agentEmail: b.AGENT_EMAIL,
    Option_Status: b.Option_Status,
    Cancel_Status: b.Cancel_Status,
    Reschedule_Status: b.Reschedule_Status,
    requestType: 'bus'
}));

const mapTrains = (arr = []) => arr.map((t) => ({
    ...t,
    rowId: t.ROWID,
    depDate: toDisplayDate(t.TRAIN_DEP_DATE),
    depCity: t.TRAIN_DEP_CITY || "N/A",
    arrCity: t.TRAIN_ARR_CITY || "N/A",
    description: t.DESCRIPTION || "",
    agentName: t.AGENT_NAME || null,
    agentInitials: t.AGENT_NAME ? _initials(t.AGENT_NAME) : null,
    agentEmail: t.AGENT_EMAIL,
    Option_Status: t.Option_Status,
    Cancel_Status: t.Cancel_Status,
    Reschedule_Status: t.Reschedule_Status,
    requestType: 'train'
}));
/* --- 3. Flight Details --- */
const FlightDetails = ({ bookings, tripStatus, onAddOptionsClick, onRescheduleClick, onViewHistoryClick, onCancelClick, onDeleteOption }) => {
    const [openMenu, setOpenMenu] = useState(null);

    if (!bookings || bookings.length === 0) {
        return <div className="itinerary-item">No flight details available.</div>;
    }

    const toggleMenu = (menuId) => {
        setOpenMenu(openMenu === menuId ? null : menuId);
    };

    const firstFlight = bookings[0];
    const seatPref = firstFlight.seatPref;
    const mealPref = firstFlight.mealPref;
    const hasPrefs = seatPref || mealPref;

    return (
        <div className="flight-details-container">
            {hasPrefs && (
                <div className="flight-preferences-header">
                    <div className="pref-left">
                        <span className="pref-title">Preferences :</span>
                        {seatPref && <span className="pref-item"><WindowSeatIcon /> {seatPref}</span>}
                        {mealPref && <span className="pref-item"><MealIcon /> {mealPref}</span>}
                    </div>
                </div>
            )}

            {bookings.map((item, i) => {
                const optionsMenuId = `options-${i}`;
                const moreMenuId = `more-${i}`;
                const showHistory = (item.Reschedule_Status || "").toLowerCase() === "reschedule";
                const isCancelled = (item.Cancel_Status || "").toLowerCase() === "cancelled";
                const optionStatus = (item.Option_Status || "").toLowerCase();
                const isAdded = optionStatus === 'added' || optionStatus === 'options added';
                const showMenuButton = !isCancelled || showHistory;

                return (
                    <div className="flight-leg-card" key={`flt-${i}`}>
                        <div className="flight-options-status-bar">
                            <span className="status-badge">{getStatusLabel(item.Option_Status)}</span>
                            <div className="agent-info">
                                <span>Travel Agent: </span>
                                {item.agentName ? (
                                    <div className="agent-pill">
                                        <span className="agent-initials">{item.agentInitials}</span>
                                        <span className="agent-name">{item.agentName}</span>
                                    </div>
                                ) : (
                                    <span>Yet to be assigned</span>
                                )}
                            </div>
                        </div>

                        <div className="flight-leg-main-row">
                            <div className="flight-date-col">
                                <div className="date-row">
                                    <CalendarIcon />
                                    <span className="date-text">{item.depDate}</span>
                                </div>
                                <span className="pref-time">Preferred Time: {item.depTime}</span>
                            </div>

                            <div className="flight-route-col">
                                <div className="location-group">
                                    <span className="city-code">{item.depCity} - {item.depCode}</span>
                                    <span className="airport-name">{item.depAirport}</span>
                                </div>
                                <div className="arrow-group">
                                    <ArrowIcon />
                                </div>
                                <div className="location-group">
                                    <span className="city-code">{item.arrCity} - {item.arrCode}</span>
                                    <span className="airport-name">{item.arrAirport}</span>
                                </div>
                            </div>

                            <div className="flight-actions-col">
                                <BookingActionButtons
                                    item={item}
                                    onAddOptions={onAddOptionsClick}
                                    openMenu={openMenu}
                                    toggleMenu={toggleMenu}
                                    menuId={optionsMenuId}
                                />
                                {showMenuButton && (
                                    <div className="dropdown-wrapper">
                                        <button className="btn-more-options" onClick={() => toggleMenu(moreMenuId)}>
                                            <ThreeDotsIcon />
                                        </button>
                                        {openMenu === moreMenuId && (
                                            <div className="dropdown-menu">
                                                {isAdded && !isCancelled && (
                                                    <>
                                                        <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onDeleteOption(item); }}>Delete Options</a>
                                                        <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); alert("Select Logic"); }}>Select Option</a>
                                                    </>
                                                )}
                                                {!isCancelled && (
                                                    <>
                                                        <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onRescheduleClick(item); }}>Reschedule</a>
                                                        <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onCancelClick(item); }}>Cancel</a>
                                                    </>
                                                )}
                                                {showHistory && (
                                                    <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onViewHistoryClick(item); }}>View Previous Itineraries</a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.description && (
                            <div className="flight-comments-row">
                                <CommentsIcon />
                                <span>{item.description}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* --- 4. Hotel Details --- */
const HotelDetails = ({ bookings, tripStatus, onAddOptionsClick, onRescheduleClick, onViewHistoryClick, onCancelClick, onDeleteOption }) => {
    const [openMenu, setOpenMenu] = useState(null);
    if (!bookings || bookings.length === 0) return <div className="itinerary-item">No hotel details available.</div>;
    const toggleMenu = (menuId) => setOpenMenu(openMenu === menuId ? null : menuId);

    return (
        <div className="hotel-details-container">
            {bookings.map((item, i) => {
                const optionsMenuId = `options-${i}`;
                const moreMenuId = `more-${i}`;
                const showHistory = (item.Reschedule_Status || "").toLowerCase() === "reschedule";
                const isCancelled = (item.Cancel_Status || "").toLowerCase() === "cancelled";
                const optionStatus = (item.Option_Status || "").toLowerCase();
                const isAdded = optionStatus === 'added' || optionStatus === 'options added';
                const showMenuButton = !isCancelled || showHistory;

                return (
                    <div className="hotel-card" key={`hot-${i}`}>
                        <div className="flight-options-status-bar">
                            <span className="status-badge">{getStatusLabel(item.Option_Status)}</span>
                            <div className="agent-info">
                                <span>Travel Agent: </span>
                                {item.agentName ? (
                                    <div className="agent-pill"><span className="agent-initials">{item.agentInitials}</span><span className="agent-name">{item.agentName}</span></div>
                                ) : (<span>Yet to be assigned</span>)}
                            </div>
                        </div>
                        <div className="hotel-main-row">
                            <div className="hotel-location-col">
                                <LocationPinIcon />
                                <div className="location-text"><span className="city-name">{item.locationCity}</span></div>
                            </div>
                            <div className="hotel-dates-col">
                                <div className="hotel-date-group"><span className="date-label">Check-in</span><span className="date-value">{item.checkInDate}, {item.checkInTime}</span></div>
                                <span className="date-separator">-</span>
                                <div className="hotel-date-group"><span className="date-label">Check-out</span><span className="date-value">{item.checkOutDate}, {item.checkOutTime}</span></div>
                            </div>
                            <div className="hotel-actions-col">
                                <BookingActionButtons item={item} onAddOptions={onAddOptionsClick} openMenu={openMenu} toggleMenu={toggleMenu} menuId={optionsMenuId} />
                                {showMenuButton && (
                                    <div className="dropdown-wrapper">
                                        <button className="btn-more-options" onClick={() => toggleMenu(moreMenuId)}><ThreeDotsIcon /></button>
                                        {openMenu === moreMenuId && (
                                            <div className="dropdown-menu">
                                                {isAdded && !isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onDeleteOption(item); }}>Delete Options</a></>}
                                                {!isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onRescheduleClick(item); }}>Reschedule</a><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onCancelClick(item); }}>Cancel</a></>}
                                                {showHistory && <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onViewHistoryClick(item); }}>View Previous Itineraries</a>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.description && <div className="hotel-comments-row"><CommentsIcon /><span>{item.description}</span></div>}
                    </div>
                );
            })}
        </div>
    );
};

/* --- 5. Car Details --- */
const CarDetails = ({ bookings, tripStatus, onAddOptionsClick, onRescheduleClick, onViewHistoryClick, onCancelClick, onDeleteOption }) => {
    const [openMenu, setOpenMenu] = useState(null);
    if (!bookings || bookings.length === 0) return <div className="itinerary-item">No car rental details available.</div>;
    const toggleMenu = (menuId) => setOpenMenu(openMenu === menuId ? null : menuId);

    return (
        <div className="car-details-container">
            {bookings.map((item, i) => {
                const optionsMenuId = `options-${i}`;
                const moreMenuId = `more-${i}`;
                const showHistory = (item.Reschedule_Status || "").toLowerCase() === "reschedule";
                const isCancelled = (item.Cancel_Status || "").toLowerCase() === "cancelled";
                const optionStatus = (item.Option_Status || "").toLowerCase();
                const isAdded = optionStatus === 'added' || optionStatus === 'options added';
                const showMenuButton = !isCancelled || showHistory;

                return (
                    <div className="car-card" key={`car-${i}`}>
                        <div className="flight-options-status-bar">
                            <span className="status-badge">{getStatusLabel(item.Option_Status)}</span>
                            <div className="agent-info">
                                <span>Travel Agent: </span>
                                {item.agentName ? <div className="agent-pill"><span className="agent-initials">{item.agentInitials}</span><span className="agent-name">{item.agentName}</span></div> : <span>Yet to be assigned</span>}
                            </div>
                        </div>
                        <div className="car-main-row">
                            <div className="car-info-col">
                                <div className="info-item"><CarTypeIcon /><span>Car Type : {item.carType}</span></div>
                                <div className="info-item"><DriverIcon /><span>Driver : {item.driver}</span></div>
                            </div>
                            <div className="car-time-col"><span className="time-label">Pick-Up</span><span className="date-time">{item.pickUpDate}, {item.pickUpTime}</span><span className="location">{item.pickUpLocation}</span></div>
                            <div className="car-arrow-col"><ArrowIcon /></div>
                            <div className="car-time-col"><span className="time-label">Drop-Off</span><span className="date-time">{item.dropOffDate}, {item.dropOffTime}</span><span className="location">{item.dropOffLocation}</span></div>
                            <div className="car-actions-col">
                                <BookingActionButtons item={item} onAddOptions={onAddOptionsClick} openMenu={openMenu} toggleMenu={toggleMenu} menuId={optionsMenuId} />
                                {showMenuButton && (
                                    <div className="dropdown-wrapper">
                                        <button className="btn-more-options" onClick={() => toggleMenu(moreMenuId)}><ThreeDotsIcon /></button>
                                        {openMenu === moreMenuId && (
                                            <div className="dropdown-menu">
                                                {isAdded && !isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onDeleteOption(item); }}>Delete Options</a></>}
                                                {!isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onRescheduleClick(item); }}>Reschedule</a><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onCancelClick(item); }}>Cancel</a></>}
                                                {showHistory && <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onViewHistoryClick(item); }}>View Previous Itineraries</a>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.description && <div className="car-comments-row"><CommentsIcon /><span>{item.description}</span></div>}
                    </div>
                );
            })}
        </div>
    );
};

/* --- 6. Bus Details --- */
const BusDetails = ({ bookings, tripStatus, onAddOptionsClick, onRescheduleClick, onViewHistoryClick, onCancelClick, onDeleteOption }) => {
    const [openMenu, setOpenMenu] = useState(null);
    if (!bookings || bookings.length === 0) return <div className="itinerary-item">No bus details available.</div>;
    const toggleMenu = (menuId) => setOpenMenu(openMenu === menuId ? null : menuId);

    return (
        <div className="bus-details-container">
            {bookings.map((item, i) => {
                const optionsMenuId = `options-${i}`;
                const moreMenuId = `more-${i}`;
                const showHistory = (item.Reschedule_Status || "").toLowerCase() === "reschedule";
                const isCancelled = (item.Cancel_Status || "").toLowerCase() === "cancelled";
                const optionStatus = (item.Option_Status || "").toLowerCase();
                const isAdded = optionStatus === 'added' || optionStatus === 'options added';
                const showMenuButton = !isCancelled || showHistory;

                return (
                    <div className="bus-card" key={`bus-${i}`}>
                        <div className="flight-options-status-bar">
                            <span className="status-badge">{getStatusLabel(item.Option_Status)}</span>
                            <div className="agent-info">
                                <span>Travel Agent: </span>
                                {item.agentName ? <div className="agent-pill"><span className="agent-initials">{item.agentInitials}</span><span className="agent-name">{item.agentName}</span></div> : <span>Yet to be assigned</span>}
                            </div>
                        </div>
                        <div className="bus-main-row">
                            <div className="bus-info-col">
                                <div className="bus-date-row"><CalendarIcon /><span className="bus-date-text">{item.depDate}</span></div>
                                <span className="bus-desc">{item.description}</span>
                            </div>
                            <div className="bus-location-col"><span className="bus-location-label">Departure</span><span className="bus-location-city">{item.depCity}</span></div>
                            <div className="bus-arrow-col"><ArrowIcon /></div>
                            <div className="bus-location-col"><span className="bus-location-label">Arrival</span><span className="bus-location-city">{item.arrCity}</span></div>
                            <div className="bus-actions-col">
                                <BookingActionButtons item={item} onAddOptions={onAddOptionsClick} openMenu={openMenu} toggleMenu={toggleMenu} menuId={optionsMenuId} />
                                {showMenuButton && (
                                    <div className="dropdown-wrapper">
                                        <button className="btn-more-options" onClick={() => toggleMenu(moreMenuId)}><ThreeDotsIcon /></button>
                                        {openMenu === moreMenuId && (
                                            <div className="dropdown-menu">
                                                {isAdded && !isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onDeleteOption(item); }}>Delete Options</a></>}
                                                {!isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onRescheduleClick(item); }}>Reschedule</a><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onCancelClick(item); }}>Cancel</a></>}
                                                {showHistory && <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onViewHistoryClick(item); }}>View Previous Itineraries</a>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.description && <div className="bus-comments-row"><CommentsIcon /><span>{item.description}</span></div>}
                    </div>
                );
            })}
        </div>
    );
};

/* --- 7. Train Details --- */
const TrainDetails = ({ bookings, tripStatus, onAddOptionsClick, onRescheduleClick, onViewHistoryClick, onCancelClick, onDeleteOption }) => {
    const [openMenu, setOpenMenu] = useState(null);
    if (!bookings || bookings.length === 0) return <div className="itinerary-item">No train details available.</div>;
    const toggleMenu = (menuId) => setOpenMenu(openMenu === menuId ? null : menuId);

    return (
        <div className="train-details-container">
            {bookings.map((item, i) => {
                const optionsMenuId = `options-${i}`;
                const moreMenuId = `more-${i}`;
                const showHistory = (item.Reschedule_Status || "").toLowerCase() === "reschedule";
                const isCancelled = (item.Cancel_Status || "").toLowerCase() === "cancelled";
                const optionStatus = (item.Option_Status || "").toLowerCase();
                const isAdded = optionStatus === 'added' || optionStatus === 'options added';
                const showMenuButton = !isCancelled || showHistory;

                return (
                    <div className="train-card" key={`train-${i}`}>
                        <div className="flight-options-status-bar">
                            <span className="status-badge">{getStatusLabel(item.Option_Status)}</span>
                            <div className="agent-info">
                                <span>Travel Agent: </span>
                                {item.agentName ? <div className="agent-pill"><span className="agent-initials">{item.agentInitials}</span><span className="agent-name">{item.agentName}</span></div> : <span>Yet to be assigned</span>}
                            </div>
                        </div>
                        <div className="train-main-row">
                            <div className="train-info-col">
                                <div className="train-date-row"><CalendarIcon /><span className="train-date-text">{item.depDate}</span></div>
                                <span className="train-desc">{item.description}</span>
                            </div>
                            <div className="train-location-col"><span className="train-location-label">Departure</span><span className="train-location-city">{item.depCity}</span></div>
                            <div className="train-arrow-col"><ArrowIcon /></div>
                            <div className="train-location-col"><span className="train-location-label">Arrival</span><span className="train-location-city">{item.arrCity}</span></div>
                            <div className="train-actions-col">
                                <BookingActionButtons item={item} onAddOptions={onAddOptionsClick} openMenu={openMenu} toggleMenu={toggleMenu} menuId={optionsMenuId} />
                                {showMenuButton && (
                                    <div className="dropdown-wrapper">
                                        <button className="btn-more-options" onClick={() => toggleMenu(moreMenuId)}><ThreeDotsIcon /></button>
                                        {openMenu === moreMenuId && (
                                            <div className="dropdown-menu">
                                                {isAdded && !isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onDeleteOption(item); }}>Delete Options</a></>}
                                                {!isCancelled && <><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onRescheduleClick(item); }}>Reschedule</a><a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onCancelClick(item); }}>Cancel</a></>}
                                                {showHistory && <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); onViewHistoryClick(item); }}>View Previous Itineraries</a>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.description && <div className="train-comments-row"><CommentsIcon /><span>{item.description}</span></div>}
                    </div>
                );
            })}
        </div>
    );
};

/* --- 8. Booking Status Widget --- */
const BookingStatus = ({ trip }) => {
    const availableBookings = ALL_TABS.filter((t) => trip.bookings[t.key]?.length > 0);
    const getBookingStatus = (bookings) => {
        if (!bookings || bookings.length === 0) return 'empty';
        const allBooked = bookings.every(b => (b.STATUS || '').toLowerCase() === 'booked');
        if (allBooked) return 'booked';
        const anyBooked = bookings.some(b => (b.STATUS || '').toLowerCase() === 'booked');
        if (anyBooked) return 'partially';
        return 'open';
    };
    if (availableBookings.length === 0) return null;
    return (
        <div className="booking-status-widget">
            <span className="widget-title">Booking Status</span>
            <div className="booking-status-icons">
                {availableBookings.map(tab => {
                    const status = getBookingStatus(trip.bookings[tab.key]);
                    const iconMap = { flight: <FlightIcon />, hotel: <HotelIcon />, car: <CarIcon />, bus: <BusIcon />, train: <TrainIcon /> };
                    return (
                        <div key={tab.key} className={`booking-status-icon booking-status-icon--${status}`} title={`${tab.label}: ${status}`}>
                            {iconMap[tab.key]}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* --- 9. Sidebar --- */
const CustomFieldsSidebar = () => {
    const fields = [
        { label: "Policy", value: "Noora Health India Private Limited" },
        { label: "Destination", value: "Dehra Dun" },
        { label: "Business Purpose", value: "Multiple Options" },
        { label: "Activity", value: "12.1-Strategic Global Development-Advocacy" },
        { label: "Donor", value: "NH-Agency Fund-2024" },
        { label: "Condition Areas", value: "Tuberculosis Care" },
        { label: "Location", value: "India KA" },
        { label: "Branch", value: "11.IN-OPS-P&C" },
    ];
    return (
        <aside className="details-sidebar">
            <h3 className="sidebar-title">Trip Details</h3>
            {fields.map((field) => (
                <div key={field.label} className="sidebar-field-item">
                    <span className="sidebar-field-label">{field.label}</span>
                    <span className="sidebar-field-value">{field.value}</span>
                </div>
            ))}
        </aside>
    );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */
export default function AgentTripDataView({ userEmail }) {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [trip, setTrip] = useState(null);
    const [activeTab, setActiveTab] = useState("");

    // --- Modal States ---
    const [currentFlightBooking, setCurrentFlightBooking] = useState(null);
    const [currentHotelBooking, setCurrentHotelBooking] = useState(null);
    const [currentCarBooking, setCurrentCarBooking] = useState(null);
    const [currentBusBooking, setCurrentBusBooking] = useState(null);
    const [currentTrainBooking, setCurrentTrainBooking] = useState(null);

    const [rescheduleCarBooking, setRescheduleCarBooking] = useState(null);
    const [rescheduleBusBooking, setRescheduleBusBooking] = useState(null);
    const [rescheduleTrainBooking, setRescheduleTrainBooking] = useState(null);
    const [rescheduleHotelBooking, setRescheduleHotelBooking] = useState(null);
    const [rescheduleFlightBooking, setRescheduleFlightBooking] = useState(null);

    const [viewHistoryCarBooking, setViewHistoryCarBooking] = useState(null);
    const [viewHistoryBusBooking, setViewHistoryBusBooking] = useState(null);
    const [viewHistoryTrainBooking, setViewHistoryTrainBooking] = useState(null);
    const [viewHistoryHotelBooking, setViewHistoryHotelBooking] = useState(null);
    const [viewHistoryFlightBooking, setViewHistoryFlightBooking] = useState(null);

    const [cancelBookingItem, setCancelBookingItem] = useState(null);

    /* --- Mappers (Local Definition to use local helper functions) --- */
    // Defined above outside component to avoid recreation on render

    const loadTripData = useCallback(async () => {
        try {
            setLoading(true);
            setErr("");

            if (!tripId) throw new Error("No Trip ID");
            if (!userEmail) throw new Error("Agent email not found. Please login again.");

            const rec = await fetchTripById(tripId);
            if (!rec) throw new Error("Trip not found");

            const a = rec.associatedData || {};
            const targetEmail = userEmail.toLowerCase().trim();

            const filterByAgent = (items) => {
                if (!Array.isArray(items)) return [];
                return items.filter(item => 
                    item.AGENT_EMAIL && 
                    item.AGENT_EMAIL.toLowerCase().trim() === targetEmail
                );
            };

            const bookings = {
                flight: mapFlights(filterByAgent(a.FlightData)),
                hotel: mapHotels(filterByAgent(a.HotelData)),
                car: mapCars(filterByAgent(a.CarData)),
                bus: mapBuses(filterByAgent(a.BusData)),
                train: mapTrains(filterByAgent(a.TrainData)),
            };

            const detail = {
                ...rec,
                duration: deriveDuration(a),
                bookings: bookings,
            };
            setTrip(detail);

        } catch (e) {
            setErr(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }, [tripId, userEmail]);

    useEffect(() => {
        loadTripData();
    }, [loadTripData]);

    const availableTabs = useMemo(() => {
        if (!trip) return [];
        return ALL_TABS.filter((t) => trip.bookings[t.key]?.length > 0);
    }, [trip]);

    useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.find(t => t.key === activeTab)) {
            setActiveTab(availableTabs[0].key);
        }
    }, [availableTabs, activeTab]);

    /* --- Action Handlers --- */
    const handleOptionSaveSuccess = () => {
        setCurrentFlightBooking(null); setCurrentHotelBooking(null); setCurrentCarBooking(null); setCurrentBusBooking(null); setCurrentTrainBooking(null);
        setRescheduleCarBooking(null); setRescheduleBusBooking(null); setRescheduleTrainBooking(null); setRescheduleHotelBooking(null); setRescheduleFlightBooking(null);
        setCancelBookingItem(null);
        loadTripData(); 
        alert("Operation successful!");
    };

    const handleDeleteOption = async (item, type) => {
        if (!window.confirm("Are you sure you want to delete these options? This will reset the status.")) return;
        try {
            const payload = { rowId: item.rowId, requestType: type };
            const response = await fetch('/server/trip_delete_option/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status === 'success') {
                handleOptionSaveSuccess();
            } else {
                alert("Failed to delete options: " + result.message);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting options.");
        }
    };

    const handleConfirmCancel = async (item, reason) => {
        try {
            const payload = { rowId: item.rowId, requestType: item.requestType, reason: reason };
            const response = await fetch('/server/trip_cancelation/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status === 'success') {
                handleOptionSaveSuccess();
            } else {
                alert("Failed to cancel: " + result.message);
            }
        } catch (error) {
            console.error("Cancel error:", error);
            alert("Error during cancellation.");
        }
    };

    const openReschedule = (item, type) => {
        const data = { ...item, tripId: trip.id, rowId: item.rowId };
        if (type === 'flight') setRescheduleFlightBooking(data);
        if (type === 'hotel') setRescheduleHotelBooking(data);
        if (type === 'car') setRescheduleCarBooking(data);
        if (type === 'bus') setRescheduleBusBooking(data);
        if (type === 'train') setRescheduleTrainBooking(data);
    };

    const openHistory = (item, type) => {
        const data = { ...item, tripId: trip.id, rowId: item.rowId };
        if (type === 'flight') setViewHistoryFlightBooking(data);
        if (type === 'hotel') setViewHistoryHotelBooking(data);
        if (type === 'car') setViewHistoryCarBooking(data);
        if (type === 'bus') setViewHistoryBusBooking(data);
        if (type === 'train') setViewHistoryTrainBooking(data);
    };

    /* --- Render --- */
    if (loading) return (<div className="ze-detail-view"><div className="ze-loading-container"><div className="ze-loader"></div></div></div>);
    if (err) return (<div className="ze-detail-view"><div className="ze-detail-content" style={{ color: 'red', padding: 20 }}>{err}</div></div>);
    if (!trip) return null;

    if (availableTabs.length === 0) {
        return (
            <div className="ze-detail-view">
                <AgentHeader trip={trip} onBack={() => navigate(-1)} />
                <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                    <h3>No items assigned to you in this trip.</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="ze-detail-view">
            <AgentHeader trip={trip} onBack={() => navigate(-1)} />

            <div className="details-grid-container">
                <div className="main-content-col">
                    <section className="trip-summary">
                        <div className="trip-title-wrapper">
                            <h1 className="report-title">{trip.tripName}</h1>
                        </div>
                        <BookingStatus trip={trip} />
                    </section>

                    <section className="trip-itinerary">
                        <div className="details-nav-tab">
                            {availableTabs.map((tab) => (
                                <button key={tab.key} className={`nav-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <div>
                            {activeTab === "flight" && (
                                <FlightDetails 
                                    bookings={trip.bookings.flight} 
                                    tripStatus={trip.status}
                                    onAddOptionsClick={(item) => setCurrentFlightBooking(item)}
                                    onRescheduleClick={(item) => openReschedule(item, 'flight')}
                                    onViewHistoryClick={(item) => openHistory(item, 'flight')}
                                    onCancelClick={(item) => setCancelBookingItem({ ...item, requestType: 'flight' })}
                                    onDeleteOption={(item) => handleDeleteOption(item, 'flight')}
                                />
                            )}
                            {activeTab === "hotel" && (
                                <HotelDetails 
                                    bookings={trip.bookings.hotel} 
                                    tripStatus={trip.status}
                                    onAddOptionsClick={(item) => setCurrentHotelBooking(item)}
                                    onRescheduleClick={(item) => openReschedule(item, 'hotel')}
                                    onViewHistoryClick={(item) => openHistory(item, 'hotel')}
                                    onCancelClick={(item) => setCancelBookingItem({ ...item, requestType: 'hotel' })}
                                    onDeleteOption={(item) => handleDeleteOption(item, 'hotel')}
                                />
                            )}
                            {activeTab === "car" && (
                                <CarDetails 
                                    bookings={trip.bookings.car} 
                                    tripStatus={trip.status}
                                    onAddOptionsClick={(item) => setCurrentCarBooking(item)}
                                    onRescheduleClick={(item) => openReschedule(item, 'car')}
                                    onViewHistoryClick={(item) => openHistory(item, 'car')}
                                    onCancelClick={(item) => setCancelBookingItem({ ...item, requestType: 'car' })}
                                    onDeleteOption={(item) => handleDeleteOption(item, 'car')}
                                />
                            )}
                            {activeTab === "bus" && (
                                <BusDetails 
                                    bookings={trip.bookings.bus} 
                                    tripStatus={trip.status}
                                    onAddOptionsClick={(item) => setCurrentBusBooking(item)}
                                    onRescheduleClick={(item) => openReschedule(item, 'bus')}
                                    onViewHistoryClick={(item) => openHistory(item, 'bus')}
                                    onCancelClick={(item) => setCancelBookingItem({ ...item, requestType: 'bus' })}
                                    onDeleteOption={(item) => handleDeleteOption(item, 'bus')}
                                />
                            )}
                            {activeTab === "train" && (
                                <TrainDetails 
                                    bookings={trip.bookings.train} 
                                    tripStatus={trip.status} 
                                    onAddOptionsClick={(item) => setCurrentTrainBooking(item)}
                                    onRescheduleClick={(item) => openReschedule(item, 'train')}
                                    onViewHistoryClick={(item) => openHistory(item, 'train')}
                                    onCancelClick={(item) => setCancelBookingItem({ ...item, requestType: 'train' })}
                                    onDeleteOption={(item) => handleDeleteOption(item, 'train')}
                                />
                            )}
                        </div>
                    </section>
                </div>
                <CustomFieldsSidebar />
            </div>
            
            {/* ---------------- MODALS ---------------- */}
            {currentFlightBooking && <FlightOptionForm flight={currentFlightBooking} onClose={() => setCurrentFlightBooking(null)} onSave={handleOptionSaveSuccess} />}
            {currentHotelBooking && <HotelOptions hotel={currentHotelBooking} onClose={() => setCurrentHotelBooking(null)} onSave={handleOptionSaveSuccess} />}
            {currentCarBooking && <CarOptionForm car={currentCarBooking} onClose={() => setCurrentCarBooking(null)} onSave={handleOptionSaveSuccess} />}
            {currentBusBooking && <BusOptionForm bus={currentBusBooking} onClose={() => setCurrentBusBooking(null)} onSave={handleOptionSaveSuccess} />}
            {currentTrainBooking && <TrainOptionForm train={currentTrainBooking} onClose={() => setCurrentTrainBooking(null)} onSave={handleOptionSaveSuccess} />}

            {rescheduleFlightBooking && <FlightRescheduleForm bookingData={rescheduleFlightBooking} onClose={() => setRescheduleFlightBooking(null)} onSave={handleOptionSaveSuccess} />}
            {rescheduleHotelBooking && <HotelRescheduleForm bookingData={rescheduleHotelBooking} onClose={() => setRescheduleHotelBooking(null)} onSave={handleOptionSaveSuccess} />}
            {rescheduleCarBooking && <CarRescheduleForm bookingData={rescheduleCarBooking} onClose={() => setRescheduleCarBooking(null)} onSave={handleOptionSaveSuccess} />}
            {rescheduleBusBooking && <BusRescheduleForm bookingData={rescheduleBusBooking} onClose={() => setRescheduleBusBooking(null)} onSave={handleOptionSaveSuccess} />}
            {rescheduleTrainBooking && <TrainRescheduleForm bookingData={rescheduleTrainBooking} onClose={() => setRescheduleTrainBooking(null)} onSave={handleOptionSaveSuccess} />}

            {viewHistoryFlightBooking && <FlightPreviousItineraries bookingData={viewHistoryFlightBooking} onClose={() => setViewHistoryFlightBooking(null)} />}
            {viewHistoryHotelBooking && <HotelPreviousItineraries bookingData={viewHistoryHotelBooking} onClose={() => setViewHistoryHotelBooking(null)} />}
            {viewHistoryCarBooking && <CarPreviousItineraries bookingData={viewHistoryCarBooking} onClose={() => setViewHistoryCarBooking(null)} />}
            {viewHistoryBusBooking && <BusPreviousItineraries bookingData={viewHistoryBusBooking} onClose={() => setViewHistoryBusBooking(null)} />}
            {viewHistoryTrainBooking && <TrainPreviousItineraries bookingData={viewHistoryTrainBooking} onClose={() => setViewHistoryTrainBooking(null)} />}

            {cancelBookingItem && <CancelItineraryModal bookingData={cancelBookingItem} onClose={() => setCancelBookingItem(null)} onConfirm={handleConfirmCancel} />}
        </div>
    );
}