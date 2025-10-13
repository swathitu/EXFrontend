import React, { useEffect, useRef, useState } from "react";
 
const Header = ({ userName = "", userEmail = "", userRole = "", onLogout }) => {

  const [open, setOpen] = useState(false);

  const ddRef = useRef(null);
 
  const toggle = () => setOpen((v) => !v);
 
  // close when clicking outside

  useEffect(() => {

    const onDocClick = (e) => {

      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);

    };

    document.addEventListener("click", onDocClick);

    return () => document.removeEventListener("click", onDocClick);

  }, []);
 
  const initial = (userName || userEmail || "U").charAt(0).toUpperCase();
 
  return (
<header className="header">
<div className="brand">
<span className="brand-logo">💼</span>
<span className="brand-name">Zoho Expense</span>
</div>
 
      <div className="header-actions">
<input className="search" placeholder="Search" aria-label="Search" />
<button className="btn ghost">Help</button>
 
        {/* avatar only (name removed from header bar) */}
<div className="user-wrap" ref={ddRef}>
<button

            className="user-trigger"

            type="button"

            title={userName || userEmail}

            onClick={toggle}
>
<span className="avatar">{initial}</span>
</button>
 
          {open && (
<div className="user-dropdown">
<div className="user-card">
<div className="user-initial">{initial}</div>
<div className="user-meta">
<div className="user-title">{userName || "User"}</div>

                  {userEmail ? <div className="user-sub">{userEmail}</div> : null}

                  {userRole ? <div className="user-sub">Role: {userRole}</div> : null}
</div>
</div>
 
              <hr className="sep" />
 
              <button

                className="logout-btn"

                type="button"

                onClick={() => {

                  onLogout?.(); // App.js already signs out + redirects

                }}
>

                Sign Out
</button>
</div>

          )}
</div>
</div>
 
      {/* quick styles (or move to App.css) */}
<style>{`

        .header{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #eee;background:#fff}

        .brand{display:flex;align-items:center;gap:8px;font-weight:600}

        .header-actions{display:flex;align-items:center;gap:12px;position:relative}

        .search{border:1px solid #ddd;border-radius:6px;padding:6px 10px}

        .btn.ghost{background:transparent;border:1px solid #ddd;border-radius:6px;padding:6px 10px;cursor:pointer}
 
        .user-wrap{position:relative}

        .user-trigger{display:flex;align-items:center;gap:8px;background:transparent;border:0;cursor:pointer}

        .avatar{width:36px;height:36px;border-radius:50%;background:#2f54eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
 
        /* ⬇️ Improved dropdown sizing + spacing */

        .user-dropdown{

          position:absolute;

          right:0;

          top:48px;

          background:#fff;

          border:1px solid #e5e7eb;

          border-radius:10px;

          box-shadow:0 8px 24px rgba(0,0,0,.08);

          width:340px;           /* wider container */

          padding:16px;          /* more breathing room */

          z-index:100;

        }

        .user-card{display:flex;gap:12px;align-items:center;word-break:break-word}

        .user-initial{width:42px;height:42px;border-radius:50%;background:#2f54eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

        .user-meta{display:flex;flex-direction:column;max-width:270px;overflow-wrap:break-word;word-wrap:break-word}

        .user-title{font-weight:700;font-size:14px;color:#111827;margin-bottom:4px} /* space between name & email */

        .user-sub{font-size:13px;color:#4b5563;line-height:1.4}

        .user-sub + .user-sub{margin-top:6px} /* space between email & role */
 
        .sep{border:none;border-top:1px solid #eee;margin:12px 0}
 
        .logout-btn{

          width:100%;

          background:#e11d48;

          color:#fff;

          border:none;

          border-radius:8px;

          padding:10px 14px;

          font-weight:500;

          cursor:pointer;

          transition:background .2s ease;

        }

        .logout-btn:hover{background:#be123c}

      `}</style>
</header>

  );

};
 
export default Header;

 