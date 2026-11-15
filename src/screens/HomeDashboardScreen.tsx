import React, { useRef } from 'react';
import {
  Award,
  BookOpen,
  Coins,
  Compass,
  Play,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import {
  CharacterCanvas,
  CharacterStageHandle,
} from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { countRestoredStars } from '../data/rewardsCatalog';
import { getNextAvailableWorldAndStage } from '../navigation/screenRouter';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, ScreenId } from '../types/game';

export const HomeDashboardScreen: React.FC = () => {
  const { state, activeProfile, navigate } = useGameState();
  const stageRef = useRef<CharacterStageHandle | null>(null);

  if (!activeProfile) return null;

  const restoredStars = countRestoredStars(activeProfile);
  const progressPercent = Math.round((restoredStars / 7) * 100);
  const nextTarget = getNextAvailableWorldAndStage(activeProfile);

  const handleContinueAdventure = () => {
    audioManager.playSfx('star');
    navigate(ScreenId.WorldDetails, { worldId: nextTarget.worldId });
  };

  return (
    <div dir="rtl" data-testid="screen-home" className="min-h-screen bg-slate-50">
      <GameHeader titleAr="الشاشة الرئيسية" />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Hero Greeting + Live 3D Lulu & Nono Stage */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-teal-700">
                  مرحباً بعودتك إلى عالم المعرفة
                </p>
                <h1 className="font-display mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  أهلاً يا {activeProfile.name}!
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600">
                  لولو ونونو بانتظارك لمواصلة استعادة نجوم المعرفة السبع.
                </p>
              </div>

              {/* Real Child Stats Grid (Tabular Numerals) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">المستوى</div>
                  <div
                    data-testid="stat-level"
                    className="mt-1 font-display text-xl font-extrabold text-slate-900 tabular-nums"
                  >
                    {activeProfile.explorerLevel}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>النجوم</span>
                  </div>
                  <div
                    data-testid="stat-stars"
                    className="mt-1 font-display text-xl font-extrabold text-amber-950 tabular-nums"
                  >
                    {restoredStars} / 7
                  </div>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-teal-800">
                    <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                    <span>نقاط الخبرة XP</span>
                  </div>
                  <div
                    data-testid="stat-xp"
                    className="mt-1 font-display text-xl font-extrabold text-teal-950 tabular-nums"
                  >
                    {activeProfile.xp}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-white p-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span>العملات</span>
                  </div>
                  <div
                    data-testid="stat-coins"
                    className="mt-1 font-display text-xl font-extrabold text-slate-900 tabular-nums"
                  >
                    {activeProfile.coins}
                  </div>
                </div>
              </div>

              {/* 7 Stars Restoration Progress */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>التقدم في استعادة النجوم السبع</span>
                  <span className="tabular-nums text-teal-800">{progressPercent}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((idx) => {
                    const earned = idx <= restoredStars;
                    return (
                      <div
                        key={idx}
                        aria-label={earned ? `نجمة ${idx} مستعادة` : `نجمة ${idx} مفقودة`}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                          earned
                            ? 'border-amber-400 bg-amber-100 text-amber-600'
                            : 'border-slate-200 bg-white text-slate-300'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${earned ? 'fill-amber-400' : ''}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTA */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleContinueAdventure}
                  className="inline-flex min-h-13 flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-teal-700 px-8 py-3.5 font-display text-base font-extrabold text-white transition-colors hover:bg-teal-800"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>متابعة المغامرة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playSfx('tap');
                    navigate(ScreenId.WelcomeStory);
                  }}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <BookOpen className="h-4 w-4 text-teal-700" />
                  <span>إعادة مشاهدة القصة</span>
                </button>
              </div>
            </div>

            {/* Live 3D Lulu & Nono */}
            <div className="lg:col-span-6">
              <div className="h-[300px] sm:h-[380px] w-full">
                <CharacterCanvas
                  ref={stageRef}
                  viewMode="both"
                  lightingPreset="studioWarm"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Idle}
                  initialExpression={FacialExpression.Smile}
                  initialInteraction="welcomeChild"
                  allowOrbit={true}
                  minHeightClass="min-h-[300px]"
                  onCharacterTap={() => {
                    audioManager.playSfx('clap');
                    stageRef.current?.runInteraction('celebrateTogether');
                  }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                المس لولو ونونو ليلوّحا لك، أو اسحب لتدوير المنصة.
              </p>
            </div>
          </div>
        </section>

        {/* Big Action Navigation Cards */}
        <section aria-label="الأقسام الرئيسية" className="grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('tap');
              navigate(ScreenId.WorldMap);
            }}
            className="flex min-h-24 items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-right transition-colors hover:border-teal-600 hover:bg-teal-50/40"
          >
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">خريطة العوالم</h2>
              <p className="mt-0.5 text-xs text-slate-600">استكشف العوالم السبعة والنجوم المضيئة</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('tap');
              navigate(ScreenId.Rewards);
            }}
            className="flex min-h-24 items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-right transition-colors hover:border-amber-500 hover:bg-amber-50/40"
          >
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">المكافآت والأوسمة</h2>
              <p className="mt-0.5 text-xs text-slate-600">الأوسمة والعملات وأزياء لولو ونونو</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('tap');
              navigate(ScreenId.Profile);
            }}
            className="flex min-h-24 items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-right transition-colors hover:border-sky-500 hover:bg-sky-50/40"
          >
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">ملفي الشخصي</h2>
              <p className="mt-0.5 text-xs text-slate-600">بياناتك وإنجازاتك وتقدمك في كل عالم</p>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
};
