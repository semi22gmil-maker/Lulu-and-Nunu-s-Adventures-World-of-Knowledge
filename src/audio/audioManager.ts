import { CharacterId, ParentSettings } from '../types/game';
import { getVoiceClip, VOICE_CLIP_MANIFEST, VoiceClipDescriptor } from './voiceManifest';

export type SoundEffectType = 'tap' | 'jump' | 'clap' | 'success' | 'gentle-try' | 'coin' | 'star';
export type VoicePlaybackMode = 'bundled-audio-file' | 'manifest-caption-lipsync-only';

export interface VoicePlaybackResult {
  clip: VoiceClipDescriptor;
  playbackMode: VoicePlaybackMode;
}

type LipSyncListener = (speaker: CharacterId | null, mouthOpen: number, captionText: string | null) => void;

class AudioManager {
  private ctx: AudioContext | null = null;
  private currentAudioEl: HTMLAudioElement | null = null;
  private lipSyncTimer: number | null = null;
  private listeners = new Set<LipSyncListener>();
  private settingsSnapshot: Pick<
    ParentSettings,
    'soundEnabled' | 'musicEnabled' | 'voiceEnabled' | 'sfxVolume' | 'musicVolume' | 'voiceVolume'
  > = {
    soundEnabled: true,
    musicEnabled: true,
    voiceEnabled: true,
    sfxVolume: 0.85,
    musicVolume: 0.45,
    voiceVolume: 1.0,
  };

  syncSettings(settings: ParentSettings): void {
    this.settingsSnapshot = {
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      voiceEnabled: settings.voiceEnabled,
      sfxVolume: settings.sfxVolume,
      musicVolume: settings.musicVolume,
      voiceVolume: settings.voiceVolume,
    };

    if (!settings.voiceEnabled || !settings.soundEnabled) {
      this.stopVoice();
    }
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  subscribeLipSync(listener: LipSyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitLipSync(speaker: CharacterId | null, mouthOpen: number, captionText: string | null): void {
    for (const cb of this.listeners) {
      cb(speaker, mouthOpen, captionText);
    }
  }

  /**
   * Plays non-speech procedural SFX using Web Audio API (tap, jump, clap, success, coin, star).
   */
  playSfx(effect: SoundEffectType): boolean {
    if (!this.settingsSnapshot.soundEnabled) return false;
    const ctx = this.ensureAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const vol = Math.max(0.02, this.settingsSnapshot.sfxVolume * 0.25);
    gain.connect(ctx.destination);

    if (effect === 'tap') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.06);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.09);
      return true;
    }

    if (effect === 'jump') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.19);
      return true;
    }

    if (effect === 'clap') {
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      gain.gain.setValueAtTime(vol * 1.2, now);
      noise.connect(filter);
      filter.connect(gain);
      noise.start(now);
      return true;
    }

    if (effect === 'success' || effect === 'star') {
      const notes = effect === 'star' ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        noteGain.gain.setValueAtTime(vol, now + idx * 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.24);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
      return true;
    }

    if (effect === 'coin') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.24);
      return true;
    }

    // gentle-try
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);
    gain.gain.setValueAtTime(vol * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.22);
    return true;
  }

  /**
   * Plays a pre-recorded local voice clip when bundled, or drives synchronized caption + lip-sync envelope
   * cleanly without using synthetic speech or browser TTS fallback.
   */
  playVoiceClip(clipId: string): VoicePlaybackResult | null {
    const clip = getVoiceClip(clipId);
    if (!clip) return null;

    this.stopVoice();

    const playbackMode: VoicePlaybackMode = clip.localAssetPath
      ? 'bundled-audio-file'
      : 'manifest-caption-lipsync-only';

    if (!this.settingsSnapshot.soundEnabled || !this.settingsSnapshot.voiceEnabled) {
      // Still surface friendly caption for accessibility even when muted
      this.emitLipSync(clip.speaker, 0, clip.textAr);
      this.lipSyncTimer = window.setTimeout(() => {
        this.emitLipSync(null, 0, null);
      }, clip.estimatedDurationMs);
      return { clip, playbackMode };
    }

    if (clip.localAssetPath) {
      const audio = new Audio(clip.localAssetPath);
      audio.volume = this.settingsSnapshot.voiceVolume;
      this.currentAudioEl = audio;
      void audio.play().catch(() => {
        // Fallback smoothly to silent lip-sync envelope if asset playback is blocked
      });
    }

    const start = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start;
      if (elapsed >= clip.estimatedDurationMs) {
        this.stopVoice();
        return;
      }
      const syllableWave = Math.abs(Math.sin(elapsed * 0.018)) * 0.85 + 0.1;
      this.emitLipSync(clip.speaker, syllableWave, clip.textAr);
    }, 50);

    this.lipSyncTimer = interval;
    return { clip, playbackMode };
  }

  stopVoice(): void {
    if (this.currentAudioEl) {
      this.currentAudioEl.pause();
      this.currentAudioEl.currentTime = 0;
      this.currentAudioEl = null;
    }
    if (this.lipSyncTimer !== null) {
      window.clearInterval(this.lipSyncTimer);
      window.clearTimeout(this.lipSyncTimer);
      this.lipSyncTimer = null;
    }
    this.emitLipSync(null, 0, null);
  }

  getDiagnostics(): {
    audioContextState: string;
    totalManifestEntries: number;
    bundledAudioFilesCount: number;
    pendingAudioFilesCount: number;
  } {
    const entries = Object.values(VOICE_CLIP_MANIFEST);
    const bundledAudioFilesCount = entries.filter((e) => Boolean(e.localAssetPath)).length;
    return {
      audioContextState: this.ctx ? this.ctx.state : 'idle (awaiting user gesture)',
      totalManifestEntries: entries.length,
      bundledAudioFilesCount,
      pendingAudioFilesCount: entries.length - bundledAudioFilesCount,
    };
  }
}

export const audioManager = new AudioManager();
