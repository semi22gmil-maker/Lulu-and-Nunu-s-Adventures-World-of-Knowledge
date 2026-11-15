import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { BADGE_CATALOG, countRestoredStars, evaluateUnlockedBadges, OUTFIT_CATALOG } from '../data/rewardsCatalog';
import {
  resolveGuardedNavigation,
} from '../navigation/screenRouter';
import { worldRegistry } from '../registry/worldRegistry';
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
  StageRunSummary,
  WorldId,
  WorldProgress,
} from '../types/game';

type Action =
  | {
      type: 'HYDRATE';
      profiles: Record<string, ChildProfile>;
      activeProfileId: string | null;
      settings: ParentSettings;
      storySeen: boolean;
    }
  | { type: 'MARK_STORY_SEEN' }
  | { type: 'NAVIGATE'; entry: NavEntry }
  | { type: 'REPLACE'; entry: NavEntry }
  | { type: 'GO_BACK' }
  | { type: 'RESET_NAV'; entry: NavEntry }
  | { type: 'UPSERT_PROFILE'; profile: ChildProfile; setActive?: boolean }
  | { type: 'REMOVE_PROFILE'; profileId: string; nextActiveId: string | null }
  | { type: 'SET_ACTIVE_PROFILE'; profileId: string | null }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<ParentSettings> }
  | { type: 'UNLOCK_PARENT_GATE'; untilTimestamp: number }
  | { type: 'SET_LAST_STAGE_RUN'; summary: StageRunSummary | null }
  | { type: 'RESET_ALL_PROGRESS' };

const initialState: GameState = {
  initialized: false,
  storySeen: false,
  activeProfileId: null,
  profiles: {},
  settings: DEFAULT_PARENT_SETTINGS,
  navStack: [{ screen: ScreenId.Splash }],
  parentGateUnlockedUntil: 0,
  sessionStartAt: Date.now(),
  lastStageRun: null,
};

