// src/components/Crown.jsx
import React from "react";
import "./Crown.css";

const Crown = () => {
  return (
    <div className="crown-container">
      <svg
        className="crown"
        viewBox="0 0 64 64"
        fill="gold"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 52V48H62V52H2Z" />
        <path d="M6 48L12 16L18 44L32 28L46 44L52 16L58 48H6Z" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="32" cy="6" r="6" />
        <circle cx="52" cy="12" r="6" />
      </svg>
    </div>
  );
};

export default Crown;
