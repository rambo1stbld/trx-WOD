/**
 * Background music player for workout phases.
 * Supports single tracks and playlists (sequential playback).
 */

let audio: HTMLAudioElement | null = null;
let currentPhaseKey: string | null = null;
let playlist: string[] = [];
let playlistIndex = 0;
let volume = 0.3;

function playNext() {
  if (!playlist.length) return;

  if (audio) {
    audio.pause();
    audio = null;
  }

  const track = playlist[playlistIndex];
  audio = new Audio(`./music/${track}`);
  audio.volume = volume;

  // When track ends, play next in playlist (loop back to start)
  audio.onended = () => {
    playlistIndex = (playlistIndex + 1) % playlist.length;
    playNext();
  };

  audio.play().catch(() => {});
}

export function playBgMusic(tracks: string | string[], vol: number = 0.3) {
  const key = Array.isArray(tracks) ? tracks.join(",") : tracks;

  // If already playing this set, do nothing
  if (audio && currentPhaseKey === key && !audio.paused) return;

  stopBgMusic();

  volume = vol;
  playlist = Array.isArray(tracks) ? tracks : [tracks];
  playlistIndex = 0;
  currentPhaseKey = key;

  playNext();
}

export function stopBgMusic() {
  if (audio) {
    audio.onended = null;
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
  currentPhaseKey = null;
  playlist = [];
  playlistIndex = 0;
}

export function pauseBgMusic() {
  if (audio && !audio.paused) {
    audio.pause();
  }
}

export function resumeBgMusic() {
  if (audio && audio.paused && currentPhaseKey) {
    audio.play().catch(() => {});
  }
}
