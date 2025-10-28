import React, { useState } from "react";

import "./styles/Sidebar.css";

/**

* Role-aware menu filtering (UPDATED)

* - admin: Home, Trip, Masters, ZohoSync

* - submitter: Home, Trip

* - approver: Home, My approvals

* Pass `role` from App.

*/

const MENU_ALL = [

  { key: "home", label: "Home", icon: "home" },

  { key: "trip", label: "Trip", icon: "trip", hasPlus: true },              // admin + submitter

  { key: "my-approvals", label: "My approvals", icon: "approvals" },        // approver only

  { key: "masters", label: "Masters", icon: "settings", isExpandable: true },


  { key: "expenseDataView", label: "Expense Data", icon: "expenseDataView" },
  { key: "travelDesk", label: "Travel Desk", icon: "police", isExpandable: true },


];

const MASTER_MENU_ALL = [

  { key: "users", label: "User Master", icon: "user-master", hasPlus: true },

  { key: "departments", label: "Department", icon: "department-master", hasPlus: true },

  { key: "location", label: "Location", icon: "location-master", hasPlus: true },

  { key: "customdata", label: "Custom Data", icon: "customData-master", hasPlus: true },

];

const TRAVEL_DESK_ALL = [
  { key: "allRequests", label: "All Requests", icon: "business" },
  { key: "flightDesk", label: "Flights", icon: "plane" },
  { key: "hotelDesk", label: "Hotels", icon: "hotel" },
  { key: "carDesk", label: "Car Rentals", icon: "car" },
  { key: "busDesk", label: "Buses", icon: "bus" },
  { key: "trainDesk", label: "Trains", icon: "train" }
]

const Icon = ({ name }) => {

  const common = {

    width: 18,

    height: 18,

    viewBox: "0 0 24 24",

    fill: "none",

    stroke: "currentColor",

    strokeWidth: 2,

    strokeLinecap: "round",

    strokeLinejoin: "round",

    "aria-hidden": true,

  };

  switch (name) {

    case "user":

      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

      );

    case "caret":

      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>

      );

    case "caret-up":

      return (
        <svg {...common}>
          <path d="M18 15l-6-6-6 6" />
        </svg>

      );

    case "plus":

      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>

      );

    case "home":

      return (
        <svg {...common}>
          <path d="M3 10.5l9-7 9 7" />
          <path d="M9 22V12h6v10" />
        </svg>

      );

    case "trip":

      return (
        <svg {...common}>
          <path d="M3 10h18l-1.5 9a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 10z" />
          <path d="M8 10V6a4 4 0 0 1 8 0v4" />
        </svg>

      );

    case "approvals": // check-circle icon

      return (
        <svg {...common}>
          <path d="M22 11.1V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>

      );

    case "settings":

      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 12 8.6a1.65 1.65 0 0 0 1.65-1.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 12c0 .3.08.6.2.86z" />
        </svg>

      );

    case "arrow-left":

      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" />
        </svg>

      );

    case "arrow-right":

      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>

      );

    case "user-master":

      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M12 2v20M2 12h20" />
        </svg>

      );

    case "department-master":

      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
          <path d="M2 7H22M12 12v5m0-5h8m-8 0h-8" />
        </svg>

      );

    case "location-master":

      return (
        <svg {...common}>
          <path d="M20.5 10.5c0 5.25-8.5 11-8.5 11S3.5 15.75 3.5 10.5a8.5 8.5 0 1 1 17 0z" />
          <circle cx="12" cy="10.5" r="3" />
        </svg>

      );

    case "customData-master":

      return (
        <svg {...common}>
          <path d="M4 4h16v16H4z" />
          <path d="M4 9h16M9 20V9" />
        </svg>

      );


    case "police":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="12" rx="2" />
          <path d="M12 2v3" />
          <path d="M10 20h4" />
          <path d="M16 10h1a2 2 0 0 1 2 2v1h-4v-3z" />
          <path d="M7 10h1a2 2 0 0 0 2 2v1h-4v-3z" />
        </svg>
      );

    // Changed 'business' to a Briefcase/All Requests icon
    case "business":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <path d="M2 11h20" />
          <path d="M12 17v-4" />
        </svg>
      );

    case "plane": // Icon for "Flights" - Improved for clearer airplane shape
      return (
        <svg {...common}>
          <path d="M14 10l-4 4-2-2l4-4 2 2z" />
          <path d="M20 5l-2 2" />
          <path d="M4 19l2-2" />
          <path d="M22 2l-6 6M2 22l6-6" />
          <path d="M10 14l-4 4 2 2 4-4-2-2z" />
        </svg>
      );

    case "hotel": // Icon for "Hotels" - Uses a more standard building/bed shape
      return (
        <svg {...common}>
          <path d="M20 20V8h-6V4h-4v4H4v12" />
          <rect x="4" y="14" width="4" height="4" rx="1" />
          <rect x="16" y="14" width="4" height="4" rx="1" />
          <path d="M4 20h16" />
        </svg>
      );

    case "car": // Icon for "Car Rentals" - Uses a simpler side-view car shape
      return (
        <svg {...common}>
          <path d="M10 20l4 0" />
          <path d="M17 17H7l-3-5h16l-3 5z" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
        </svg>
      );

    case "bus": // Icon for "Buses" - Simple front-view bus
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M6 18V6" />
          <path d="M18 18V6" />
          <path d="M4 13h16" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      );

    case "train": // Icon for "Trains" - More detailed train/locomotive
      return (
        <svg {...common}>
          <path d="M8 20l-4-4V6h16v10l-4 4H8z" />
          <path d="M4 14h16" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
          <path d="M10 10h4" />
        </svg>
      );



    default:

      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>

      );

  }

};

