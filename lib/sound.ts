/**
 * Web Audio API synthesizer for clean notification chimes with full iOS & Android mobile support.
 * Includes user-interaction audio context unlocking, crisp mobile frequency tuning, and haptic vibration.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Explicitly unlock Web Audio stack on iOS Safari & Android mobile browsers.
 * Must be triggered by a user gesture (touch, click, pointerdown).
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {});
    }

    // Play an inaudible 1-sample buffer to satisfy iOS WebKit autoplay policy
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    if (ctx.state === 'running') {
      isAudioUnlocked = true;
    }
  } catch (e) {
    // Ignore unlock errors
  }
}

// Auto-register touch/click interaction listeners to unlock audio on first mobile interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'];
  const handleFirstInteraction = () => {
    unlockAudio();
    if (isAudioUnlocked) {
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction, true);
      });
    }
  };

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { passive: true, capture: true });
  });
}

/**
 * Play a bright, clean, mobile-optimized two-tone notification chime.
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Ensure context is resumed
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: Bright Crisp Intro Note (880.00 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Tone 2: Melodic High Harmonic Bell (1318.51 Hz - E6) - Crystal clear on phone speakers
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.09);
    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.32, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.debug('Audio chime playback omitted:', err);
  }
}

export const SOUND_STORAGE_KEY = 'tmail_sound_enabled';

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

