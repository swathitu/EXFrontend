import React, { useEffect, useRef, useState } from "react";
import "./styles/Sidebar.css";

// ---------------- Menu definitions ----------------
const MENU = [
  { key: "home", label: "Home", icon: "home" },
  { key: "trip", label: "Trip", icon: "trip", hasPlus: true },
  { key: "masters", label: "Masters", icon: "settings", isExpandable: true },
  { key: "ticketDataView", label: "ZohoSync", icon: "ticketDataView" },
];

const MASTER_MENU = [
  { key: "users", label: "User Master", icon: "user-master", hasPlus: true },
  { key: "departments", label: "Department", icon: "department-master", hasPlus: true },
  { key: "location", label: "Location", icon: "location-master", hasPlus: true },
  {key: "customdata", label: "Custom Data", icon: "customData-master", hasPlus: true},
];

const VIEW_OPTIONS = [
  { key: "my", label: "My View" },
  { key: "admin", label: "Admin View" },
  { key: "ap", label: "AP View" },
  { key: "travel", label: "Travel Desk View" },
];

// ---------------- Icons ----------------
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
      return (<svg {...common}><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/></svg>);
    case "caret":
      return (<svg {...common}><path d="M6 9l6 6 6-6"/></svg>);
    case "caret-up":
      return (<svg {...common}><path d="M18 15l-6-6-6 6"/></svg>);
    case "plus":
      return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case "home":
      return (<svg {...common}><path d="M3 10.5l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>);
    case "trip":
      return (<svg {...common}><path d="M3 10h18l-1.5 9a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 10z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>);
    case "settings":
      return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 12 8.6a1.65 1.65 0 0 0 1.65-1.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 12c0 .3.08.6.2.86z"/></svg>);
    case "arrow-left":
      return (<svg {...common}><path d="M15 18l-6-6 6-6" /></svg>);
    case "arrow-right":
      return (<svg {...common}><path d="M9 6l6 6-6 6" /></svg>);
    case "user-master":
      return (<svg {...common}><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M12 2v20M2 12h20"/></svg>);
    case "department-master":
      return (<svg {...common}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M2 7H22M12 12v5m0-5h8m-8 0h-8"/></svg>);
    case "location-master":
      return (<svg {...common}><path d="M20.5 10.5c0 5.25-8.5 11-8.5 11S3.5 15.75 3.5 10.5a8.5 8.5 0 1 1 17 0z"/><circle cx="12" cy="10.5" r="3"/></svg>);
    case "customData-master":
      return (<svg {...common}><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 20V9"/></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="8"/></svg>);
  }
};

// ---------------- MyView dropdown ----------------
const MyView = ({ value, onChange, collapsed, setCollapsed }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, VIEW_OPTIONS.findIndex((v) => v.key === value))
  );
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const idx = Math.max(0, VIEW_OPTIONS.findIndex((v) => v.key === value));
      setActiveIndex(idx);
    }
  }, [open, value]);

  const current = VIEW_OPTIONS.find((v) => v.key === value) || VIEW_OPTIONS[0];

  const selectAt = (idx) => {
    const item = VIEW_OPTIONS[idx];
    if (!item) return;
    onChange?.(item.key);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onButtonKeyDown = (e) => {
    if (collapsed) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCollapsed(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % VIEW_OPTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i - 1 + VIEW_OPTIONS.length) % VIEW_OPTIONS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };

  const onMenuKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % VIEW_OPTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + VIEW_OPTIONS.length) % VIEW_OPTIONS.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectAt(activeIndex);
    }
  };

  return (
    <div className="view-header vh-wrap" ref={wrapRef}>
      <span className="vh-text">You are currently in</span>
      <button
        ref={btnRef}
        type="button"
        className="vh-current"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (collapsed) {
            setCollapsed(false);
            setOpen(false);
          } else {
            setOpen((o) => !o);
          }
        }}
        onKeyDown={onButtonKeyDown}
      >
        <span className="vh-user"><Icon name="user" /></span>
        <span className="vh-name">{current.label}</span>
        <span className="vh-caret"><Icon name="caret" /></span>
      </button>

      {!collapsed && open && (
        <div className="vh-dropdown" role="listbox" tabIndex={-1} onKeyDown={onMenuKeyDown}>
          {VIEW_OPTIONS.map((opt, idx) => {
            const selected = opt.key === current.key;
            const focused = idx === activeIndex;
            return (
              <div
                key={opt.key}
                role="option"
                aria-selected={selected}
                className={`vh-item${selected ? " selected" : ""}${focused ? " focused" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => selectAt(idx)}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------- SideRow ----------------
const SideRow = ({ item, active, onClick, children, collapsed,onAdd }) => {
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
              onClick={(e) => { e.stopPropagation(); onAdd?.(item.key); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.stopPropagation();
              }}
>
<Icon name="plus" />
</span>
          )}
          {item.isExpandable && !showPlusButton && (
<span className="expand-caret">
<Icon name={isExpanded ? "caret-up" : "caret"} />
</span>
          )}
</span>
</button>
 
      {/* ✅ Only render children when expanded AND not collapsed */}
      {item.isExpandable && isExpanded && !collapsed && children}
</div>
  );
};

// ---------------- Sidebar ----------------
export default function Sidebar({ defaultActive = "home", onSelect, defaultViewKey, collapsed, setCollapsed, onAdd }) {
  const [activeKey, setActiveKey] = useState(() => defaultActive === undefined ? "home" : defaultActive);
  const [viewKey, setViewKey] = useState(() => {
    try {
      const saved = localStorage.getItem("ze-current-view");
      if (saved) return saved;
    } catch {}
    return defaultViewKey || "my";
  });

  useEffect(() => {
    try {
      localStorage.setItem("ze-current-view", viewKey);
    } catch {}
  }, [viewKey]);

  const handleSelect = (key) => {
    setActiveKey(key);
    onSelect?.(key);
  };

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} aria-label="Sidebar">
      <div className="view-wrapper">
        <MyView value={viewKey} onChange={setViewKey} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <nav className="side-list" role="menu">
        {MENU.map((it) =>
          it.isExpandable ? (
            <SideRow
              key={it.key}
              item={it}
              active={activeKey.startsWith(it.key)}
              collapsed={collapsed}
              onAdd={onAdd}
            >
              <div className="nested-list">
                {MASTER_MENU.map((nestedItem) => (
                  <SideRow
                    key={nestedItem.key}
                    item={nestedItem}
                    active={activeKey === nestedItem.key}
                    onClick={() => handleSelect(nestedItem.key)}
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
              onClick={() => handleSelect(it.key)}
              collapsed={collapsed}
              onAdd={onAdd}
            />
          )
        )}
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
