'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, FastForward, Terminal, Sparkles } from 'lucide-react';
import {
  playRetroBootSound,
  playRetroBlipSound,
  playRetroStartSound,
  unlockAudio,
  getSoundEnabled,
  getAudioContext,
} from '@/lib/sound';

interface WelcomeScreenProps {
  onComplete: () => void;
  appName?: string;
  autoDismissDelay?: number;
  allowSkip?: boolean;
  isSoundEnabled?: boolean;
}

export default function WelcomeScreen({
  onComplete,
  appName = 'HEYFLATIMO',
  autoDismissDelay = 2800,
  allowSkip = true,
  isSoundEnabled,
}: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('> BOOTING ENGINE...');
  const [isExiting, setIsExiting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const hasTriggeredCompleteRef = useRef(false);

  // Directly synchronized with mail app audio setting
  const activeSound = isSoundEnabled !== undefined ? isSoundEnabled : (typeof window !== 'undefined' ? getSoundEnabled() : true);

  // Auto-play boot sound respecting the main app sound setting, with user-interaction fallback
  useEffect(() => {
    if (!activeSound) {
      setIsAudioBlocked(false);
      return;
    }

    // Attempt to unlock and play immediately
    const attemptPlay = () => {
      unlockAudio();
      try {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().then(() => {
            playRetroBootSound(true);
            setIsAudioBlocked(false);
          }).catch(() => {
            setIsAudioBlocked(true);
          });
        } else {
          playRetroBootSound(true);
          setIsAudioBlocked(false);
        }
      } catch (err) {
        setIsAudioBlocked(true);
      }
    };

    attemptPlay();

    // Browser Autoplay Policy Fallback:
    // If the browser suspends initial audio, unlock and play immediately on first interaction
    const handleFirstInteraction = () => {
      unlockAudio();
      playRetroBootSound(true);
      setIsAudioBlocked(false);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [activeSound]);

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

      // Play 8-bit blip tick sound as progress advances (only when audio enabled)
      if (activeSound && step % 2 === 0) {
        playRetroBlipSound(true);
      }

      if (step >= totalSteps) {
        clearInterval(timer);
        setCurrentLog('> ALL SYSTEMS READY');
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoDismissDelay, activeSound]);

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
    if (activeSound) {
      playRetroStartSound(true);
    }
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
      id="welcome-screen-root"
      suppressHydrationWarning
      onClick={() => {
        if (activeSound && isAudioBlocked) {
          unlockAudio();
          playRetroBootSound(true);
          setIsAudioBlocked(false);
        }
      }}
      className={`fixed inset-0 z-50 h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-[#f0f4f8]/95 dark:bg-[#07080c]/95 backdrop-blur-md transition-all duration-500 ${
        isExiting ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      {/* Retro CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-45" />

      {/* Aesthetic Synthwave & Cyberpunk Particle Field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* 1. Ambient Cyberpunk Aurora Lighting (Breathing Neon Bloom) */}
        <div className="absolute -top-[15%] -left-[10%] w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] bg-cyan-500/18 dark:bg-cyan-400/25 rounded-full blur-[110px] pointer-events-none anim-aura-breathe" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] bg-fuchsia-600/18 dark:bg-fuchsia-500/25 rounded-full blur-[110px] pointer-events-none anim-aura-breathe" style={{ animationDelay: '-4.5s' }} />
        <div className="absolute top-[40%] right-[25%] w-[280px] h-[280px] bg-indigo-500/12 dark:bg-indigo-400/18 rounded-full blur-[90px] pointer-events-none" />

        {/* 2. Top Cyber Coordinate Matrix Grid (Subtle Aesthetic Points) */}
        <div className="absolute inset-0 opacity-20 dark:opacity-25 bg-[radial-gradient(#00f0ff_1.5px,transparent_1.5px)] [background-size:32px_32px]" />

        {/* 3. 3D Synthwave Horizon Wireframe Floor (Cinematic Receding Horizon) */}
        <div className="absolute bottom-0 left-[-40%] w-[180%] h-[44%] pointer-events-none opacity-50 dark:opacity-65 [transform:perspective(260px)_rotateX(66deg)] [transform-origin:bottom_center] [mask-image:linear-gradient(to_top,black_45%,transparent_100%)]">
          <div className="w-full h-full anim-horizon-grid bg-[linear-gradient(to_right,rgba(0,0,0,0.22)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,0,0,0.22)_2px,transparent_2px)] dark:bg-[linear-gradient(to_right,rgba(0,240,255,0.45)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,240,255,0.45)_2px,transparent_2px)] bg-[size:44px_44px]" />
        </div>
        {/* Luminous Horizon Laser Line */}
        <div className="absolute bottom-[44%] left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent dark:via-cyan-300 shadow-[0_0_16px_rgba(0,240,255,0.9)]" />

        {/* 4. Sleek Wireframe Holographic 3D Isometric Cube (Top-Left - Enlarged & Crisp) */}
        <div className="absolute top-[6%] left-[3%] sm:left-[6%] anim-token-float-1 scale-90 sm:scale-100 opacity-90 sm:opacity-100">
          <svg width="74" height="74" viewBox="0 0 64 64" className="sm:w-[92px] sm:h-[92px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_20px_rgba(0,240,255,0.85)]">
            {/* Isometric Wireframe Cube */}
            <polygon points="32,6 58,21 32,36 6,21" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="6,21 32,36 32,60 6,45" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="58,21 32,36 32,60 58,45" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Luminous Core Vertices */}
            <circle cx="32" cy="6" r="3.5" fill="#ffe600" />
            <circle cx="58" cy="21" r="3.5" fill="#ffe600" />
            <circle cx="6" cy="21" r="3.5" fill="#ffe600" />
            <circle cx="32" cy="36" r="4" fill="#ff007f" />
            <circle cx="32" cy="60" r="3.5" fill="#ffe600" />
          </svg>
        </div>

        {/* 5. Holographic Crystal Diamond Prism (Top-Right - Enlarged & Shimmering) */}
        <div className="absolute top-[13%] right-[3%] sm:right-[6%] anim-gem-float scale-90 sm:scale-100 opacity-90 sm:opacity-100">
          <svg width="70" height="70" viewBox="0 0 64 64" className="sm:w-[88px] sm:h-[88px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_22px_rgba(255,0,127,0.85)]">
            <polygon points="32,4 58,22 32,60 6,22" fill="none" stroke="#ff007f" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="18,22 32,4 46,22 32,60" fill="none" stroke="#ff007f" strokeWidth="1.8" strokeLinejoin="round" />
            <line x1="6" y1="22" x2="58" y2="22" stroke="#ff007f" strokeWidth="2.2" />
            {/* Shimmer Highlight */}
            <polygon points="32,4 46,22 32,28" fill="#ffffff" opacity="0.4" />
          </svg>
        </div>

        {/* 6. Concentric Cyber Radar Reticle (Bottom-Left - Enlarged & Vibrant) */}
        <div className="absolute bottom-[11%] left-[3%] sm:left-[6%] scale-85 sm:scale-100 opacity-80 sm:opacity-95">
          <div className="relative w-22 h-22 sm:w-30 sm:h-30">
            {/* Outer Spinning Dashed Ring */}
            <svg viewBox="0 0 100 100" className="w-full h-full anim-reticle-spin drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(0,240,255,0.7)]">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="10 6" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeDasharray="18 10" />
            </svg>
            {/* Center Target Cross */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-emerald-400 rotate-45 dark:shadow-[0_0_10px_#00ff9f]" />
            </div>
          </div>
        </div>

        {/* 7. PlayStation Wireframe Neon Glyphs (Enlarged & High-Impact) */}
        {/* Emerald Triangle (▲) */}
        <div className="absolute top-[32%] left-[2%] sm:left-[4%] anim-token-float-1 scale-90 sm:scale-100 opacity-85 sm:opacity-100">
          <svg width="58" height="58" viewBox="0 0 100 100" className="sm:w-[74px] sm:h-[74px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(0,255,102,0.8)]">
            <polygon points="50,14 90,86 10,86" fill="none" stroke="#00ff66" strokeWidth="7" strokeLinejoin="round" />
            <circle cx="50" cy="14" r="5" fill="#00ff66" />
            <circle cx="90" cy="86" r="4.5" fill="#00ff66" />
            <circle cx="10" cy="86" r="4.5" fill="#00ff66" />
          </svg>
        </div>

        {/* Crimson Circle (●) */}
        <div className="absolute bottom-[28%] right-[2%] sm:right-[5%] anim-token-pulse scale-90 sm:scale-100 opacity-85 sm:opacity-100">
          <svg width="56" height="56" viewBox="0 0 100 100" className="sm:w-[72px] sm:h-[72px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,0,85,0.8)]">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#ff0055" strokeWidth="7" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="#ff0055" strokeWidth="2.5" strokeDasharray="8 5" />
            <circle cx="50" cy="12" r="4.5" fill="#ff0055" />
          </svg>
        </div>

        {/* Electric Cyan Cross (✖) */}
        <div className="absolute top-[48%] right-[2%] sm:right-[4%] anim-token-spin scale-90 sm:scale-100 opacity-85 sm:opacity-100">
          <svg width="54" height="54" viewBox="0 0 100 100" className="sm:w-[70px] sm:h-[70px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(0,210,255,0.8)]">
            <line x1="20" y1="20" x2="80" y2="80" stroke="#00d2ff" strokeWidth="11" strokeLinecap="round" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#00d2ff" strokeWidth="11" strokeLinecap="round" />
          </svg>
        </div>

        {/* Hot Pink Cyber Square (■) */}
        <div className="absolute bottom-[8%] right-[6%] sm:right-[9%] anim-token-float-2 scale-90 sm:scale-100 opacity-85 sm:opacity-100">
          <svg width="56" height="56" viewBox="0 0 100 100" className="sm:w-[70px] sm:h-[70px] drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,0,127,0.8)]">
            <rect x="16" y="16" width="68" height="68" fill="none" stroke="#ff007f" strokeWidth="7" rx="5" />
            <rect x="36" y="36" width="28" height="28" fill="#ffe600" opacity="0.85" />
          </svg>
        </div>

        {/* 8. Floating Digital Stardust Embers (Enlarged & Radiant) */}
        <div className="absolute top-[20%] left-[28%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400 dark:bg-cyan-300 dark:shadow-[0_0_14px_#00f0ff] anim-stardust-1" />
        <div className="absolute top-[65%] left-[20%] w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-yellow-400 dark:shadow-[0_0_14px_#ffe600] anim-stardust-2" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[35%] right-[24%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-pink-500 dark:shadow-[0_0_14px_#ff007f] anim-stardust-1" style={{ animationDelay: '-3.5s' }} />
        <div className="absolute bottom-[28%] left-[42%] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400 dark:shadow-[0_0_12px_#00ff66] anim-stardust-2" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute top-[14%] right-[38%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-300 dark:shadow-[0_0_14px_#00f0ff] anim-stardust-1" style={{ animationDelay: '-4.8s' }} />
        <div className="absolute bottom-[16%] right-[30%] w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-yellow-300 dark:shadow-[0_0_14px_#ffe600] anim-stardust-2" style={{ animationDelay: '-5.2s' }} />

        {/* 9. Minimalist Retro Sparkle Stars (Enlarged & Glowing) */}
        <div className="absolute top-[8%] left-[48%] text-[#ffe600] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(255,230,0,0.9)]">
          <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
        </div>
        <div className="absolute bottom-[8%] left-[26%] text-[#ff007f] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(255,0,127,0.9)]" style={{ animationDelay: '-1.2s' }}>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
        </div>

        {/* 10. Sci-Fi Micro-HUD Decals (Subtle Aesthetic Tech Inscriptions) */}
        <div className="hidden sm:block absolute top-4 left-5 text-[9px] font-mono tracking-widest text-slate-500/70 dark:text-cyan-400/60 uppercase select-none">
          SYS.BOOT // VER_2.6
        </div>
        <div className="hidden sm:block absolute bottom-4 left-5 text-[9px] font-mono tracking-widest text-slate-500/70 dark:text-cyan-400/60 uppercase select-none">
          + DISPOSABLE_INBOX // FLATIMO_CORE
        </div>
        <div className="hidden sm:block absolute bottom-4 right-5 text-[9px] font-mono tracking-widest text-slate-500/70 dark:text-cyan-400/60 uppercase select-none">
          AUDIO: SYNC_60HZ • 60 FPS +
        </div>
      </div>

      {/* Skip Button Top Right (Responsive Position & Sizing) */}
      {allowSkip && (
        <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-40">
          <button
            type="button"
            onClick={handleDismiss}
            className="brutal-btn bg-white dark:bg-[#151b27] text-black dark:text-white font-pixel text-[8px] xs:text-[9px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 border-2 border-black flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <FastForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>LEWATI</span>
            <span className="bg-black text-yellow-300 px-1 py-0.2 text-[7px] sm:text-[8px] font-mono border border-slate-700">ESC</span>
          </button>
        </div>
      )}

      {/* Main Neo-Brutalist Arcade Box (Intrinsic Responsive Mobile Fit) */}
      <div className="relative z-30 brutal-card my-auto bg-white dark:bg-[#0e121b] border-[3px] xs:border-[3.5px] sm:border-[4.5px] border-black p-3.5 xs:p-5 sm:p-7 max-w-[460px] w-full text-center shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] dark:shadow-[0_0_35px_rgba(0,200,255,0.14),4px_4px_0px_#000000] flex flex-col items-center transition-all duration-300">
        
        {/* 1. Status Badges: Arcade System + Dynamic Audio Status */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3.5">
          <div className="inline-flex items-center gap-1.5 bg-[#ffe600] border-2 border-black px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-[2px_2px_0px_#000]">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black fill-black" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-black tracking-wider uppercase font-black">
              ARCADE SYSTEM
            </span>
          </div>

          {!activeSound ? (
            <div className="inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-black px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-[2px_2px_0px_#000]">
              <span className="font-pixel text-[7.5px] sm:text-[8px] tracking-wider uppercase font-bold">
                🔇 AUDIO MUTE (IKUT MAIL)
              </span>
            </div>
          ) : isAudioBlocked ? (
            <div className="inline-flex items-center gap-1 bg-[#ff0055] text-white border-2 border-black px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-[2px_2px_0px_#000] animate-bounce">
              <span className="font-pixel text-[7.5px] sm:text-[8px] tracking-wider uppercase font-black">
                ⚡ KLIK LAYAR UNTUK BUNYIKAN AUDIO ⚡
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 bg-[#00ff66] text-black border-2 border-black px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-[2px_2px_0px_#000]">
              <span className="font-pixel text-[7.5px] sm:text-[8px] tracking-wider uppercase font-black">
                🔊 AUDIO 8-BIT AKTIF
              </span>
            </div>
          )}
        </div>

        {/* 2. Header Section */}
        <div className="mb-1 sm:mb-2 w-full">
          {/* Colorful Pixel Letters: W E L C O M E   T O (Never wraps awkwardly) */}
          <div className="font-pixel text-xs xs:text-sm sm:text-2xl font-black tracking-tight my-1 sm:my-2 flex items-center justify-center flex-nowrap gap-0.5 sm:gap-1.5 select-none">
            <span className="text-[#ffe600] drop-shadow-[2px_2px_0px_#000]">W</span>
            <span className="text-[#ff007f] drop-shadow-[2px_2px_0px_#000]">E</span>
            <span className="text-[#00c8ff] drop-shadow-[2px_2px_0px_#000]">L</span>
            <span className="text-[#00ff66] drop-shadow-[2px_2px_0px_#000]">C</span>
            <span className="text-[#ff5500] drop-shadow-[2px_2px_0px_#000]">O</span>
            <span className="text-[#b026ff] drop-shadow-[2px_2px_0px_#000]">M</span>
            <span className="text-[#ffe600] drop-shadow-[2px_2px_0px_#000]">E</span>
            <span className="mx-0.5 sm:mx-1.5" />
            <span className="text-[#00ffff] drop-shadow-[2px_2px_0px_#000]">T</span>
            <span className="text-[#ff007f] drop-shadow-[2px_2px_0px_#000]">O</span>
          </div>

          {/* 3. Pure White HEYFLATIMO with Subtle Glow in Dark Mode */}
          <div className="my-1.5 sm:my-3 select-none">
            <div className="font-pixel text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight xs:tracking-wider text-black dark:text-white drop-shadow-[2px_2px_0px_#000] sm:drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]">
              {appName}
            </div>
          </div>

          {/* 4. Single Concise Subtitle */}
          <p className="font-pixel text-[8px] xs:text-[8.5px] sm:text-[10px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mt-1 sm:mt-2 font-bold uppercase tracking-wider">
            LAYANAN EMAIL SEMENTARA CEPAT &amp; PRIVAT
          </p>
        </div>

        {/* 5. Pixel Segmented Progress Bar with Animated Runner Character */}
        <div className="w-full mt-8 sm:mt-9 mb-3 sm:mb-4 bg-slate-100 dark:bg-[#151b27] border-2 border-black p-2 sm:p-2.5 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] relative">
          
          {/* Dynamic Character Runner (MailBot 88) */}
          <div
            className={`absolute -top-8 sm:-top-9 transition-all duration-200 -translate-x-1/2 pointer-events-none z-30 ${
              progress >= 100 ? 'anim-victory' : ''
            }`}
            style={{ left: `${charPosition}%` }}
          >
            <div className="anim-char-bob flex flex-col items-center">
              <div className="relative">
                {/* Speech Bubble Tag */}
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 bg-[#ffe600] text-black font-pixel text-[6px] xs:text-[7px] px-1 sm:px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap font-bold">
                  {speechText}
                </div>

                {/* Pixel Robot Body (SVG) */}
                <svg width="28" height="28" viewBox="0 0 32 32" className="sm:w-[34px] sm:h-[34px] drop-shadow-[2px_2px_0px_#000]">
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
              <div className="anim-flame -mt-1 flex gap-0.5 sm:gap-1">
                <div className="w-1 sm:w-1.5 h-1.5 sm:h-2 bg-gradient-to-b from-yellow-400 to-red-600 border border-black" />
                <div className="w-1 sm:w-1.5 h-1.5 sm:h-2 bg-gradient-to-b from-yellow-400 to-red-600 border border-black" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1.5 sm:mb-2 text-[8px] xs:text-[9px] sm:text-[10px] font-pixel">
            <div className="flex items-center gap-1.5 truncate">
              <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="truncate font-bold text-blue-700 dark:text-cyan-400">{currentLog}</span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-bold ml-2">{progress}%</span>
          </div>

          {/* 12 Segments */}
          <div className="grid grid-cols-12 gap-0.5 sm:gap-1 h-3 sm:h-3.5 bg-black p-0.5 border border-slate-700">
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
        <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 mt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="brutal-btn w-full bg-[#ffe600] hover:bg-yellow-300 text-black font-pixel font-black text-xs sm:text-sm py-2.5 xs:py-3 px-4 sm:px-6 border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] dark:shadow-[0_0_20px_rgba(255,230,0,0.3),3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
            <span>MASUK KE INBOX</span>
          </button>

          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-pixel text-slate-600 dark:text-slate-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Masuk otomatis dalam <strong className="text-yellow-600 dark:text-yellow-400">{countdown}</strong> detik
            </span>
          </div>
        </div>

        {/* Footer info (Clean, No Parentheses) */}
        <div className="mt-2.5 sm:mt-4 text-center font-pixel text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest">
          SECURE DISPOSABLE PROTOCOL • FLATIMO 2026
        </div>
      </div>
    </div>
  );
}
