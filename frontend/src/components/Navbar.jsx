// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn }) => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">{isLoggedIn ? "Account" : "Login"}</Link>
        </li>
        <li>
          <Link to="/hall-of-fame">Hall of Fame</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
