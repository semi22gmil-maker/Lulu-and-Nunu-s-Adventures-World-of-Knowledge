import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Play, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { GameHeader } from '../components/layout/GameHeader';
import { isStageUnlockedForProfile } from '../navigation/screenRouter';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { ScreenId, StageMetadata } from '../types/game';

export const StageSelectScreen: React.FC = () => {
  const { currentNav, activeProfile, navigate, replaceScreen } = useGameState();
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const worldId = currentNav.params?.worldId;
  const world = worldId ? worldRegistry.getById(worldId) : undefined;
  const wp = world && activeProfile ? activeProfile.worldProgress[world.id] : undefined;

  useEffect(() => {
    if (!world || !wp || !wp.unlocked) {
      replaceScreen(ScreenId.WorldMap);
    }
  }, [world, wp, replaceScreen]);

  if (!activeProfile || !world || !wp || !wp.unlocked) return null;

  const allCompleted = world.stages.every((s) => wp.completedStageIds.includes(s.id));

  const handleStageSelect = (stage: StageMetadata) => {
    const unlocked = isStageUnlockedForProfile(activeProfile, world.id, stage.id);
    if (!unlocked) {
      audioManager.playSfx('gentle-try');
      setLockedNotice(
        `المرحلة «${stage.titleAr}» مقفلة حالياً — أكمل المرحلة السابقة أولاً لفتحها.`
      );
      return;
    }
    audioManager.playSfx('tap');
    setLockedNotice(null);
    navigate(ScreenId.Gameplay, { worldId: world.id, stageId: stage.id });
  };

  return (
    <div dir="rtl" data-testid="screen-stage-select" className="min-h-screen bg-slate-50">
      <GameHeader titleAr={`مراحل ${world.nameAr}`} showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                اختر المرحلة في {world.nameAr}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                أكمل جميع المراحل بالتتابع لاستعادة {world.starNameAr}.
              </p>
            </div>

            {allCompleted && !wp.starRestored && (
              <button
                type="button"
                onClick={() => {
                  audioManager.playSfx('star');
                  navigate(ScreenId.StarRestore, { worldId: world.id });
                }}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 font-display text-sm font-extrabold text-slate-950 hover:bg-amber-400"
              >
                <Star className="h-4 w-4 fill-current" />
                <span>استعادة {world.starNameAr} الآن!</span>
              </button>
            )}
          </div>

          {lockedNotice && (
            <div
              role="status"
              data-testid="stage-locked-notice"
              className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
            >
              {lockedNotice}
            </div>
          )}
        </section>

        <section aria-label="المراحل" className="grid gap-4 sm:grid-cols-2">
          {world.stages.map((stage) => {
            const completed = wp.completedStageIds.includes(stage.id);
            const unlocked = isStageUnlockedForProfile(activeProfile, world.id, stage.id);

            const statusText = completed
              ? 'مكتملة'
              : unlocked
              ? 'متاحة للعب'
              : `مقفلة · تتطلب المرحلة ${stage.order - 1}`;

            return (
              <button
                key={stage.id}
                type="button"
                data-testid={`stage-card-${stage.id}`}
                aria-disabled={!unlocked}
                onClick={() => handleStageSelect(stage)}
                className={`flex items-center justify-between gap-4 rounded-3xl border p-5 text-right transition-colors ${
                  completed
                    ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50'
                    : unlocked
                    ? 'border-teal-700 bg-white hover:bg-teal-50/40'
                    : 'border-slate-200 bg-slate-100/80 text-slate-500 hover:border-amber-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="tabular-nums text-slate-500">المرحلة {stage.order}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        completed
                          ? 'text-emerald-700'
                          : unlocked
                          ? 'text-teal-800'
                          : 'text-slate-600'
                      }
                    >
                      {statusText}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    {stage.titleAr}
                  </h2>
                  <p className="text-xs text-slate-600">{stage.descriptionAr}</p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : unlocked
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : unlocked ? (
                    <Play className="h-5 w-5 fill-current" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};
