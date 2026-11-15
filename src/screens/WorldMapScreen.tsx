import React, { useState } from 'react';
import { CheckCircle2, Compass, Lock, Play, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { GameHeader } from '../components/layout/GameHeader';
import { countRestoredStars } from '../data/rewardsCatalog';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { ScreenId, WorldDefinition } from '../types/game';

export const WorldMapScreen: React.FC = () => {
  const { activeProfile, navigate } = useGameState();
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  if (!activeProfile) return null;

  const worlds = worldRegistry.getAll();
  const restoredCount = countRestoredStars(activeProfile);
  const currentActiveWorld =
    worlds.find(
      (w) =>
        activeProfile.worldProgress[w.id]?.unlocked &&
        !activeProfile.worldProgress[w.id]?.starRestored
    ) ?? worlds[0];

  const handleWorldClick = (world: WorldDefinition) => {
    const wp = activeProfile.worldProgress[world.id];
    if (!wp || !wp.unlocked) {
      audioManager.playSfx('gentle-try');
      const prevWorld = worlds.find((w) => w.order === world.order - 1);
      setLockedMessage(
        prevWorld
          ? `«${world.nameAr}» مقفل حالياً — يُفتح تلقائياً بعد استعادة نجمة «${prevWorld.nameAr}».`
          : `«${world.nameAr}» مقفل حالياً.`
      );
      return;
    }

    audioManager.playSfx('tap');
    setLockedMessage(null);
    navigate(ScreenId.WorldDetails, { worldId: world.id });
  };

  return (
    <div dir="rtl" data-testid="screen-world-map" className="min-h-screen bg-slate-50">
      <GameHeader titleAr="خريطة العوالم السبعة" showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  خريطة العوالم السبعة
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  استعد نجمة كل عالم لتفتح العالم التالي في مغامرة لولو ونونو.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-amber-900 tabular-nums">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              <span>النجوم المستعادة: {restoredCount} من 7</span>
            </div>
          </div>

          {lockedMessage && (
            <div
              role="status"
              data-testid="world-locked-notice"
              className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
            >
              {lockedMessage}
            </div>
          )}
        </section>

        <section aria-label="قائمة العوالم السبعة" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => {
            const wp = activeProfile.worldProgress[world.id];
            const unlocked = Boolean(wp?.unlocked);
            const starRestored = Boolean(wp?.starRestored);
            const isCurrent = unlocked && currentActiveWorld.id === world.id;
            const completedCount = wp?.completedStageIds.length ?? 0;
            const totalStages = world.stages.length;

            const statusLabel = starRestored
              ? 'مكتمل · النجمة مستعادة'
              : isCurrent
              ? 'العالم الحالي · مفتوح'
              : unlocked
              ? 'مفتوح للاستكشاف'
              : 'مقفل';

            return (
              <button
                key={world.id}
                type="button"
                data-testid={`world-card-${world.id}`}
                data-locked={!unlocked}
                onClick={() => handleWorldClick(world)}
                className={`flex flex-col justify-between rounded-3xl border p-5 text-right transition-colors ${
                  unlocked
                    ? isCurrent
                      ? 'border-teal-700 bg-white hover:bg-teal-50/40'
                      : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-slate-50'
                    : 'border-slate-200 bg-slate-100/80 text-slate-500 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-slate-500 tabular-nums">العالم {world.order}</span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        starRestored
                          ? 'text-emerald-700'
                          : unlocked
                          ? 'text-teal-800'
                          : 'text-slate-600'
                      }`}
                    >
                      {starRestored ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : unlocked ? (
                        <Play className="h-3.5 w-3.5 text-teal-700" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <h2 className="font-display mt-2.5 text-lg font-extrabold text-slate-900">
                    {world.nameAr}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{world.subtitleAr}</p>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-amber-800">
                      <Star
                        className={`h-4 w-4 ${
                          starRestored
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                      <span>{world.starNameAr}</span>
                    </span>
                    <span className="tabular-nums text-slate-600">
                      {completedCount} / {totalStages} مراحل
                    </span>
                  </div>

                  {!unlocked && (
                    <p className="text-xs font-medium text-amber-800">
                      السبب: استعد نجمة العالم {world.order - 1} أولاً
                    </p>
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
