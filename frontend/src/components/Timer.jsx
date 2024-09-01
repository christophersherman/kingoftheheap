// src/components/Timer.jsx
import React, { useState, useEffect } from "react";
import "./Timer.css";

const Timer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = endTime - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        milliseconds: Math.floor((difference % 1000) / 10),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 10);

    return () => clearInterval(timer);
  });

  return (
    <div className="timer">
      There is {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}.
      {String(timeLeft.milliseconds).padStart(2, "0")} remaining
    </div>
  );
};

export default Timer;
