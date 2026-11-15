import React, { useEffect, useState } from 'react';
import { Compass, Home, Sparkles, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { CelebrationBurst } from '../components/ui/CelebrationBurst';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { countRestoredStars } from '../data/rewardsCatalog';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, ScreenId, WorldId } from '../types/game';

export const StarRestoreScreen: React.FC = () => {
  const { state, currentNav, activeProfile, restoreWorldStar, resetNav, replaceScreen } =
    useGameState();
  const worldId = currentNav.params?.worldId;
  const world = worldId ? worldRegistry.getById(worldId) : undefined;
  const [unlockedNextWorld, setUnlockedNextWorld] = useState<WorldId | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!world || !activeProfile) {
      replaceScreen(ScreenId.WorldMap);
      return;
    }
    let mounted = true;
    restoreWorldStar(world.id).then((res) => {
      if (!mounted) return;
      setUnlockedNextWorld(res.nextWorldUnlocked);
      setNewBadges(res.newBadges);
      audioManager.playSfx('star');
      audioManager.playVoiceClip('star_restored_celebration');
    });
    return () => {
      mounted = false;
    };
  }, [world?.id]);

  if (!activeProfile || !world) return null;

  const restoredTotal = countRestoredStars(activeProfile);
  const nextWorldDef = unlockedNextWorld ? worldRegistry.getById(unlockedNextWorld) : null;

  return (
    <div dir="rtl" data-testid="screen-star-restore" className="min-h-screen bg-slate-50">
      <GameHeader titleAr={`استعادة ${world.starNameAr}`} showBack={false} />

      <main className="animate-screen-enter mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <section className="relative rounded-3xl border border-amber-300 bg-white p-6 sm:p-8 overflow-hidden">
          <CelebrationBurst tone="gold" />

          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                  <Star className="h-8 w-8 fill-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800">لحظة إنجاز عظيمة</p>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                    تمت استعادة {world.starNameAr}!
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                أضأت سماء «{world.nameAr}» يا {activeProfile.name}! مجموع النجوم المستعادة الآن{' '}
                <strong className="text-amber-900 tabular-nums">{restoredTotal} من 7</strong>.
              </p>

              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 space-y-1.5 text-sm font-semibold text-teal-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-700" />
                  <span>مكافأة استعادة النجمة: +50 XP و +25 عملة ذهبية</span>
                </div>
                {nextWorldDef && (
                  <p className="text-xs font-bold text-emerald-800">
                    تم فتح عالم جديد على الخريطة: {nextWorldDef.nameAr}!
                  </p>
                )}
                {newBadges.length > 0 && (
                  <p className="text-xs font-bold text-amber-900">
                    أوسمة جديدة: {newBadges.join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playSfx('tap');
                    resetNav(ScreenId.WorldMap);
                  }}
                  className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-3.5 font-display text-base font-extrabold text-white hover:bg-teal-800"
                >
                  <Compass className="h-5 w-5" />
                  <span>الانتقال لخريطة العوالم</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioManager.playSfx('tap');
                    resetNav(ScreenId.Home);
                  }}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" />
                  <span>الرئيسية</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-[300px] sm:h-[370px] w-full">
                <CharacterCanvas
                  viewMode="both"
                  lightingPreset="sunnyMorning"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Dance}
                  initialExpression={FacialExpression.Laugh}
                  initialInteraction="celebrateTogether"
                  allowOrbit={true}
                  minHeightClass="min-h-[300px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
