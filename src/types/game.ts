/**
 * Core Domain Types & Enumerations
 * Lulu & Nono – Adventure of Knowledge (مغامرات لولو ونونو – عالم المعرفة)
 */

export enum ScreenId {
  Phase0Diagnostics = 'phase0-diagnostics',
  Splash = 'splash',
  WelcomeStory = 'welcome-story',
  CreateProfile = 'create-profile',
  Home = 'home',
  WorldMap = 'world-map',
  Rewards = 'rewards',
  Profile = 'profile',
  ParentGate = 'parent-gate',
  ParentDashboard = 'parent-dashboard',
  WorldDetails = 'world-details',
  StageSelect = 'stage-select',
  Gameplay = 'gameplay',
  Victory = 'victory',
  StarRestore = 'star-restore',
}

export enum WorldId {
  ArabicLetters = 'arabic-letters',
  NumbersMath = 'numbers-math',
  AnimalsKingdom = 'animals-kingdom',
  ScienceLab = 'science-lab',
  SmartPuzzles = 'smart-puzzles',
  EnglishWorld = 'english-world',
  ArtStudio = 'art-studio',
}

export enum CharacterId {
  Lulu = 'lulu',
  Nono = 'nono',
}

export enum CharacterAnimState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Celebrate = 'Celebrate',
  Dance = 'Dance',
  Clap = 'Clap',
  Encourage = 'Encourage',
  Point = 'Point',
  Think = 'Think',
  Surprise = 'Surprise',
  Laugh = 'Laugh',
  GentleSad = 'GentleSad',
}

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export enum QualityTier {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface StageMetadata {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  targetSkill: string;
  recommendedLevel: DifficultyLevel;
}

export interface WorldDefinition {
  id: WorldId;
  order: number;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  starNameAr: string;
  primaryColor: string;
  accentColor: string;
  skyColor: string;
  /** True once the world's interactive gameplay module is implemented in its respective phase */
  implemented: boolean;
  plannedPhase: number;
  stages: StageMetadata[];
}

export interface WorldProgress {
  worldId: WorldId;
  unlocked: boolean;
  starRestored: boolean;
  completedStageIds: string[];
  currentDifficulty: DifficultyLevel;
  consecutiveSuccesses: number;
  consecutiveMistakes: number;
  masteryScore: number; // 0 to 100
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarCompanion: CharacterId;
  createdAt: number;
  lastActiveAt: number;
  xp: number;
  coins: number;
  explorerLevel: number;
  unlockedBadges: string[];
  unlockedOutfits: string[];
  equippedOutfits: Record<CharacterId, string>;
  totalPlaySeconds: number;
  worldProgress: Record<WorldId, WorldProgress>;
}

export interface ParentSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  sfxVolume: number; // 0 - 1
  musicVolume: number; // 0 - 1
  voiceVolume: number; // 0 - 1
  qualityTier: QualityTier;
  dailyLimitMinutes: number; // 0 means unlimited
  parentPinHash: string | null;
}

export interface ActivityAttempt {
  id?: number;
  profileId: string;
  worldId: WorldId;
  stageId: string;
  skill: string;
  success: boolean;
  hintsUsed: number;
  durationMs: number;
  difficulty: DifficultyLevel;
  timestamp: number;
}

export interface DrawingRecord {
  id: string;
  profileId: string;
  title: string;
  dataUrl: string;
  createdAt: number;
}

export interface NavEntry {
  screen: ScreenId;
  params?: {
    worldId?: WorldId;
    stageId?: string;
    redirectAfterGate?: ScreenId;
  };
}

export interface GameState {
  initialized: boolean;
  activeProfileId: string | null;
  profiles: Record<string, ChildProfile>;
  settings: ParentSettings;
  navStack: NavEntry[];
  parentGateUnlockedUntil: number;
  sessionStartAt: number;
}
