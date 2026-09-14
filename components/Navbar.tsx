'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Moon,
  Sun,
  LayoutPanelLeft,
  Home,
  ShieldCheck,
  Inbox,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface NavbarProps {
  appName?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  activeView: 'home' | 'split';
  onToggleView: (view: 'home' | 'split') => void;
  unreadCount: number;
}

export default function Navbar({
  appName = 'HeyFlatimo',
  isDark,
  onToggleTheme,
  activeView,
  onToggleView,
  unreadCount,
}: NavbarProps) {
  return (
    <header className="border-b-[3px] sm:border-b-[4px] border-[var(--border-color)] bg-[var(--card-bg)] sticky top-0 z-40 transition-colors duration-200 shadow-[0px_3px_0px_var(--shadow-color)] sm:shadow-[0px_4px_0px_var(--shadow-color)]">
      <div className="max-w-6xl mx-auto px-2.5 xs:px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center gap-1.5 xs:gap-2">
        {/* Brand Logo with Vector Icon & Micro-Motion */}
        <div
          onClick={() => onToggleView('home')}
          className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          title="Kembali ke Beranda"
        >
          {/* Logo Badge */}
          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 bg-[var(--color-blue)] border-[2px] sm:border-[3.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3.5px_3.5px_0px_var(--shadow-color)] group-hover:-translate-y-0.5 group-hover:rotate-6 transition-all duration-200 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6 text-[var(--color-yellow)] fill-[var(--color-yellow)] icon-scale" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-heading font-black text-sm xs:text-base sm:text-2xl tracking-tight text-[var(--text-main)] uppercase whitespace-nowrap">
                {appName}
              </span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-yellow)] fill-[var(--color-yellow)] icon-wiggle flex-shrink-0 hidden xs:inline-block" />
              <span className="bg-[var(--color-yellow)] text-black text-[7px] xs:text-[8px] sm:text-[9px] font-mono-custom font-black px-1 py-0.2 border border-[var(--border-color)] uppercase flex-shrink-0">
                PRO
              </span>
            </div>
            <span className="text-[7px] xs:text-[8px] sm:text-[10px] font-mono-custom font-bold text-[var(--text-muted)] uppercase tracking-wider block -mt-0.5 hidden xs:block">
              Personal Temp Mail
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Status Badge (Tablet / Desktop): Animated INBOX READY */}
          <div className="hidden lg:flex items-center gap-2 brutal-badge bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7] px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] border-[2px] sm:border-[2.5px] border-[var(--border-color)] motion-live-badge select-none">
            {/* Pulsing Sonar Beacon */}
            <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
              <span className="motion-radar-ring" />
              <span className="motion-radar-ring-delayed" />
              <span className="relative w-2 h-2 rounded-full bg-[var(--color-green)]" />
            </div>

            {/* Signal Equalizer Motion Bars */}
            <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-1" />
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-2" />
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-3" />
            </div>

            <span className="font-mono-custom font-black tracking-wide">INBOX READY</span>
          </div>

          {/* Admin / API Key Portal Button */}
          <Link
            href="/admin"
            className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-2 xs:px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 group cursor-pointer font-black z-10 shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
            title="Buka Menu Admin & Bot API Key"
          >
            <KeyRound className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:rotate-45 transition-transform flex-shrink-0" />
            <span className="font-heading tracking-wide">ADMIN</span>
          </Link>

          {/* Switch View Button */}
          {activeView === 'home' ? (
            <button
              onClick={() => onToggleView('split')}
              className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-700 px-2 xs:px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-[11px] sm:text-xs flex items-center gap-1 sm:gap-2 group shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
              title="Buka tampilan Split Inbox"
            >
              <LayoutPanelLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 icon-scale transition-transform flex-shrink-0" />
              <span className="hidden sm:inline">SPLIT INBOX</span>
              <span className="sm:hidden">SPLIT</span>
              {unreadCount > 0 && (
                <span className="bg-[var(--color-yellow)] text-black px-1 py-0.2 border border-[var(--border-color)] text-[8px] xs:text-[9px] sm:text-[10px] font-mono font-black">
                  {unreadCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onToggleView('home')}
              className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2 xs:px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-[11px] sm:text-xs flex items-center gap-1 sm:gap-2 group shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
              title="Kembali ke Beranda"
            >
              <Home className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 icon-bounce transition-transform flex-shrink-0" />
              <span className="hidden sm:inline">BERANDA</span>
              <span className="sm:hidden">HOME</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="brutal-btn-icon bg-[var(--color-yellow)] dark:bg-zinc-800 text-black dark:text-[var(--color-yellow)] w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black group shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] flex-shrink-0"
            title="Ganti Tema Gelap / Terang"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[var(--color-yellow)] fill-[var(--color-yellow)] group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-black group-hover:-rotate-45 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
