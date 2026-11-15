import React, { useEffect, useState } from 'react';
import {
  Clock,
  Lock,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  Volume2,
  Wrench,
} from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { GameHeader } from '../components/layout/GameHeader';
import { countRestoredStars } from '../data/rewardsCatalog';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { indexedDbService } from '../storage/indexedDbService';
import { ActivityAttempt, QualityTier, ScreenId } from '../types/game';

interface ParentDashboardScreenProps {
  onOpenCharacterLab?: () => void;
}

function formatDurationAr(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'لم يُسجَّل وقت لعب بعد';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs} ثانية`;
  return `${mins} دقيقة و${secs} ثانية`;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  onOpenCharacterLab,
}) => {
  const {
    state,
    activeProfile,
    updateSettings,
    selectProfile,
    deleteProfile,
    lockParentGate,
    resetAllProgress,
    navigate,
    replaceScreen,
    resetNav,
  } = useGameState();

  const [activityLogs, setActivityLogs] = useState<ActivityAttempt[]>([]);
  const [pinInput, setPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const isGateValid = Date.now() <= state.parentGateUnlockedUntil;

  useEffect(() => {
    if (!isGateValid) {
      replaceScreen(ScreenId.ParentGate, { redirectAfterGate: ScreenId.ParentDashboard });
    }
  }, [isGateValid, replaceScreen]);

  useEffect(() => {
    if (!activeProfile) {
      setActivityLogs([]);
      return;
    }
    let mounted = true;
    indexedDbService
      .getActivityLogsByProfile(activeProfile.id)
      .then((logs) => {
        if (!mounted) return;
        setActivityLogs(logs.sort((a, b) => b.timestamp - a.timestamp));
      })
      .catch(() => {
        if (mounted) setActivityLogs([]);
      });
    return () => {
      mounted = false;
    };
  }, [activeProfile?.id, activeProfile?.xp]);

  if (!isGateValid) return null;

  const worlds = worldRegistry.getAll();
  const allProfiles = Object.values(state.profiles);
  const completedWorlds = activeProfile
    ? worlds.filter((w) => activeProfile.worldProgress[w.id]?.starRestored)
    : [];
  const practicedSkills = Array.from(new Set(activityLogs.map((l) => l.skill)));

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim();
    if (!/^\d{4}$/.test(cleaned)) {
      setPinFeedback('يرجى إدخال رمز مكوّن من 4 أرقام بالضبط.');
      return;
    }
    updateSettings({ parentPinHash: cleaned });
    setPinInput('');
    setPinFeedback('تم حفظ رمز الوالدين الخاص بنجاح.');
  };

  return (
    <div dir="rtl" data-testid="screen-parent-dashboard" className="min-h-screen bg-slate-50">
      <GameHeader
        titleAr="لوحة الوالدين والإعدادات"
        showBack={true}
        onBack={() => {
          lockParentGate();
          resetNav(activeProfile ? ScreenId.Home : ScreenId.CreateProfile);
        }}
        showNavLinks={false}
        showParentButton={false}
      />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Top Action Bar */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              لوحة الوالدين والإحصائيات الفعلية
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              تُعرض هنا فقط البيانات المسجلة فعلياً من جهازك دون أي أرقام تقديرية أو مختلقة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('tap');
              lockParentGate();
              resetNav(activeProfile ? ScreenId.Home : ScreenId.CreateProfile);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Lock className="h-4 w-4" />
            <span>قفل اللوحة والعودة للطفل</span>
          </button>
        </section>

        {/* Child Progress Summary & Practiced Activities */}
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-700" />
              <span>ملخص تقدم الطفل والوقت الفعلي</span>
            </h2>

            {activeProfile ? (
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">الطفل النشط:</dt>
                  <dd className="font-bold text-slate-900">
                    {activeProfile.name} ({activeProfile.age} سنوات)
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">المستوى ونقاط الخبرة:</dt>
                  <dd className="font-bold text-slate-900 tabular-nums">
                    المستوى {activeProfile.explorerLevel} · {activeProfile.xp} XP
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">الوقت المسجل في اللعب:</dt>
                  <dd className="font-bold text-slate-900 tabular-nums">
                    {formatDurationAr(activeProfile.totalPlaySeconds)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">النجوم المستعادة:</dt>
                  <dd className="font-bold text-amber-800 tabular-nums">
                    {countRestoredStars(activeProfile)} من 7
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">العوالم المكتملة:</dt>
                  <dd className="font-bold text-slate-900">
                    {completedWorlds.length > 0
                      ? completedWorlds.map((w) => w.nameAr).join('، ')
                      : 'لم يُكتمل أي عالم بعد'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">لا يوجد ملف طفل نشط حالياً.</p>
            )}
          </div>

          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900">
              المهارات والأنشطة الممارَسة فعلياً ({activityLogs.length} سجل)
            </h2>
            {activityLogs.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                لم تُسجَّل أي أنشطة لعب مكتملة بعد في قاعدة IndexedDB لهذا الملف.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">
                  المهارات المسجلة: {practicedSkills.join(' · ')}
                </div>
                <ul className="max-h-48 overflow-y-auto space-y-2 text-xs">
                  {activityLogs.slice(0, 8).map((log, i) => (
                    <li
                      key={log.id ?? `${log.timestamp}-${i}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="font-semibold text-slate-800">
                        {log.stageId} ({log.skill})
                      </span>
                      <span className={log.success ? 'font-bold text-emerald-700' : 'font-bold text-amber-800'}>
                        {log.success ? 'إجابة صحيحة' : 'محاولة تعليمية'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Sound & Gameplay Settings */}
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-teal-700" />
              <span>إعدادات الصوت</span>
            </h2>

            <div className="space-y-3 text-sm">
              {[
                {
                  key: 'soundEnabled' as const,
                  label: 'تفعيل المؤثرات الصوتية العامة',
                  val: state.settings.soundEnabled,
                },
                {
                  key: 'voiceEnabled' as const,
                  label: 'تفعيل أصوات الحوار والتشجيع',
                  val: state.settings.voiceEnabled,
                },
                {
                  key: 'musicEnabled' as const,
                  label: 'تفعيل الموسيقى الهادئة في الخلفية',
                  val: state.settings.musicEnabled,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                    className="h-5 w-5 accent-teal-700"
                  />
                </label>
              ))}

              <div className="pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>مستوى صوت المؤثرات</span>
                  <span className="tabular-nums">{Math.round(state.settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.settings.sfxVolume}
                  onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
                  className="w-full accent-teal-700"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-700" />
              <span>إعدادات اللعب وإمكانية الوصول</span>
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">جودة الرسوميات ثلاثية الأبعاد:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: QualityTier.Low, label: 'منخفض' },
                    { id: QualityTier.Medium, label: 'متوسط' },
                    { id: QualityTier.High, label: 'عالي' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => updateSettings({ qualityTier: q.id })}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold ${
                        state.settings.qualityTier === q.id
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">الحد اليومي المقترح للعب:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 15, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateSettings({ dailyLimitMinutes: mins })}
                      className={`min-h-10 rounded-xl border px-2 py-1.5 text-xs font-bold tabular-nums ${
                        state.settings.dailyLimitMinutes === mins
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      {mins === 0 ? 'مفتوح' : `${mins} د`}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 cursor-pointer">
                <span className="font-semibold text-slate-800">
                  تقليل المؤثرات والحركات الانتقالية (Reduced Motion)
                </span>
                <input
                  type="checkbox"
                  checked={state.settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  className="h-5 w-5 accent-teal-700"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Privacy, PIN, Profile Management & QA Lab */}
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-700" />
              <span>إعدادات الخصوصية ورمز البوابة</span>
            </h2>
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs leading-relaxed text-emerald-950">
              خصوصية الطفل محفوظة بالكامل: جميع الملفات والتقدم تُخزّن محلياً على الجهاز عبر IndexedDB وlocalStorage فقط ولا يتم إرسال أي بيانات لجهات خارجية.
            </p>

            <form onSubmit={handleSavePin} className="flex flex-wrap gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="تعيين رمز PIN (4 أرقام)"
                className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm"
              />
              <button
                type="submit"
                className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
              >
                حفظ الرمز
              </button>
              {state.settings.parentPinHash && (
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ parentPinHash: null });
                    setPinFeedback('تم إلغاء الرمز والعودة إلى سؤال التحقق الحسابي.');
                  }}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                >
                  إزالة الرمز
                </button>
              )}
            </form>
            {pinFeedback && <p className="text-xs font-semibold text-teal-800">{pinFeedback}</p>}
          </div>

          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-extrabold text-slate-900">
              إدارة ملفات الأطفال وأدوات الفحص
            </h2>

            {allProfiles.length > 0 && (
              <div className="space-y-2">
                {allProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => selectProfile(p.id)}
                      className="text-right text-sm font-bold text-slate-900 hover:text-teal-800"
                    >
                      {p.name} ({p.age} س) {p.id === activeProfile?.id ? '· نشط' : ''}
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف ملف ${p.name}`}
                      onClick={() => deleteProfile(p.id)}
                      className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {onOpenCharacterLab && (
                <button
                  type="button"
                  onClick={onOpenCharacterLab}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                  <span>مختبر الشخصيات (المرحلة 1)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(ScreenId.Phase0Diagnostics)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                <Wrench className="h-3.5 w-3.5 text-teal-700" />
                <span>فحص البنية (المرحلة 0)</span>
              </button>
            </div>

            <div className="pt-1">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-10 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100"
                >
                  مسح كافة البيانات المحلية وإعادة التعيين
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await resetAllProgress();
                      setConfirmReset(false);
                    }}
                    className="min-h-10 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white"
                  >
                    تأكيد المسح النهائي
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
