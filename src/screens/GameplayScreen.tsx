import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Heart, HelpCircle } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import {
  CharacterCanvas,
  CharacterStageHandle,
} from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { buildStructuralStageSteps } from '../data/phase2Activities';
import { isStageUnlockedForProfile } from '../navigation/screenRouter';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, ScreenId } from '../types/game';

export const GameplayScreen: React.FC = () => {
  const {
    state,
    currentNav,
    activeProfile,
    replaceScreen,
    recordAttemptAndAdapt,
    completeStageRun,
  } = useGameState();
  const stageRef = useRef<CharacterStageHandle | null>(null);

  const worldId = currentNav.params?.worldId;
  const stageId = currentNav.params?.stageId;
  const world = worldId ? worldRegistry.getById(worldId) : undefined;
  const stage = world?.stages.find((s) => s.id === stageId);
  const canPlay =
    Boolean(activeProfile && world && stage) &&
    isStageUnlockedForProfile(activeProfile!, world!.id, stage!.id);

  const [stepIdx, setStepIdx] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; textAr: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const stepStartedRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!canPlay) {
      replaceScreen(ScreenId.WorldMap);
    }
  }, [canPlay, replaceScreen]);

  if (!activeProfile || !world || !stage || !canPlay) return null;

  const steps = buildStructuralStageSteps(world, stage);
  const currentStep = steps[stepIdx];
  const progressPct = Math.round(((stepIdx + 1) / steps.length) * 100);

  const handleOptionSelect = async (isCorrect: boolean) => {
    if (busy) return;
    setBusy(true);
    const stepDurationMs = Math.max(250, Date.now() - stepStartedRef.current);

    await recordAttemptAndAdapt({
      worldId: world.id,
      stageId: stage.id,
      skill: stage.targetSkill,
      success: isCorrect,
      hintsUsed: 0,
      durationMs: stepDurationMs,
      difficulty: activeProfile.worldProgress[world.id].currentDifficulty,
    });

    if (isCorrect) {
      audioManager.playSfx('success');
      stageRef.current?.playAnimation('both', CharacterAnimState.Clap, false);
      stageRef.current?.setExpression('both', FacialExpression.Laugh);
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setFeedback({ ok: true, textAr: 'أحسنت! استجابة ممتازة وتشجيع من لولو ونونو.' });

      window.setTimeout(async () => {
        if (stepIdx < steps.length - 1) {
          setStepIdx((prev) => prev + 1);
          stepStartedRef.current = Date.now();
          setFeedback(null);
          setBusy(false);
          stageRef.current?.playAnimation('both', CharacterAnimState.Think, true);
          stageRef.current?.setExpression('both', FacialExpression.Focus);
        } else {
          const durationSec = Math.max(2, Math.round((Date.now() - startedAtRef.current) / 1000));
          await completeStageRun(world.id, stage.id, nextCorrect, steps.length, durationSec);
          replaceScreen(ScreenId.Victory, { worldId: world.id, stageId: stage.id });
        }
      }, state.settings.reducedMotion ? 150 : 450);
    } else {
      audioManager.playSfx('gentle-try');
      stageRef.current?.playAnimation('both', CharacterAnimState.Encourage, false);
      stageRef.current?.setExpression('both', FacialExpression.Encourage);
      setAttemptsLeft((prev) => Math.max(1, prev - 1));
      setFeedback({
        ok: false,
        textAr: 'محاولة لطيفة! تشجعك لولو على اختيار الخيار الصحيح للمتابعة.',
      });
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" data-testid="screen-gameplay" className="min-h-screen bg-slate-50">
      <GameHeader titleAr={`${world.nameAr} · ${stage.titleAr}`} showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
        {/* Progress & Attempts Bar */}
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>
                  الخطوة {stepIdx + 1} من {steps.length}
                </span>
                <span className="tabular-nums text-teal-800">{progressPct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-700 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 tabular-nums">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>المحاولات المتبقية: {attemptsLeft}</span>
            </div>
          </div>
        </section>

        {/* Two-Column Gameplay Area: Activity Deck + Live 3D Companions */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Question & Touch Options Zone */}
          <section className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <HelpCircle className="h-4 w-4" />
                <span>واجهة النشاط التفاعلي — {stage.titleAr}</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentStep.promptAr}
              </h1>
              <p className="text-sm text-slate-600">{currentStep.helperAr}</p>
            </div>

            <div className="grid gap-3">
              {currentStep.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={busy}
                  data-testid={`gameplay-option-${opt.id}`}
                  onClick={() => handleOptionSelect(opt.isCorrect)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-right font-display text-base font-bold text-slate-900 transition-colors hover:border-teal-700 hover:bg-teal-50 disabled:opacity-60"
                >
                  <span>{opt.labelAr}</span>
                  <CheckCircle2 className="h-5 w-5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {feedback && (
              <div
                role="status"
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  feedback.ok
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}
              >
                {feedback.textAr}
              </div>
            )}
          </section>

          {/* 3D Encouraging Companions */}
          <aside className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>لولو ونونو يشجعانك</span>
              <span className="text-teal-700">تفاعل مباشر</span>
            </div>
            <div className="h-[260px] sm:h-[320px] w-full">
              <CharacterCanvas
                ref={stageRef}
                viewMode="both"
                lightingPreset="studioWarm"
                qualityTier={state.settings.qualityTier}
                initialAnimation={CharacterAnimState.Think}
                initialExpression={FacialExpression.Focus}
                allowOrbit={false}
                minHeightClass="min-h-[260px]"
              />
            </div>
            <p className="text-center text-xs text-slate-500">
              هيكل واجهة اللعب جاهز؛ المحتوى التفصيلي لكل عالم يُضاف في المراحل 3–9.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};
