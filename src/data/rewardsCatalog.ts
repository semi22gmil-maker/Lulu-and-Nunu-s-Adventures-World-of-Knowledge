import { CharacterId, ChildProfile, WorldId } from '../types/game';

export interface BadgeDefinition {
  id: string;
  titleAr: string;
  descriptionAr: string;
  unlockHintAr: string;
  checkUnlocked: (profile: ChildProfile) => boolean;
}

export interface OutfitDefinition {
  id: string;
  titleAr: string;
  character: CharacterId | 'both';
  descriptionAr: string;
  costCoins: number;
  requiredStars: number;
}

export function countRestoredStars(profile: ChildProfile): number {
  return Object.values(profile.worldProgress).filter((w) => w.starRestored).length;
}

export function countCompletedStages(profile: ChildProfile): number {
  return Object.values(profile.worldProgress).reduce(
    (sum, w) => sum + w.completedStageIds.length,
    0
  );
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'badge-first-explorer',
    titleAr: 'مستكشف المعرفة',
    descriptionAr: 'انضممت إلى لولو ونونو وبدأت رحلة البحث عن النجوم.',
    unlockHintAr: 'يُفتح تلقائياً عند إنشاء ملفك الشخصي.',
    checkUnlocked: () => true,
  },
  {
    id: 'badge-first-stage',
    titleAr: 'أول خطوة ناجحة',
    descriptionAr: 'أكملت أول مرحلة تعليمية بنجاح!',
    unlockHintAr: 'أكمل مرحلة واحدة في أي عالم.',
    checkUnlocked: (p) => countCompletedStages(p) >= 1,
  },
  {
    id: 'badge-coin-collector',
    titleAr: 'جامع العملات الذهبية',
    descriptionAr: 'جمعت 50 عملة أو أكثر بفضل اجتهادك.',
    unlockHintAr: 'اجمع 50 عملة ذهبية من إكمال المراحل.',
    checkUnlocked: (p) => p.coins >= 50,
  },
  {
    id: 'badge-star-savior',
    titleAr: 'منقذ أول نجمة',
    descriptionAr: 'أعدت أول نجمة معرفة إلى سماء العوالم السبعة!',
    unlockHintAr: 'أكمل جميع مراحل أحد العوالم واستعد نجمته.',
    checkUnlocked: (p) => countRestoredStars(p) >= 1,
  },
  {
    id: 'badge-arabic-champion',
    titleAr: 'بطل نجمة البيان',
    descriptionAr: 'استعدت نجمة عالم الحروف العربية كاملة.',
    unlockHintAr: 'استعد نجمة عالم الحروف العربية.',
    checkUnlocked: (p) => Boolean(p.worldProgress[WorldId.ArabicLetters]?.starRestored),
  },
  {
    id: 'badge-star-guardian',
    titleAr: 'حارس النجوم السبع',
    descriptionAr: 'استعدت جميع نجوم المعرفة السبع وأعدت النور لكل العوالم!',
    unlockHintAr: 'استعد جميع النجوم السبع في خريطة العوالم.',
    checkUnlocked: (p) => countRestoredStars(p) >= 7,
  },
];

export const OUTFIT_CATALOG: OutfitDefinition[] = [
  {
    id: 'explorer-default',
    titleAr: 'زي المستكشف الأساسي',
    character: 'both',
    descriptionAr: 'الزي الافتراضي المريح للولو ونونو في بداية المغامرة.',
    costCoins: 0,
    requiredStars: 0,
  },
  {
    id: 'star-scarf',
    titleAr: 'وشاح النجمة الذهبية',
    character: CharacterId.Lulu,
    descriptionAr: 'وشاح متلألئ يعكس ذكاء لولو في عالم الحروف.',
    costCoins: 25,
    requiredStars: 0,
  },
  {
    id: 'adventure-backpack',
    titleAr: 'حقيبة المستكشف المضيئة',
    character: CharacterId.Nono,
    descriptionAr: 'حقيبة ظهر جديدة مجهزة لأدوات نونو الاستكشافية.',
    costCoins: 30,
    requiredStars: 0,
  },
  {
    id: 'knowledge-crown',
    titleAr: 'تاج المعرفة اللامع',
    character: 'both',
    descriptionAr: 'تاج احتفالي مميز يُفتح بعد استعادة نجمة معرفة واحدة.',
    costCoins: 60,
    requiredStars: 1,
  },
];

export function evaluateUnlockedBadges(profile: ChildProfile): string[] {
  const earned = new Set(profile.unlockedBadges);
  for (const badge of BADGE_CATALOG) {
    if (badge.checkUnlocked(profile)) {
      earned.add(badge.id);
    }
  }
  return Array.from(earned);
}
