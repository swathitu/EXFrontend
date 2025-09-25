import React, { useState } from "react";
import "./TripDataView.css";
import TripRejectModal from "./TripRejectModal";
export default function TripDataView() {
const [showReject, setShowReject] = useState(false);

  return (
<div className="tdv-wrap">
<div className="tdv-card">

        {/* Header */}
<div className="tdv-header">
<div className="tdv-left">
<div className="tdv-avatar">Z</div>
<div className="tdv-org">
<span className="name">Zoho.India</span>
<span className="email">zoho.india@noorahealth.org</span>
</div>
<div className="tdv-trip">
<span className="tdv-tripno">TRIP-00023</span>
<span className="tdv-badge">APPROVED</span>
</div>
</div>
 
          <div className="tdv-actions">
<button className="tdv-btn">Comments &amp; History</button>
<button className="tdv-btn primary">Update</button>
<button className="tdv-btn" onClick={() => setShowReject(true)}>Reject</button> 
<button className="tdv-btn">⋯</button>
</div>
</div>
 
        {/* Title + Booking status */}
<div className="tdv-titlebar">
<div>
<h2 className="tdv-title">Domestic Travel</h2>
<div className="tdv-sub">Duration · 16 Sep 2025 – 16 Sep 2025 (1 Day)</div>
</div>
<div className="tdv-booking">
<div className="label">Booking Status</div>
<div className="tdv-statusicons">
<div className="dot" title="Flight" />
<div className="dot" title="Hotel" />
<div className="dot" title="Car" />
<div className="dot" title="Train" />
<div className="dot" title="Bus" />
<div className="dot" title="Other" />
</div>
</div>
</div>
 
        {/* Tabs */}
<div className="tdv-tabs">
<div className="tdv-tab">FLIGHT</div>
<div className="tdv-tab">HOTEL</div>
<div className="tdv-tab active">CAR RENTAL</div>
<div className="tdv-tab">…</div>
<div className="tdv-tab">Associated Reports</div>
<div className="tdv-tab">Advances</div>
</div>
 
        {/* Body */}
<div className="tdv-section">

          {/* Banner */}
<div className="tdv-banner">
<span className="tdv-chip">Waiting for Options</span>
<span>Car rental booking has been initiated.</span>
</div>
 
          <div className="tdv-grid">

            {/* Left details */}
<div className="tdv-cardlite">
<div className="hd">Car Rental</div>
<div className="bd">
<div className="kv"><span className="k">Car Type:</span> Premium</div>
<div className="kv"><span className="k">Driver:</span> Yes</div>
<div className="kv"><span className="k">Booking:</span> Cab booking</div>
</div>
</div>
 
            {/* Right I/O and button */}
<div className="io">
<div className="box">
<div className="tt">Pick-Up</div>
<div className="dt">16 Sep 2025, 13:00</div>
<div className="loc">Mangalore</div>
</div>
<div className="box">
<div className="tt">Drop-Off</div>
<div className="dt">16 Sep 2025, 14:00</div>
<div className="loc">Mangalore</div>
</div>
 
              <div className="tdv-rightbtn full-span">
<button className="tonal">Add Options</button>
</div>
</div>
</div>
</div>
</div>{/* /.tdv-card */}
<TripRejectModal
        open={showReject}
        onClose={() => setShowReject(false)}
        onSubmit={(reason) => {
          // TODO: call your API with `reason` here
          console.log("Reject reason:", reason);
          setShowReject(false);
        }}
      />
</div>

  );

}

 