function createDefaultWorldProgress(
  startingDifficulty: DifficultyLevel = DifficultyLevel.Beginner
): Record<WorldId, WorldProgress> {
  const map = {} as Record<WorldId, WorldProgress>;
  for (const world of worldRegistry.getAll()) {
    map[world.id] = {
      worldId: world.id,
      unlocked: world.order === 1,
      starRestored: false,
      completedStageIds: [],
      currentDifficulty: startingDifficulty,
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
  avatarCompanion: CharacterId = CharacterId.Lulu,
  startingDifficulty: DifficultyLevel = DifficultyLevel.Beginner
): ChildProfile {
  const now = Date.now();
  const baseProfile: ChildProfile = {
    id: `child_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    age,
    avatarCompanion,
    startingDifficulty,
    createdAt: now,
    lastActiveAt: now,
    xp: 0,
    coins: 0,
    explorerLevel: 1,
    unlockedBadges: ['badge-first-explorer'],
    unlockedOutfits: ['explorer-default'],
    equippedOutfits: {
      [CharacterId.Lulu]: 'explorer-default',
      [CharacterId.Nono]: 'explorer-default',
    },
    totalPlaySeconds: 0,
    worldProgress: createDefaultWorldProgress(startingDifficulty),
  };
  baseProfile.unlockedBadges = evaluateUnlockedBadges(baseProfile);
  return baseProfile;
}

function getActiveProfileFromState(state: GameState): ChildProfile | null {
  return state.activeProfileId ? state.profiles[state.activeProfileId] ?? null : null;
}

function persistNav(entry: NavEntry): void {
  if (entry.screen === ScreenId.Splash || entry.screen === ScreenId.Phase0Diagnostics) {
    return;
  }
  localStorageService.saveLastScreen(entry.screen);
  localStorageService.saveLastNav(entry);
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        initialized: true,
        storySeen: action.storySeen,
        profiles: action.profiles,
        activeProfileId: action.activeProfileId,
        settings: action.settings,
      };
    case 'MARK_STORY_SEEN':
      return {
        ...state,
        storySeen: true,
      };
    case 'NAVIGATE': {
      const profile = getActiveProfileFromState(state);
      const resolved = resolveGuardedNavigation(
        action.entry,
        state.parentGateUnlockedUntil,
        profile,
        state.storySeen
      );
      persistNav(resolved);
      const top = state.navStack[state.navStack.length - 1];
      if (
        top &&
        top.screen === resolved.screen &&
        top.params?.worldId === resolved.params?.worldId &&
        top.params?.stageId === resolved.params?.stageId
      ) {
        return state;
      }
      return {
        ...state,
        navStack: [...state.navStack, resolved],
      };
    }
    case 'REPLACE': {
      const profile = getActiveProfileFromState(state);
      const resolved = resolveGuardedNavigation(
        action.entry,
        state.parentGateUnlockedUntil,
        profile,
        state.storySeen
      );
      persistNav(resolved);
      return {
        ...state,
        navStack: [...state.navStack.slice(0, -1), resolved],
      };
    }
    case 'GO_BACK': {
      if (state.navStack.length <= 1) return state;
      const nextStack = state.navStack.slice(0, -1);
      const profile = getActiveProfileFromState(state);
      const top = nextStack[nextStack.length - 1];
      const guardedTop = resolveGuardedNavigation(
        top,
        state.parentGateUnlockedUntil,
        profile,
        state.storySeen
      );
      persistNav(guardedTop);
      return {
        ...state,
        navStack: [...nextStack.slice(0, -1), guardedTop],
      };
    }
    case 'RESET_NAV': {
      const profile = getActiveProfileFromState(state);
      const resolved = resolveGuardedNavigation(
        action.entry,
        state.parentGateUnlockedUntil,
        profile,
        state.storySeen
      );
      persistNav(resolved);
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
    case 'REMOVE_PROFILE': {
      const nextProfiles = { ...state.profiles };
      delete nextProfiles[action.profileId];
      return {
        ...state,
        profiles: nextProfiles,
        activeProfileId: action.nextActiveId,
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
    case 'SET_LAST_STAGE_RUN':
      return {
        ...state,
        lastStageRun: action.summary,
      };
    case 'RESET_ALL_PROGRESS':
      return {
        ...state,
        storySeen: false,
        activeProfileId: null,
        profiles: {},
        settings: DEFAULT_PARENT_SETTINGS,
        navStack: [{ screen: ScreenId.Splash }],
        parentGateUnlockedUntil: 0,
        lastStageRun: null,
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
  markStorySeen: () => void;
  getPostSplashDestination: () => NavEntry;
  createProfile: (
    name: string,
    age: number,
    companion: CharacterId,
    startingDifficulty?: DifficultyLevel
  ) => Promise<ChildProfile>;
  updateProfileDetails: (
    profileId: string,
    patch: Partial<Pick<ChildProfile, 'name' | 'age' | 'avatarCompanion'>>
  ) => Promise<ChildProfile | null>;
  deleteProfile: (profileId: string) => Promise<void>;
  selectProfile: (profileId: string) => void;
  updateSettings: (patch: Partial<ParentSettings>) => void;
  unlockParentGate: (durationMs?: number) => void;
  lockParentGate: () => void;
  recordAttemptAndAdapt: (
    attempt: Omit<ActivityAttempt, 'profileId' | 'timestamp'>
  ) => Promise<DifficultyLevel | null>;
  completeStageRun: (
    worldId: WorldId,
    stageId: string,
    correctCount: number,
    totalSteps: number,
    durationSec: number
  ) => Promise<StageRunSummary | null>;
  restoreWorldStar: (worldId: WorldId) => Promise<{
    alreadyRestored: boolean;
    nextWorldUnlocked: WorldId | null;
    newBadges: string[];
  }>;
  unlockOutfit: (outfitId: string) => Promise<{ ok: boolean; reasonAr?: string }>;
  equipOutfit: (character: CharacterId, outfitId: string) => Promise<void>;
  resetAllProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const settings = localStorageService.loadSettings();
      const savedActiveId = localStorageService.loadActiveProfileId();
      const storySeen = localStorageService.loadStorySeen();
      let profilesList: ChildProfile[] = [];
      try {
        profilesList = await indexedDbService.getAllProfiles();
      } catch {
        profilesList = [];
      }

      if (!mounted) return;

      const profilesMap: Record<string, ChildProfile> = {};
      for (const p of profilesList) {
        if (!p || !p.id || !p.worldProgress) continue;
        profilesMap[p.id] = p;
      }

      const validActiveId =
        savedActiveId && profilesMap[savedActiveId]
          ? savedActiveId
          : Object.keys(profilesMap)[0] ?? null;

      if (validActiveId) {
        localStorageService.saveActiveProfileId(validActiveId);
      }

      dispatch({
        type: 'HYDRATE',
        profiles: profilesMap,
        activeProfileId: validActiveId,
        settings,
        storySeen,
      });
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync reducedMotion preference globally on <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('reduced-motion', Boolean(state.settings.reducedMotion));
  }, [state.settings.reducedMotion]);

  const currentNav = state.navStack[state.navStack.length - 1] ?? { screen: ScreenId.Splash };
  const activeProfile = getActiveProfileFromState(state);

  const navigate = (screen: ScreenId, params?: NavEntry['params']) => {
    dispatch({ type: 'NAVIGATE', entry: { screen, params } });
  };

  const replaceScreen = (screen: ScreenId, params?: NavEntry['params']) => {
    dispatch({ type: 'REPLACE', entry: { screen, params } });
  };

  const goBack = () => dispatch({ type: 'GO_BACK' });

  const resetNav = (screen: ScreenId, params?: NavEntry['params']) => {
    dispatch({ type: 'RESET_NAV', entry: { screen, params } });
  };

  const markStorySeen = () => {
    localStorageService.saveStorySeen(true);
    dispatch({ type: 'MARK_STORY_SEEN' });
  };

  const getPostSplashDestination = (): NavEntry => {
    const profile = getActiveProfileFromState(stateRef.current);
    const storySeen = stateRef.current.storySeen;
    if (!profile) {
      return { screen: storySeen ? ScreenId.CreateProfile : ScreenId.WelcomeStory };
    }
    const savedNav = localStorageService.loadLastNav();
    if (
      savedNav &&
      savedNav.screen !== ScreenId.Splash &&
      savedNav.screen !== ScreenId.WelcomeStory &&
      savedNav.screen !== ScreenId.CreateProfile &&
      savedNav.screen !== ScreenId.Phase0Diagnostics &&
      savedNav.screen !== ScreenId.Victory &&
      savedNav.screen !== ScreenId.Gameplay
    ) {
      return resolveGuardedNavigation(
        savedNav,
        stateRef.current.parentGateUnlockedUntil,
        profile,
        storySeen
      );
    }
    return { screen: ScreenId.Home };
  };

  const createProfile = async (
    name: string,
    age: number,
    companion: CharacterId,
    startingDifficulty: DifficultyLevel = DifficultyLevel.Beginner
  ): Promise<ChildProfile> => {
    const profile = buildNewChildProfile(name, age, companion, startingDifficulty);
    await indexedDbService.saveProfile(profile);
    localStorageService.saveActiveProfileId(profile.id);
    localStorageService.saveStorySeen(true);
    dispatch({ type: 'MARK_STORY_SEEN' });
    dispatch({ type: 'UPSERT_PROFILE', profile, setActive: true });
    return profile;
  };

  const updateProfileDetails = async (
    profileId: string,
    patch: Partial<Pick<ChildProfile, 'name' | 'age' | 'avatarCompanion'>>
  ): Promise<ChildProfile | null> => {
    const existing = stateRef.current.profiles[profileId];
    if (!existing) return null;
    const updated: ChildProfile = {
      ...existing,
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : existing.name,
      lastActiveAt: Date.now(),
    };
    await indexedDbService.saveProfile(updated);
    dispatch({ type: 'UPSERT_PROFILE', profile: updated });
    return updated;
  };

  const deleteProfile = async (profileId: string): Promise<void> => {
    await indexedDbService.deleteProfile(profileId);
    const remainingIds = Object.keys(stateRef.current.profiles).filter((id) => id !== profileId);
    const nextActiveId =
      stateRef.current.activeProfileId === profileId
        ? remainingIds[0] ?? null
        : stateRef.current.activeProfileId;
    localStorageService.saveActiveProfileId(nextActiveId);
    dispatch({ type: 'REMOVE_PROFILE', profileId, nextActiveId });
  };

  const selectProfile = (profileId: string) => {
    if (!stateRef.current.profiles[profileId]) return;
    localStorageService.saveActiveProfileId(profileId);
    dispatch({ type: 'SET_ACTIVE_PROFILE', profileId });
  };

  const updateSettings = (patch: Partial<ParentSettings>) => {
    const merged = { ...stateRef.current.settings, ...patch };
    localStorageService.saveSettings(merged);
    dispatch({ type: 'UPDATE_SETTINGS', patch });
  };

  const unlockParentGate = (durationMs = 5 * 60 * 1000) => {
    dispatch({ type: 'UNLOCK_PARENT_GATE', untilTimestamp: Date.now() + durationMs });
  };

  const lockParentGate = () => {
    dispatch({ type: 'UNLOCK_PARENT_GATE', untilTimestamp: 0 });
  };

  const recordAttemptAndAdapt = async (
    attemptInput: Omit<ActivityAttempt, 'profileId' | 'timestamp'>
  ): Promise<DifficultyLevel | null> => {
    const currentProfile = getActiveProfileFromState(stateRef.current);
    if (!currentProfile) return null;
    const now = Date.now();
    const attempt: ActivityAttempt = {
      ...attemptInput,
      profileId: currentProfile.id,
      timestamp: now,
    };

    try {
      await indexedDbService.logActivity(attempt);
    } catch {
      // Keep gameplay smooth even if log write fails
    }

    const wp = currentProfile.worldProgress[attempt.worldId];
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

    const xpGain = attempt.success ? 15 : 5;
    const coinGain = attempt.success ? 5 : 0;
    const nextXp = currentProfile.xp + xpGain;

    const updatedProfile: ChildProfile = {
      ...currentProfile,
      lastActiveAt: now,
      xp: nextXp,
      coins: currentProfile.coins + coinGain,
      explorerLevel: Math.floor(nextXp / 100) + 1,
      worldProgress: {
        ...currentProfile.worldProgress,
        [attempt.worldId]: {
          ...wp,
          currentDifficulty: nextDiff,
          consecutiveSuccesses: successes,
          consecutiveMistakes: mistakes,
          masteryScore: Math.min(100, Math.max(0, wp.masteryScore + (attempt.success ? 8 : -2))),
        },
      },
    };
    updatedProfile.unlockedBadges = evaluateUnlockedBadges(updatedProfile);

    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });
    return nextDiff;
  };

  const completeStageRun = async (
    worldId: WorldId,
    stageId: string,
    correctCount: number,
    totalSteps: number,
    durationSec: number
  ): Promise<StageRunSummary | null> => {
    const currentProfile = getActiveProfileFromState(stateRef.current);
    const world = worldRegistry.getById(worldId);
    const stage = world?.stages.find((s) => s.id === stageId);
    if (!currentProfile || !world || !stage) return null;

    const wp = currentProfile.worldProgress[worldId];
    if (!wp) return null;

    const alreadyCompleted = wp.completedStageIds.includes(stageId);
    const nextCompletedIds = alreadyCompleted
      ? wp.completedStageIds
      : [...wp.completedStageIds, stageId];

    const stageBonusXp = alreadyCompleted ? 15 : 30;
    const stageBonusCoins = alreadyCompleted ? 5 : 15;
    const nextXp = currentProfile.xp + stageBonusXp;
    const nextCoins = currentProfile.coins + stageBonusCoins;
    const masteryFromCompletion = Math.round((nextCompletedIds.length / world.stages.length) * 100);

    const prevBadges = new Set(currentProfile.unlockedBadges);
    const updatedProfile: ChildProfile = {
      ...currentProfile,
      lastActiveAt: Date.now(),
      xp: nextXp,
      coins: nextCoins,
      explorerLevel: Math.floor(nextXp / 100) + 1,
      totalPlaySeconds: currentProfile.totalPlaySeconds + Math.max(1, Math.round(durationSec)),
      worldProgress: {
        ...currentProfile.worldProgress,
        [worldId]: {
          ...wp,
          completedStageIds: nextCompletedIds,
          masteryScore: Math.max(wp.masteryScore, masteryFromCompletion),
        },
      },
    };

    updatedProfile.unlockedBadges = evaluateUnlockedBadges(updatedProfile);
    const newlyUnlockedBadges = updatedProfile.unlockedBadges
      .filter((id) => !prevBadges.has(id))
      .map((id) => BADGE_CATALOG.find((b) => b.id === id)?.titleAr ?? id);

    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });

    const allWorldStagesCompleted = world.stages.every((s) => nextCompletedIds.includes(s.id));
    const summary: StageRunSummary = {
      worldId,
      stageId,
      stageTitleAr: stage.titleAr,
      correctCount,
      totalSteps,
      xpEarned: stageBonusXp,
      coinsEarned: stageBonusCoins,
      newlyCompletedStage: !alreadyCompleted,
      eligibleForStarRestore: allWorldStagesCompleted && !wp.starRestored,
      newlyUnlockedBadges,
      completedAt: Date.now(),
    };
    dispatch({ type: 'SET_LAST_STAGE_RUN', summary });
    return summary;
  };

  const restoreWorldStar = async (
    worldId: WorldId
  ): Promise<{
    alreadyRestored: boolean;
    nextWorldUnlocked: WorldId | null;
    newBadges: string[];
  }> => {
    const currentProfile = getActiveProfileFromState(stateRef.current);
    const world = worldRegistry.getById(worldId);
    if (!currentProfile || !world) {
      return { alreadyRestored: false, nextWorldUnlocked: null, newBadges: [] };
    }

    const wp = currentProfile.worldProgress[worldId];
    if (!wp) {
      return { alreadyRestored: false, nextWorldUnlocked: null, newBadges: [] };
    }

    if (wp.starRestored) {
      return { alreadyRestored: true, nextWorldUnlocked: null, newBadges: [] };
    }

    const nextWorld = worldRegistry.getAll().find((w) => w.order === world.order + 1) ?? null;
    const nextWorldProgress = {
      ...currentProfile.worldProgress,
      [worldId]: {
        ...wp,
        starRestored: true,
        masteryScore: 100,
      },
    };
    if (nextWorld && nextWorldProgress[nextWorld.id]) {
      nextWorldProgress[nextWorld.id] = {
        ...nextWorldProgress[nextWorld.id],
        unlocked: true,
      };
    }

    const nextXp = currentProfile.xp + 50;
    const prevBadges = new Set(currentProfile.unlockedBadges);

    const updatedProfile: ChildProfile = {
      ...currentProfile,
      lastActiveAt: Date.now(),
      xp: nextXp,
      coins: currentProfile.coins + 25,
      explorerLevel: Math.floor(nextXp / 100) + 1,
      worldProgress: nextWorldProgress,
    };
    updatedProfile.unlockedBadges = evaluateUnlockedBadges(updatedProfile);
    const newBadges = updatedProfile.unlockedBadges
      .filter((id) => !prevBadges.has(id))
      .map((id) => BADGE_CATALOG.find((b) => b.id === id)?.titleAr ?? id);

    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });

    return {
      alreadyRestored: false,
      nextWorldUnlocked: nextWorld?.id ?? null,
      newBadges,
    };
  };

  const unlockOutfit = async (
    outfitId: string
  ): Promise<{ ok: boolean; reasonAr?: string }> => {
    const currentProfile = getActiveProfileFromState(stateRef.current);
    const outfit = OUTFIT_CATALOG.find((o) => o.id === outfitId);
    if (!currentProfile || !outfit) {
      return { ok: false, reasonAr: 'تعذر العثور على الزي المطلوب.' };
    }
    if (currentProfile.unlockedOutfits.includes(outfitId)) {
      return { ok: true };
    }
    const stars = countRestoredStars(currentProfile);
    if (stars < outfit.requiredStars) {
      return {
        ok: false,
        reasonAr: `يتطلب استعادة ${outfit.requiredStars} نجمة معرفة على الأقل.`,
      };
    }
    if (currentProfile.coins < outfit.costCoins) {
      return {
        ok: false,
        reasonAr: `تحتاج إلى ${outfit.costCoins} عملة لفتح هذا الزي.`,
      };
    }

    const updatedProfile: ChildProfile = {
      ...currentProfile,
      coins: currentProfile.coins - outfit.costCoins,
      unlockedOutfits: [...currentProfile.unlockedOutfits, outfitId],
      lastActiveAt: Date.now(),
    };
    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });
    return { ok: true };
  };

  const equipOutfit = async (character: CharacterId, outfitId: string): Promise<void> => {
    const currentProfile = getActiveProfileFromState(stateRef.current);
    if (!currentProfile || !currentProfile.unlockedOutfits.includes(outfitId)) return;

    const updatedProfile: ChildProfile = {
      ...currentProfile,
      equippedOutfits: {
        ...currentProfile.equippedOutfits,
        [character]: outfitId,
      },
      lastActiveAt: Date.now(),
    };
    await indexedDbService.saveProfile(updatedProfile);
    dispatch({ type: 'UPSERT_PROFILE', profile: updatedProfile });
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
        markStorySeen,
        getPostSplashDestination,
        createProfile,
        updateProfileDetails,
        deleteProfile,
        selectProfile,
        updateSettings,
        unlockParentGate,
        lockParentGate,
        recordAttemptAndAdapt,
        completeStageRun,
        restoreWorldStar,
        unlockOutfit,
        equipOutfit,
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
