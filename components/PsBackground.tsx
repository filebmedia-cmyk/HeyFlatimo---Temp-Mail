'use client';

import React, { useEffect, useState } from 'react';

// PlayStation button particle definition
interface PsParticle {
  id: number;
  shape: 'triangle' | 'circle' | 'cross' | 'square';
  color: string;
  glowColor: string;
  size: number; // in px
  top: string; // percentage string
  left: string; // percentage string
  animDuration: string;
  rotDuration: string;
  delay: string;
  opacity: number;
  animType: 'ps-float-1' | 'ps-float-2' | 'ps-float-3' | 'ps-float-4';
  rotDir: 'clockwise' | 'counter';
}

const PARTICLES: PsParticle[] = [
  // 1. TRIANGLE (Green) - Giant Ambient Background Top Right
  {
    id: 1,
    shape: 'triangle',
    color: '#00e676',
    glowColor: 'rgba(0, 230, 118, 0.45)',
    size: 130,
    top: '8%',
    left: '82%',
    animDuration: '24s',
    rotDuration: '32s',
    delay: '0s',
    opacity: 0.28,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 2. CIRCLE (Red) - Top Left Floating
  {
    id: 2,
    shape: 'circle',
    color: '#ff1744',
    glowColor: 'rgba(255, 23, 68, 0.55)',
    size: 95,
    top: '12%',
    left: '6%',
    animDuration: '18s',
    rotDuration: '22s',
    delay: '-3s',
    opacity: 0.35,
    animType: 'ps-float-2',
    rotDir: 'counter',
  },
  // 3. CROSS / X (Blue) - Mid Right Floating
  {
    id: 3,
    shape: 'cross',
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.6)',
    size: 110,
    top: '42%',
    left: '88%',
    animDuration: '22s',
    rotDuration: '28s',
    delay: '-6s',
    opacity: 0.32,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 4. SQUARE (Pink) - Mid Left Floating
  {
    id: 4,
    shape: 'square',
    color: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.55)',
    size: 105,
    top: '46%',
    left: '4%',
    animDuration: '20s',
    rotDuration: '25s',
    delay: '-2s',
    opacity: 0.34,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 5. TRIANGLE (Green) - Bottom Left Floating
  {
    id: 5,
    shape: 'triangle',
    color: '#00e676',
    glowColor: 'rgba(0, 230, 118, 0.55)',
    size: 85,
    top: '78%',
    left: '12%',
    animDuration: '19s',
    rotDuration: '24s',
    delay: '-8s',
    opacity: 0.36,
    animType: 'ps-float-2',
    rotDir: 'clockwise',
  },
  // 6. CIRCLE (Red) - Bottom Right Floating
  {
    id: 6,
    shape: 'circle',
    color: '#ff1744',
    glowColor: 'rgba(255, 23, 68, 0.5)',
    size: 120,
    top: '75%',
    left: '84%',
    animDuration: '26s',
    rotDuration: '30s',
    delay: '-5s',
    opacity: 0.28,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 7. CROSS / X (Blue) - Center Upper Mid Accent
  {
    id: 7,
    shape: 'cross',
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.5)',
    size: 75,
    top: '22%',
    left: '48%',
    animDuration: '17s',
    rotDuration: '20s',
    delay: '-4s',
    opacity: 0.25,
    animType: 'ps-float-4',
    rotDir: 'counter',
  },
  // 8. SQUARE (Pink) - Center Lower Mid Accent
  {
    id: 8,
    shape: 'square',
    color: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.5)',
    size: 80,
    top: '68%',
    left: '52%',
    animDuration: '21s',
    rotDuration: '26s',
    delay: '-9s',
    opacity: 0.25,
    animType: 'ps-float-3',
    rotDir: 'clockwise',
  },
  // 9. TRIANGLE (Green) - Upper Left Secondary Accent
  {
    id: 9,
    shape: 'triangle',
    color: '#00e676',
    glowColor: 'rgba(0, 230, 118, 0.5)',
    size: 65,
    top: '32%',
    left: '18%',
    animDuration: '16s',
    rotDuration: '19s',
    delay: '-1s',
    opacity: 0.3,
    animType: 'ps-float-1',
    rotDir: 'counter',
  },
  // 10. CIRCLE (Red) - Upper Right Secondary Accent
  {
    id: 10,
    shape: 'circle',
    color: '#ff1744',
    glowColor: 'rgba(255, 23, 68, 0.5)',
    size: 70,
    top: '28%',
    left: '74%',
    animDuration: '23s',
    rotDuration: '27s',
    delay: '-7s',
    opacity: 0.3,
    animType: 'ps-float-2',
    rotDir: 'clockwise',
  },
  // 11. CROSS / X (Blue) - Bottom Center Ambient
  {
    id: 11,
    shape: 'cross',
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.5)',
    size: 90,
    top: '88%',
    left: '42%',
    animDuration: '25s',
    rotDuration: '33s',
    delay: '-11s',
    opacity: 0.26,
    animType: 'ps-float-1',
    rotDir: 'clockwise',
  },
  // 12. SQUARE (Pink) - Top Center Giant Accent
  {
    id: 12,
    shape: 'square',
    color: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.45)',
    size: 115,
    top: '5%',
    left: '32%',
    animDuration: '27s',
    rotDuration: '35s',
    delay: '-13s',
    opacity: 0.22,
    animType: 'ps-float-3',
    rotDir: 'counter',
  },
];

function RenderShape({ shape, color }: { shape: PsParticle['shape']; color: string }) {
  switch (shape) {
    case 'triangle':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ color }}
        >
          <polygon
            points="50,14 92,86 8,86"
            stroke="currentColor"
            strokeWidth="11"
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
          className="w-full h-full"
          style={{ color }}
        >
          <circle cx="50" cy="50" r="37" stroke="currentColor" strokeWidth="11" fill="none" />
        </svg>
      );
    case 'cross':
      return (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ color }}
        >
          <line
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <line
            x1="80"
            y1="20"
            x2="20"
            y2="80"
            stroke="currentColor"
            strokeWidth="12"
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
          className="w-full h-full"
          style={{ color }}
        >
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            stroke="currentColor"
            strokeWidth="11"
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
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#050508]"
    >
      {/* 1. Deep Cyber Radial Backdrop & Grid */}
      <div
        className="absolute inset-0 z-0 opacity-100"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(20, 24, 40, 0.85) 0%, #050508 80%),
            linear-gradient(to right, rgba(255, 255, 255, 0.055) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.055) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* 2. Soft PlayStation Glow Blobs in Corners */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d2ff 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff007f 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00e676 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff1744 0%, transparent 70%)' }}
      />

      {/* 3. Floating PlayStation Buttons (Triangle, Circle, Cross, Square) */}
      <div className="absolute inset-0 z-10">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className={`absolute ${p.animType} will-change-transform`}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: mounted ? p.opacity : 0,
              animationDuration: p.animDuration,
              animationDelay: p.delay,
              filter: `drop-shadow(0 0 16px ${p.glowColor}) drop-shadow(0 0 32px ${p.glowColor})`,
              transition: 'opacity 0.8s ease-in-out',
            }}
          >
            <div
              className={`w-full h-full ${
                p.rotDir === 'clockwise' ? 'ps-spin-cw' : 'ps-spin-ccw'
              }`}
              style={{
                animationDuration: p.rotDuration,
                animationDelay: p.delay,
              }}
            >
              <RenderShape shape={p.shape} color={p.color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
