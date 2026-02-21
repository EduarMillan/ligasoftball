"use client";

import { useEffect, useState, useCallback } from "react";

export function IntroScreen() {
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  const exit = useCallback(() => {
    if (exiting || done) return;
    setExiting(true);
    setTimeout(() => setDone(true), 800);
  }, [exiting, done]);

  useEffect(() => {
    const t = setTimeout(exit, 4600);
    return () => clearTimeout(t);
  }, [exit]);

  if (done) return null;

  return (
    <div
      onClick={exit}
      className="intro-root"
      style={{
        animation: exiting ? "introExit 800ms cubic-bezier(0.7, 0, 1, 1) forwards" : undefined,
      }}
    >
      {/* Scanlines overlay */}
      <div className="intro-scanlines" />

      {/* Moving scanline beam */}
      <div className="intro-beam" />

      {/* Ambient glow center */}
      <div className="intro-glow-bg" />

      {/* Corner brackets */}
      <div className="intro-corner intro-corner-tl" />
      <div className="intro-corner intro-corner-tr" />
      <div className="intro-corner intro-corner-bl" />
      <div className="intro-corner intro-corner-br" />

      {/* Horizontal lines top/bottom */}
      <div className="intro-hline intro-hline-top" />
      <div className="intro-hline intro-hline-bottom" />

      {/* Main content */}
      <div className="intro-content">

        {/* Softball SVG */}
        <div className="intro-ball-wrap">
          <div className="intro-ball-glow" />
          <svg
            viewBox="0 0 100 100"
            className="intro-ball-svg"
            aria-hidden="true"
          >
            {/* Outer ring */}
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(245,158,11,0.15)"
              strokeWidth="1"
              strokeDasharray="289"
              strokeDashoffset="289"
              style={{ animation: "introDraw 500ms ease-out 200ms forwards" }}
            />
            {/* Ball */}
            <circle
              cx="50" cy="50" r="40"
              fill="rgba(245,158,11,0.04)"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="251"
              strokeDashoffset="251"
              style={{ animation: "introDraw 700ms ease-out 300ms forwards" }}
            />
            {/* Inner detail ring */}
            <circle
              cx="50" cy="50" r="34"
              fill="none"
              stroke="rgba(245,158,11,0.12)"
              strokeWidth="0.8"
              strokeDasharray="214"
              strokeDashoffset="214"
              style={{ animation: "introDraw 500ms ease-out 700ms forwards" }}
            />
            {/* Seam top-left */}
            <path
              d="M 18 42 C 26 22, 44 16, 50 18"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="42"
              strokeDashoffset="42"
              style={{ animation: "introDraw 350ms ease-out 900ms forwards" }}
            />
            {/* Seam top-right */}
            <path
              d="M 50 18 C 56 16, 74 22, 82 42"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="42"
              strokeDashoffset="42"
              style={{ animation: "introDraw 350ms ease-out 1050ms forwards" }}
            />
            {/* Seam bottom-left */}
            <path
              d="M 18 58 C 26 78, 44 84, 50 82"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="42"
              strokeDashoffset="42"
              style={{ animation: "introDraw 350ms ease-out 1200ms forwards" }}
            />
            {/* Seam bottom-right */}
            <path
              d="M 50 82 C 56 84, 74 78, 82 58"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="42"
              strokeDashoffset="42"
              style={{ animation: "introDraw 350ms ease-out 1350ms forwards" }}
            />
            {/* Center diamond */}
            <polygon
              points="50,33 61,50 50,67 39,50"
              fill="none"
              stroke="rgba(245,158,11,0.35)"
              strokeWidth="1"
              style={{ animation: "introFadeIn 400ms ease-out 1500ms both" }}
            />
            {/* Diamond dots */}
            <circle cx="50" cy="33" r="2" fill="#f59e0b" style={{ animation: "introFadeIn 300ms ease-out 1600ms both" }} />
            <circle cx="61" cy="50" r="2" fill="#f59e0b" style={{ animation: "introFadeIn 300ms ease-out 1650ms both" }} />
            <circle cx="50" cy="67" r="2" fill="#f59e0b" style={{ animation: "introFadeIn 300ms ease-out 1700ms both" }} />
            <circle cx="39" cy="50" r="2" fill="#f59e0b" style={{ animation: "introFadeIn 300ms ease-out 1750ms both" }} />
          </svg>
        </div>

        {/* Title block */}
        <div className="intro-title-block">
          <p
            className="intro-label"
            style={{ animation: "introSlideUp 500ms ease-out 1700ms both" }}
          >
            Bienvenido a la
          </p>
          <h1
            className="intro-title-top"
            style={{ animation: "introSlideUp 600ms cubic-bezier(0.16,1,0.3,1) 1900ms both" }}
          >
            Liga de
          </h1>
          <h1
            className="intro-title-main"
            style={{ animation: "introGlowReveal 700ms cubic-bezier(0.16,1,0.3,1) 2150ms both" }}
          >
            Softball
          </h1>
        </div>

        {/* Divider */}
        <div
          className="intro-divider"
          style={{ animation: "introDivider 600ms ease-out 2700ms both" }}
        />

        {/* Subtitle */}
        <p
          className="intro-subtitle"
          style={{ animation: "introFadeIn 600ms ease-out 3000ms both" }}
        >
          Estadísticas · Resultados · Temporada
        </p>

        {/* Tap hint */}
        <p
          className="intro-tap"
          style={{ animation: "introPulse 1.8s ease-in-out 3500ms infinite both" }}
        >
          Toca para continuar
        </p>
      </div>

      {/* Flash overlay on exit */}
      {exiting && <div className="intro-flash" />}
    </div>
  );
}
