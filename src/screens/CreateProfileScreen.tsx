import React, { useState } from 'react';
import { Check, Sparkles, UserPlus } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, CharacterId, DifficultyLevel, ScreenId } from '../types/game';

const TARGET_AGES = [4, 5, 6, 7, 8, 9, 10] as const;

const DIFFICULTY_OPTIONS: Array<{
  id: DifficultyLevel;
  labelAr: string;
  hintAr: string;
}> = [
  { id: DifficultyLevel.Beginner, labelAr: 'مبتدئ', hintAr: 'خطوات بسيطة ومناسبة للبداية' },
  { id: DifficultyLevel.Intermediate, labelAr: 'متوسط', hintAr: 'تحديات متوازنة' },
  { id: DifficultyLevel.Advanced, labelAr: 'متقدم', hintAr: 'أسئلة أكثر تشويقاً' },
];

export const CreateProfileScreen: React.FC = () => {
  const { state, activeProfile, createProfile, resetNav } = useGameState();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [companion, setCompanion] = useState<CharacterId>(CharacterId.Lulu);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Beginner);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = name.trim().replace(/\s+/g, ' ');
    if (cleaned.length < 2) {
      audioManager.playSfx('gentle-try');
      setErrorMsg('يرجى كتابة اسم مستعار من حرفين على الأقل ليظهر في ترحيب لولو ونونو.');
      return;
    }
    if (cleaned.length > 20) {
      audioManager.playSfx('gentle-try');
      setErrorMsg('يفضّل أن يكون الاسم المستعار 20 حرفاً أو أقل.');
      return;
    }

    setErrorMsg(null);
    setSaving(true);
    try {
      await createProfile(cleaned, age, companion, difficulty);
      audioManager.playSfx('star');
      resetNav(ScreenId.Home);
    } catch {
      setErrorMsg('حدث تعذر بسيط أثناء الحفظ المحلي، حاول مرة أخرى.');
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" data-testid="screen-create-profile" className="min-h-screen bg-slate-50">
      <GameHeader
        titleAr="إنشاء ملف البطل"
        showBack={Boolean(activeProfile)}
        showNavLinks={false}
        showParentButton={false}
      />

      <main className="animate-screen-enter mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Live 3D Companion Preview */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                رفيقك المختار: {companion === CharacterId.Lulu ? 'لولو' : 'نونو'}
              </h2>
              <span className="text-xs font-semibold text-teal-700">معاينة ثلاثية الأبعاد</span>
            </div>

            <div className="h-[290px] sm:h-[340px] w-full">
              <CharacterCanvas
                viewMode={companion === CharacterId.Lulu ? 'lulu' : 'nono'}
                lightingPreset="sunnyMorning"
                qualityTier={state.settings.qualityTier}
                initialAnimation={CharacterAnimState.Encourage}
                initialExpression={FacialExpression.Smile}
                allowOrbit={true}
                minHeightClass="min-h-[290px]"
              />
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              يُحفظ ملفك محلياً على جهازك فقط دون طلب أي بيانات شخصية حساسة.
            </p>
          </div>

          {/* Child-friendly Profile Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 space-y-6"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <UserPlus className="h-5 w-5 text-teal-700" />
              <div>
                <h1 className="font-display text-xl font-extrabold text-slate-900">
                  أنشئ بطاقة المغامرة الخاصة بك
                </h1>
                <p className="text-xs text-slate-500">خطوة واحدة سريعة ونبدأ البحث عن النجوم!</p>
              </div>
            </div>

            {/* 1. Nickname */}
            <div>
              <label
                htmlFor="child-nickname-input"
                className="block font-display text-sm font-bold text-slate-900 mb-2"
              >
                1. ما هو اسمك أو لقبك المستعار؟
              </label>
              <input
                id="child-nickname-input"
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="مثال: سارة أو البطل آدم"
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none"
              />
              {errorMsg && (
                <p
                  role="alert"
                  className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800"
                >
                  {errorMsg}
                </p>
              )}
            </div>

            {/* 2. Companion Choice */}
            <div>
              <p className="font-display text-sm font-bold text-slate-900 mb-2">
                2. اختر رفيقك المفضل (سيظهر في ملفك ومراحل اللعب)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: CharacterId.Lulu,
                    nameAr: 'لولو',
                    descAr: 'الأرنبة الذكية والمحبة للحروف',
                  },
                  {
                    id: CharacterId.Nono,
                    nameAr: 'نونو',
                    descAr: 'الدب المرح والمحب للاكتشاف',
                  },
                ].map((item) => {
                  const selected = companion === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        audioManager.playSfx('tap');
                        setCompanion(item.id);
                      }}
                      className={`flex min-h-16 flex-col items-start rounded-2xl border p-4 text-right transition-colors ${
                        selected
                          ? 'border-teal-700 bg-teal-50 text-teal-950'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-display text-base font-extrabold">{item.nameAr}</span>
                        {selected && <Check className="h-4 w-4 text-teal-700" />}
                      </div>
                      <span className="mt-1 text-xs text-slate-600">{item.descAr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Target Age */}
            <div>
              <p className="font-display text-sm font-bold text-slate-900 mb-2">
                3. كم عمرك؟ (من 4 إلى 10 سنوات)
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {TARGET_AGES.map((a) => {
                  const selected = age === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        audioManager.playSfx('tap');
                        setAge(a);
                      }}
                      className={`min-h-12 rounded-2xl border px-3 py-2 font-display text-base font-bold tabular-nums transition-colors ${
                        selected
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Starting Difficulty */}
            <div>
              <p className="font-display text-sm font-bold text-slate-900 mb-2">
                4. مستوى البداية المفضّل
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const selected = difficulty === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        audioManager.playSfx('tap');
                        setDifficulty(opt.id);
                      }}
                      className={`min-h-14 rounded-2xl border p-3 text-right transition-colors ${
                        selected
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-display text-sm font-bold">{opt.labelAr}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{opt.hintAr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-3.5 font-display text-base font-extrabold text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              <span>{saving ? 'جارٍ حفظ ملفك...' : 'حفظ الملف والانطلاق للرئيسية'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
