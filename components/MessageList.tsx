'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';
import { EmailMessage } from './MessageReader';
import { formatEmailBody, formatDateWIB, formatTimeAgo } from '@/lib/formatters';
import { extractOtp, extractLinks } from '@/lib/otpParser';
import { playSound, playKatanaSlashSound, playNekoSound, playShibaSound } from '@/lib/sound';

interface MessageListProps {
  messages: EmailMessage[];
  currentEmail: string;
  onOpenSplitView: () => void;
  onSelectMessageForSplit: (message: EmailMessage) => void;
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
}

export default function MessageList({
  messages,
  currentEmail,
  onOpenSplitView,
  onSelectMessageForSplit,
  onDeleteMessage,
  onClearAll,
}: MessageListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Interactive Squad Character States
  const [giyuState, setGiyuState] = useState<'idle' | 'slashing'>('idle');
  const [nekoState, setNekoState] = useState<'idle' | 'meow'>('idle');
  const [shibaState, setShibaState] = useState<'idle' | 'bark'>('idle');

  const toggleExpand = (id: string) => {
    playSound('click');
    setExpandedId(expandedId === id ? null : id);
  };

  const handleGiyuClick = () => {
    if (giyuState === 'slashing') return;
    setGiyuState('slashing');
    playKatanaSlashSound(true);
    setTimeout(() => {
      setGiyuState('idle');
    }, 1400);
  };

  const handleNekoClick = () => {
    if (nekoState === 'meow') return;
    setNekoState('meow');
    playNekoSound(true);
    setTimeout(() => {
      setNekoState('idle');
    }, 1200);
  };

  const handleShibaClick = () => {
    if (shibaState === 'bark') return;
    setShibaState('bark');
    playShibaSound(true);
    setTimeout(() => {
      setShibaState('idle');
    }, 1200);
  };

  return (
    <div className="relative mt-8 xs:mt-10 sm:mt-12">
      {/* ======================================================== */}
      {/* SQUAD DIORAMA OVER TOP BORDER OF MAIL BOX                */}
      {/* ZERO LAYOUT SHIFT: Positioned absolute above top border */}
      {/* ======================================================== */}
      <div className="absolute -top-[46px] xs:-top-[52px] sm:-top-[58px] left-0 right-0 w-full flex items-end justify-between px-3 xs:px-6 sm:px-10 pointer-events-none z-20 select-none">
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

          {/* Water Slash Wave Effect Overlay when slashing */}
          {giyuState === 'slashing' && (
            <div className="absolute -top-10 xs:-top-12 sm:-top-14 left-1/2 -translate-x-1/2 pointer-events-none z-40 w-[200px] xs:w-[240px] sm:w-[280px] anim-water-slash">
              <svg viewBox="0 0 200 80" className="w-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
                <path d="M10,70 Q60,10 130,25 T190,5" fill="none" stroke="#00ffff" strokeWidth="7" strokeLinecap="round" />
                <path d="M15,72 Q65,15 135,28 T195,8" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="45" cy="30" r="3.5" fill="#00f0ff" />
                <circle cx="85" cy="18" r="4.5" fill="#ffffff" />
                <circle cx="120" cy="15" r="3" fill="#00f0ff" />
                <circle cx="160" cy="22" r="4" fill="#ffffff" />
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

      {/* Main Mail Box Card */}
      <div className="brutal-card overflow-hidden bg-[var(--card-bg)]">
        {/* Header bar of inbox card with Electric Sky Blue & Cyber Yellow */}
        <div className="bg-[#f0f9ff] dark:bg-zinc-900 border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] px-3 xs:px-4 py-2.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3 select-none">
          <div className="font-mono-custom font-bold text-xs sm:text-sm flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white flex-shrink-0 shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[2px_2px_0px_var(--shadow-color)]">
              <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[var(--text-muted)] font-black flex-shrink-0">INBOX:</span>
            <span className="text-[var(--color-blue)] font-black break-all">
              {currentEmail || '...'}
            </span>
            {/* Animated radar dot */}
            <span className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0 ml-1">
              <span className="motion-radar-ring" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 xs:gap-2 justify-end flex-wrap">
            {messages.length > 0 && (
              <button
                onClick={onClearAll}
                className="brutal-btn bg-[var(--color-red)] text-white px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] xs:text-[11px] font-bold font-mono-custom flex items-center gap-1 hover:bg-red-600 group shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                title="Kosongkan semua pesan di inbox ini"
              >
                <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" />
                <span className="hidden xs:inline">BERSIHKAN</span>
              </button>
            )}

            {/* BUKA SPLIT VIEW */}
            <button
              onClick={onOpenSplitView}
              className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] xs:text-[11px] sm:text-xs font-bold font-mono-custom flex items-center gap-1 sm:gap-1.5 group shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
            >
              <ExternalLink className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              <span>SPLIT INBOX</span>
            </button>

            {/* Message Count Badge */}
            <div className="text-[10px] xs:text-[11px] sm:text-xs font-black font-mono-custom bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] px-2 xs:px-2.5 py-0.5 sm:py-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] whitespace-nowrap">
              <span>{messages.length}</span> PESAN
            </div>
          </div>
        </div>

        {/* Message List Body */}
        <div className="p-3 xs:p-3.5 sm:p-5 bg-[var(--card-bg)] min-h-[220px] sm:min-h-[260px] flex flex-col space-y-3 sm:space-y-3.5">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-9 select-none">
              
              {/* ======================================================== */}
              {/* SQUAD DIORAMA STANDING GUARD INSIDE EMPTY MAIL BOX      */}
              {/* ======================================================== */}
              <div className="relative mb-4 sm:mb-5 flex items-end justify-center gap-2.5 sm:gap-5 select-none">
                
                {/* 1. Neko Gamer */}
                <div
                  onClick={handleNekoClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleNekoClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`flex flex-col items-center anim-char-bob cursor-pointer group transition-transform ${
                    nekoState === 'meow' ? '-translate-y-2' : ''
                  }`}
                  title="Neko Gamer"
                >
                  <div className="bg-[#ff007f] text-white font-pixel text-[5.5px] xs:text-[6px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
                    {nekoState === 'meow' ? 'PURR! 🐱' : 'MEOW! 🎧'}
                  </div>
                  <svg width="40" height="40" viewBox="0 0 32 32" className="xs:w-[44px] xs:h-[44px] drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
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

                {/* 2. Center: GIYU TOMIOKA (Standing Guard with Water Breathing & Nichirin Katana) */}
                <div
                  onClick={handleGiyuClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleGiyuClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`flex flex-col items-center relative cursor-pointer group ${
                    giyuState === 'slashing' ? 'anim-action-slash' : 'anim-char-bob'
                  }`}
                  title="Giyu Tomioka (Klik untuk tebasan air!)"
                >
                  <div className="bg-cyan-500 text-black font-pixel text-[6px] xs:text-[6.5px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-30 flex items-center gap-1 font-bold group-hover:scale-105 transition-transform">
                    <span>{giyuState === 'slashing' ? '⚔️' : '🌊'}</span>
                    <span>{giyuState === 'slashing' ? 'WATER SLASH!' : 'GIYU TOMIOKA'}</span>
                  </div>

                  {giyuState === 'slashing' && (
                    <div className="absolute -top-10 xs:-top-12 sm:-top-14 left-1/2 -translate-x-1/2 pointer-events-none z-40 w-[200px] xs:w-[240px] sm:w-[280px] anim-water-slash">
                      <svg viewBox="0 0 200 80" className="w-full filter drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
                        <path d="M10,70 Q60,10 130,25 T190,5" fill="none" stroke="#00ffff" strokeWidth="7" strokeLinecap="round" />
                        <path d="M15,72 Q65,15 135,28 T195,8" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="45" cy="30" r="3.5" fill="#00f0ff" />
                        <circle cx="85" cy="18" r="4.5" fill="#ffffff" />
                        <circle cx="120" cy="15" r="3" fill="#00f0ff" />
                        <circle cx="160" cy="22" r="4" fill="#ffffff" />
                      </svg>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute -inset-1.5 bg-cyan-400/25 blur-sm rounded-full anim-water" />
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

                      {/* Nichirin Blade */}
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

                      {/* Legs */}
                      <rect x="12" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                      <line x1="12" y1="31" x2="16" y2="31" stroke="#ffffff" strokeWidth="0.75" />
                      <rect x="11.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
                      <rect x="20" y="29" width="4" height="4" fill="#0f172a" stroke="#000" strokeWidth="0.8" />
                      <line x1="20" y1="31" x2="24" y2="31" stroke="#ffffff" strokeWidth="0.75" />
                      <rect x="19.5" y="32" width="5" height="2" fill="#d97706" rx="0.5" />
                    </svg>
                  </div>
                </div>

                {/* 3. Shiba Mail Courier holding Central Mailbox Beacon */}
                <div
                  onClick={handleShibaClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleShibaClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', animationDelay: '-1.2s' }}
                  className={`flex flex-col items-center anim-char-bob cursor-pointer group transition-transform ${
                    shibaState === 'bark' ? '-translate-y-2' : ''
                  }`}
                  title="Shiba Mail Courier"
                >
                  <div className="bg-[#ffe600] text-black font-pixel text-[5.5px] xs:text-[6px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold group-hover:scale-105 transition-transform">
                    {shibaState === 'bark' ? 'WOOF! 🐶' : 'MAIL! 💌'}
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[var(--color-green)] opacity-40 motion-radar-sweep pointer-events-none" />
                    <svg width="40" height="40" viewBox="0 0 32 32" className="xs:w-[44px] xs:h-[44px] relative z-10 drop-shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
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
                </div>

              </div>

              {/* Live INBOX READY Status Pill with Animated Signal Equalizer */}
              <div className="inline-flex items-center gap-2 brutal-badge bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7] px-3 py-1 sm:py-1.5 text-[10px] xs:text-xs font-mono-custom font-black border-2 border-[var(--border-color)] mb-2 sm:mb-2.5 motion-live-badge">
                <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                  <span className="motion-radar-ring" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
                </div>
                <div className="flex items-end gap-0.5 h-2.5 flex-shrink-0">
                  <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-1" />
                  <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-2" />
                  <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-3" />
                </div>
                <span className="tracking-wide">INBOX READY &bull; STANDBY</span>
              </div>

              <h3 className="font-heading text-sm xs:text-base sm:text-lg md:text-xl font-black uppercase tracking-tight mb-1 text-[var(--text-main)]">
                MENUNGGU PESAN MASUK
              </h3>
              <p className="font-mono-custom text-[11px] xs:text-xs text-[var(--text-muted)] max-w-xs sm:max-w-sm leading-relaxed px-2">
                Kirim email ke alamat di atas. Pesan atau kode OTP akan otomatis muncul di sini dalam 3 detik.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {messages.map((msg) => {
                const isExpanded = expandedId === msg.id;
                const formattedHtml = formatEmailBody(msg.bodyHtml || msg.bodyText);
                const otpRes = extractOtp(msg.bodyText, msg.bodyHtml, msg.subject);
                const linksRes = extractLinks(msg.bodyText, msg.bodyHtml);

                return (
                  <div
                    key={msg.id}
                    className={`motion-message-item border-[2.5px] sm:border-[3px] border-[var(--border-color)] transition-all ${
                      !msg.isRead ? 'bg-[#f0fdf4] dark:bg-[#121b18] shadow-[3px_3px_0px_var(--shadow-color)]' : 'bg-[#fcfdfe] dark:bg-[#10141e] shadow-[2px_2px_0px_var(--shadow-color)]'
                    }`}
                  >
                    <div className="p-3 xs:p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3">
                      {/* Summary Details */}
                      <div
                        onClick={() => toggleExpand(msg.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-heading font-black text-xs sm:text-sm text-[var(--color-blue)] truncate max-w-[200px] sm:max-w-none uppercase">
                            {msg.sender}
                          </span>
                          <span className="text-[10px] font-mono-custom bg-[var(--color-yellow)] text-black px-1.5 py-0.2 border border-[var(--border-color)] font-bold">
                            {formatTimeAgo(msg.createdAt)}
                          </span>
                          {!msg.isRead && (
                            <span className="bg-[var(--color-green)] text-white text-[9px] font-mono-custom font-black px-1.5 py-0.2 border border-[var(--border-color)] uppercase motion-new-badge">
                              BARU
                            </span>
                          )}
                        </div>

                        <div className="font-heading font-black text-xs xs:text-sm sm:text-base text-[var(--text-main)] truncate uppercase">
                          {msg.subject || '(Tanpa Subjek)'}
                        </div>

                        <div className="text-[10px] sm:text-[11px] font-mono-custom text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-[var(--color-orange)] flex-shrink-0" />
                          <span>{formatDateWIB(msg.createdAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 xs:gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => onSelectMessageForSplit(msg)}
                          className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white px-2.5 py-1.5 text-[10px] xs:text-xs font-mono-custom font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-[#f0f9ff]"
                          title="Buka pesan di Split Panel Reader"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>PANEL</span>
                        </button>

                        <button
                          onClick={() => toggleExpand(msg.id)}
                          className="brutal-btn bg-[var(--color-yellow)] text-black px-2.5 py-1.5 text-[10px] xs:text-xs font-mono-custom font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>TUTUP</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>BACA</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="brutal-btn bg-[var(--color-red)] text-white p-1.5 text-xs shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-red-600"
                          title="Hapus pesan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content View */}
                    {isExpanded && (
                      <div className="border-t-[2.5px] sm:border-t-[3px] border-[var(--border-color)] bg-[#f8fbff] dark:bg-zinc-950 p-3 xs:p-4 sm:p-5 space-y-3 sm:space-y-4">
                        {/* OTP & Links Quick Extraction Callouts */}
                        {(otpRes.found || linksRes.found) && (
                          <div className="space-y-2">
                            {/* OTP Banner */}
                            {otpRes.found && otpRes.otp && (
                              <div className="p-2.5 xs:p-3 bg-amber-50 dark:bg-amber-950/40 border-[2px] border-amber-400 dark:border-amber-600 flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 bg-[var(--color-yellow)] text-black border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                                    <Zap className="w-3.5 h-3.5 text-black fill-black" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-mono-custom font-black text-amber-700 dark:text-amber-300 uppercase block leading-none">
                                      KODE OTP TERDETEKSI
                                    </span>
                                    <span className="font-mono-custom font-black text-sm xs:text-base text-black dark:text-white tracking-widest select-all">
                                      {otpRes.otp}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(otpRes.otp!);
                                    playSound('success');
                                  }}
                                  className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3 py-1 text-xs font-mono-custom font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>SALIN OTP</span>
                                </button>
                              </div>
                            )}

                            {/* Verification Link Banner */}
                            {linksRes.found && linksRes.primaryLink && (
                              <div className="p-2.5 xs:p-3 bg-[#ecfdf5] dark:bg-emerald-950/50 border-[2px] border-[var(--color-green)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in">
                                <div className="min-w-0 flex items-center gap-2">
                                  <div className="w-6 h-6 bg-[var(--color-green)] text-white border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-mono-custom font-black text-emerald-800 dark:text-emerald-300 uppercase">
                                        VERIFICATION LINK
                                      </span>
                                      {linksRes.primaryLabel && (
                                        <span className="bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-500 text-[9px] font-mono-custom font-black px-1.5 py-0.2 rounded-none">
                                          &quot;{linksRes.primaryLabel}&quot;
                                        </span>
                                      )}
                                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                    </div>
                                    <p
                                      className="font-mono-custom text-[10px] xs:text-[11px] text-zinc-600 dark:text-zinc-300 break-all line-clamp-2 max-w-full cursor-pointer hover:underline select-all"
                                      title={linksRes.primaryLink}
                                      onClick={() => {
                                        navigator.clipboard.writeText(linksRes.primaryLink!);
                                        playSound('success');
                                      }}
                                    >
                                      {linksRes.primaryLink}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(linksRes.primaryLink!);
                                      playSound('success');
                                    }}
                                    className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white px-2.5 py-1 text-xs font-mono-custom font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-zinc-100 cursor-pointer"
                                    title="Salin Link Lengkap"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>SALIN</span>
                                  </button>
                                  <a
                                    href={linksRes.primaryLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => playSound('click')}
                                    className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3 py-1 text-xs font-mono-custom font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                                    title="Buka Link Verifikasi"
                                  >
                                    <span>BUKA LINK</span>
                                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <iframe
                          title={`Inline Message ${msg.id}`}
                          srcDoc={formattedHtml}
                          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                          className="w-full min-h-[260px] xs:min-h-[300px] sm:min-h-[380px] md:min-h-[440px] border-[2.5px] sm:border-[3px] border-[var(--border-color)] bg-white shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info with Animated Live Radar Beacon */}
        <div className="p-2.5 sm:p-3 text-center border-t-[2px] sm:border-t-[2.5px] border-dashed border-[var(--border-color)] text-[10px] xs:text-[11px] font-mono-custom font-black text-[var(--text-muted)] uppercase flex items-center justify-center gap-2 select-none">
          <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
            <span className="motion-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
          </div>
          <span className="truncate">HeyFlatimo Engine &bull; Realtime Inbox Listening</span>
        </div>
      </div>
    </div>
  );
}
