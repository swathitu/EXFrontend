import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ApproverTripDataView.css";
import { fetchTripById } from "../../api/trips";

/* ---------------- Icons ---------------- */
const CloseIcon = () => (<svg viewBox="0 0 512 512" className="icon-hover"><path d="m285.7 256 198-198c8.2-8.2 8.2-21.5 0-29.7s-21.5-8.2-29.7 0l-198 198-198-198c-8.2-8.2-21.5-8.2-29.7 0s-8.2 21.5 0 29.7l198 198-198 198c-8.2 8.2-8.2 21.5 0 29.7 4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2l198-198 198 198c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.2-8.2 8.2-21.5 0-29.7L285.7 256z" /></svg>);
const InfoIcon = () => (<svg viewBox="0 0 512 512" className="icon-xs"><path d="M388.5 5.9h-265C58.6 5.9 5.9 58.6 5.9 123.5v265c0 64.8 52.8 117.6 117.6 117.6h265c64.8 0 117.6-52.8 117.6-117.6v-265c0-64.9-52.7-117.6-117.6-117.6zM298 264.3l-9.7 5.1c-1.6.9-2.7 2.6-2.7 4.4v27.1c0 16.8-13.9 30.5-30.8 30-16.3-.4-29.2-14.3-29.2-30.6v-30.2c0-21.9 12-41.9 31.4-52.1l13-6.9c10.2-5.4 16.6-15.9 16.6-27.5 0-16.8-14.2-31-31.1-31-16.8 0-30.9 14.1-31.1 30.9-.1 16.6-13.4 30.2-30 30.2-16.5 0-30-13.3-30-29.8-.1-50.3 40.8-91.2 91.1-91.2 50.2 0 91 40.8 91.1 91 .1 33.9-18.6 64.8-48.6 80.6z" /></svg>);
const FlightIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m483.1 205.6-114-64.2v-26.8c0-41.3-22.5-79.2-58.7-99-33.7-18.4-74-18.5-107.7-.2l-.4.2c-36.5 19.7-59.1 57.7-59.1 99.2v26.4L28.9 205.6C10.6 215.9-.8 235.4-.8 256.5v45.2c0 11.6 9.4 21 21 21h122.9V466l-31.1 2.2c-11.6.8-20.3 10.8-19.5 22.4s10.8 20.3 22.4 19.5l141.2-9.9 140.6 9.9c.5 0 1 .1 1.5.1 10.9 0 20.1-8.5 20.9-19.5.8-11.6-7.9-21.6-19.5-22.4l-30.5-2.1V322.6h122.7c11.6 0 21-9.4 21-21v-45.2c0-21-11.4-40.5-29.7-50.8z"/></svg>);
const HotelIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m463 201.7-94.3-54V64.8c0-17.3-7.8-33.4-21.5-44.1-13.6-10.7-31.1-14.4-48-10.3l-227 56.1c-40.6 10.1-69 46.4-69 88.3v257.4c0 50.2 40.8 91 91 91H417.8c50.2 0 91-40.8 91-91V280.6c0-32.5-17.5-62.8-45.8-78.9z"/></svg>);
const CarIcon = () => (<svg viewBox="0 0 512 512" className="icon"><path d="m462.4 206.4-16.1-147C443.2 31 419.2 9.5 390.6 9.5H305c-3.7-5.9-10.3-9.8-17.8-9.8h-62.4c-7.5 0-14.1 3.9-17.8 9.8h-85.7c-28.6 0-52.5 21.4-55.7 49.9l-16.1 147c-26.2 16.7-43.7 46-43.7 79.4v134c0 30.9 25.1 56 56 56h25.6v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7h253v15.7c0 11.6 9.4 21 21 21s21-9.4 21-21v-15.7H450c30.9 0 56-25.1 56-56v-134c.1-33.4-17.3-62.7-43.6-79.4z"/></svg>);
const BusIcon  = () => (<svg viewBox="0 0 640 512" className="icon"><path d="M80 64C35.8 64 0 99.8 0 144v224c0 17.7 14.3 32 32 32h32c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h32c17.7 0 32-14.3 32-32V144c0-44.2-35.8-80-80-80H80zM64 144c0-8.8 7.2-16 16-16h480c8.8 0 16 7.2 16 16v128H64z"/></svg>);
const TrainIcon = () => (<svg viewBox="0 0 448 512" className="icon"><path d="M96 0C60.7 0 32 28.7 32 64V288c0 35.3 28.7 64 64 64l-32 32v32H160l32-32h64l32 32H384V384l-32-32c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H96zM96 64H352V208H96zM128 416l-32 32 32 32h32l32-32-32-32H128zM320 416H288l-32 32 32 32h32l32-32-32-32z"/></svg>);
const ArrowIcon = () => (<svg viewBox="0 0 512 512" className="icon-sm"><path d="M415.2 230.1l-85.3-51-74.3-44.4c-23.2-13.9-54.4 1-54.4 25.9V221h-84.9c-19.3 0-35 15.7-35 35s15.7 35 35 35h84.9v60.3c0 25 31.2 39.8 54.4 25.9l74.3-44.4 85.3-51c20.6-12.2 20.6-39.4 0-51.7z"/></svg>);

