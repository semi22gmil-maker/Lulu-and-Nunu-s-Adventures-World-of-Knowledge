import { ParentSettings, QualityTier } from '../types/game';

const STORAGE_PREFIX = 'lulu_nono_v1_';
const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
const ACTIVE_PROFILE_KEY = `${STORAGE_PREFIX}active_profile_id`;
const LAST_SCREEN_KEY = `${STORAGE_PREFIX}last_screen`;

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  soundEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  sfxVolume: 0.85,
  musicVolume: 0.45,
  voiceVolume: 1.0,
  qualityTier: QualityTier.Medium,
  dailyLimitMinutes: 0,
  parentPinHash: null,
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const localStorageService = {
  loadSettings(): ParentSettings {
    return {
      ...DEFAULT_PARENT_SETTINGS,
      ...safeRead<Partial<ParentSettings>>(SETTINGS_KEY, {}),
    };
  },

  saveSettings(settings: ParentSettings): boolean {
    return safeWrite(SETTINGS_KEY, settings);
  },

  loadActiveProfileId(): string | null {
    return safeRead<string | null>(ACTIVE_PROFILE_KEY, null);
  },

  saveActiveProfileId(profileId: string | null): boolean {
    return safeWrite(ACTIVE_PROFILE_KEY, profileId);
  },

  loadLastScreen(): string | null {
    return safeRead<string | null>(LAST_SCREEN_KEY, null);
  },

  saveLastScreen(screenId: string): boolean {
    return safeWrite(LAST_SCREEN_KEY, screenId);
  },

  clearAllAppKeys(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // Ignore storage quota / security errors gracefully
    }
  },
};
