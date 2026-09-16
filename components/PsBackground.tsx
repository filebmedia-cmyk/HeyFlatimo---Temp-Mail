'use client';

import React, { useEffect, useState } from 'react';

// PlayStation Neo-Brutalist Token Definition (Option 1)
interface PsToken {
  id: number;
  shape: 'triangle' | 'circle' | 'cross' | 'square';
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
  // 1. TRIANGLE (Green) - Top Right
  {
    id: 1,
    shape: 'triangle',
    color: '#00c853',
    size: 76,
    top: '8%',
    left: '84%',
    animDuration: '22s',
    rotDuration: '28s',
    delay: '0s',
    opacity: 0.32,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 2. CIRCLE (Red) - Top Left
  {
    id: 2,
    shape: 'circle',
    color: '#ff003c',
    size: 68,
    top: '12%',
    left: '6%',
    animDuration: '18s',
    rotDuration: '24s',
    delay: '-3s',
    opacity: 0.3,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
  // 3. CROSS / X (Blue) - Mid Right
  {
    id: 3,
    shape: 'cross',
    color: '#0055ff',
    size: 72,
    top: '44%',
    left: '88%',
    animDuration: '20s',
    rotDuration: '26s',
    delay: '-6s',
    opacity: 0.28,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 4. SQUARE (Pink) - Mid Left
  {
    id: 4,
    shape: 'square',
    color: '#ff007f',
    size: 74,
    top: '48%',
    left: '5%',
    animDuration: '19s',
    rotDuration: '25s',
    delay: '-2s',
    opacity: 0.3,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 5. TRIANGLE (Green) - Bottom Left
  {
    id: 5,
    shape: 'triangle',
    color: '#00c853',
    size: 64,
    top: '80%',
    left: '12%',
    animDuration: '21s',
    rotDuration: '27s',
    delay: '-8s',
    opacity: 0.28,
    animType: 'ps-float-2',
    rotDir: 'clockwise',
  },
  // 6. CIRCLE (Red) - Bottom Right
  {
    id: 6,
    shape: 'circle',
    color: '#ff003c',
    size: 78,
    top: '76%',
    left: '82%',
    animDuration: '24s',
    rotDuration: '30s',
    delay: '-5s',
    opacity: 0.28,
    animType: 'ps-float-1',
    rotDir: 'counter',
  },
  // 7. CROSS / X (Blue) - Top Center
  {
    id: 7,
    shape: 'cross',
    color: '#0055ff',
    size: 58,
    top: '6%',
    left: '46%',
    animDuration: '17s',
    rotDuration: '22s',
    delay: '-4s',
    opacity: 0.25,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 8. SQUARE (Pink) - Bottom Center
  {
    id: 8,
    shape: 'square',
    color: '#ff007f',
    size: 62,
    top: '86%',
    left: '48%',
    animDuration: '23s',
    rotDuration: '29s',
    delay: '-9s',
    opacity: 0.25,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 9. TRIANGLE (Green) - Mid Left Center
  {
    id: 9,
    shape: 'triangle',
    color: '#00c853',
    size: 52,
    top: '30%',
    left: '16%',
    animDuration: '16s',
    rotDuration: '20s',
    delay: '-1s',
    opacity: 0.22,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 10. CIRCLE (Red) - Mid Right Center
  {
    id: 10,
    shape: 'circle',
    color: '#ff003c',
    size: 54,
    top: '26%',
    left: '76%',
    animDuration: '25s',
    rotDuration: '31s',
    delay: '-7s',
    opacity: 0.22,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
];

function RenderIcon({ shape, color }: { shape: PsToken['shape']; color: string }) {
  const glowStyle = { color, filter: 'drop-shadow(0 0 2.5px currentColor)' };
  switch (shape) {
    case 'triangle':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={glowStyle}
        >
          <polygon
            points="50,16 88,82 12,82"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
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
          style={glowStyle}
        >
          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="12" fill="none" />
        </svg>
      );
    case 'cross':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2"
          style={glowStyle}
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
          style={glowStyle}
        >
          <rect
            x="18"
            y="18"
            width="64"
            height="64"
            rx="10"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
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
      {/* Floating Neo-Brutalist PlayStation Button Tokens on top of original grid */}
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
              {/* Neo-Brutalist Button Box with Black Border & 3D Shadow + Luminous Glow */}
              <div
                className="w-full h-full bg-white dark:bg-[#121622] border-[2.5px] sm:border-[3px] border-[var(--border-color)] rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center transition-all"
                style={{
                  boxShadow: undefined,
                }}
              >
                <RenderIcon shape={token.shape} color={token.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
