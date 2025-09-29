// src/components/Trip/TripsApprover.js
import React, { useMemo, useState } from "react";

/**
 * Trips (Approver View)
 * - Tabs: All | Awaiting Approval | Approved | Rejected
 * - Dummy data now; swap with backend later.
 * - Minimal inline styles to avoid external CSS.
 */

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

const dummyTrips = [
  {
    id: "TRIP-00031",
    tripName: "UK Trip",
    tripLink: "#",
    submitter: { name: "Zoho.India", initials: "Z", color: "#F7C948" },
    createdOn: "19 Sep 2025",
    period: "19 Sep 2025 - 30 Sep 2025",
    destination: "Aiken",
    status: STATUS.APPROVED,
    approver: { name: "Zoho.India", initials: "Z", color: "#E8E8E8" },
    booking: "Booked",
  },
  {
    id: "TRIP-00029",
    tripName: "Delhi",
    tripLink: "#",
    submitter: { name: "Likhit", initials: "L", color: "#FFD3D3" },
    createdOn: "16 Sep 2025",
    period: "16 Sep 2025 - 16 Sep 2025",
    destination: "New Delhi",
    status: STATUS.REJECTED,
    approver: { name: "Manoj", initials: "M", color: "#D2F4D3" },
    booking: "-",
  },
  {
    id: "TRIP-00028",
    tripName: "Patna",
    tripLink: "#",
    submitter: { name: "Jyoti", initials: "J", color: "#FFD3D3" },
    createdOn: "16 Sep 2025",
    period: "16 Sep 2025 - 16 Sep 2025",
    destination: "Patna",
    status: STATUS.REJECTED,
    approver: { name: "Manoj", initials: "M", color: "#D2F4D3" },
    booking: "-",
  },
  {
    id: "TRIP-00027",
    tripName: "Odisha",
    tripLink: "#",
    submitter: { name: "Jyoti", initials: "J", color: "#FFD3D3" },
    createdOn: "16 Sep 2025",
    period: "16 Sep 2025 - 16 Sep 2025",
    destination: "Bhubaneswar",
    status: STATUS.REJECTED,
    approver: { name: "Manoj", initials: "M", color: "#D2F4D3" },
    booking: "-",
  },
  {
    id: "TRIP-00026",
    tripName: "test077",
    tripLink: "#",
    submitter: { name: "Likhit", initials: "L", color: "#FFD3D3" },
    createdOn: "16 Sep 2025",
    period: "16 Sep 2025 - 16 Sep 2025",
    destination: "Hyderabad, Albania",
    status: STATUS.REJECTED,
    approver: { name: "Manoj", initials: "M", color: "#D2F4D3" },
    booking: "-",
  },
  // Extra examples to exercise tabs:
  {
    id: "TRIP-00032",
    tripName: "Chennai Offsite",
    tripLink: "#",
    submitter: { name: "Karthik", initials: "K", color: "#E1ECFF" },
    createdOn: "22 Sep 2025",
    period: "24 Sep 2025 - 27 Sep 2025",
    destination: "Chennai",
    status: STATUS.PENDING,
    approver: { name: "Manoj", initials: "M", color: "#D2F4D3" },
    booking: "-",
  },
  {
    id: "TRIP-00033",
    tripName: "Mumbai Client Meet",
    tripLink: "#",
    submitter: { name: "Anita", initials: "A", color: "#FFECC7" },
    createdOn: "23 Sep 2025",
    period: "29 Sep 2025 - 01 Oct 2025",
    destination: "Mumbai",
    status: STATUS.APPROVED,
    approver: { name: "Ravi", initials: "R", color: "#E8E8E8" },
    booking: "Partially Booked",
  },
];

function Pill({ type, children }) {
  const styles = {
    base: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.2,
      border: "1px solid transparent",
    },
    [STATUS.APPROVED]: { color: "#0E8A00", background: "#E7F7E7", borderColor: "#BDE7BD" },
    [STATUS.CANCELLED]: { color: "#A11", background: "#FDECEC", borderColor: "#F7C6C6" },
    [STATUS.PENDING]: { color: "#946200", background: "#FFF4E0", borderColor: "#FFE2B5" },
    [STATUS.REJECTED]: { color: "#9B1C1C", background: "#FCE8E8", borderColor: "#F5B5B5" },
  };
  return <span style={{ ...styles.base, ...styles[type] }}>{children}</span>;
}

