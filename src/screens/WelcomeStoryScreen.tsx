import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import {
  CharacterCanvas,
  CharacterStageHandle,
} from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { DualInteractionId, FacialExpression } from '../characters/shared/CharacterTypes';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, CharacterId, ScreenId } from '../types/game';

interface StoryBeat {
  titleAr: string;
  speakerNameAr: string;
  dialogueAr: string;
  clipId: string;
  speaker: CharacterId;
  interaction: DualInteractionId;
  expression: FacialExpression;
}

const STORY_BEATS: StoryBeat[] = [
  {
    titleAr: 'لغز اختفاء النجوم السبع',
    speakerNameAr: 'لولو الأرنبة الذكية',
    dialogueAr:
      'أهلاً يا صديقي! بالأمس اختفت نجوم المعرفة السبع المضيئة وتناثرت في سبعة عوالم مليئة بالمغامرة والمرح.',
    clipId: 'story_lost_stars',
    speaker: CharacterId.Lulu,
    interaction: 'luluWelcomesNono',
    expression: FacialExpression.Surprise,
  },
  {
    titleAr: 'مهمة لولو ونونو',
    speakerNameAr: 'نونو الدب المرح',
    dialogueAr:
      'لا تقلق أبداً! سنسافر معاً عبر عالم الحروف والأرقام والحيوانات والعلوم والألغاز والإنجليزية والفن لنعيد كل نجمة!',
    clipId: 'story_nono_ready',
    speaker: CharacterId.Nono,
    interaction: 'nonoWavesToLulu',
    expression: FacialExpression.Encourage,
  },
  {
    titleAr: 'أنت بطل هذه المغامرة',
    speakerNameAr: 'لولو ونونو معاً',
    dialogueAr:
      'كل مرحلة تنجح فيها تمنحك نقاط خبرة وعملات وأوسمة، وعند إتمام كل عالم تضيء نجمته من جديد!',
    clipId: 'lulu_welcome_01',
    speaker: CharacterId.Lulu,
    interaction: 'celebrateTogether',
    expression: FacialExpression.Laugh,
  },
];

export const WelcomeStoryScreen: React.FC = () => {
  const { state, activeProfile, markStorySeen, replaceScreen, resetNav } = useGameState();
  const [step, setStep] = useState(0);
  const [caption, setCaption] = useState<string | null>(null);
  const stageRef = useRef<CharacterStageHandle | null>(null);
  const beat = STORY_BEATS[step];

  useEffect(() => {
    const unsub = audioManager.subscribeLipSync((_speaker, _amp, text) => {
      setCaption(text);
    });
    return unsub;
  }, []);

  useEffect(() => {
    stageRef.current?.runInteraction(beat.interaction);
    stageRef.current?.setExpression('both', beat.expression);
    audioManager.playVoiceClip(beat.clipId);
  }, [step]);

  const finishStory = () => {
    audioManager.playSfx('star');
    audioManager.stopVoice();
    markStorySeen();
    if (activeProfile) {
      resetNav(ScreenId.Home);
    } else {
      replaceScreen(ScreenId.CreateProfile);
    }
  };

  return (
    <div dir="rtl" data-testid="screen-welcome-story" className="min-h-screen bg-slate-50">
      <GameHeader
        titleAr="قصة المغامرة"
        showBack={Boolean(activeProfile)}
        showNavLinks={false}
        showParentButton={false}
      />

      <main className="animate-screen-enter mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-teal-700" />
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                {beat.titleAr}
              </h1>
            </div>

            <button
              type="button"
              onClick={finishStory}
              className="min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              تخطي القصة
            </button>
          </div>

          <div className="mt-5 grid items-center gap-6 lg:grid-cols-12">
            {/* 3D Character Stage */}
            <div className="lg:col-span-6">
              <div className="relative h-[290px] sm:h-[360px] w-full">
                <CharacterCanvas
                  ref={stageRef}
                  viewMode="both"
                  lightingPreset="studioWarm"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Encourage}
                  initialExpression={beat.expression}
                  initialInteraction={beat.interaction}
                  allowOrbit={false}
                  minHeightClass="min-h-[290px]"
                  onCharacterTap={() => {
                    audioManager.playSfx('tap');
                    stageRef.current?.runInteraction('welcomeChild');
                  }}
                />
                {caption && (
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-center text-xs font-semibold text-slate-800 shadow-sm">
                    {caption}
                  </div>
                )}
              </div>
            </div>

            {/* Dialogue & Story Navigation */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>{beat.speakerNameAr}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums text-slate-500">
                    المشهد {step + 1} من {STORY_BEATS.length}
                  </span>
                </div>

                <p className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 font-body text-base sm:text-lg leading-relaxed text-slate-800">
                  «{beat.dialogueAr}»
                </p>

                {/* 7 Missing Stars Visual Strip */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2.5">
                    نجوم المعرفة السبع المنتظرة في رحلتنا:
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <div
                        key={num}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-500"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            step === 2 && num === 1
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-amber-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => {
                    audioManager.playSfx('tap');
                    setStep((s) => Math.max(0, s - 1));
                  }}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span>السابق</span>
                </button>

                {step < STORY_BEATS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('tap');
                      setStep((s) => Math.min(STORY_BEATS.length - 1, s + 1));
                    }}
                    className="inline-flex min-h-12 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-2xl bg-teal-700 px-8 py-3 font-display text-base font-bold text-white hover:bg-teal-800"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishStory}
                    className="inline-flex min-h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3 font-display text-base font-bold text-slate-950 hover:bg-amber-400"
                  >
                    <span>{activeProfile ? 'العودة إلى الرئيسية' : 'ابدأ المغامرة'}</span>
                    <Sparkles className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
