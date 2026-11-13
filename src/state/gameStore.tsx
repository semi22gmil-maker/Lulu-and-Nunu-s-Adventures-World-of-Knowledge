import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { worldRegistry } from '../registry/worldRegistry';
import { resolveNavigationTarget } from '../navigation/screenRouter';
import { indexedDbService } from '../storage/indexedDbService';
import { DEFAULT_PARENT_SETTINGS, localStorageService } from '../storage/localStorageService';
import {
  ActivityAttempt,
  CharacterId,
  ChildProfile,
  DifficultyLevel,
  GameState,
  NavEntry,
  ParentSettings,
  ScreenId,
  WorldId,
  WorldProgress,
} from '../types/game';

type Action =
  | { type: 'HYDRATE'; profiles: Record<string, ChildProfile>; activeProfileId: string | null; settings: ParentSettings }
  | { type: 'NAVIGATE'; entry: NavEntry }
  | { type: 'REPLACE'; entry: NavEntry }
  | { type: 'GO_BACK' }
  | { type: 'RESET_NAV'; entry: NavEntry }
  | { type: 'UPSERT_PROFILE'; profile: ChildProfile; setActive?: boolean }
  | { type: 'SET_ACTIVE_PROFILE'; profileId: string | null }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<ParentSettings> }
  | { type: 'UNLOCK_PARENT_GATE'; untilTimestamp: number }
  | { type: 'RESET_ALL_PROGRESS' };

const initialState: GameState = {
  initialized: false,
  activeProfileId: null,
  profiles: {},
  settings: DEFAULT_PARENT_SETTINGS,
  navStack: [{ screen: ScreenId.Phase0Diagnostics }],
  parentGateUnlockedUntil: 0,
  sessionStartAt: Date.now(),
};

function createDefaultWorldProgress(): Record<WorldId, WorldProgress> {
  const map = {} as Record<WorldId, WorldProgress>;
  for (const world of worldRegistry.getAll()) {
    map[world.id] = {
      worldId: world.id,
      unlocked: world.order === 1, // First world unlocked by default; rest unlock smoothly or via exploration
      starRestored: false,
      completedStageIds: [],
      currentDifficulty: DifficultyLevel.Beginner,
      consecutiveSuccesses: 0,
      consecutiveMistakes: 0,
      masteryScore: 0,
    };
  }
  return map;
}

