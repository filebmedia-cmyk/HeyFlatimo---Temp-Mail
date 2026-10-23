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
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-60" />

      {/* Dynamic Animated Retro Arcade & 8-Bit Gaming Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* Infinite Moving High-Contrast Retro Grid Lines (Light & Dark) */}
        <div className="absolute inset-0 anim-grid-drift bg-[linear-gradient(to_right,rgba(0,0,0,0.18)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,0,0,0.18)_2px,transparent_2px)] dark:bg-[linear-gradient(to_right,rgba(0,210,255,0.22)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,210,255,0.22)_2px,transparent_2px)] bg-[size:36px_36px]" />

        {/* Ambient Neon Arcade Glow Orbs */}
        <div className="absolute top-[8%] left-[10%] w-[380px] sm:w-[600px] h-[380px] sm:h-[600px] bg-cyan-500/18 dark:bg-cyan-400/22 rounded-full blur-[100px] pointer-events-none anim-aura-breathe" />
        <div className="absolute bottom-[8%] right-[10%] w-[380px] sm:w-[600px] h-[380px] sm:h-[600px] bg-fuchsia-600/18 dark:bg-fuchsia-500/22 rounded-full blur-[100px] pointer-events-none anim-aura-breathe" style={{ animationDelay: '-4.5s' }} />

        {/* 1. 8-Bit Golden Arcade Coin (3D Spin & Glow) */}
        <div className="absolute top-[5%] left-[4%] sm:left-[8%] anim-coin-spin scale-90 sm:scale-100">
          <svg width="58" height="58" viewBox="0 0 16 16" className="drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,230,0,0.8)]">
            <rect x="5" y="1" width="6" height="1" fill="#000" />
            <rect x="3" y="2" width="10" height="1" fill="#000" />
            <rect x="2" y="3" width="12" height="2" fill="#000" />
            <rect x="1" y="5" width="14" height="6" fill="#000" />
            <rect x="2" y="11" width="12" height="2" fill="#000" />
            <rect x="3" y="13" width="10" height="1" fill="#000" />
            <rect x="5" y="14" width="6" height="1" fill="#000" />
            <rect x="5" y="2" width="6" height="1" fill="#ffe600" />
            <rect x="3" y="3" width="10" height="2" fill="#ffe600" />
            <rect x="2" y="5" width="12" height="6" fill="#ffe600" />
            <rect x="3" y="11" width="10" height="2" fill="#ffd000" />
            <rect x="5" y="13" width="6" height="1" fill="#ffd000" />
            <rect x="4" y="4" width="8" height="8" fill="#ffd000" stroke="#000" strokeWidth="0.75" />
            <rect x="7" y="5" width="2" height="6" fill="#ffffff" />
            <rect x="5" y="7" width="6" height="2" fill="#ffffff" />
            <rect x="4" y="4" width="2" height="2" fill="#ffffff" />
          </svg>
        </div>

        {/* 2. 8-Bit Retro Pixel Heart 1-UP / HP (Heartbeat Pulse) */}
        <div className="absolute top-[12%] right-[4%] sm:right-[8%] anim-heart-pulse scale-90 sm:scale-100">
          <svg width="56" height="56" viewBox="0 0 16 16" className="drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,0,85,0.85)]">
            <path d="M1,4 h4 v-2 h2 v2 h2 v-2 h2 v2 h4 v4 h-1 v2 h-2 v2 h-2 v2 h-2 v-2 h-2 v-2 h-2 v-2 h-1 v-4 z" fill="#000000" />
            <path d="M2,4 h3 v-1 h2 v1 h2 v-1 h2 v1 h3 v3 h-1 v2 h-2 v2 h-2 v2 h-2 v-2 h-2 v-2 h-2 v-2 h-1 v-3 z" fill="#ff0055" />
            <rect x="3" y="4" width="2" height="2" fill="#ffffff" />
            <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
          </svg>
        </div>

        {/* 3. 8-Bit Cyber Diamond Gem (Shimmer & Float) */}
        <div className="absolute bottom-[16%] left-[4%] sm:left-[8%] anim-gem-float scale-90 sm:scale-100">
          <svg width="52" height="52" viewBox="0 0 16 16" className="drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(0,240,255,0.85)]">
            <polygon points="5,1 11,1 16,6 8,15 0,6" fill="#000000" />
            <polygon points="5,2 11,2 15,6 8,14 1,6" fill="#00f0ff" />
            <polygon points="5,2 11,2 9,6 7,6" fill="#ffffff" opacity="0.85" />
            <polygon points="1,6 15,6 8,14" fill="#00b4d8" />
            <polygon points="8,6 15,6 8,14" fill="#0077b6" />
          </svg>
        </div>

        {/* 4. 8-Bit Retro Arcade Controller / Gamepad (Orbiting Drift) */}
        <div className="absolute bottom-[12%] right-[4%] sm:right-[8%] anim-token-orbit scale-90 sm:scale-100">
          <svg width="68" height="44" viewBox="0 0 24 16" className="drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(176,38,255,0.8)]">
            <rect x="1" y="2" width="22" height="12" rx="3" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
            <rect x="4" y="7" width="5" height="2" fill="#00f0ff" stroke="#000" strokeWidth="0.5" />
            <rect x="5.5" y="5.5" width="2" height="5" fill="#00f0ff" stroke="#000" strokeWidth="0.5" />
            <rect x="10.5" y="8" width="1.5" height="1" fill="#94a3b8" />
            <rect x="12.5" y="8" width="1.5" height="1" fill="#94a3b8" />
            <circle cx="16" cy="7" r="1.6" fill="#ff0055" stroke="#000" strokeWidth="0.5" />
            <circle cx="19" cy="9" r="1.6" fill="#ffe600" stroke="#000" strokeWidth="0.5" />
          </svg>
        </div>

        {/* 5. 8-Bit Retro Space Invader Alien (Nostalgic Pixel Sprite) */}
        <div className="absolute bottom-[32%] left-[2%] sm:left-[5%] anim-token-float-2 scale-90 sm:scale-100">
          <svg width="50" height="40" viewBox="0 0 12 10" className="drop-shadow-[3px_3px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(0,255,150,0.8)]">
            <rect x="2" y="0" width="1" height="2" fill="#00ff9f" />
            <rect x="9" y="0" width="1" height="2" fill="#00ff9f" />
            <rect x="3" y="1" width="6" height="1" fill="#00ff9f" />
            <rect x="2" y="2" width="8" height="5" fill="#00ff9f" />
            <rect x="1" y="3" width="10" height="3" fill="#00ff9f" />
            <rect x="0" y="4" width="12" height="2" fill="#00ff9f" />
            <rect x="3" y="3" width="1" height="2" fill="#000" />
            <rect x="8" y="3" width="1" height="2" fill="#000" />
            <rect x="2" y="7" width="2" height="2" fill="#00ff9f" />
            <rect x="8" y="7" width="2" height="2" fill="#00ff9f" />
            <rect x="0" y="8" width="1" height="2" fill="#00ff9f" />
            <rect x="11" y="8" width="1" height="2" fill="#00ff9f" />
          </svg>
        </div>

        {/* 6. PlayStation Emerald Triangle (▲) - Bold 3D Drop Shadow */}
        <div className="absolute top-[30%] left-[2%] sm:left-[4%] anim-token-float-1 scale-90 sm:scale-100">
          <svg width="62" height="62" viewBox="0 0 100 100" className="drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(0,255,102,0.85)]">
            <polygon points="50,12 92,86 8,86" fill="#00ff66" stroke="#000000" strokeWidth="9" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 7. PlayStation Crimson Circle (●) - Pulsing Arcade Energy */}
        <div className="absolute bottom-[28%] right-[2%] sm:right-[5%] anim-token-pulse scale-90 sm:scale-100">
          <svg width="58" height="58" viewBox="0 0 100 100" className="drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,0,85,0.85)]">
            <circle cx="50" cy="50" r="40" fill="#ff0055" stroke="#000000" strokeWidth="9" />
          </svg>
        </div>

        {/* 8. PlayStation Electric Cyan Cross (✖) - Smooth 360 Spin */}
        <div className="absolute top-[46%] right-[2%] sm:right-[4%] anim-token-spin scale-90 sm:scale-100">
          <svg width="56" height="56" viewBox="0 0 100 100" className="drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(0,200,255,0.85)]">
            <line x1="20" y1="20" x2="80" y2="80" stroke="#00c8ff" strokeWidth="18" strokeLinecap="square" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#00c8ff" strokeWidth="18" strokeLinecap="square" />
          </svg>
        </div>

        {/* 9. PlayStation Hot Pink Cyber Square (■) - Floating Drift */}
        <div className="absolute bottom-[6%] right-[6%] sm:right-[10%] anim-token-float-2 scale-90 sm:scale-100">
          <svg width="58" height="58" viewBox="0 0 100 100" className="drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[0_0_18px_rgba(255,0,127,0.85)]">
            <rect x="15" y="15" width="70" height="70" fill="#ff007f" stroke="#000000" strokeWidth="9" />
          </svg>
        </div>

        {/* 10. Twinkling 8-Bit Pixel Sparkle Stars */}
        <div className="absolute top-[8%] left-[48%] text-[#ffe600] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(255,230,0,0.9)]">
          <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
        </div>
        <div className="absolute top-[68%] left-[4%] sm:left-[11%] text-[#00f0ff] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_14px_rgba(0,240,255,0.85)]" style={{ animationDelay: '-1.8s' }}>
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 fill-current" />
        </div>
        <div className="absolute bottom-[8%] left-[26%] text-[#ff007f] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_16px_rgba(255,0,127,0.9)]" style={{ animationDelay: '-1.2s' }}>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
        </div>
        <div className="absolute top-[52%] right-[3%] sm:right-[7%] text-[#00ff66] anim-pixel-twinkle drop-shadow-[2px_2px_0px_#000] dark:drop-shadow-[0_0_14px_rgba(0,255,102,0.85)]" style={{ animationDelay: '-0.7s' }}>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
        </div>

        {/* 11. Floating Retro Arcade Badges (1UP & INSERT COIN) */}
        <div className="hidden sm:block absolute top-[20%] left-[20%] bg-black text-[#00ff66] border-2 border-[#00ff66] font-pixel text-[8px] px-2.5 py-1 shadow-[3px_3px_0px_#000] dark:shadow-[0_0_10px_rgba(0,255,102,0.5)] anim-token-float-1">
          1UP 9999
        </div>
        <div className="hidden sm:block absolute bottom-[22%] right-[20%] bg-black text-[#ffe600] border-2 border-[#ffe600] font-pixel text-[8px] px-2.5 py-1 shadow-[3px_3px_0px_#000] dark:shadow-[0_0_10px_rgba(255,230,0,0.5)] anim-token-float-2">
          INSERT COIN
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
