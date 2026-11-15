import React, { useState } from 'react';
import { Award, CheckCircle2, Coins, Lock, Sparkles, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { GameHeader } from '../components/layout/GameHeader';
import { CelebrationBurst } from '../components/ui/CelebrationBurst';
import {
  BADGE_CATALOG,
  countRestoredStars,
  OUTFIT_CATALOG,
} from '../data/rewardsCatalog';
import { useGameState } from '../state/gameStore';
import { CharacterId } from '../types/game';

export const RewardsScreen: React.FC = () => {
  const { activeProfile, unlockOutfit, equipOutfit } = useGameState();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  if (!activeProfile) return null;

  const restoredStars = countRestoredStars(activeProfile);
  const earnedBadgesSet = new Set(activeProfile.unlockedBadges);

  const handleOutfitAction = async (outfitId: string, character: CharacterId | 'both') => {
    const isUnlocked = activeProfile.unlockedOutfits.includes(outfitId);
    if (!isUnlocked) {
      const res = await unlockOutfit(outfitId);
      if (!res.ok) {
        audioManager.playSfx('gentle-try');
        setCelebrating(false);
        setFeedback({ ok: false, msg: res.reasonAr ?? 'لا يزال هذا العنصر مقفلاً.' });
        return;
      }
      audioManager.playSfx('star');
      setCelebrating(true);
      setFeedback({ ok: true, msg: 'مبارك! تم فتح المكافأة بنجاح!' });
      return;
    }

    if (character === 'both') {
      await equipOutfit(CharacterId.Lulu, outfitId);
      await equipOutfit(CharacterId.Nono, outfitId);
    } else {
      await equipOutfit(character, outfitId);
    }
    audioManager.playSfx('coin');
    setCelebrating(true);
    setFeedback({ ok: true, msg: 'تم تجهيز الزي بنجاح لبطل المغامرة!' });
  };

  return (
    <div dir="rtl" data-testid="screen-rewards" className="min-h-screen bg-slate-50">
      <GameHeader titleAr="المكافآت والأوسمة" showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Top Real Earnings Summary */}
        <section className="relative rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 overflow-hidden">
          {celebrating && <CelebrationBurst tone="gold" />}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  مكافآت {activeProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  كل النجوم والعملات والأوسمة المعروضة محفوظة من تقدمك الفعلي.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm font-bold tabular-nums">
              <span className="inline-flex items-center gap-1.5 text-amber-900">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                <span>{restoredStars} / 7 نجوم</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-900">
                <Coins className="h-5 w-5 text-amber-500" />
                <span>{activeProfile.coins} عملة</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-teal-800">
                <Sparkles className="h-5 w-5 text-teal-700" />
                <span>{earnedBadgesSet.size} / {BADGE_CATALOG.length} أوسمة</span>
              </span>
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              className={`relative z-10 mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                feedback.ok
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
            >
              {feedback.msg}
            </div>
          )}
        </section>

        {/* Badges Grid (Unlocked vs Locked with explicit requirements) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-extrabold text-slate-900">الأوسمة والإنجازات</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BADGE_CATALOG.map((badge) => {
              const unlocked = earnedBadgesSet.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    unlocked
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className={unlocked ? 'text-emerald-800' : 'text-slate-600'}>
                      {unlocked ? 'مكتسب' : 'لم يُفتح بعد'}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <h3 className="font-display text-base font-extrabold text-slate-900">
                    {badge.titleAr}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {unlocked ? badge.descriptionAr : badge.unlockHintAr}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Outfits & Companion Gear */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-extrabold text-slate-900">
            الأزياء والأدوات للولو ونونو
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {OUTFIT_CATALOG.map((outfit) => {
              const unlocked = activeProfile.unlockedOutfits.includes(outfit.id);
              const equipped =
                outfit.character === 'both'
                  ? activeProfile.equippedOutfits[CharacterId.Lulu] === outfit.id &&
                    activeProfile.equippedOutfits[CharacterId.Nono] === outfit.id
                  : activeProfile.equippedOutfits[outfit.character] === outfit.id;

              const targetLabel =
                outfit.character === 'both'
                  ? 'للولو ونونو'
                  : outfit.character === CharacterId.Lulu
                  ? 'خاص بلولو'
                  : 'خاص بنونو';

              return (
                <div
                  key={outfit.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 space-y-4 ${
                    unlocked ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-teal-800">{targetLabel}</span>
                      <span className="tabular-nums text-slate-600">
                        {unlocked
                          ? equipped
                            ? 'مُجهّز حالياً'
                            : 'مفتوح'
                          : `${outfit.costCoins} عملة · ${outfit.requiredStars} نجمة`}
                      </span>
                    </div>
                    <h3 className="font-display mt-1.5 text-base font-extrabold text-slate-900">
                      {outfit.titleAr}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">{outfit.descriptionAr}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOutfitAction(outfit.id, outfit.character)}
                    className={`min-h-11 w-full rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                      equipped
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                        : unlocked
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'border border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                    }`}
                  >
                    {equipped
                      ? 'مُفعّل حالياً'
                      : unlocked
                      ? 'تجهيز هذا الزي'
                      : `فتح مقابل ${outfit.costCoins} عملة`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
