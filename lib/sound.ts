/**
 * Pro-Grade Universal Audio Engine (HTML5 Audio Pool + Web Audio API Backup)
 * Uses high-fidelity, CD-quality 44.1kHz audio files (/sounds/*.wav) for 100% cross-browser reliability.
 * Supports zero-latency interactive clicks, loud crystal notification bells, mobile haptics, and auto-unlock.
 */

export type SoundEffectType = 'click' | 'success' | 'notification' | 'delete' | 'pop' | 'error';
export const SOUND_STORAGE_KEY = 'tmail_sound_enabled';

const soundFiles: Record<SoundEffectType, string> = {
  notification: '/sounds/notification.wav',
  success: '/sounds/success.wav',
  click: '/sounds/click.wav',
  pop: '/sounds/pop.wav',
  delete: '/sounds/delete.wav',
  error: '/sounds/error.wav',
};

// Audio element pool for instantaneous, multi-channel concurrent playback
const audioPool: Partial<Record<SoundEffectType, HTMLAudioElement[]>> = {};

function getPooledAudio(type: SoundEffectType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  try {
    const pool = audioPool[type] || [];
    // Find an available (idle or finished) audio element
    for (const item of pool) {
      if (item.paused || item.ended) {
        item.currentTime = 0;
        return item;
      }
    }
    // If all are busy, create a new instance (up to 4 per sound type)
    if (pool.length < 4) {
      const newAudio = new Audio(soundFiles[type]);
      newAudio.preload = 'auto';
      pool.push(newAudio);
      audioPool[type] = pool;
      return newAudio;
    }
    // Reuse the first element if max pool reached
    const fallback = pool[0];
    fallback.currentTime = 0;
    return fallback;
  } catch (e) {
    return null;
  }
}

/**
 * Preload all sound assets in memory on first user interaction or mount.
 */
export function preloadSounds(): void {
  if (typeof window === 'undefined') return;
  try {
    (Object.keys(soundFiles) as SoundEffectType[]).forEach((type) => {
      const audio = getPooledAudio(type);
      if (audio) {
        audio.load();
      }
    });
  } catch (e) {
    // Ignore preload error
  }
}

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtxClass();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Unlocks mobile browser autoplay policies across iOS Safari & Android Chrome.
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    preloadSounds();

    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
  } catch (e) {
    // Ignore unlock errors
  }
}

// Auto-register touch/click interaction listeners
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'];
  const handleUserInteraction = () => {
    unlockAudio();
  };

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserInteraction, { passive: true, capture: true, once: false });
  });
}

/**
 * Web Audio synthesizer fallback for edge cases.
 */
function playWebAudioFallback(type: SoundEffectType): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state !== 'running') {
      ctx.resume().then(() => renderTone(ctx, type)).catch(() => {});
    } else {
      renderTone(ctx, type);
    }
  } catch (e) {}
}

function renderTone(ctx: AudioContext, type: SoundEffectType): void {
  try {
    const t0 = ctx.currentTime + 0.01;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'notification') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t0);
      osc.frequency.setValueAtTime(1318.5, t0 + 0.12);
      gain.gain.setValueAtTime(0.7, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.85);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t0);
      osc.frequency.setValueAtTime(659.25, t0 + 0.08);
      osc.frequency.setValueAtTime(1046.5, t0 + 0.16);
      gain.gain.setValueAtTime(0.6, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.65);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t0);
      osc.frequency.exponentialRampToValueAtTime(200, t0 + 0.05);
      gain.gain.setValueAtTime(0.4, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.055);
    }
  } catch (e) {}
}

/**
 * Universal Sound Player.
 * Plays crisp WAV audio files with instant zero-latency feedback.
 * Pass `force = true` to bypass mute (e.g. testing / toggle ON confirmation).
 */
export function playSound(type: SoundEffectType = 'click', force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  if (typeof window === 'undefined') return;

  // 1. Haptic feedback on mobile for important alerts
  if (type === 'notification') {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([100, 50, 150]);
      }
    } catch (e) {}
  }

  // 2. Primary High-Fidelity Audio Pool
  try {
    const audio = getPooledAudio(type);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 1.0;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay was blocked, try Web Audio fallback
          playWebAudioFallback(type);
        });
      }
      return;
    }
  } catch (err) {
    // If HTML5 audio fails, use Web Audio API fallback
    playWebAudioFallback(type);
    return;
  }

  playWebAudioFallback(type);
}

export function playClickSound(): void {
  playSound('click');
}

export function playSuccessSound(): void {
  playSound('success');
}

export function playNotificationSound(): void {
  playSound('notification');
}

export function playDeleteSound(): void {
  playSound('delete');
}

export function playPopSound(): void {
  playSound('pop');
}

export function playErrorSound(): void {
  playSound('error');
}

/**
 * Check if sound FX is enabled in localStorage.
 * Defaults to TRUE (Sound ON) unless explicitly muted by the user.
 */
export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY);
    if (stored === null) return true; // Default: Sound ON
    return stored !== 'false';
  } catch (e) {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    // Ignore storage error
  }
}
