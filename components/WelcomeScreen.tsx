'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, FastForward, Terminal, Sparkles, Volume2, VolumeX } from 'lucide-react';
import {
  playRetroBootSound,
  playRetroBlipSound,
  playRetroStartSound,
  unlockAudio,
  getSoundEnabled,
  setSoundEnabled,
} from '@/lib/sound';

interface WelcomeScreenProps {
  onComplete: () => void;
  appName?: string;
  autoDismissDelay?: number;
  allowSkip?: boolean;
}

export default function WelcomeScreen({
  onComplete,
  appName = 'HEYFLATIMO',
  autoDismissDelay = 2800,
  allowSkip = true,
}: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('> BOOTING ENGINE...');
  const [isExiting, setIsExiting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const hasTriggeredCompleteRef = useRef(false);

  // Initialize sound state & auto-play boot sound with user-interaction fallback
  useEffect(() => {
    const enabled = getSoundEnabled();
    setIsSoundOn(enabled);

    unlockAudio();
    playRetroBootSound();

    // Browser Autoplay Policy Fallback:
    // If the browser suspends/blocks initial audio, unlock and play immediately on first interaction
    const handleFirstInteraction = () => {
      unlockAudio();
      playRetroBootSound();
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Toggle Sound function
  const handleToggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      unlockAudio();
      playRetroBootSound(true);
    }
  };

  // Animate progress segments with 8-bit blip sound
  useEffect(() => {
    const totalSteps = 12;
    const intervalTime = (autoDismissDelay * 0.75) / totalSteps;
    let step = 0;

    const logMessages = [
      '> CHECKING PROTOCOL...',
      '> SECURE GATEWAY OPEN...',
      '> ALLOCATING STORAGE...',
      '> GENERATING INBOX...',
      '> CREATING TEMP TOKEN...',
      '> ENCRYPTING SOCKET...',
      '> BYPASSING SPAM...',
      '> CONNECTING DISPOSABLE DNS...',
      '> READY FOR INBOX TRANSMISSION!',
    ];

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);

      const msgIndex = Math.floor((step / totalSteps) * logMessages.length);
      if (logMessages[msgIndex]) {
        setCurrentLog(logMessages[msgIndex]);
      }

      // Play 8-bit blip tick sound as progress advances
      if (step % 2 === 0) {
        playRetroBlipSound();
      }

      if (step >= totalSteps) {
        clearInterval(timer);
        setCurrentLog('> ALL SYSTEMS READY');
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoDismissDelay]);

  // Auto countdown to dismiss
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  // Keyboard shortcut: ESC to skip, ENTER or Space to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowSkip) {
        handleDismiss();
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allowSkip]);

  const handleDismiss = () => {
    if (hasTriggeredCompleteRef.current) return;
    hasTriggeredCompleteRef.current = true;
    playRetroStartSound();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 550);
  };

  const segmentColors = [
    'bg-[#ffe600]', 'bg-[#ffe600]', 'bg-[#ff5500]', 'bg-[#ff007f]',
    'bg-[#ff007f]', 'bg-[#7000ff]', 'bg-[#0055ff]', 'bg-[#0055ff]',
    'bg-[#00f0ff]', 'bg-[#00f0ff]', 'bg-[#00c853]', 'bg-[#00c853]'
  ];

  // Dynamic Character Runner calculation
  const charPosition = 4 + (progress * 0.92);
  let speechText = 'RUN!';
  if (progress >= 35 && progress < 70) speechText = 'FETCHING!';
  else if (progress >= 70 && progress < 100) speechText = 'LOCKING!';
  else if (progress >= 100) speechText = 'DELIVERED!';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#f0f4f8]/95 dark:bg-[#07080c]/95 backdrop-blur-md transition-all duration-500 ${
        isExiting ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Retro CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-65" />

      {/* Dynamic Retro Grid Background & Game Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* Dynamic Retro Grid Lines */}
        <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[linear-gradient(to_right,rgba(0,0,0,0.12)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,0,0,0.12)_2px,transparent_2px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_2px,transparent_2px)] bg-[size:32px_32px]" />

        {/* 1. PlayStation Triangle (Emerald Green) */}
        <div className="absolute top-[8%] left-[7%] animate-pulse">
          <svg width="56" height="56" viewBox="0 0 100 100">
            <polygon points="50,15 90,85 10,85" fill="#00ff66" stroke="#000000" strokeWidth="8" />
          </svg>
        </div>

        {/* 2. PlayStation Circle (Crimson Red) */}
        <div className="absolute top-[16%] right-[8%]">
          <svg width="52" height="52" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#ff0055" stroke="#000000" strokeWidth="8" />
          </svg>
        </div>

        {/* 3. PlayStation Cross (Electric Cyan) */}
        <div className="absolute bottom-[18%] left-[10%]">
          <svg width="48" height="48" viewBox="0 0 100 100">
            <line x1="20" y1="20" x2="80" y2="80" stroke="#00c8ff" strokeWidth="18" strokeLinecap="square" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#00c8ff" strokeWidth="18" strokeLinecap="square" />
          </svg>
        </div>

        {/* 4. PlayStation Square (Hot Pink) */}
        <div className="absolute bottom-[14%] right-[10%]">
          <svg width="50" height="50" viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" fill="#ff007f" stroke="#000000" strokeWidth="8" />
          </svg>
        </div>

        {/* 5. 8-Bit Pixel Sparkle Star 1 (Cyber Yellow) */}
        <div className="absolute top-[12%] left-[46%] text-[#ffe600] animate-bounce">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>

        {/* 6. 8-Bit Pixel Sparkle Star 2 (Laser Mint) */}
        <div className="absolute top-[48%] right-[5%] text-[#00ff66] animate-pulse">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>

        {/* 7. Floating Retro D-pad Pixel */}
        <div className="absolute top-[42%] left-[4%]">
          <div className="w-6 h-6 bg-yellow-400 border-2 border-black rotate-45 shadow-[2px_2px_0px_#000]" />
        </div>
      </div>

      {/* Top Action Controls Bar: Sound Toggle & Skip Button */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="brutal-btn bg-white dark:bg-[#151b27] text-black dark:text-white font-pixel text-[9px] sm:text-xs px-2.5 sm:px-3 py-1.5 border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
          title="Toggle Audio"
        >
          {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{isSoundOn ? 'AUDIO ON' : 'AUDIO OFF'}</span>
        </button>

        {/* Skip Button */}
        {allowSkip && (
          <button
            type="button"
            onClick={handleDismiss}
            className="brutal-btn bg-white dark:bg-[#151b27] text-black dark:text-white font-pixel text-[10px] sm:text-xs px-3 py-1.5 border-2 border-black flex items-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>LEWATI</span>
            <span className="bg-black text-yellow-300 px-1 py-0.2 text-[8px] font-mono border border-slate-700">ESC</span>
          </button>
        )}
      </div>

      {/* Main Neo-Brutalist Arcade Box with Subtle Glow in Dark Mode */}
      <div className="relative z-30 brutal-card bg-white dark:bg-[#0e121b] border-[3.5px] sm:border-[4.5px] border-black p-6 sm:p-8 max-w-lg w-full text-center shadow-[6px_6px_0px_#000] dark:shadow-[0_0_35px_rgba(0,200,255,0.14),6px_6px_0px_#000000] flex flex-col items-center transition-all duration-300">
        
        {/* 1. Single Clean Status Badge */}
        <div className="inline-flex items-center gap-2 bg-[#ffe600] border-2 border-black px-3 py-1 mb-4 shadow-[2px_2px_0px_#000]">
          <Zap className="w-3.5 h-3.5 text-black fill-black" />
          <span className="font-pixel text-[9px] text-black tracking-wider uppercase font-black">
            ARCADE SYSTEM
          </span>
        </div>

        {/* 2. Header Section */}
        <div className="mb-2 w-full">
          {/* Colorful Pixel Letters: W E L C O M E   T O */}
          <div className="font-pixel text-xl sm:text-2xl font-black tracking-tight my-2 flex items-center justify-center flex-wrap gap-1 select-none">
            <span className="text-[#ffe600] drop-shadow-[2px_2px_0px_#000]">W</span>
            <span className="text-[#ff007f] drop-shadow-[2px_2px_0px_#000]">E</span>
            <span className="text-[#00c8ff] drop-shadow-[2px_2px_0px_#000]">L</span>
            <span className="text-[#00ff66] drop-shadow-[2px_2px_0px_#000]">C</span>
            <span className="text-[#ff5500] drop-shadow-[2px_2px_0px_#000]">O</span>
            <span className="text-[#b026ff] drop-shadow-[2px_2px_0px_#000]">M</span>
            <span className="text-[#ffe600] drop-shadow-[2px_2px_0px_#000]">E</span>
            <span className="mx-1 sm:mx-2" />
            <span className="text-[#00ffff] drop-shadow-[2px_2px_0px_#000]">T</span>
            <span className="text-[#ff007f] drop-shadow-[2px_2px_0px_#000]">O</span>
          </div>

          {/* 3. Pure White HEYFLATIMO with Subtle Glow in Dark Mode */}
          <div className="my-3 select-none">
            <div className="font-pixel text-3xl sm:text-4xl font-black tracking-wider text-black dark:text-white drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]">
              {appName}
            </div>
          </div>

          {/* 4. Single Concise Subtitle (No Duplicate Badges) */}
          <p className="font-pixel text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mt-2 font-bold uppercase tracking-wider">
            LAYANAN EMAIL SEMENTARA CEPAT &amp; PRIVAT
          </p>
        </div>

        {/* 5. Pixel Segmented Progress Bar with Animated Runner Character */}
        <div className="w-full mt-7 mb-4 bg-slate-100 dark:bg-[#151b27] border-2 border-black p-2.5 shadow-[3px_3px_0px_#000] relative">
          
          {/* Dynamic Character Runner (MailBot 88) */}
          <div
            className={`absolute -top-9 transition-all duration-200 -translate-x-1/2 pointer-events-none z-30 ${
              progress >= 100 ? 'anim-victory' : ''
            }`}
            style={{ left: `${charPosition}%` }}
          >
            <div className="anim-char-bob flex flex-col items-center">
              <div className="relative">
                {/* Speech Bubble Tag */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#ffe600] text-black font-pixel text-[7px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap font-bold">
                  {speechText}
                </div>

                {/* Pixel Robot Body (SVG) */}
                <svg width="34" height="34" viewBox="0 0 32 32" className="drop-shadow-[2px_2px_0px_#000]">
                  {/* Antenna */}
                  <rect x="15" y="2" width="2" height="4" fill="#000" />
                  <rect x="14" y="1" width="4" height="2" fill="#ff0055" />
                  {/* Robot Head */}
                  <rect x="6" y="6" width="20" height="12" fill="#ffe600" stroke="#000" strokeWidth="1.5" />
                  {/* Eyes (Cyan Visor) */}
                  <rect x="9" y="9" width="4" height="3" fill="#00f0ff" stroke="#000" strokeWidth="0.8" />
                  <rect x="19" y="9" width="4" height="3" fill="#00f0ff" stroke="#000" strokeWidth="0.8" />
                  {/* Cute Blush */}
                  <rect x="7" y="14" width="2" height="1.5" fill="#ff007f" />
                  <rect x="23" y="14" width="2" height="1.5" fill="#ff007f" />
                  {/* Mouth line */}
                  <line x1="12" y1="14" x2="20" y2="14" stroke="#000" strokeWidth="1.5" />
                  {/* Body / Envelope held in hands */}
                  <rect x="8" y="18" width="16" height="8" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <polygon points="8,18 16,23 24,18" fill="#cbd5e1" stroke="#000" strokeWidth="1" />
                  {/* Stamp */}
                  <rect x="14" y="22" width="4" height="2.5" fill="#ff0055" />
                  {/* Hands */}
                  <rect x="5" y="19" width="3" height="4" fill="#ffe600" stroke="#000" strokeWidth="1" />
                  <rect x="24" y="19" width="3" height="4" fill="#ffe600" stroke="#000" strokeWidth="1" />
                </svg>
              </div>
              {/* Jetpack Flame particles */}
              <div className="anim-flame -mt-1 flex gap-1">
                <div className="w-1.5 h-2 bg-gradient-to-b from-yellow-400 to-red-600 border border-black" />
                <div className="w-1.5 h-2 bg-gradient-to-b from-yellow-400 to-red-600 border border-black" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 text-[10px] font-pixel">
            <div className="flex items-center gap-1.5 truncate">
              <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="truncate font-bold text-blue-700 dark:text-cyan-400">{currentLog}</span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-bold ml-2">{progress}%</span>
          </div>

          {/* 12 Segments */}
          <div className="grid grid-cols-12 gap-1 h-3.5 bg-black p-0.5 border border-slate-700">
            {Array.from({ length: 12 }).map((_, idx) => {
              const isFilled = progress >= ((idx + 1) / 12) * 100;
              return (
                <div
                  key={idx}
                  className={`transition-colors duration-150 ${
                    isFilled ? segmentColors[idx] : 'bg-slate-700 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* 6. Action Button: MASUK KE INBOX */}
        <div className="w-full flex flex-col items-center gap-2 mt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="brutal-btn w-full bg-[#ffe600] hover:bg-yellow-300 text-black font-pixel font-black text-xs sm:text-sm py-3 px-6 border-3 border-black shadow-[4px_4px_0px_#000] dark:shadow-[0_0_20px_rgba(255,230,0,0.3),4px_4px_0px_#000] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>MASUK KE INBOX</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-pixel text-slate-600 dark:text-slate-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Masuk otomatis dalam <strong className="text-yellow-600 dark:text-yellow-400">{countdown}</strong> detik
            </span>
          </div>
        </div>

        {/* Footer info (Clean, No Parentheses) */}
        <div className="mt-4 text-center font-pixel text-[8px] text-slate-500 uppercase tracking-widest">
          SECURE DISPOSABLE PROTOCOL • FLATIMO 2026
        </div>
      </div>
    </div>
  );
}
