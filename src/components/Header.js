import React from "react";

const Header = () => {
  return (
    <header className="header">
      <div className="brand">
        {/* You can swap this text with a logo if you have one */}
        <span className="brand-logo">💼</span>
        <span className="brand-name">Zoho Expense</span>
      </div>

      <div className="header-actions">
        <input
          className="search"
          placeholder="Search"
          aria-label="Search"
        />
        <button className="btn ghost">Help</button>
        <div className="avatar" title="You">S</div>
      </div>
    </header>
  );
};

export default Header;
