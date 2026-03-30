/**
 * Procedural workout music engine using Web Audio API.
 * Three genre modes: EDM, Hip-Hop, Drum & Bass.
 */

export type MusicGenre = "edm" | "hiphop" | "dnb";
type PhaseStyle = "warmup" | "workout" | "intense" | "cooldown";

interface MusicState {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  playing: boolean;
  genre: MusicGenre;
  style: PhaseStyle;
  bpm: number;
  nextBeatTime: number;
  timerID: number | null;
  currentStep: number;
}

const state: MusicState = {
  ctx: null,
  masterGain: null,
  playing: false,
  genre: "edm",
  style: "warmup",
  bpm: 128,
  nextBeatTime: 0,
  timerID: null,
  currentStep: 0,
};

function getCtx(): AudioContext {
  if (!state.ctx) {
    state.ctx = new AudioContext();
    state.masterGain = state.ctx.createGain();
    state.masterGain.gain.value = 0.35;
    state.masterGain.connect(state.ctx.destination);
  }
  return state.ctx;
}

function getMaster(): GainNode {
  getCtx();
  return state.masterGain!;
}

// ─── Sound generators ───

function playKick(time: number, style: "punchy" | "deep" | "tight" = "punchy") {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(getMaster());

  if (style === "deep") {
    // Hip-hop: boomy 808-style
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.25);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.start(time);
    osc.stop(time + 0.45);
  } else if (style === "tight") {
    // DnB: short, punchy
    osc.frequency.setValueAtTime(170, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.start(time);
    osc.stop(time + 0.2);
  } else {
    // EDM: standard four-on-the-floor
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.start(time);
    osc.stop(time + 0.3);
  }
}