const SideRow = ({ item, active, onClick, children, collapsed, onAdd }) => {

  const [isExpanded, setIsExpanded] = useState(false);

  const [hovered, setHovered] = useState(false);

  const handleToggleExpand = (e) => {

    e.stopPropagation();

    setIsExpanded(!isExpanded);

  };

  const showPlusButton = !collapsed && item.hasPlus && (active || hovered);

  return (
    <div className="side-row">
      <button

        type="button"

        className={`side-link${active ? " active" : hovered ? " hovered" : ""}`}

        data-key={item.key}

        onClick={item.isExpandable ? handleToggleExpand : onClick}

        aria-current={active ? "page" : undefined}

        onMouseEnter={() => setHovered(true)}

        onMouseLeave={() => setHovered(false)}
      >
        <span className="side-left">
          <span className={`icon-box${active ? " active" : ""}`}>
            <Icon name={item.icon} />
          </span>
          <span className="label">{item.label}</span>
        </span>

        <span className="side-right">

          {showPlusButton && (
            <span

              className="plus-btn"

              title="Create"

              role="button"

              tabIndex={0}

              onClick={(e) => {

                e.stopPropagation();

                onAdd?.(item.key);

              }}

              onKeyDown={(e) => {

                if (e.key === "Enter" || e.key === " ") e.stopPropagation();

              }}
            >
              <Icon name="plus" />
            </span>

          )}

          {item.isExpandable && !showPlusButton && !collapsed && (
            <span className="expand-caret">
              <Icon name={isExpanded ? "caret-up" : "caret"} />
            </span>

          )}
        </span>
      </button>

      {item.isExpandable && isExpanded && !collapsed && children}
    </div>

  );

};

export default function Sidebar({

  role = "submitter",

  defaultActive = "home",

  onSelect,

  collapsed,

  setCollapsed,

  onAdd,

}) {

  const [activeKey, setActiveKey] = useState(defaultActive ?? "home");

  // Build menu by role

  let roleMenu = [];

  if (role === "admin") {
    roleMenu = MENU_ALL.filter((m) =>
      ["home", "trip", "masters", "expenseDataView", "travelDesk"].includes(m.key)
    );
  } else if (role === "admin1") {
    roleMenu = MENU_ALL.filter((m) =>
      ["expenseDataView"].includes(m.key)
    );
  } else if (role === "approver") {
    roleMenu = MENU_ALL.filter((m) => ["home", "my-approvals"].includes(m.key));
  } else if (role === "travel_associate") {
    // New rule for Travel Agent
    roleMenu = MENU_ALL.filter((m) => ["expenseDataView"].includes(m.key));
  }
  else {
    // submitter
    roleMenu = MENU_ALL.filter((m) => ["home", "trip"].includes(m.key));
  }


  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} aria-label="Sidebar">
      <nav className="side-list" role="menu">
        {roleMenu.map((it) => {
          // Determine nested menu items based on the key
          const nestedItems =
            it.key === "masters"
              ? MASTER_MENU_ALL
              : it.key === "travelDesk"
                ? TRAVEL_DESK_ALL
                : [];

          return it.isExpandable ? (
            <SideRow
              key={it.key}
              item={it}
              active={activeKey.startsWith(it.key)}
              collapsed={collapsed}
              onAdd={onAdd}
            >
              <div className="nested-list">
                {nestedItems.map((nestedItem) => (
                  <SideRow
                    key={nestedItem.key}
                    item={nestedItem}
                    active={activeKey === nestedItem.key}
                    onClick={() => {
                      setActiveKey(nestedItem.key);
                      onSelect?.(nestedItem.key);
                    }}
                    collapsed={collapsed}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            </SideRow>
          ) : (
            <SideRow
              key={it.key}
              item={it}
              active={activeKey === it.key}
              onClick={() => {
                setActiveKey(it.key);
                onSelect?.(it.key);
              }}
              collapsed={collapsed}
              onAdd={onAdd}
            />
          );
        })}
      </nav>

      <div className="collapse-toggle">
        <button
          type="button"
          className="collapse-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span className="icon">
            <Icon name={collapsed ? "arrow-right" : "arrow-left"} />
          </span>
        </button>
      </div>
    </aside>

  );

}

