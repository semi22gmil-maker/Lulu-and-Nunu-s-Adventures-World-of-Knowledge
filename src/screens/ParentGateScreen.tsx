import React, { useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { GameHeader } from '../components/layout/GameHeader';
import { useGameState } from '../state/gameStore';
import { ScreenId } from '../types/game';

interface MathChallenge {
  a: number;
  b: number;
  c: number;
  answer: number;
}

function generateChallenge(): MathChallenge {
  const a = 6 + Math.floor(Math.random() * 4); // 6..9
  const b = 4 + Math.floor(Math.random() * 5); // 4..8
  const c = 3 + Math.floor(Math.random() * 7); // 3..9
  return { a, b, c, answer: a * b + c };
}

export const ParentGateScreen: React.FC = () => {
  const { state, currentNav, activeProfile, unlockParentGate, replaceScreen, goBack } =
    useGameState();
  const hasCustomPin = Boolean(state.settings.parentPinHash);
  const [challenge, setChallenge] = useState<MathChallenge>(() => generateChallenge());
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const destination = currentNav.params?.redirectAfterGate ?? ScreenId.ParentDashboard;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();

    if (hasCustomPin) {
      if (trimmed === state.settings.parentPinHash) {
        audioManager.playSfx('success');
        unlockParentGate();
        replaceScreen(destination);
        return;
      }
      audioManager.playSfx('gentle-try');
      setInputVal('');
      setErrorMsg('رمز الوالدين غير صحيح، يرجى المحاولة مرة أخرى.');
      return;
    }

    const numeric = Number(trimmed);
    if (!trimmed || Number.isNaN(numeric) || numeric !== challenge.answer) {
      audioManager.playSfx('gentle-try');
      setInputVal('');
      setChallenge(generateChallenge());
      setErrorMsg('الإجابة غير صحيحة. هذه البوابة مخصصة للوالدين فقط.');
      return;
    }

    audioManager.playSfx('success');
    unlockParentGate();
    replaceScreen(destination);
  };

  return (
    <div dir="rtl" data-testid="screen-parent-gate" className="min-h-screen bg-slate-50">
      <GameHeader
        titleAr="بوابة الوالدين"
        showBack={true}
        onBack={() => {
          if (state.navStack.length > 1) goBack();
          else replaceScreen(activeProfile ? ScreenId.Home : ScreenId.WelcomeStory);
        }}
        showNavLinks={false}
        showParentButton={false}
      />

      <main className="animate-screen-enter mx-auto max-w-lg px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-slate-900">
                منطقة مخصصة للوالدين
              </h1>
              <p className="text-xs text-slate-600">
                يرجى إتمام التحقق التالي لحماية إعدادات الطفل وخصوصيته.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {hasCustomPin ? (
              <div>
                <label
                  htmlFor="parent-gate-input"
                  className="block font-display text-base font-bold text-slate-900 mb-2"
                >
                  أدخل رمز الوالدين السري (4 أرقام)
                </label>
                <input
                  id="parent-gate-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••"
                  className="min-h-13 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-center font-display text-xl font-extrabold tracking-widest text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-slate-700">
                    سؤال التحقق للبالغين:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('tap');
                      setChallenge(generateChallenge());
                      setInputVal('');
                      setErrorMsg(null);
                    }}
                    className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>تغيير السؤال</span>
                  </button>
                </div>

                <div
                  dir="ltr"
                  data-testid="parent-gate-question"
                  className="rounded-2xl border border-teal-200 bg-teal-50/70 py-4 text-center font-display text-2xl font-extrabold text-teal-950 tabular-nums"
                >
                  ({challenge.a} × {challenge.b}) + {challenge.c} = ?
                </div>

                <label htmlFor="parent-gate-input" className="sr-only">
                  أدخل الناتج الصحيح
                </label>
                <input
                  id="parent-gate-input"
                  type="number"
                  inputMode="numeric"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="أدخل الناتج الصحيح"
                  className="min-h-13 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-center font-display text-lg font-extrabold text-slate-900 tabular-nums focus:border-teal-700 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {errorMsg && (
              <p
                role="alert"
                data-testid="parent-gate-error"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              data-testid="parent-gate-submit"
              className="min-h-13 w-full rounded-2xl bg-teal-700 px-6 py-3.5 font-display text-base font-extrabold text-white transition-colors hover:bg-teal-800"
            >
              تأكيد ودخول لوحة الوالدين
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