export function buildNewChildProfile(
  name: string,
  age: number,
  avatarCompanion: CharacterId = CharacterId.Lulu
): ChildProfile {
  const now = Date.now();
  return {
    id: `child_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    age,
    avatarCompanion,
    createdAt: now,
    lastActiveAt: now,
    xp: 0,
    coins: 0,
    explorerLevel: 1,
    unlockedBadges: [],
    unlockedOutfits: ['explorer-default'],
    equippedOutfits: {
      [CharacterId.Lulu]: 'explorer-default',
      [CharacterId.Nono]: 'explorer-default',
    },
    totalPlaySeconds: 0,
    worldProgress: createDefaultWorldProgress(),
  };
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        initialized: true,
        profiles: action.profiles,
        activeProfileId: action.activeProfileId,
        settings: action.settings,
      };
    case 'NAVIGATE': {
      const resolved = resolveNavigationTarget(action.entry, state.parentGateUnlockedUntil);
      return {
        ...state,
        navStack: [...state.navStack, resolved],
      };
    }
    case 'REPLACE': {
      const resolved = resolveNavigationTarget(action.entry, state.parentGateUnlockedUntil);
      return {
        ...state,
        navStack: [...state.navStack.slice(0, -1), resolved],
      };
    }
    case 'GO_BACK':
      if (state.navStack.length <= 1) return state;
      return {
        ...state,
        navStack: state.navStack.slice(0, -1),
      };
    case 'RESET_NAV': {
      const resolved = resolveNavigationTarget(action.entry, state.parentGateUnlockedUntil);
      return {
        ...state,
        navStack: [resolved],
      };
    }
    case 'UPSERT_PROFILE': {
      const nextProfiles = {
        ...state.profiles,
        [action.profile.id]: action.profile,
      };
      return {
        ...state,
        profiles: nextProfiles,
        activeProfileId: action.setActive ? action.profile.id : state.activeProfileId,
      };
    }
    case 'SET_ACTIVE_PROFILE':
      return {
        ...state,
        activeProfileId: action.profileId,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.patch,
        },
      };
    case 'UNLOCK_PARENT_GATE':
      return {
        ...state,
        parentGateUnlockedUntil: action.untilTimestamp,
      };
    case 'RESET_ALL_PROGRESS':
      return {
        ...state,
        activeProfileId: null,
        profiles: {},
        settings: DEFAULT_PARENT_SETTINGS,
        navStack: [{ screen: ScreenId.Phase0Diagnostics }],
        parentGateUnlockedUntil: 0,
      };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  currentNav: NavEntry;
  activeProfile: ChildProfile | null;
  navigate: (screen: ScreenId, params?: NavEntry['params']) => void;
  replaceScreen: (screen: ScreenId, params?: NavEntry['params']) => void;
  goBack: () => void;
  resetNav: (screen: ScreenId, params?: NavEntry['params']) => void;
  createProfile: (name: string, age: number, companion: CharacterId) => Promise<ChildProfile>;
  selectProfile: (profileId: string) => void;
  updateSettings: (patch: Partial<ParentSettings>) => void;
  unlockParentGate: (durationMs?: number) => void;
  recordAttemptAndAdapt: (attempt: Omit<ActivityAttempt, 'profileId' | 'timestamp'>) => Promise<DifficultyLevel | null>;
  resetAllProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const settings = localStorageService.loadSettings();
      const savedActiveId = localStorageService.loadActiveProfileId();
      let profilesList: ChildProfile[] = [];
      try {
        profilesList = await indexedDbService.getAllProfiles();
      } catch {
        profilesList = [];
      }

      if (!mounted) return;

      const profilesMap: Record<string, ChildProfile> = {};
      for (const p of profilesList) {
        profilesMap[p.id] = p;
      }

      const validActiveId = savedActiveId && profilesMap[savedActiveId] ? savedActiveId : profilesList[0]?.id ?? null;

      dispatch({
        type: 'HYDRATE',
        profiles: profilesMap,
        activeProfileId: validActiveId,
        settings,
      });
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const currentNav = state.navStack[state.navStack.length - 1] ?? { screen: ScreenId.Phase0Diagnostics };
  const activeProfile = state.activeProfileId ? state.profiles[state.activeProfileId] ?? null : null;

  const navigate = (screen: ScreenId, params?: NavEntry['params']) => {
    localStorageService.saveLastScreen(screen);
    dispatch({ type: 'NAVIGATE', entry: { screen, params } });
  };

  const replaceScreen = (screen: ScreenId, params?: NavEntry['params']) => {
    localStorageService.saveLastScreen(screen);
    dispatch({ type: 'REPLACE', entry: { screen, params } });
  };

  const goBack = () => dispatch({ type: 'GO_BACK' });

  const resetNav = (screen: ScreenId, params?: NavEntry['params']) => {
    localStorageService.saveLastScreen(screen);
    dispatch({ type: 'RESET_NAV', entry: { screen, params } });
  };

  const createProfile = async (name: string, age: number, companion: CharacterId): Promise<ChildProfile> => {
    const profile = buildNewChildProfile(name, age, companion);
    await indexedDbService.saveProfile(profile);
    localStorageService.saveActiveProfileId(profile.id);
    dispatch({ type: 'UPSERT_PROFILE', profile, setActive: true });
    return profile;
  };

  const selectProfile = (profileId: string) => {
    localStorageService.saveActiveProfileId(profileId);
    dispatch({ type: 'SET_ACTIVE_PROFILE', profileId });
  };

  const updateSettings = (patch: Partial<ParentSettings>) => {
    const merged = { ...state.settings, ...patch };
    localStorageService.saveSettings(merged);
    dispatch({ type: 'UPDATE_SETTINGS', patch });
  };

  const unlockParentGate = (durationMs = 5 * 60 * 1000) => {
    dispatch({ type: 'UNLOCK_PARENT_GATE', untilTimestamp: Date.now() + durationMs });
  };

  /**
   * Adaptive Difficulty Engine (Phase 11 foundation built into Core State):
   * Advances difficulty after 3 consecutive mastery successes without heavy hints,
   * and gently steps down after 2 consecutive mistakes without penalizing the child.
   */
  const recordAttemptAndAdapt = async (
    attemptInput: Omit<ActivityAttempt, 'profileId' | 'timestamp'>
  ): Promise<DifficultyLevel | null> => {
    if (!activeProfile) return null;
    const now = Date.now();
    const attempt: ActivityAttempt = {
      ...attemptInput,
      profileId: activeProfile.id,
      timestamp: now,
    };

    try {
      await indexedDbService.logActivity(attempt);
    } catch {
      // Keep gameplay smooth even if log write fails
    }

    const wp = activeProfile.worldProgress[attempt.worldId];
    if (!wp) return null;

    let nextDiff = wp.currentDifficulty;
    let successes = attempt.success ? wp.consecutiveSuccesses + 1 : 0;
    let mistakes = attempt.success ? 0 : wp.consecutiveMistakes + 1;

    if (successes >= 3 && attempt.hintsUsed === 0) {
      if (nextDiff === DifficultyLevel.Beginner) nextDiff = DifficultyLevel.Intermediate;
      else if (nextDiff === DifficultyLevel.Intermediate) nextDiff = DifficultyLevel.Advanced;
      successes = 0;
    } else if (mistakes >= 2) {
      if (nextDiff === DifficultyLevel.Advanced) nextDiff = DifficultyLevel.Intermediate;
      else if (nextDiff === DifficultyLevel.Intermediate) nextDiff = DifficultyLevel.Beginner;
      mistakes = 0;
    }

    const xpGain = attempt.success ? 15 : 5; // Reward effort gently even on retry
    const coinGain = attempt.success ? 5 : 0;
    const nextXp = activeProfile.xp + xpGain;

    const updatedProfile: ChildProfile = {
      ...activeProfile,
      lastActiveAt: now,
      xp: nextXp,
      coins: activeProfile.coins + coinGain,
      explorerLevel: Math.floor(nextXp / 100) + 1,
      worldProgress: {
        ...activeProfile.worldProgress,
        [attempt.worldId]: {
          ...wp,
          currentDifficulty: nextDiff,
          consecutiveSuccesses: successes,
          consecutiveMistakes: mistakes,
          masteryScore: Math.min(100, Math.max(0, wp.masteryScore + (attempt.success ? 8 : -2))),
        },
      },
    };

    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });
    return nextDiff;
  };

  const resetAllProgress = async () => {
    localStorageService.clearAllAppKeys();
    await indexedDbService.clearAllData();
    dispatch({ type: 'RESET_ALL_PROGRESS' });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        currentNav,
        activeProfile,
        navigate,
        replaceScreen,
        goBack,
        resetNav,
        createProfile,
        selectProfile,
        updateSettings,
        unlockParentGate,
        recordAttemptAndAdapt,
        resetAllProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGameState(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used inside GameStateProvider');
  return ctx;
}
