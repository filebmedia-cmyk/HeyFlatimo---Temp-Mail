'use client';

import React, { useEffect, useState } from 'react';

// PlayStation Neo-Brutalist Token Definition
interface PsToken {
  id: number;
  shape: 'controller' | 'dpad' | 'joystick' | 'triangle' | 'circle' | 'cross' | 'square';
  color: string;
  size: number; // in px
  top: string;
  left: string;
  animDuration: string;
  rotDuration: string;
  delay: string;
  opacity: number;
  animType: 'ps-float-1' | 'ps-float-2' | 'ps-float-3' | 'ps-float-4';
  rotDir: 'clockwise' | 'counter';
}

const TOKENS: PsToken[] = [
  // 1. PLAYSTATION CONTROLLER STICK - Top Right
  {
    id: 1,
    shape: 'controller',
    color: '#0055ff', // Electric Blue
    size: 94,
    top: '6%',
    left: '84%',
    animDuration: '22s',
    rotDuration: '28s',
    delay: '0s',
    opacity: 0.92,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 2. TRIANGLE (Green) - Top Left
  {
    id: 2,
    shape: 'triangle',
    color: '#00c853', // Vivid Emerald Green
    size: 82,
    top: '8%',
    left: '5%',
    animDuration: '18s',
    rotDuration: '24s',
    delay: '-3s',
    opacity: 0.90,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
  // 3. D-PAD CONTROLLER - Mid Right
  {
    id: 3,
    shape: 'dpad',
    color: '#ffe600', // Cyber Yellow
    size: 84,
    top: '38%',
    left: '88%',
    animDuration: '20s',
    rotDuration: '26s',
    delay: '-5s',
    opacity: 0.92,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 4. CIRCLE (Red) - Mid Left
  {
    id: 4,
    shape: 'circle',
    color: '#ff003c', // Electric Crimson Red
    size: 80,
    top: '44%',
    left: '4%',
    animDuration: '17s',
    rotDuration: '22s',
    delay: '-2s',
    opacity: 0.90,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 5. ANALOG JOYSTICK STICK - Bottom Left
  {
    id: 5,
    shape: 'joystick',
    color: '#7000ff', // Vivid Violet
    size: 84,
    top: '76%',
    left: '7%',
    animDuration: '21s',
    rotDuration: '27s',
    delay: '-7s',
    opacity: 0.90,
    animType: 'ps-float-2',
    rotDir: 'clockwise',
  },
  // 6. SQUARE (Pink) - Bottom Right
  {
    id: 6,
    shape: 'square',
    color: '#ff007f', // Hot Pink
    size: 82,
    top: '74%',
    left: '82%',
    animDuration: '23s',
    rotDuration: '30s',
    delay: '-4s',
    opacity: 0.90,
    animType: 'ps-float-1',
    rotDir: 'counter',
  },
  // 7. CROSS / X (Blue) - Top Center
  {
    id: 7,
    shape: 'cross',
    color: '#0055ff', // Pure Blue
    size: 76,
    top: '4%',
    left: '48%',
    animDuration: '16s',
    rotDuration: '20s',
    delay: '-3.5s',
    opacity: 0.88,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 8. PLAYSTATION CONTROLLER STICK - Bottom Center
  {
    id: 8,
    shape: 'controller',
    color: '#00c853', // Vivid Green
    size: 90,
    top: '86%',
    left: '46%',
    animDuration: '24s',
    rotDuration: '32s',
    delay: '-8s',
    opacity: 0.90,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 9. D-PAD CONTROLLER - Upper Mid Left
  {
    id: 9,
    shape: 'dpad',
    color: '#ff5500', // Blazing Orange
    size: 74,
    top: '24%',
    left: '16%',
    animDuration: '15s',
    rotDuration: '21s',
    delay: '-1s',
    opacity: 0.86,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 10. ANALOG JOYSTICK STICK - Upper Mid Right
  {
    id: 10,
    shape: 'joystick',
    color: '#00f0ff', // Electric Cyan
    size: 76,
    top: '22%',
    left: '73%',
    animDuration: '25s',
    rotDuration: '31s',
    delay: '-6s',
    opacity: 0.86,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
  // 11. TRIANGLE (Green) - Lower Mid Right
  {
    id: 11,
    shape: 'triangle',
    color: '#00c853',
    size: 74,
    top: '58%',
    left: '76%',
    animDuration: '19s',
    rotDuration: '25s',
    delay: '-9s',
    opacity: 0.86,
    animType: 'ps-float-4',
    rotDir: 'clockwise',
  },
  // 12. CROSS / X (Blue) - Lower Mid Left
  {
    id: 12,
    shape: 'cross',
    color: '#0055ff',
    size: 74,
    top: '62%',
    left: '19%',
    animDuration: '21s',
    rotDuration: '27s',
    delay: '-5.5s',
    opacity: 0.86,
    animType: 'ps-float-3',
    rotDir: 'counter',
  },
];

function RenderIcon({ shape, color }: { shape: PsToken['shape']; color: string }) {
  const iconStyle = { color };
  switch (shape) {
    case 'controller':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
          style={iconStyle}
        >
          {/* L1 & R1 Shoulder Buttons */}
          <rect x="22" y="23" width="16" height="6" rx="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2.5" />
          <rect x="62" y="23" width="16" height="6" rx="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2.5" />
          {/* Main Controller Body */}
          <path
            d="M 24,30 C 16,30 10,46 10,68 C 10,82 18,86 28,82 C 36,78 40,64 45,64 L 55,64 C 60,64 64,78 72,82 C 82,86 90,82 90,68 C 90,46 84,30 76,30 C 68,30 62,34 50,34 C 38,34 32,30 24,30 Z"
            stroke="currentColor"
            strokeWidth="6.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.22"
          />
          {/* D-Pad on Left */}
          <rect x="24" y="44" width="5" height="15" rx="1.5" fill="currentColor" />
          <rect x="19" y="49" width="15" height="5" rx="1.5" fill="currentColor" />
          {/* Action Buttons on Right: Triangle, Circle, Cross, Square */}
          <circle cx="75" cy="44" r="3.2" fill="#00c853" stroke="#000000" strokeWidth="1.5" />
          <circle cx="82" cy="51" r="3.2" fill="#ff003c" stroke="#000000" strokeWidth="1.5" />
          <circle cx="75" cy="58" r="3.2" fill="#0055ff" stroke="#000000" strokeWidth="1.5" />
          <circle cx="68" cy="51" r="3.2" fill="#ff007f" stroke="#000000" strokeWidth="1.5" />
          {/* Center PS Button */}
          <circle cx="50" cy="49" r="4.5" fill="currentColor" fillOpacity="0.8" />
          {/* Dual Analog Thumbstick Rings */}
          <circle cx="37" cy="58" r="6.5" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.3" />
          <circle cx="37" cy="58" r="2.5" fill="currentColor" />
          <circle cx="63" cy="58" r="6.5" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.3" />
          <circle cx="63" cy="58" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'dpad':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
          style={iconStyle}
        >
          {/* D-Pad Cross Body */}
          <path
            d="M 37,16 L 63,16 L 63,37 L 84,37 L 84,63 L 63,63 L 63,84 L 37,84 L 37,63 L 16,63 L 16,37 L 37,37 Z"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.25"
          />
          {/* Directional Arrow Heads */}
          <polygon points="50,22 42,32 58,32" fill="currentColor" stroke="#000000" strokeWidth="1" />
          <polygon points="50,78 42,68 58,68" fill="currentColor" stroke="#000000" strokeWidth="1" />
          <polygon points="22,50 32,42 32,58" fill="currentColor" stroke="#000000" strokeWidth="1" />
          <polygon points="78,50 68,42 68,58" fill="currentColor" stroke="#000000" strokeWidth="1" />
          {/* Center Pivot Dot */}
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      );
    case 'joystick':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
          style={iconStyle}
        >
          {/* Outer Texture Ring */}
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="6" strokeDasharray="6 4" fill="none" />
          {/* Inner Base Dome */}
          <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="6.5" fill="currentColor" fillOpacity="0.25" />
          {/* 4 Directional Grip Dots */}
          <circle cx="50" cy="36" r="4" fill="currentColor" />
          <circle cx="50" cy="64" r="4" fill="currentColor" />
          <circle cx="36" cy="50" r="4" fill="currentColor" />
          <circle cx="64" cy="50" r="4" fill="currentColor" />
          {/* Center Concave Pip */}
          <circle cx="50" cy="50" r="6" fill="currentColor" stroke="#000000" strokeWidth="1.5" />
        </svg>
      );
    case 'triangle':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <polygon
            points="50,14 88,82 12,82"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </svg>
      );
    case 'circle':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <circle
            cx="50"
            cy="50"
            r="34"
            stroke="currentColor"
            strokeWidth="14"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </svg>
      );
    case 'cross':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <line
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            stroke="currentColor"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <line
            x1="80"
            y1="20"
            x2="20"
            y2="80"
            stroke="currentColor"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'square':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            stroke="currentColor"
            strokeWidth="14"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </svg>
      );
  }
}

export default function PsBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none select-none overflow-hidden z-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Fixed Neo-Brutalist Grid Canvas Layer (Immune to scroll) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-100 transition-opacity"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--grid-color) 2px, transparent 2px), linear-gradient(to bottom, var(--grid-color) 2px, transparent 2px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Ambient Depth Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-blue)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-green)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Neo-Brutalist PlayStation Button & Controller Stick Tokens */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {TOKENS.map((token) => (
          <div
            key={token.id}
            className={`absolute ${token.animType} will-change-transform`}
            style={{
              top: token.top,
              left: token.left,
              width: `${token.size}px`,
              height: `${token.size}px`,
              opacity: mounted ? token.opacity : 0,
              animationDuration: token.animDuration,
              animationDelay: token.delay,
              transition: 'opacity 0.6s ease-in-out',
            }}
          >
            <div
              className={`w-full h-full ${
                token.rotDir === 'clockwise' ? 'ps-spin-cw' : 'ps-spin-ccw'
              }`}
              style={{
                animationDuration: token.rotDuration,
                animationDelay: token.delay,
              }}
            >
              {/* Neo-Brutalist Button Card with Solid Borders & 3D Shadow */}
              <div className="w-full h-full bg-white dark:bg-[#0f1422] border-[3px] sm:border-[3.5px] border-[var(--border-color)] rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_var(--shadow-color)] sm:shadow-[5px_5px_0px_var(--shadow-color)] dark:shadow-[4px_4px_0px_#000000] flex items-center justify-center transition-all">
                <RenderIcon shape={token.shape} color={token.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
