import React, { useEffect } from 'react';
import { Compass, Play, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, CharacterId, ScreenId } from '../types/game';

export const WorldDetailsScreen: React.FC = () => {
  const { state, currentNav, activeProfile, navigate, replaceScreen } = useGameState();
  const worldId = currentNav.params?.worldId;
  const world = worldId ? worldRegistry.getById(worldId) : undefined;
  const wp = world && activeProfile ? activeProfile.worldProgress[world.id] : undefined;

  useEffect(() => {
    if (!world || !wp || !wp.unlocked) {
      replaceScreen(ScreenId.WorldMap);
    }
  }, [world, wp, replaceScreen]);

  if (!activeProfile || !world || !wp || !wp.unlocked) return null;

  const completedCount = wp.completedStageIds.length;
  const totalStages = world.stages.length;
  const progressPct = Math.round((completedCount / Math.max(1, totalStages)) * 100);
  const companion = activeProfile.avatarCompanion === CharacterId.Nono ? 'nono' : 'lulu';

  return (
    <div dir="rtl" data-testid="screen-world-details" className="min-h-screen bg-slate-50">
      <GameHeader titleAr={world.nameAr} showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <Compass className="h-4 w-4" />
                <span>العالم {world.order} من 7</span>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {world.nameAr}
                </h1>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
                  {world.subtitleAr}. يرحب بك {companion === 'lulu' ? 'لولو' : 'نونو'} لاستكشاف المراحل واستعادة النجمة المضيئة!
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Star
                    className={`h-7 w-7 ${
                      wp.starRestored
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-amber-500'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-amber-900">النجمة المستهدفة</div>
                    <div className="font-display text-base font-extrabold text-slate-900">
                      {world.starNameAr}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900">
                  {wp.starRestored ? 'مستعادة' : 'بانتظار الاستعادة'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>تقدمك في هذا العالم</span>
                  <span className="tabular-nums">
                    {completedCount} من {totalStages} مراحل ({progressPct}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playSfx('star');
                    navigate(ScreenId.StageSelect, { worldId: world.id });
                  }}
                  className="inline-flex min-h-13 flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-teal-700 px-8 py-3.5 font-display text-base font-extrabold text-white hover:bg-teal-800"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>بدء المغامرة</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-[290px] sm:h-[360px] w-full">
                <CharacterCanvas
                  viewMode={companion}
                  lightingPreset="sunnyMorning"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Encourage}
                  initialExpression={FacialExpression.Encourage}
                  allowOrbit={true}
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
