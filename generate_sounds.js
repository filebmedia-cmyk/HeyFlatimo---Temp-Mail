const fs = require('fs');
const path = require('path');

function createWavBuffer(samples, sampleRate = 44100) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Normalize samples to -1.0 dB peak (0.89)
  let maxAmp = 0;
  for (let i = 0; i < numSamples; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxAmp) maxAmp = abs;
  }
  const scale = maxAmp > 0 ? 0.89 / maxAmp : 1;

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * scale));
    const val = s < 0 ? Math.floor(s * 32768) : Math.floor(s * 32767);
    buffer.writeInt16LE(val, offset);
    offset += 2;
  }

  return buffer;
}

const soundsDir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const sampleRate = 44100;

// 1. Notification (Pristine Crystal Bell Chime)
{
  const dur = 0.95;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;

    // Note 1: E5 (659.25 Hz) + harmonics
    if (t < 0.45) {
      const env = (1 - Math.exp(-t * 200)) * Math.exp(-t * 6.5);
      s += 0.60 * Math.sin(2 * Math.PI * 659.25 * t) * env;
      s += 0.25 * Math.sin(2 * Math.PI * 1318.5 * t) * env;
      s += 0.10 * Math.sin(2 * Math.PI * 1977.75 * t) * env;
    }

    // Note 2: B5 (987.77 Hz) + resonant harmonics
    if (t >= 0.12) {
      const t2 = t - 0.12;
      const env2 = (1 - Math.exp(-t2 * 200)) * Math.exp(-t2 * 3.8);
      s += 0.70 * Math.sin(2 * Math.PI * 987.77 * t) * env2;
      s += 0.30 * Math.sin(2 * Math.PI * 1975.54 * t) * env2;
      s += 0.15 * Math.sin(2 * Math.PI * 2963.3 * t) * env2;
      s += 0.05 * Math.sin(2 * Math.PI * 3951.08 * t) * env2;
    }

    samples[i] = s;
  }

  fs.writeFileSync(path.join(soundsDir, 'notification.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created notification.wav');
}

// 2. Success (Cheerful Harmonic Arpeggio: C5 -> E5 -> G5/C6)
{
  const dur = 0.70;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;

    // Note 1: C5 (523.25 Hz)
    if (t < 0.25) {
      const env = (1 - Math.exp(-t * 250)) * Math.exp(-t * 10);
      s += 0.55 * Math.sin(2 * Math.PI * 523.25 * t) * env;
      s += 0.15 * Math.sin(2 * Math.PI * 1046.5 * t) * env;
    }

    // Note 2: E5 (659.25 Hz)
    if (t >= 0.08 && t < 0.35) {
      const t2 = t - 0.08;
      const env2 = (1 - Math.exp(-t2 * 250)) * Math.exp(-t2 * 10);
      s += 0.60 * Math.sin(2 * Math.PI * 659.25 * t) * env2;
      s += 0.15 * Math.sin(2 * Math.PI * 1318.5 * t) * env2;
    }

    // Note 3: C6 (1046.5 Hz) + G5 (783.99 Hz)
    if (t >= 0.16) {
      const t3 = t - 0.16;
      const env3 = (1 - Math.exp(-t3 * 250)) * Math.exp(-t3 * 5.0);
      s += 0.70 * Math.sin(2 * Math.PI * 1046.5 * t) * env3;
      s += 0.35 * Math.sin(2 * Math.PI * 783.99 * t) * env3;
      s += 0.15 * Math.sin(2 * Math.PI * 2093.0 * t) * env3;
    }

    samples[i] = s;
  }

  fs.writeFileSync(path.join(soundsDir, 'success.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created success.wav');
}

// 3. Click (Crisp Mechanical UI Tick)
{
  const dur = 0.045;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / dur;
    const freq = 800 - progress * 550;
    const env = (1 - Math.exp(-t * 800)) * Math.exp(-t * 70);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env;
  }

  fs.writeFileSync(path.join(soundsDir, 'click.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created click.wav');
}

// 4. Pop (Bubbly UI Pop)
{
  const dur = 0.065;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / dur;
    const freq = 320 + progress * 580;
    const env = (1 - Math.exp(-t * 600)) * Math.exp(-t * 45);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env;
  }

  fs.writeFileSync(path.join(soundsDir, 'pop.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created pop.wav');
}

// 5. Delete (Downward disposal swoosh)
{
  const dur = 0.14;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / dur;
    const freq = 520 - progress * 380;
    const env = (1 - Math.exp(-t * 400)) * Math.exp(-t * 22);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env;
  }

  fs.writeFileSync(path.join(soundsDir, 'delete.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created delete.wav');
}

// 6. Error (Double warning tone)
{
  const dur = 0.22;
  const numSamples = Math.floor(sampleRate * dur);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;
    if (t < 0.09) {
      const env = (1 - Math.exp(-t * 300)) * Math.exp(-t * 28);
      s += Math.sin(2 * Math.PI * 250 * t) * env;
    } else if (t >= 0.10) {
      const t2 = t - 0.10;
      const env2 = (1 - Math.exp(-t2 * 300)) * Math.exp(-t2 * 22);
      s += Math.sin(2 * Math.PI * 180 * t) * env2;
    }
    samples[i] = s;
  }

  fs.writeFileSync(path.join(soundsDir, 'error.wav'), createWavBuffer(samples, sampleRate));
  console.log('Created error.wav');
}