/* ---------------- Tabs ---------------- */
const ALL_TABS = [
  { key: "flight", label: "Flight", icon: <FlightIcon /> },
  { key: "hotel",  label: "Hotel",  icon: <HotelIcon /> },
  { key: "car",    label: "Car Rental", icon: <CarIcon /> },
  { key: "bus",    label: "Bus",    icon: <BusIcon /> },
  { key: "train",  label: "Train",  icon: <TrainIcon /> },
];

/* ---------------- Helpers & Mappers ---------------- */
const toDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const toTime = (hhmm) => (hhmm || "");

const mapFlights = (arr = []) => arr.map((f) => ({ dep: { date: toDisplayDate(f.FLIGHT_DEP_DATE), time: toTime(f.FLIGHT_DEP_TIME), city: f.FLIGHT_DEP_CITY }, arr: { date: toDisplayDate(f.FLIGHT_ARRV_DATE), time: toTime(f.FLIGHT_ARRV_TIME), city: f.FLIGHT_ARRV_CITY } }));
const mapHotels = (arr = []) => arr.map((h) => ({ location: h.HOTEL_ARRV_CITY || "", checkIn:  { date: toDisplayDate(h.HOTEL_ARRV_DATE)}, checkOut: { date: toDisplayDate(h.HOTEL_DEP_DATE)} }));
const mapCars = (arr = []) => arr.map((c) => ({ carType: c.CAR_TYPE || "", pickUp:  { date: toDisplayDate(c.CAR_DEP_DATE), location: c.CAR_DEP_CITY || "" }, dropOff: { date: toDisplayDate(c.CAR_ARRV_DATE), location: c.CAR_ARRV_CITY || "" } }));
const mapBuses = (arr = []) => arr.map((b) => ({ from: { city: b.BUS_DEP_CITY || "", date: toDisplayDate(b.BUS_DEP_DATE) }, to: { city: b.BUS_ARRV_CITY || "", date: toDisplayDate(b.BUS_ARRV_DATE) } }));
const mapTrains = (arr = []) => arr.map((t) => ({ from: { city: t.TRAIN_DEP_CITY || "", date: toDisplayDate(t.TRAIN_DEP_DATE) }, to: { city: t.TRAIN_ARRV_CITY || "", date: toDisplayDate(t.TRAIN_ARRV_DATE) } }));

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

/* --- ADDED: All required sub-component definitions --- */
const SubmitterHeader = ({ trip, onBack }) => {
  if (!trip) return null;
  const showActionButtons = trip.status === 'PENDING';
  return (
    <div className="submitter-header">
      <div className="submitter-info-block">
        <span className="initial-circle">{trip.submitter?.initials || '?'}</span>
        <div className="submitter-details">
          <span className="submitter-name">{trip.submitter?.name || 'N/A'}</span>
          <span className="submitter-email">{trip.submitter?.email || ''}</span>
        </div>
      </div>
      <div className="trip-info-block">
        <span className="trip-id-header">{trip.trip_number}</span>
        <span className={`status-pill pill--${trip.status.toLowerCase()}`}>{trip.status}</span>
      </div>
      <div className="header-actions">
        {showActionButtons && (
          <div className="action-buttons">
            <button className="btn btn-secondary">Update</button>
            <button className="btn btn-approve">Approve</button>
            <button className="btn btn-reject">Reject</button>
            <button className="btn btn-secondary">Cancel Trip</button>
          </div>
        )}
        <button className="btn btn-icon" onClick={onBack}><CloseIcon /></button>
      </div>
    </div>
  );
};

