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
    color: '#0055ff',
    size: 88,
    top: '7%',
    left: '82%',
    animDuration: '24s',
    rotDuration: '30s',
    delay: '0s',
    opacity: 0.58,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 2. TRIANGLE (Green) - Top Left
  {
    id: 2,
    shape: 'triangle',
    color: '#00c853',
    size: 76,
    top: '10%',
    left: '6%',
    animDuration: '20s',
    rotDuration: '26s',
    delay: '-3s',
    opacity: 0.54,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
  // 3. D-PAD CONTROLLER - Mid Right
  {
    id: 3,
    shape: 'dpad',
    color: '#ffe600',
    size: 78,
    top: '42%',
    left: '87%',
    animDuration: '22s',
    rotDuration: '28s',
    delay: '-6s',
    opacity: 0.58,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 4. CIRCLE (Red) - Mid Left
  {
    id: 4,
    shape: 'circle',
    color: '#ff003c',
    size: 72,
    top: '46%',
    left: '5%',
    animDuration: '19s',
    rotDuration: '24s',
    delay: '-2s',
    opacity: 0.52,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 5. ANALOG JOYSTICK STICK - Bottom Left
  {
    id: 5,
    shape: 'joystick',
    color: '#7000ff',
    size: 76,
    top: '78%',
    left: '10%',
    animDuration: '23s',
    rotDuration: '29s',
    delay: '-8s',
    opacity: 0.55,
    animType: 'ps-float-2',
    rotDir: 'clockwise',
  },
  // 6. SQUARE (Pink) - Bottom Right
  {
    id: 6,
    shape: 'square',
    color: '#ff007f',
    size: 76,
    top: '76%',
    left: '80%',
    animDuration: '25s',
    rotDuration: '32s',
    delay: '-5s',
    opacity: 0.52,
    animType: 'ps-float-1',
    rotDir: 'counter',
  },
  // 7. CROSS / X (Blue) - Top Center
  {
    id: 7,
    shape: 'cross',
    color: '#0055ff',
    size: 68,
    top: '5%',
    left: '46%',
    animDuration: '18s',
    rotDuration: '23s',
    delay: '-4s',
    opacity: 0.50,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 8. PLAYSTATION CONTROLLER STICK - Bottom Center
  {
    id: 8,
    shape: 'controller',
    color: '#00c853',
    size: 82,
    top: '84%',
    left: '48%',
    animDuration: '26s',
    rotDuration: '34s',
    delay: '-9s',
    opacity: 0.54,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 9. D-PAD CONTROLLER - Mid Left Center
  {
    id: 9,
    shape: 'dpad',
    color: '#ff5500',
    size: 64,
    top: '28%',
    left: '18%',
    animDuration: '17s',
    rotDuration: '22s',
    delay: '-1s',
    opacity: 0.48,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 10. ANALOG JOYSTICK STICK - Mid Right Center
  {
    id: 10,
    shape: 'joystick',
    color: '#00f0ff',
    size: 66,
    top: '25%',
    left: '74%',
    animDuration: '27s',
    rotDuration: '33s',
    delay: '-7s',
    opacity: 0.48,
    animType: 'ps-float-2',
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
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <path
            d="M 22,32 C 16,32 10,48 10,68 C 10,80 18,84 26,80 C 34,76 38,62 44,62 L 56,62 C 62,62 66,76 74,80 C 82,84 90,80 90,68 C 90,48 84,32 78,32 C 70,32 64,36 50,36 C 36,36 30,32 22,32 Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <rect x="23" y="45" width="4" height="12" rx="1" fill="currentColor" />
          <rect x="19" y="49" width="12" height="4" rx="1" fill="currentColor" />
          <circle cx="75" cy="46" r="2.2" fill="#00c853" />
          <circle cx="80" cy="51" r="2.2" fill="#ff003c" />
          <circle cx="75" cy="56" r="2.2" fill="#0055ff" />
          <circle cx="70" cy="51" r="2.2" fill="#ff007f" />
          <circle cx="38" cy="55" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="62" cy="55" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'dpad':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <path
            d="M 38,18 L 62,18 L 62,38 L 82,38 L 82,62 L 62,62 L 62,82 L 38,82 L 38,62 L 18,62 L 18,38 L 38,38 Z"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <polygon points="50,24 44,33 56,33" fill="currentColor" />
          <polygon points="50,76 44,67 56,67" fill="currentColor" />
          <polygon points="24,50 33,44 33,56" fill="currentColor" />
          <polygon points="76,50 67,44 67,56" fill="currentColor" />
        </svg>
      );
    case 'joystick':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={iconStyle}
        >
          <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="6" strokeDasharray="6 4" fill="none" />
          <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="6" fill="currentColor" fillOpacity="0.18" />
          <circle cx="50" cy="38" r="3" fill="currentColor" />
          <circle cx="50" cy="62" r="3" fill="currentColor" />
          <circle cx="38" cy="50" r="3" fill="currentColor" />
          <circle cx="62" cy="50" r="3" fill="currentColor" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
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
            points="50,15 87,81 13,81"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="currentColor"
            fillOpacity="0.16"
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
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="12" fill="currentColor" fillOpacity="0.16" />
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
            x1="22"
            y1="22"
            x2="78"
            y2="78"
            stroke="currentColor"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <line
            x1="78"
            y1="22"
            x2="22"
            y2="78"
            stroke="currentColor"
            strokeWidth="13"
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
            x="18"
            y="18"
            width="64"
            height="64"
            rx="10"
            stroke="currentColor"
            strokeWidth="12"
            fill="currentColor"
            fillOpacity="0.16"
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
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-transparent"
    >
      {/* Floating Neo-Brutalist PlayStation Button & Controller Stick Tokens */}
      <div className="absolute inset-0">
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
              <div className="w-full h-full bg-white/95 dark:bg-[#121622]/95 border-[2.5px] sm:border-[3px] border-[var(--border-color)] rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center transition-all backdrop-blur-xs">
                <RenderIcon shape={token.shape} color={token.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
