/**
 * Voice announcements using pre-generated ElevenLabs MP3 clips.
 * Files are in /voices/{exerciseId}.mp3
 */

let enabled = true;
let currentAudio: HTMLAudioElement | null = null;

export function setSpeechEnabled(value: boolean) {
  enabled = value;
}

export function isSpeechEnabled(): boolean {
  return enabled;
}

export function speakExerciseName(name: string, exerciseId?: string) {
  if (!enabled) return;

  // Stop any currently playing clip
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Use the exerciseId to find the matching MP3 file
  const id = exerciseId || name;
  const audio = new Audio(`./voices/${id}.mp3`);
  audio.volume = 0.9;
  audio.play().catch(() => {
    // Autoplay blocked or file not found — silently fail
  });
  currentAudio = audio;
}

export function speakCue(cue: "rest" | "getReady") {
  if (!enabled) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(`./voices/${cue}.mp3`);
  audio.volume = 0.9;
  audio.play().catch(() => {});
  currentAudio = audio;
}

export function speakPhase(phaseIndex: number) {
  if (!enabled) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(`./voices/phase${phaseIndex}.mp3`);
  audio.volume = 0.9;
  audio.play().catch(() => {});
  currentAudio = audio;
}

let countdownAudio: HTMLAudioElement | null = null;

export function speakCountdown(seconds: number) {
  if (!enabled) return;
  if (seconds < 1 || seconds > 40) return;

  if (countdownAudio) {
    countdownAudio.pause();
    countdownAudio = null;
  }

  const audio = new Audio(`./voices/count${seconds}.mp3`);
  audio.volume = 0.85;
  if (seconds <= 5) {
    audio.playbackRate = 1.5;
  }
  audio.play().catch(() => {});
  countdownAudio = audio;
}
