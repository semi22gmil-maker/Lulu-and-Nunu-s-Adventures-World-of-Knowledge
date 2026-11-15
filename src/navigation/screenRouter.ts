import { worldRegistry } from '../registry/worldRegistry';
import { ChildProfile, NavEntry, ScreenId, WorldId } from '../types/game';

export interface ScreenMetadata {
  id: ScreenId;
  titleAr: string;
  requiresParentGate: boolean;
  requiresProfile: boolean;
  plannedPhase: number;
  /** Temporary Phase 0 verification screen (not part of the 14 game screens built in Phase 2) */
  isDiagnosticOnly?: boolean;
}

export const PLANNED_GAME_SCREEN_COUNT = 14;

export const SCREEN_DIRECTORY: Record<ScreenId, ScreenMetadata> = {
  [ScreenId.Phase0Diagnostics]: {
    id: ScreenId.Phase0Diagnostics,
    titleAr: 'فحص البنية التقنية (المرحلة صفر)',
    requiresParentGate: false,
    requiresProfile: false,
    plannedPhase: 0,
    isDiagnosticOnly: true,
  },
  [ScreenId.Splash]: {
    id: ScreenId.Splash,
    titleAr: 'شاشة البداية',
    requiresParentGate: false,
    requiresProfile: false,
    plannedPhase: 2,
  },
  [ScreenId.WelcomeStory]: {
    id: ScreenId.WelcomeStory,
    titleAr: 'الترحيب والقصة',
    requiresParentGate: false,
    requiresProfile: false,
    plannedPhase: 2,
  },
  [ScreenId.CreateProfile]: {
    id: ScreenId.CreateProfile,
    titleAr: 'إنشاء ملف الطفل',
    requiresParentGate: false,
    requiresProfile: false,
    plannedPhase: 2,
  },
  [ScreenId.Home]: {
    id: ScreenId.Home,
    titleAr: 'الشاشة الرئيسية',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.WorldMap]: {
    id: ScreenId.WorldMap,
    titleAr: 'خريطة العوالم السبعة',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.Rewards]: {
    id: ScreenId.Rewards,
    titleAr: 'المكافآت والأوسمة',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.Profile]: {
    id: ScreenId.Profile,
    titleAr: 'الملف الشخصي',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.ParentGate]: {
    id: ScreenId.ParentGate,
    titleAr: 'بوابة تحدي الوالدين',
    requiresParentGate: false,
    requiresProfile: false,
    plannedPhase: 2,
  },
  [ScreenId.ParentDashboard]: {
    id: ScreenId.ParentDashboard,
    titleAr: 'لوحة الوالدين والإعدادات',
    requiresParentGate: true,
    requiresProfile: false,
    plannedPhase: 2,
  },
  [ScreenId.WorldDetails]: {
    id: ScreenId.WorldDetails,
    titleAr: 'تفاصيل العالم',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.StageSelect]: {
    id: ScreenId.StageSelect,
    titleAr: 'اختيار المرحلة',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.Gameplay]: {
    id: ScreenId.Gameplay,
    titleAr: 'شاشة اللعب',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.Victory]: {
    id: ScreenId.Victory,
    titleAr: 'النجاح والفوز',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
  [ScreenId.StarRestore]: {
    id: ScreenId.StarRestore,
    titleAr: 'استعادة النجمة',
    requiresParentGate: false,
    requiresProfile: true,
    plannedPhase: 2,
  },
};

export function isStageUnlockedForProfile(
  profile: ChildProfile,
  worldId: WorldId,
  stageId: string
): boolean {
  const world = worldRegistry.getById(worldId);
  const wp = profile.worldProgress[worldId];
  if (!world || !wp || !wp.unlocked) return false;

  const idx = world.stages.findIndex((s) => s.id === stageId);
  if (idx === -1) return false;
  if (idx === 0) return true;
  const prevStage = world.stages[idx - 1];
  return wp.completedStageIds.includes(prevStage.id) || wp.completedStageIds.includes(stageId);
}

export function getNextAvailableWorldAndStage(profile: ChildProfile): {
  worldId: WorldId;
  stageId: string;
} {
  const worlds = worldRegistry.getAll();
  for (const world of worlds) {
    const wp = profile.worldProgress[world.id];
    if (!wp?.unlocked) continue;
    const nextStage = world.stages.find((s) => !wp.completedStageIds.includes(s.id));
    if (nextStage) {
      return { worldId: world.id, stageId: nextStage.id };
    }
  }
  const fallbackWorld = worlds.find((w) => profile.worldProgress[w.id]?.unlocked) ?? worlds[0];
  return {
    worldId: fallbackWorld.id,
    stageId: fallbackWorld.stages[0].id,
  };
}

export function resolveNavigationTarget(
  target: NavEntry,
  parentGateUnlockedUntil: number,
  now = Date.now()
): NavEntry {
  const meta = SCREEN_DIRECTORY[target.screen];
  if (meta?.requiresParentGate && now > parentGateUnlockedUntil) {
    return {
      screen: ScreenId.ParentGate,
      params: {
        ...target.params,
        redirectAfterGate: target.screen,
      },
    };
  }
  return target;
}

export function resolveGuardedNavigation(
  target: NavEntry,
  parentGateUnlockedUntil: number,
  activeProfile: ChildProfile | null,
  storySeen: boolean,
  now = Date.now()
): NavEntry {
  const gateChecked = resolveNavigationTarget(target, parentGateUnlockedUntil, now);
  const meta = SCREEN_DIRECTORY[gateChecked.screen];

  if (!meta) {
    return { screen: activeProfile ? ScreenId.Home : ScreenId.WelcomeStory };
  }

  if (meta.requiresProfile && !activeProfile) {
    return {
      screen: storySeen ? ScreenId.CreateProfile : ScreenId.WelcomeStory,
    };
  }

  if (activeProfile) {
    if (
      gateChecked.screen === ScreenId.WorldDetails ||
      gateChecked.screen === ScreenId.StageSelect ||
      gateChecked.screen === ScreenId.StarRestore
    ) {
      const worldId = gateChecked.params?.worldId;
      if (!worldId || !activeProfile.worldProgress[worldId]?.unlocked) {
        return { screen: ScreenId.WorldMap };
      }
    }

    if (gateChecked.screen === ScreenId.Gameplay) {
      const worldId = gateChecked.params?.worldId;
      const stageId = gateChecked.params?.stageId;
      if (!worldId || !stageId || !isStageUnlockedForProfile(activeProfile, worldId, stageId)) {
        if (worldId && activeProfile.worldProgress[worldId]?.unlocked) {
          return { screen: ScreenId.StageSelect, params: { worldId } };
        }
        return { screen: ScreenId.WorldMap };
      }
    }
  }

  return gateChecked;
}
