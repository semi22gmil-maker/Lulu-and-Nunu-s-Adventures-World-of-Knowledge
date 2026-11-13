import { NavEntry, ScreenId } from '../types/game';

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