function playSnare(time: number, style: "crack" | "clap" | "break" = "crack") {
  const ctx = getCtx();

  const dur = style === "clap" ? 0.18 : style === "break" ? 0.08 : 0.12;
  const freq = style === "clap" ? 1800 : style === "break" ? 2500 : 1200;

  // Noise burst
  const bufferSize = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = freq;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(style === "clap" ? 0.6 : 0.5, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(getMaster());
  noise.start(time);
  noise.stop(time + dur);

  // Tonal body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(style === "break" ? 220 : 180, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.06);
  oscGain.gain.setValueAtTime(0.4, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  osc.connect(oscGain);
  oscGain.connect(getMaster());
  osc.start(time);
  osc.stop(time + 0.06);
}

function playHiHat(time: number, open: boolean = false) {
  const ctx = getCtx();
  const bufferSize = Math.floor(ctx.sampleRate * (open ? 0.15 : 0.04));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6000;

  const duration = open ? 0.15 : 0.04;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(open ? 0.2 : 0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  noise.start(time);
  noise.stop(time + duration);
}

function playRide(time: number) {
  const ctx = getCtx();
  const bufferSize = Math.floor(ctx.sampleRate * 0.25);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 8000;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  noise.start(time);
  noise.stop(time + 0.25);
}

function playBass(time: number, freq: number, dur: number, style: "sub" | "reese" | "wobble" = "sub") {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (style === "reese") {
    // DnB reese bass
    const osc2 = ctx.createOscillator();
    osc.type = "sawtooth";
    osc2.type = "sawtooth";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 1.008;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + dur);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.setValueAtTime(0.2, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(getMaster());
    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur);
    osc2.stop(time + dur);
    return;
  }

  if (style === "wobble") {
    // Hip-hop 808 sub
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, time + dur);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.setValueAtTime(0.35, time + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  } else {
    // EDM sub
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + dur * 0.8);
    osc.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.setValueAtTime(0.25, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    gain.connect(getMaster());
    osc.start(time);
    osc.stop(time + dur);
    return;
  }

  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(time);
  osc.stop(time + dur);
}

function playSynth(time: number, freq: number, dur: number) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc2.type = "square";
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 1.005;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.exponentialRampToValueAtTime(500, time + dur);

  gain.gain.setValueAtTime(0.07, time);
  gain.gain.setValueAtTime(0.07, time + dur * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  osc.start(time);
  osc2.start(time);
  osc.stop(time + dur);
  osc2.stop(time + dur);
}

function playPad(time: number, freq: number, dur: number) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.06, time + dur * 0.3);
  gain.gain.setValueAtTime(0.06, time + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(time);
  osc.stop(time + dur);
}

// ─── Bass note tables ───

const bassNotes = [55, 55, 65.4, 55, 73.4, 65.4, 82.4, 55]; // Am pentatonic-ish

// ─── Genre-specific scheduling ───

function scheduleEDM(step: number, time: number) {
  const beat = step % 16;
  const beatInBar = beat % 4;
  const spb = 60 / state.bpm;
  const isIntense = state.style === "intense";
  const isCooldown = state.style === "cooldown";

  // Kick: four-on-the-floor (skip in cooldown)
  if (!isCooldown && beatInBar === 0) playKick(time, "punchy");
  if (isCooldown && beat % 8 === 0) playKick(time, "punchy");

  // Snare on 2 and 4
  if (!isCooldown && beatInBar === 2) playSnare(time, "crack");

  // Hi-hats
  if (isIntense) {
    playHiHat(time, beat % 4 === 3);
  } else if (!isCooldown) {
    if (beatInBar % 2 === 0) playHiHat(time, false);
    if (beatInBar === 3) playHiHat(time, true);
  }

  // Bass
  if (beatInBar === 0) {
    const idx = Math.floor(beat / 4) % bassNotes.length;
    playBass(time, bassNotes[idx], spb * 3.5, "sub");
  }

  // Synth chord every 2 bars
  if (beat % 8 === 0 && !isCooldown) {
    const chords = [220, 293.7, 329.6, 293.7];
    playSynth(time, chords[(beat / 8) % chords.length], spb * 7);
  }

  // Cooldown pad
  if (isCooldown && beat === 0) {
    playPad(time, 220, spb * 16);
    playPad(time, 330, spb * 16);
  }
}

function scheduleHipHop(step: number, time: number) {
  const beat = step % 16;
  const beatInBar = beat % 4;
  const spb = 60 / state.bpm;
  const isCooldown = state.style === "cooldown";
  const isIntense = state.style === "intense";

  // Kick: boom-bap pattern
  if (!isCooldown) {
    if (beatInBar === 0) playKick(time, "deep");
    if (beat % 8 === 3) playKick(time, "deep"); // off-beat kick
  } else {
    if (beat % 8 === 0) playKick(time, "deep");
  }

  // Snare/clap on 2 and 4
  if (!isCooldown && beatInBar === 2) playSnare(time, "clap");

  // Hi-hats: swing feel
  if (!isCooldown) {
    if (beatInBar === 0 || beatInBar === 2) playHiHat(time, false);
    if (isIntense) {
      playHiHat(time, false); // double-time hats
      if (beatInBar === 1 || beatInBar === 3) playHiHat(time, true);
    }
  }

  // 808 sub bass
  if (beatInBar === 0) {
    const idx = Math.floor(beat / 4) % bassNotes.length;
    playBass(time, bassNotes[idx] * 0.5, spb * 3.8, "wobble");
  }

  // Sparse melody
  if (beat % 8 === 0 && !isCooldown) {
    const notes = [330, 392, 440, 392];
    playSynth(time, notes[(beat / 8) % notes.length], spb * 3);
  }

  // Cooldown
  if (isCooldown && beat === 0) {
    playPad(time, 196, spb * 16);
    playPad(time, 294, spb * 16);
  }
}

function scheduleDnB(step: number, time: number) {
  const beat = step % 16;
  const beatInBar = beat % 4;
  const spb = 60 / state.bpm;
  const isCooldown = state.style === "cooldown";
  const isIntense = state.style === "intense";

  // DnB two-step kick pattern
  if (!isCooldown) {
    if (beatInBar === 0) playKick(time, "tight");
    if (beat % 8 === 3) playKick(time, "tight"); // syncopated 2nd kick
  } else {
    if (beat % 8 === 0) playKick(time, "tight");
  }

  // Snare on 2 and 4 — sharp break snare
  if (!isCooldown && beatInBar === 2) playSnare(time, "break");

  // Fast ride/hats
  if (!isCooldown) {
    playRide(time); // every 16th note
    if (isIntense && (beatInBar === 1 || beatInBar === 3)) {
      playHiHat(time, false);
    }
  }

  // Reese bass
  if (beatInBar === 0) {
    const idx = Math.floor(beat / 4) % bassNotes.length;
    playBass(time, bassNotes[idx], spb * 3, "reese");
  }

  // Stab synth
  if (beat % 8 === 0 && !isCooldown) {
    const stabs = [440, 523, 587, 523];
    playSynth(time, stabs[(beat / 8) % stabs.length], spb * 2);
  }

  // Cooldown
  if (isCooldown && beat === 0) {
    playPad(time, 220, spb * 16);
    playPad(time, 277, spb * 16);
  }
}

function scheduleStep(step: number, time: number) {
  switch (state.genre) {
    case "edm": scheduleEDM(step, time); break;
    case "hiphop": scheduleHipHop(step, time); break;
    case "dnb": scheduleDnB(step, time); break;
  }
}

function scheduler() {
  const ctx = getCtx();
  const secondsPerBeat = 60 / state.bpm / 4;

  while (state.nextBeatTime < ctx.currentTime + 0.1) {
    scheduleStep(state.currentStep, state.nextBeatTime);
    state.nextBeatTime += secondsPerBeat;
    state.currentStep = (state.currentStep + 1) % 16;
  }
}

// ─── BPM table per genre × phase ───

function getBPM(genre: MusicGenre, style: PhaseStyle): number {
  const table: Record<MusicGenre, Record<PhaseStyle, number>> = {
    edm:    { warmup: 118, workout: 128, intense: 138, cooldown: 95 },
    hiphop: { warmup: 85,  workout: 95,  intense: 105, cooldown: 75 },
    dnb:    { warmup: 150, workout: 170, intense: 180, cooldown: 110 },
  };
  return table[genre][style];
}

// ─── Public API ───

export function startMusic() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
  if (state.playing) return;

  state.playing = true;
  state.bpm = getBPM(state.genre, state.style);
  state.nextBeatTime = ctx.currentTime + 0.05;
  state.currentStep = 0;
  state.timerID = window.setInterval(scheduler, 25);
}

export function stopMusic() {
  if (state.timerID !== null) {
    clearInterval(state.timerID);
    state.timerID = null;
  }
  state.playing = false;
}

export function setMusicGenre(genre: MusicGenre) {
  state.genre = genre;
  state.bpm = getBPM(genre, state.style);
}

export function getMusicGenre(): MusicGenre {
  return state.genre;
}

export function setMusicStyle(style: PhaseStyle) {
  state.style = style;
  state.bpm = getBPM(state.genre, style);
}

export function setMusicVolume(vol: number) {
  if (state.masterGain) {
    state.masterGain.gain.value = Math.max(0, Math.min(1, vol));
  }
}

export function getMusicVolume(): number {
  return state.masterGain?.gain.value ?? 0.35;
}

export function isMusicPlaying(): boolean {
  return state.playing;
}

export function getPhaseStyle(phaseIndex: number): PhaseStyle {
  switch (phaseIndex) {
    case 0: return "warmup";
    case 5: return "cooldown";
    case 4: return "intense";
    default: return "workout";
  }
}
