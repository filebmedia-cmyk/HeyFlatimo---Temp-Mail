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

let isAudioUnlocked = false;

/**
 * Unlocks mobile browser autoplay policies across iOS Safari & Android Chrome.
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined' || isAudioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {});
      }
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (err) {}
    }
    preloadSounds();
    isAudioUnlocked = true;
  } catch (e) {
    // Ignore unlock errors
  }
}

// Auto-register touch/click interaction listeners with one-time cleanup
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'pointerdown'];
  const handleUserInteraction = () => {
    unlockAudio();
    if (isAudioUnlocked) {
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction, true);
      });
    }
  };

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserInteraction, { passive: true, capture: true });
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
 * 8-Bit Classic Arcade Coin Chime (B5 -> E6)
 * Iconic chime instantly played upon arcade coin insert / start.
 */
export function playRetroCoinSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {}
}

/**
 * Katana Unsheathe & Metallic Water Slice (Demon Slayer Giyu Action)
 */
export function playKatanaSlashSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // 1. Metallic Ring
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);

    // 2. Water Splash Wave
    const oscWater = ctx.createOscillator();
    const gainWater = ctx.createGain();
    oscWater.type = 'triangle';
    oscWater.frequency.setValueAtTime(800, now + 0.05);
    oscWater.frequency.exponentialRampToValueAtTime(160, now + 0.4);
    gainWater.gain.setValueAtTime(0.3, now + 0.05);
    gainWater.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    oscWater.connect(gainWater);
    gainWater.connect(ctx.destination);
    oscWater.start(now + 0.05);
    oscWater.stop(now + 0.46);
  } catch (e) {}
}

/**
 * Neko Purr / Meow Chime
 */
export function playNekoSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {}
}

/**
 * Shiba Bark / Mail Ding
 */
export function playShibaSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.setValueAtTime(987.77, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch (e) {}
}

/**
 * 8-Bit Retro Arcade Sound Engine (Square / Triangle Web Audio Synthesizer)
 * Works universally across desktop and mobile browsers by awaiting AudioContext.resume().
 */
function renderRetroBoot(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime + 0.02;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.14);
    });
  } catch (e) {}
}

export function playRetroBootSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  // Dual engine: High-fidelity notification chime via HTML5 pool + synthesized retro square arpeggio
  playSound('notification', force);
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().then(() => renderRetroBoot(ctx)).catch(() => {});
    } else {
      renderRetroBoot(ctx);
    }
  } catch (e) {}
}

function renderRetroBlip(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime + 0.005;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
}

export function playRetroBlipSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  // Dual engine: Punchy pop audio + synthesized retro triangle tick
  playSound('pop', force);
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().then(() => renderRetroBlip(ctx)).catch(() => {});
    } else {
      renderRetroBlip(ctx);
    }
  } catch (e) {}
}

function renderRetroStart(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime + 0.005;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.09); // E6

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
}

export function playRetroStartSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  // Dual engine: Triumphant success fanfare + synthesized retro square chords
  playSound('success', force);
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().then(() => renderRetroStart(ctx)).catch(() => {});
    } else {
      renderRetroStart(ctx);
    }
  } catch (e) {}
}

export function playArcadeKOSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.56);

    const oscHi = ctx.createOscillator();
    const gainHi = ctx.createGain();
    oscHi.type = 'square';
    oscHi.frequency.setValueAtTime(440, now);
    oscHi.frequency.setValueAtTime(880, now + 0.1);
    gainHi.gain.setValueAtTime(0.3, now);
    gainHi.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    oscHi.connect(gainHi);
    gainHi.connect(ctx.destination);
    oscHi.start(now);
    oscHi.stop(now + 0.46);
  } catch (e) {}
}

export function playSpideyThwipSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch (e) {}
}

export function playVictoryFanfareSound(force: boolean = false): void {
  if (!force && !getSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.36);
    });
  } catch (e) {}
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
