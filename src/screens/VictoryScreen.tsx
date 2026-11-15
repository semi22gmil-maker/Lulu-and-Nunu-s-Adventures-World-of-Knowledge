import React, { useEffect } from 'react';
import { Award, Coins, RotateCcw, Sparkles, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { CelebrationBurst } from '../components/ui/CelebrationBurst';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, ScreenId } from '../types/game';

export const VictoryScreen: React.FC = () => {
  const { state, activeProfile, currentNav, goBack, navigate, replaceScreen } = useGameState();
  const run = state.lastStageRun;
  const fallbackWorldId = currentNav.params?.worldId ?? run?.worldId;
  const fallbackStageId = currentNav.params?.stageId ?? run?.stageId;
  const world = fallbackWorldId ? worldRegistry.getById(fallbackWorldId) : undefined;

  useEffect(() => {
    if (!run || !activeProfile) {
      replaceScreen(ScreenId.Home);
      return;
    }
    audioManager.playSfx('star');
    audioManager.playVoiceClip('nono_celebrate_01');
  }, []);

  if (!run || !activeProfile || !world) return null;

  const accuracy = Math.min(100, Math.round((run.correctCount / Math.max(1, run.totalSteps)) * 100));

  const handleContinue = () => {
    audioManager.playSfx('tap');
    const prevEntry = state.navStack[state.navStack.length - 2];
    if (prevEntry?.screen === ScreenId.StageSelect && prevEntry.params?.worldId === world.id) {
      goBack();
    } else {
      navigate(ScreenId.StageSelect, { worldId: world.id });
    }
  };

  return (
    <div dir="rtl" data-testid="screen-victory" className="min-h-screen bg-slate-50">
      <GameHeader titleAr="إنجاز رائع!" showBack={false} />

      <main className="animate-screen-enter mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <section className="relative rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 overflow-hidden">
          <CelebrationBurst tone="gold" />

          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <Award className="h-4 w-4" />
                <span>أكملت المرحلة بنجاح!</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                أحسنت يا {activeProfile.name}!
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                أنهيت «{run.stageTitleAr}» في {world.nameAr} وشاركت لولو ونونو فرحة الفوز.
              </p>

              {/* Real Earned Run Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <div className="text-xs font-semibold text-slate-500">الدقة</div>
                  <div className="mt-1 font-display text-xl font-extrabold text-slate-900 tabular-nums">
                    {accuracy}%
                  </div>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold text-teal-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>XP مكتسب</span>
                  </div>
                  <div className="mt-1 font-display text-xl font-extrabold text-teal-950 tabular-nums">
                    +{run.xpEarned}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-800">
                    <Coins className="h-3.5 w-3.5" />
                    <span>عملات</span>
                  </div>
                  <div className="mt-1 font-display text-xl font-extrabold text-amber-950 tabular-nums">
                    +{run.coinsEarned}
                  </div>
                </div>
              </div>

              {run.newlyUnlockedBadges.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
                  أوسمة جديدة مفتوحة: {run.newlyUnlockedBadges.join(' · ')}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {run.eligibleForStarRestore ? (
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('star');
                      replaceScreen(ScreenId.StarRestore, { worldId: world.id });
                    }}
                    className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 font-display text-base font-extrabold text-slate-950 hover:bg-amber-400"
                  >
                    <Star className="h-5 w-5 fill-current" />
                    <span>استعادة {world.starNameAr}!</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-3.5 font-display text-base font-extrabold text-white hover:bg-teal-800"
                  >
                    <span>متابعة المغامرة</span>
                  </button>
                )}

                {fallbackStageId && (
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('tap');
                      replaceScreen(ScreenId.Gameplay, {
                        worldId: world.id,
                        stageId: fallbackStageId,
                      });
                    }}
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>إعادة المحاولة</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-[290px] sm:h-[360px] w-full">
                <CharacterCanvas
                  viewMode="both"
                  lightingPreset="sunnyMorning"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Celebrate}
                  initialExpression={FacialExpression.Laugh}
                  initialInteraction="celebrateTogether"
                  allowOrbit={false}
                  minHeightClass="min-h-[290px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
