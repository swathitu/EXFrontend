import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <span>© {new Date().getFullYear()} Zoho Expense</span>
    <span className="footer-right">
      <NavLink to="/privacy">Privacy</NavLink>
      <NavLink to="/terms">Terms</NavLink>
    </span>
  </footer>
);
export default Footer;
