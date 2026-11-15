import React, { useEffect, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState } from '../types/game';

export const SplashScreen: React.FC = () => {
  const { state, getPostSplashDestination, replaceScreen } = useGameState();
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (!state.initialized) return;
    setProgress(85);
    const delayMs = state.settings.reducedMotion ? 600 : 1500;
    const readyTimer = window.setTimeout(() => {
      setProgress(100);
    }, Math.round(delayMs * 0.55));
    const navTimer = window.setTimeout(() => {
      const dest = getPostSplashDestination();
      replaceScreen(dest.screen, dest.params);
    }, delayMs);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(navTimer);
    };
  }, [state.initialized, state.settings.reducedMotion]);

  const handleContinueNow = () => {
    if (!state.initialized) return;
    audioManager.playSfx('tap');
    const dest = getPostSplashDestination();
    replaceScreen(dest.screen, dest.params);
  };

  return (
    <main
      dir="rtl"
      data-testid="screen-splash"
      className="min-h-screen bg-gradient-to-b from-sky-50 via-teal-50/40 to-amber-50/40 px-4 py-8 flex items-center justify-center"
    >
      <div className="animate-screen-enter mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 text-center lg:text-right space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>عالم تعليمي تفاعلي للأطفال 4–10 سنوات</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
                <Star className="h-8 w-8 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  مغامرات لولو ونونو
                </h1>
                <p className="font-display text-base font-bold text-teal-700">عالم المعرفة</p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              أهلاً بكم! نقوم الآن بتجهيز ملف المستكشف وإعداداتك المحلية للانطلاق في رحلة استعادة نجوم المعرفة السبع.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{state.initialized ? 'تم تحميل بياناتك المحلية بنجاح' : 'جارٍ التحميل من الذاكرة المحلية...'}</span>
                <span className="tabular-nums">{state.initialized ? `${progress}%` : '25%'}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-700 transition-all duration-500"
                  style={{ width: `${state.initialized ? progress : 25}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleContinueNow}
                disabled={!state.initialized}
                className="min-h-12 w-full sm:w-auto rounded-2xl bg-teal-700 px-8 py-3 font-display text-base font-bold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
              >
                هيا نبدأ!
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-[280px] sm:h-[340px] w-full">
              <CharacterCanvas
                viewMode="both"
                lightingPreset="sunnyMorning"
                qualityTier={state.settings.qualityTier}
                initialAnimation={CharacterAnimState.Encourage}
                initialExpression={FacialExpression.Smile}
                initialInteraction="welcomeChild"
                allowOrbit={false}
                minHeightClass="min-h-[280px]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