function Avatar({ name, initials, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: color || "#EEE",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#333",
        }}
        title={name}
      >
        {initials}
      </span>
      <span style={{ fontSize: 13, color: "#1f2937" }}>{name}</span>
    </span>
  );
}

function BookingIcons({ status }) {
  // Just a light placeholder: replace with real icons later
  if (status === "-" || !status) return <span>-</span>;
  if (status === "Booked") return <span title="Booked">🏨 ✈️</span>;
  if (status === "Partially Booked") return <span title="Partially Booked">🏨 •</span>;
  return <span>-</span>;
}

function TripsTable({ rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            <th style={thSx({ width: 36 })}>
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
          {rows.map((t, idx) => (
            <tr key={t.id} style={{ background: idx % 2 ? "#fff" : "#fcfcfd" }}>
              <td style={tdSx({ textAlign: "center" })}>
                <input type="checkbox" aria-label={`Select ${t.id}`} />
              </td>
              <Td>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Avatar {...t.submitter} />
                  <span style={{ fontSize: 12, color: "#6b7280" }}>on: {t.createdOn}</span>
                </div>
              </Td>
              <Td style={{ fontVariantNumeric: "tabular-nums" }}>{t.id}</Td>
              <Td>
                <a href={t.tripLink} style={{ color: "#2563eb", textDecoration: "none" }}>
                  {t.tripName}
                </a>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{t.period}</div>
              </Td>
              <Td>{t.destination}</Td>
              <Td>
                <Pill type={t.status}>
                  {t.status === STATUS.PENDING
                    ? "PENDING"
                    : t.status === STATUS.APPROVED
                    ? "APPROVED"
                    : t.status === STATUS.REJECTED
                    ? "REJECTED"
                    : "CANCELLED"}
                </Pill>
              </Td>
              <Td>
                <Avatar {...t.approver} />
              </Td>
              <Td>
                <BookingIcons status={t.booking} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, style }) {
  return (
    <th style={thSx(style)}>
      <span style={{ color: "#6b7280", fontWeight: 600, fontSize: 12 }}>{children}</span>
    </th>
  );
}
function Td({ children, style }) {
  return <td style={tdSx(style)}>{children}</td>;
}

function thSx(extra = {}) {
  return {
    textAlign: "left",
    padding: "12px 14px",
    background: "#F8FAFC",
    borderBottom: "1px solid #E5E7EB",
    position: "sticky",
    top: 0,
    zIndex: 1,
    ...extra,
  };
}
function tdSx(extra = {}) {
  return {
    padding: "14px",
    borderBottom: "1px solid #F1F5F9",
    color: "#111827",
    ...extra,
  };
}

export default function TripsApprover() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "awaiting":
        return dummyTrips.filter((t) => t.status === STATUS.PENDING);
      case "approved":
        return dummyTrips.filter((t) => t.status === STATUS.APPROVED);
      case "rejected":
        return dummyTrips.filter((t) => t.status === STATUS.REJECTED);
      case "all":
      default:
        return dummyTrips;
    }
  }, [activeTab]);

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Trips</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#" style={{ color: "#2563eb", textDecoration: "none", fontSize: 14 }}>
            Travel Documents
          </a>
          <button style={iconBtnSx()} title="Help">?</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ marginTop: 16, borderBottom: "1px solid #E5E7EB", display: "flex", gap: 8 }}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                color: active ? "#111827" : "#6b7280",
                fontWeight: active ? 700 : 500,
              }}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
            </button>
          );
        })}
        <button
          title="More"
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          …
        </button>
      </div>

      {/* Table */}
      <div style={{ marginTop: 8, border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
        <TripsTable rows={filtered} />
      </div>
    </div>
  );
}

function iconBtnSx() {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 700,
  };
}
