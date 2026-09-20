/**
 * Web Audio API synthesizer for clean, zero-latency interactive sound FX.
 * Includes user-interaction audio context unlocking, crisp mobile frequency tuning,
 * and dedicated sound profiles for clicks, success/copy, new messages, deletes, and modals.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
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
    } else if (ctx.state === 'running') {
      isAudioUnlocked = true;
    }

    // Play an inaudible 1-sample buffer to satisfy iOS WebKit autoplay policy
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
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

function executeSound(ctx: AudioContext, type: SoundEffectType): void {
  try {
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        // Soft, crisp tactile mechanical tick (750 Hz -> 260 Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.045);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
        break;
      }

      case 'success': {
        // Uplifting two-tone harmonic chime (C6: 1046.5 Hz -> G6: 1567.98 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.28, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.14);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1567.98, now + 0.06);
        gain2.gain.setValueAtTime(0.001, now + 0.06);
        gain2.gain.linearRampToValueAtTime(0.35, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.35);
        break;
      }

      case 'notification': {
        // 1. Haptic vibration feedback for mobile devices
        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate([100, 50, 150]);
          }
        } catch (e) {
          // Vibration ignored if unsupported
        }

        // 2. Crystal Bell Chime (A5: 880 Hz -> E6: 1318.51 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.38, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.09);
        gain2.gain.setValueAtTime(0.001, now + 0.09);
        gain2.gain.linearRampToValueAtTime(0.42, now + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.70);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.09);
        osc2.stop(now + 0.70);
        break;
      }

      case 'delete': {
        // Low swoosh drop indicating disposal/clearing (520 Hz -> 140 Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.10);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.10);
        break;
      }

      case 'pop': {
        // Soft upward frequency bubble pop (350 Hz -> 880 Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'error': {
        // Low pitch boop for validation error or invalid CDK
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(140, now + 0.06);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }
    }
  } catch (err) {
    // Ignore playback error
  }
}

export type SoundEffectType = 'click' | 'success' | 'notification' | 'delete' | 'pop' | 'error';

/**
 * Unified Sound Dispatcher - automatically checks if sound is enabled and handles AudioContext resumption before playing.
 */
export function playSound(type: SoundEffectType = 'click'): void {
  if (!getSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        executeSound(ctx, type);
      }).catch(() => {
        executeSound(ctx, type);
      });
    } else {
      executeSound(ctx, type);
    }
  } catch (err) {
    // Ignore playback error
  }
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

export const SOUND_STORAGE_KEY = 'tmail_sound_enabled';

/**
 * Check if sound FX is enabled.
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