const FlightDetails = ({ bookings }) => bookings.map((item, i) => (
    <div className="itinerary-item flight-item" key={`flt-${i}`}>
        <div className="itinerary-leg">
            <div className="date-block"><div className="font-xs text-muted">Departure</div><div>{item.dep.date}, {item.dep.time} at {item.dep.city}</div></div>
            <div className="arrow"><ArrowIcon /></div>
            <div className="date-block"><div className="font-xs text-muted">Arrival</div><div>{item.arr.date}, {item.arr.time} at {item.arr.city}</div></div>
        </div>
    </div>
));
const HotelDetails = ({ bookings }) => bookings.map((item, i) => (
    <div className="itinerary-item hotel-item" key={`hot-${i}`}>
        <div className="itinerary-date"><HotelIcon /> {item.location}</div>
        <div className="itinerary-leg">
            <div className="date-block"><div className="font-xs text-muted">Check-in</div><div>{item.checkIn.date}</div></div>
            <div className="date-block"><div className="font-xs text-muted">Check-out</div><div>{item.checkOut.date}</div></div>
        </div>
    </div>
));
const CarDetails = ({ bookings }) => bookings.map((item, i) => (
    <div className="itinerary-item car-item" key={`car-${i}`}>
      <div className="itinerary-date"><div className="font-xs text-muted">Car Type: {item.carType}</div></div>
      <div className="itinerary-leg">
          <div className="date-block"><div className="font-xs text-muted">Pick-Up</div><div>{item.pickUp.date} at {item.pickUp.location}</div></div>
          <div className="date-block"><div className="font-xs text-muted">Drop-Off</div><div>{item.dropOff.date} at {item.dropOff.location}</div></div>
      </div>
    </div>
));
const BusDetails = ({ bookings }) => bookings.map((item, i) => (
    <div className="itinerary-item" key={`bus-${i}`}>
        <div className="itinerary-date"><BusIcon /> Bus</div>
        <div className="itinerary-leg">
            <div className="date-block"><div className="font-xs text-muted">From {item.from.city}</div><div>{item.from.date}, {item.from.time}</div></div>
            <div className="arrow"><ArrowIcon /></div>
            <div className="date-block"><div className="font-xs text-muted">To {item.to.city}</div><div>{item.to.date}, {item.to.time}</div></div>
        </div>
    </div>
));
const TrainDetails = ({ bookings }) => bookings.map((item, i) => (
    <div className="itinerary-item" key={`train-${i}`}>
        <div className="itinerary-date"><TrainIcon /> Train</div>
        <div className="itinerary-leg">
            <div className="date-block"><div className="font-xs text-muted">From {item.from.city}</div><div>{item.from.date}, {item.from.time}</div></div>
            <div className="arrow"><ArrowIcon /></div>
            <div className="date-block"><div className="font-xs text-muted">To {item.to.city}</div><div>{item.to.date}, {item.to.time}</div></div>
        </div>
    </div>
));

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
          const iconMap = { flight: <FlightIcon/>, hotel: <HotelIcon/>, car: <CarIcon/>, bus: <BusIcon/>, train: <TrainIcon/> };
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

/* ---------------- Main Component ---------------- */
export default function ApproverTripDataView() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setErr("");
        if (!tripId) throw new Error("No Trip ID in route");

        const rec = await fetchTripById(tripId);
        if (!rec) throw new Error("Trip not found");

        const a = rec.associatedData || {};
        const detail = {
          ...rec,
          duration: deriveDuration(a),
          bookings: {
            flight: mapFlights(a.FlightData), hotel: mapHotels(a.HotelData),
            car: mapCars(a.CarData), bus: mapBuses(a.BusData), train: mapTrains(a.TrainData),
          },
        };
        if (!cancelled) setTrip(detail);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
 }, [tripId]);

  const availableTabs = useMemo(() => {
    if (!trip) return [];
    return ALL_TABS.filter((t) => trip.bookings[t.key]?.length > 0);
  }, [trip]);

  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) setActiveTab(availableTabs[0].key);
  }, [availableTabs, activeTab]);

  if (loading) {
    return (<div className="ze-detail-view"><div className="ze-loading-container"><div className="ze-loader"></div></div></div>);
  }
  if (err) {
    return (<div className="ze-detail-view"><header className="ze-detail-header">Error</header><div className="ze-detail-content" style={{color: 'red'}}>{err}</div></div>);
  }
  if (!trip) return null;

  return (
    <div className="ze-detail-view">
        <SubmitterHeader trip={trip} onBack={() => navigate(-1)} />
        
        <div className="ze-detail-content">
          
          {/* This section is now a single card containing title and booking status */}
          <section className="trip-summary">
            {/* Wrapper for the left side (Title and Duration) */}
            <div className="trip-title-wrapper">
              <h1 className="report-title">{trip.tripName}</h1>
              {trip.duration && (
                <div className="text-muted font-small">
                  <InfoIcon /> Duration: {trip.duration}
                </div>
              )}
            </div>
            
            {/* The BookingStatus component is now inside the summary card */}
            <BookingStatus trip={trip} />
          </section>

          {/* The Itinerary section now sits below the summary card */}
          <section className="trip-itinerary">
              <div className="details-nav-tab">
                  {availableTabs.map((tab) => (
                      <button key={tab.key} className={`nav-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
                          {tab.icon} {tab.label}
                      </button>
                  ))}
              </div>
              <div>
                  {activeTab === "flight" && <FlightDetails bookings={trip.bookings.flight} />}
                  {activeTab === "hotel" && <HotelDetails bookings={trip.bookings.hotel} />}
                  {activeTab === "car" && <CarDetails bookings={trip.bookings.car} />}
                  {activeTab === "bus" && <BusDetails bookings={trip.bookings.bus} />}
                  {activeTab === "train" && <TrainDetails bookings={trip.bookings.train} />}
              </div>
          </section>

        </div>
    </div>
  );
}