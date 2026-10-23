'use client';

import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Shuffle,
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Crown,
  Sun,
  Moon,
  QrCode,
  Bell,
  BellOff,
} from 'lucide-react';
import CustomEmailModal from './CustomEmailModal';
import DomainDropdown, { DomainOption } from './DomainDropdown';
import { playSound, playKatanaSlashSound, playNekoSound, playShibaSound } from '@/lib/sound';

interface EmailCardProps {
  currentEmail: string;
  currentPrefix: string;
  currentDomain: string;
  availableDomains: (string | DomainOption)[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeDomain: (domain: string) => void;
  onApplyCustom: (prefix: string, domain: string) => void;
  onCopy: (email: string) => void;
  countdownSeconds: number;
  isVipUnlocked?: boolean;
  onOpenVipModal?: () => void;
  onRequestVipUnlock?: (domain: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenQrModal?: () => void;
  heroHeader?: {
    badgeText?: string;
    titlePrefix?: string;
    titleHighlight?: string;
    subtitle?: string;
  };
}

export default function EmailCard({
  currentEmail,
  currentPrefix,
  currentDomain,
  availableDomains,
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeDomain,
  onApplyCustom,
  onCopy,
  countdownSeconds,
  isVipUnlocked = false,
  onOpenVipModal,
  onRequestVipUnlock,
  isDark = false,
  onToggleTheme,
  isSoundEnabled = true,
  onToggleSound,
  onOpenQrModal,
  heroHeader,
}: EmailCardProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Interactive Squad Character States
  const [giyuState, setGiyuState] = useState<'idle' | 'slashing'>('idle');
  const [nekoState, setNekoState] = useState<'idle' | 'meow'>('idle');
  const [shibaState, setShibaState] = useState<'idle' | 'bark'>('idle');

  const badgeText = heroHeader?.badgeText !== undefined ? heroHeader.badgeText : 'DISPOSABLE INBOX SYSTEM';
  const titlePrefix = heroHeader?.titlePrefix !== undefined ? heroHeader.titlePrefix : 'TEMPORARY';
  const titleHighlight = heroHeader?.titleHighlight !== undefined ? heroHeader.titleHighlight : 'INBOX';
  const subtitle = heroHeader?.subtitle !== undefined ? heroHeader.subtitle : 'Terima kode OTP & verifikasi instan. Otomatis terhapus, aman & tanpa data pribadi.';

  const handleCopyClick = () => {
    if (!currentEmail) return;
    onCopy(currentEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGiyuClick = () => {
    if (giyuState === 'slashing') return;
    setGiyuState('slashing');
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
    setTimeout(() => {
      setGiyuState('idle');
    }, 1400);
  };

  const handleNekoClick = () => {
    if (nekoState === 'meow') return;
    setNekoState('meow');
    if (isSoundEnabled) {
      playNekoSound(true);
    }
    setTimeout(() => {
      setNekoState('idle');
    }, 1200);
  };

  const handleShibaClick = () => {
    if (shibaState === 'bark') return;
    setShibaState('bark');
    if (isSoundEnabled) {
      playShibaSound(true);
    }
    setTimeout(() => {
      setShibaState('idle');
    }, 1200);
  };

  // Interactive Giyu Strip Runner State
  const [runnerQuote, setRunnerQuote] = useState<string | null>(null);
  const runnerQuoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRunnerClick = () => {
    const quotes = [
      'PERNAPASAN AIR!',
      'PATROLI INBOX!',
      'JANGAN MENYERAH!',
      'HASHIRA RUSH!',
      'SYNC DATA!',
    ];
    const picked = quotes[Math.floor(Math.random() * quotes.length)];
    setRunnerQuote(picked);
    if (isSoundEnabled) {
      playKatanaSlashSound(true);
    }
    if (runnerQuoteTimeoutRef.current) {
      clearTimeout(runnerQuoteTimeoutRef.current);
    }
    runnerQuoteTimeoutRef.current = setTimeout(() => {
      setRunnerQuote(null);
    }, 2200);
  };

  return (
    <div className="brutal-card px-4 pb-4 pt-5 xs:px-5 xs:pb-5 xs:pt-6 sm:p-7 mt-14 xs:mt-16 sm:mt-20 mb-5 sm:mb-7 relative bg-[var(--card-bg)]">
      {/* ======================================================== */}
      {/* SQUAD DIORAMA OVER TOP BORDER (GIYU + NEKO + SHIBA)     */}
      {/* CENTERED SQUAD COMPOSITION: Never overlaps corner buttons */}
      {/* ======================================================== */}
      <div className="absolute -top-[48px] xs:-top-[54px] sm:-top-[58px] left-0 right-0 w-full flex items-end justify-center gap-4 xs:gap-7 sm:gap-12 md:gap-16 px-12 xs:px-14 sm:px-16 pointer-events-none z-20 select-none">
        {/* 1. Left: Pixel Neko Gamer (Interactive) */}
        <div
          onClick={handleNekoClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleNekoClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`flex flex-col items-center anim-char-bob pointer-events-auto cursor-pointer group transition-transform ${
            nekoState === 'meow' ? '-translate-y-2' : ''
          }`}
          title="Neko Gamer"
        >
          <div className="bg-[#ff007f] text-white font-pixel text-[5.5px] xs:text-[6px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
            {nekoState === 'meow' ? 'PURR! 🐱' : 'MEOW! 🎧'}
          </div>
          <svg width="42" height="42" viewBox="0 0 32 32" className="xs:w-[46px] xs:h-[46px] drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
            <g className="anim-tail">
              <rect x="23" y="16" width="3" height="3" fill="#ff9900" stroke="#000" strokeWidth="0.75" />
              <rect x="25" y="13" width="3" height="4" fill="#ffffff" stroke="#000" strokeWidth="0.75" />
            </g>
            <polygon points="7,4 12,4 7,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
            <polygon points="25,4 20,4 25,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
            <path d="M7,10 Q16,4 25,10" fill="none" stroke="#00ffff" strokeWidth="2.2" />
            <rect x="5" y="9" width="3" height="5" rx="1" fill="#00ffff" stroke="#000" strokeWidth="0.7" />
            <rect x="24" y="9" width="3" height="5" rx="1" fill="#00ffff" stroke="#000" strokeWidth="0.7" />
            <rect x="8" y="8" width="16" height="11" rx="2" fill="#ff9900" stroke="#000" strokeWidth="1" />
            <rect x="12" y="13" width="8" height="5" fill="#ffffff" />
            <rect x="10" y="11" width="3" height="3" fill="#000000" />
            <rect x="10" y="11" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="19" y="11" width="3" height="3" fill="#000000" />
            <rect x="19" y="11" width="1.5" height="1.5" fill="#ffffff" />
            <polygon points="15,14 17,14 16,15.5" fill="#ff007f" />
            <rect x="10" y="18" width="12" height="9" fill="#ff9900" stroke="#000" strokeWidth="0.9" />
            <rect x="12" y="18" width="8" height="6" fill="#ffffff" />
            <rect x="11" y="26" width="4" height="4" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
            <rect x="17" y="26" width="4" height="4" rx="1.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
          </svg>
        </div>

        {/* 2. Center: GIYU TOMIOKA (Hashira Air) - Interactive Katana Slash Action */}
        <div
          onClick={handleGiyuClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleGiyuClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`flex flex-col items-center relative -mb-0.5 pointer-events-auto cursor-pointer group ${
            giyuState === 'slashing' ? 'anim-action-slash' : 'anim-char-bob'
          }`}
          title="Giyu Tomioka (Klik untuk tebasan air!)"
        >
          {/* Action Tag: Pure Name in Idle, Water Slash during action */}
          <div className="bg-cyan-500 text-black font-pixel text-[6px] xs:text-[6.5px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-30 flex items-center gap-1 font-bold group-hover:scale-105 transition-transform">
            <span>{giyuState === 'slashing' ? '⚔️' : '🌊'}</span>
            <span>{giyuState === 'slashing' ? 'WATER SLASH!' : 'GIYU TOMIOKA'}</span>
          </div>

          {/* Water Slash Wave Effect Overlay when slashing (Aligned directly with Nichirin blade trajectory) */}
          {giyuState === 'slashing' && (
            <div className="absolute top-[-6px] xs:top-[-8px] sm:top-[-10px] left-1/2 -translate-x-1/2 pointer-events-none z-30 w-[180px] xs:w-[210px] sm:w-[250px] anim-water-slash">
              <svg viewBox="0 0 200 70" className="w-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
                <path d="M10,55 Q60,8 130,20 T190,5" fill="none" stroke="#00ffff" strokeWidth="6" strokeLinecap="round" />
                <path d="M15,57 Q65,12 135,22 T195,7" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="45" cy="24" r="3" fill="#00f0ff" />
                <circle cx="85" cy="14" r="4" fill="#ffffff" />
                <circle cx="120" cy="12" r="2.5" fill="#00f0ff" />
                <circle cx="160" cy="16" r="3.5" fill="#ffffff" />
                <circle cx="180" cy="8" r="2" fill="#00f0ff" />
              </svg>
            </div>
          )}

          <div className="relative">
            <div className="absolute -inset-1 bg-cyan-400/20 blur-sm rounded-full anim-water"></div>
            <svg width="60" height="60" viewBox="0 0 36 36" className="xs:w-[68px] xs:h-[68px] relative z-10 drop-shadow-[3px_3px_0px_#000] group-hover:scale-105 transition-transform">
              {/* Ponytail Hair */}
              <polygon points="8,10 3,16 6,24 10,21 10,14" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <rect x="7" y="13" width="3" height="2" fill="#38bdf8" />
              {/* Spiky Black Hair */}
              <polygon points="10,5 18,3 26,5 28,11 26,13 10,13 8,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
              <polygon points="7,8 4,11 9,11" fill="#0f172a" />
              <polygon points="27,8 30,11 25,11" fill="#0f172a" />
              {/* Face */}
              <rect x="10" y="8" width="16" height="11" fill="#fde68a" stroke="#000" strokeWidth="1" />
              <polygon points="10,8 14,13 16,9 20,13 22,8" fill="#0f172a" />
              {/* Eyes */}
              <rect x="12" y="12" width="3" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
              <rect x="13" y="12" width="1" height="1" fill="#ffffff" />
              <rect x="21" y="12" width="3" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
              <rect x="22" y="12" width="1" height="1" fill="#ffffff" />
              <line x1="16" y1="16" x2="20" y2="16" stroke="#000" strokeWidth="0.75" />
              {/* Split Haori */}
              <path d="M10,19 L18,19 L18,29 L8,29 L8,22 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.9" />
              <path d="M18,19 L26,19 L28,22 L28,29 L18,29 Z" fill="#15803d" stroke="#000" strokeWidth="0.9" />
              <rect x="19" y="20" width="3" height="3" fill="#eab308" />
              <rect x="23" y="20" width="3" height="3" fill="#ea580c" />
              <rect x="21" y="23" width="3" height="3" fill="#eab308" />
              <polygon points="15,19 21,19 18,25" fill="#0f172a" />
              <line x1="18" y1="19" x2="18" y2="24" stroke="#ffffff" strokeWidth="0.8" />
              <rect x="13" y="25" width="10" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.6" />

              {/* Nichirin Blade: Sheathed in idle, Drawn in action */}
              {giyuState === 'idle' ? (
                <g>
                  <line x1="5" y1="28" x2="14" y2="23" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="28" x2="14" y2="23" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="13.5" y="21.5" width="2" height="2" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />
                  <line x1="14" y1="22" x2="18" y2="20" stroke="#ffffff" strokeWidth="1.8" />
                </g>
              ) : (
                <g>
                  <line x1="18" y1="20" x2="34" y2="9" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="18" y1="20" x2="34" y2="9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="18" cy="20" r="2" fill="#000" stroke="#00f0ff" strokeWidth="0.8" />
                </g>
              )}

              {/* Legs dangling */}
              <rect x="12" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <line x1="12" y1="31" x2="16" y2="31" stroke="#ffffff" strokeWidth="0.75" />
              <rect x="11.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
              <rect x="20" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
              <line x1="20" y1="31" x2="24" y2="31" stroke="#ffffff" strokeWidth="0.75" />
              <rect x="19.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
            </svg>
          </div>
        </div>

        {/* 3. Right: Shiba Mail Courier & Mini Ghost (Interactive) */}
        <div
          onClick={handleShibaClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleShibaClick();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', animationDelay: '-1.2s' }}
          className={`flex items-end gap-1 anim-char-bob pointer-events-auto cursor-pointer group transition-transform ${
            shibaState === 'bark' ? '-translate-y-2' : ''
          }`}
          title="Shiba Courier"
        >
          <div className="flex flex-col items-center">
            <div className="bg-[#ffe600] text-black font-pixel text-[5.5px] xs:text-[6px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
              {shibaState === 'bark' ? 'WOOF! 🐶' : 'MAIL! 💌'}
            </div>
            <svg width="42" height="42" viewBox="0 0 32 32" className="xs:w-[46px] xs:h-[46px] drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
              <polygon points="7,4 12,4 9,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
              <polygon points="25,4 20,4 23,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
              <rect x="8" y="6" width="16" height="4" fill="#1e3a8a" stroke="#000" strokeWidth="0.7" rx="1" />
              <circle cx="16" cy="8" r="1.2" fill="#ffe600" />
              <rect x="8" y="10" width="16" height="11" fill="#d97706" stroke="#000" strokeWidth="0.9" rx="1" />
              <rect x="10" y="13" width="2.5" height="2.5" fill="#000" />
              <rect x="19.5" y="13" width="2.5" height="2.5" fill="#000" />
              <rect x="12" y="15" width="8" height="4" fill="#ffffff" />
              <polygon points="15,16 17,16 16,17" fill="#000" />
              <rect x="11" y="19" width="10" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
              <rect x="14.5" y="20.5" width="3" height="2" fill="#ff0055" />
              <rect x="9" y="25" width="4" height="4" rx="1" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
              <rect x="19" y="25" width="4" height="4" rx="1" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
            </svg>
          </div>
          <div className="hidden xs:block -mb-1 anim-water">
            <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-[2px_2px_0px_#000]">
              <path d="M6,10 A6,6 0 0,1 18,10 L18,20 L15,18 L12,20 L9,18 L6,20 Z" fill="#ff007f" stroke="#000" strokeWidth="1" />
              <rect x="8" y="9" width="3" height="3" fill="#fff" />
              <rect x="9" y="10" width="1.5" height="2" fill="#00f0ff" />
              <rect x="13" y="9" width="3" height="3" fill="#fff" />
              <rect x="14" y="10" width="1.5" height="2" fill="#00f0ff" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top-Left Action Control: Dark/Light Mode Toggle */}
      {onToggleTheme && (
        <div className="absolute top-2.5 left-2.5 xs:top-3 xs:left-3 sm:top-4 sm:left-4 z-30">
          <button
            type="button"
            onClick={onToggleTheme}
            className="brutal-btn w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] dark:bg-zinc-800 text-black dark:text-[var(--color-yellow)] border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] group cursor-pointer transition-colors p-0"
            title="Ganti Tema Gelap / Terang"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 text-[var(--color-yellow)] fill-[var(--color-yellow)] group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 text-black group-hover:-rotate-45 transition-transform duration-300" />
            )}
          </button>
        </div>
      )}

      {/* Top-Right Action Control: VIP Crown Button */}
      <div className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 sm:top-4 sm:right-4 z-30">
        {isVipUnlocked ? (
          <div
            className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)]"
            title="Domain VIP Aktif (Mode Eksklusif)"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-black text-black animate-pulse" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVipModal}
            className="brutal-btn w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-white dark:bg-zinc-800 hover:bg-[var(--color-yellow)] dark:hover:bg-[var(--color-yellow)] text-amber-500 hover:text-black dark:hover:text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] group cursor-pointer transition-colors p-0"
            title="Klik untuk membuka Domain VIP (Masukkan CDK)"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 group-hover:fill-black group-hover:rotate-12 transition-all duration-200" />
          </button>
        )}
      </div>

      {/* Title Header: Symmetrically Balanced, Protected from Overlap */}
      <div className="text-center mb-5 sm:mb-6 px-9 xs:px-11 sm:px-14">
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 brutal-badge bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] xs:text-[10px] sm:text-[11px] mb-2 sm:mb-2.5 font-mono-custom uppercase tracking-wide max-w-full truncate">
            <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[var(--color-orange)] icon-wiggle flex-shrink-0" />
            <span className="truncate">{badgeText}</span>
          </div>
        )}
        <h1 className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[var(--text-main)] mb-1.5 sm:mb-2">
          {titlePrefix}{' '}
          {titleHighlight && <span className="text-[var(--color-blue)]">{titleHighlight}</span>}
        </h1>
        {subtitle && (
          <p className="text-[var(--text-muted)] font-mono-custom text-[11px] xs:text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Email Input Display + Copy Button */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1 group min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-blue)] group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <input
            type="text"
            readOnly
            value={currentEmail || 'Memuat alamat email...'}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="brutal-input w-full font-mono-custom text-xs xs:text-sm sm:text-base md:text-lg py-2.5 xs:py-3 sm:py-3.5 pl-9 xs:pl-10 sm:pl-11 pr-3 sm:pr-4 font-bold text-center sm:text-left select-all cursor-pointer bg-white dark:bg-zinc-900 border-[2.5px] sm:border-[3.5px] border-[var(--border-color)] truncate"
          />
        </div>

        {/* Tombol SALIN */}
        <button
          onClick={handleCopyClick}
          className={`brutal-btn px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-2 group shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] ${
            copied
              ? 'bg-[var(--color-green)] text-white'
              : 'bg-[var(--color-blue)] text-white hover:bg-sky-600'
          }`}
          title="Salin ke Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 icon-bounce" />
              <span>TERSALIN!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
              <span>SALIN</span>
            </>
          )}
        </button>
      </div>

      {/* Control Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 xs:gap-2.5 pb-4 sm:pb-5 border-b-[2.5px] sm:border-b-[3px] border-dashed border-[var(--border-color)]">
        {/* Tombol EMAIL BARU */}
        <button
          onClick={onRandomize}
          className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Buat alamat acak baru"
        >
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
          <span className="truncate">EMAIL BARU</span>
        </button>

        {/* Tombol KUSTOM */}
        <button
          onClick={() => {
            playSound('pop');
            setIsModalOpen(true);
          }}
          className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Tentukan nama email kustom"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-45 transition-transform duration-200 flex-shrink-0" />
          <span className="truncate">KUSTOM</span>
        </button>

        {/* Tombol QR CODE */}
        {onOpenQrModal && (
          <button
            onClick={onOpenQrModal}
            className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 px-3 xs:px-3.5 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
            title="Tampilkan QR Code Alamat Email"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0 text-[var(--color-blue)]" />
            <span className="truncate">QR CODE</span>
          </button>
        )}

        {/* Tombol SUARA NOTIFIKASI (Default: Mute) */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className={`brutal-btn px-2.5 xs:px-3 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] ${
              isSoundEnabled
                ? 'bg-[var(--color-purple)] text-white hover:bg-purple-700'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
            }`}
            title={
              isSoundEnabled
                ? 'Suara Notifikasi: AKTIF (Klik untuk Mute)'
                : 'Suara Notifikasi: SENYAP/MUTE (Klik untuk Bunyikan)'
            }
          >
            {isSoundEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-yellow)] flex-shrink-0" />
                <span className="hidden xs:inline">SUARA ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline">MUTE</span>
              </>
            )}
          </button>
        )}

        {/* Animated Custom Domain Dropdown */}
        {availableDomains.length >= 1 && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-mono-custom font-bold text-[var(--text-muted)] uppercase hidden md:inline">
              Domain:
            </span>
            <DomainDropdown
              domains={availableDomains}
              selectedDomain={currentDomain}
              onSelect={onChangeDomain}
              isVipUnlocked={isVipUnlocked}
              onRequestVipUnlock={onRequestVipUnlock}
              className="w-full sm:w-auto flex-1"
            />
          </div>
        )}

        {/* Right Action Container: Manual Refresh Button + Giyu Runner on Strip */}
        <div className="col-span-2 sm:col-span-1 flex items-end justify-end gap-3 xs:gap-3.5 sm:gap-4.5 sm:ml-auto w-full sm:w-auto relative">
          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs flex items-center justify-center gap-1.5 sm:gap-2 group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] flex-shrink-0"
            title="Refresh Inbox Manual"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0 ${
                isRefreshing ? 'animate-spin-fast' : 'group-hover:rotate-180'
              }`}
            />
            <span className="hidden xs:inline font-mono-custom font-bold">
              {isRefreshing ? 'MENYINKRONKAN...' : 'REFRESH'}
            </span>
            <span className="xs:hidden">SYNC</span>
          </button>

          {/* GIYU TOMIOKA RUNNER IN PLACE WITH WIND EFFECTS (RIGHT SIDE POSITION) */}
          <div
            onClick={handleRunnerClick}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleRunnerClick();
            }}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            className={`relative flex items-end cursor-pointer group pointer-events-auto select-none -mb-3 sm:-mb-4 min-w-[46px] min-h-[40px] flex-shrink-0 ${
              isRefreshing ? 'anim-giyu-sprint-bob' : 'anim-giyu-runner-bob'
            }`}
            title="Giyu Tomioka (Berlari di tempat) - Klik untuk seruan Hashira!"
          >
            {/* Speech / Action Bubble (Upright & Readable) */}
            <div
              className={`absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[5px] xs:text-[6px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap z-40 pointer-events-none transition-all duration-200 ${
                runnerQuote || isRefreshing ? 'opacity-100 scale-100' : 'opacity-85 group-hover:opacity-100 scale-95'
              } ${isRefreshing ? 'bg-cyan-400 text-black font-black animate-pulse' : 'bg-[var(--color-yellow)] text-black font-bold'}`}
            >
              {isRefreshing ? '⚡ HASHIRA SYNC!' : runnerQuote || '🌊 GIYU RUNNER'}
            </div>

            {/* Inward Facing Graphic: Giyu faces left toward the Refresh button & Inbox */}
            <div className="relative scale-x-[-1]">

            {/* Wind Effects (Wind streaks, floating water petals, dust puffs) */}
            <div className="absolute -inset-x-6 -top-2 bottom-0 pointer-events-none z-10 overflow-visible">
              <div
                className={`absolute top-2 right-9 w-8 xs:w-10 h-[1.5px] bg-cyan-300 dark:bg-cyan-400 rounded-full ${
                  isRefreshing ? 'wind-streak-fast-1' : 'wind-streak-1'
                }`}
              />
              <div
                className={`absolute top-4.5 right-7 w-10 xs:w-12 h-[2px] bg-white rounded-full ${
                  isRefreshing ? 'wind-streak-fast-2' : 'wind-streak-2'
                }`}
              />
              <div
                className={`absolute top-7 right-11 w-7 xs:w-9 h-[1.5px] bg-cyan-200 dark:bg-cyan-300 rounded-full ${
                  isRefreshing ? 'wind-streak-fast-3' : 'wind-streak-3'
                }`}
              />
              <div
                className={`absolute top-9 right-6 w-9 xs:w-11 h-[1.5px] bg-sky-300 dark:bg-sky-400 rounded-full ${
                  isRefreshing ? 'wind-streak-fast-4' : 'wind-streak-4'
                }`}
              />

              {/* Floating Petal / Water Droplets */}
              <div className="absolute top-3.5 right-8 w-1.5 h-1.5 bg-cyan-400 rounded-sm petal-float-1" />
              <div className="absolute top-6.5 right-11 w-1.5 h-1.5 bg-white rounded-full petal-float-2" />

              {/* Dust Puffs at feet */}
              <div className="absolute bottom-0 left-1 w-2 h-2 bg-zinc-400/80 rounded-full dust-puff-1" />
              <div className="absolute bottom-0 left-3 w-1.5 h-1.5 bg-zinc-300/70 rounded-full dust-puff-2" />
            </div>

            {/* Dual-Frame Pixel Runner SVG (Frame A & Frame B alternate via CSS) */}
            <div className="relative z-20">
              <svg
                width="52"
                height="46"
                viewBox="0 0 38 34"
                className="w-[46px] h-[40px] xs:w-[52px] xs:h-[46px] sm:w-[58px] sm:h-[51px] drop-shadow-[2px_2px_0px_#000] overflow-visible group-hover:scale-105 transition-transform"
              >
                {/* Ground Contact Shadow (Shared) */}
                <ellipse cx="19" cy="33" rx="8" ry="1.4" fill="#000000" opacity="0.45" />

                {/* ============================================== */}
                {/* FRAME A: STEP 1 (Left Leg Forward, Haori Mid) */}
                {/* ============================================== */}
                <g className="anim-giyu-frame-a">
                  {/* Ponytail Hair */}
                  <polygon points="11,11 3,13 0,19 5,22 9,17" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                  <rect x="7" y="13.5" width="2.2" height="2" fill="#38bdf8" />
                  <line x1="2" y1="17" x2="6" y2="16" stroke="#38bdf8" strokeWidth="0.7" />

                  {/* Back Leg (Right) - Pushing Off */}
                  <rect x="8" y="24" width="3" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                  <rect x="8" y="27" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                  <rect x="7.5" y="29.5" width="3.5" height="1.8" fill="#d97706" rx="0.5" />

                  {/* Back Arm (Right) */}
                  <rect x="22" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                  <circle cx="23.5" cy="23.5" r="1.5" fill="#fde68a" />

                  {/* Spiky Black Hair */}
                  <polygon points="12,5 20,3 28,5 30,11 28,13 12,13 10,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
                  <polygon points="9,8 6,11 11,11" fill="#0f172a" />
                  <polygon points="29,8 32,11 27,11" fill="#0f172a" />

                  {/* Face */}
                  <rect x="12" y="8" width="16" height="10" fill="#fde68a" stroke="#000" strokeWidth="0.9" rx="0.5" />
                  <polygon points="12,8 16,12 18,9 22,12 24,8" fill="#0f172a" />
                  <rect x="20" y="11" width="3.5" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
                  <rect x="22" y="11" width="1.2" height="1" fill="#ffffff" />
                  <line x1="20" y1="15" x2="24" y2="15" stroke="#000" strokeWidth="0.75" />

                  {/* Split Haori - Frame A Wave */}
                  <path d="M12,17 L18,17 L17,25 L7,25 L6,20 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
                  <path d="M18,17 L26,17 L28,21 L27,26 L18,25 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                  <rect x="19" y="18" width="2.5" height="2.5" fill="#eab308" />
                  <rect x="23" y="18" width="2.5" height="2.5" fill="#ea580c" />
                  <rect x="21" y="21" width="2.5" height="2.5" fill="#eab308" />

                  {/* Uniform & Belt */}
                  <polygon points="16,17 21,17 19,23" fill="#0f172a" />
                  <line x1="19" y1="17" x2="19" y2="22" stroke="#ffffff" strokeWidth="0.7" />
                  <rect x="14" y="23" width="9" height="1.8" fill="#ffffff" stroke="#000" strokeWidth="0.6" />

                  {/* Katana */}
                  <line x1="5" y1="27" x2="15" y2="22" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="5" y1="27" x2="15" y2="22" stroke="#0284c7" strokeWidth="1" strokeLinecap="round" />
                  <rect x="14" y="21" width="1.8" height="1.8" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />

                  {/* Front Leg (Left) - Forward Step */}
                  <rect x="15" y="24" width="3" height="7" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                  <rect x="15" y="27.5" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                  <rect x="15.5" y="31" width="3.8" height="1.8" fill="#d97706" rx="0.5" />

                  {/* Front Arm (Left) */}
                  <rect x="16" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                  <circle cx="18" cy="23.5" r="1.5" fill="#fde68a" />
                </g>

                {/* ============================================== */}
                {/* FRAME B: STEP 2 (Right Leg Forward, Haori High)*/}
                {/* ============================================== */}
                <g className="anim-giyu-frame-b">
                  {/* Ponytail Hair - Fluttering Higher */}
                  <polygon points="11,10 2,11 0,16 6,19 9,15" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                  <rect x="7" y="12.5" width="2.2" height="2" fill="#38bdf8" />
                  <line x1="1" y1="15" x2="5" y2="14" stroke="#38bdf8" strokeWidth="0.7" />

                  {/* Back Leg (Left) - Extended Back */}
                  <rect x="7" y="24" width="3" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                  <rect x="7" y="27" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                  <rect x="6.5" y="29.5" width="3.5" height="1.8" fill="#d97706" rx="0.5" />

                  {/* Front Arm (Right) - Pumping Forward */}
                  <rect x="19" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                  <circle cx="21" cy="23.5" r="1.5" fill="#fde68a" />

                  {/* Spiky Black Hair */}
                  <polygon points="12,5 20,3 28,5 30,11 28,13 12,13 10,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
                  <polygon points="9,8 6,11 11,11" fill="#0f172a" />
                  <polygon points="29,8 32,11 27,11" fill="#0f172a" />

                  {/* Face */}
                  <rect x="12" y="8" width="16" height="10" fill="#fde68a" stroke="#000" strokeWidth="0.9" rx="0.5" />
                  <polygon points="12,8 16,12 18,9 22,12 24,8" fill="#0f172a" />
                  <rect x="20" y="11" width="3.5" height="2.5" fill="#0284c7" stroke="#000" strokeWidth="0.5" />
                  <rect x="22" y="11" width="1.2" height="1" fill="#ffffff" />
                  <line x1="20" y1="15" x2="24" y2="15" stroke="#000" strokeWidth="0.75" />

                  {/* Split Haori - Frame B Wave (Higher Billow) */}
                  <path d="M12,17 L18,17 L16,24 L5,24 L4,19 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.8" />
                  <path d="M18,17 L26,17 L29,19 L28,24 L18,24 Z" fill="#15803d" stroke="#000" strokeWidth="0.8" />
                  <rect x="19" y="17.5" width="2.5" height="2.5" fill="#eab308" />
                  <rect x="23" y="17.5" width="2.5" height="2.5" fill="#ea580c" />
                  <rect x="21" y="20.5" width="2.5" height="2.5" fill="#eab308" />

                  {/* Uniform & Belt */}
                  <polygon points="16,17 21,17 19,23" fill="#0f172a" />
                  <line x1="19" y1="17" x2="19" y2="22" stroke="#ffffff" strokeWidth="0.7" />
                  <rect x="14" y="23" width="9" height="1.8" fill="#ffffff" stroke="#000" strokeWidth="0.6" />

                  {/* Katana - Slightly Swayed */}
                  <line x1="5" y1="26" x2="15" y2="22" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="5" y1="26" x2="15" y2="22" stroke="#0284c7" strokeWidth="1" strokeLinecap="round" />
                  <rect x="14" y="21" width="1.8" height="1.8" fill="#000" stroke="#38bdf8" strokeWidth="0.5" />

                  {/* Front Leg (Right) - Forward Step */}
                  <rect x="14" y="24" width="3" height="7" fill="#0f172a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                  <rect x="14" y="27.5" width="3" height="2" fill="#ffffff" stroke="#000" strokeWidth="0.5" />
                  <rect x="14.5" y="31" width="3.8" height="1.8" fill="#d97706" rx="0.5" />

                  {/* Back Arm (Left) - Pumping Back */}
                  <rect x="15" y="17" width="3.5" height="6" fill="#0f172a" stroke="#000" strokeWidth="0.7" rx="1" />
                  <circle cx="16.5" cy="23.5" r="1.5" fill="#fde68a" />
                </g>
              </svg>
            </div>
            {/* End of scale-x-[-1] container */}
          </div>
        </div>
      </div>
    </div>

      {/* Auto-Sync Live Status Indicator Badge */}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="motion-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
          </div>
          <span className="font-bold text-[var(--text-main)]">
            Auto-Sync Aktif (Setiap {countdownSeconds}s)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--color-blue)]" />
          <span>Masa aktif email: <strong className="text-[var(--text-main)]">24 Jam</strong></span>
        </div>
      </div>

      {/* Custom Email Modal Dialog */}
      <CustomEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onApplyCustom}
        availableDomains={availableDomains}
        currentPrefix={currentPrefix}
        currentDomain={currentDomain}
        isVipUnlocked={isVipUnlocked}
        onRequestVipUnlock={onRequestVipUnlock}
      />
    </div>
  );
}
