import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Layers,
  ShieldCheck,
  Smartphone,
  Volume2,
  VolumeX,
  Compass,
  RotateCcw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { audioManager } from './audio/audioManager';
import { CharacterLab } from './features/character-lab/CharacterLab';
import { PLANNED_GAME_SCREEN_COUNT, SCREEN_DIRECTORY } from './navigation/screenRouter';
import { worldRegistry } from './registry/worldRegistry';
import { useGameState } from './state/gameStore';
import { indexedDbService } from './storage/indexedDbService';
import { registerOfflineServiceWorker, ServiceWorkerStatus } from './storage/serviceWorkerRegister';
import { CharacterId, QualityTier, ScreenId } from './types/game';
import {
  detectWebGLCapabilities,
  getRenderProfileConfig,
  probeThreeRendererInit,
} from './utils/performanceProfile';

interface DbCheckResult {
  ran: boolean;
  ok: boolean;
  latencyMs: number;
  message: string;
}

type LabTab = 'character-lab' | 'phase0-diagnostics';

export default function App() {
  const {
    state,
    currentNav,
    activeProfile,
    navigate,
    goBack,
    createProfile,
    updateSettings,
    unlockParentGate,
    resetAllProgress,
  } = useGameState();

  const [activeTab, setActiveTab] = useState<LabTab>('character-lab');
  const [dbTest, setDbTest] = useState<DbCheckResult>({
    ran: false,
    ok: false,
    latencyMs: 0,
    message: 'جاهز للفحص',
  });
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    supported: false,
    registered: false,
    scope: null,
    warmedAssetsCount: 0,
    error: null,
  });
  const [cacheInfo, setCacheInfo] = useState<string>('لم يتم فحص CacheStorage بعد');
  const [threeProbeResult, setThreeProbeResult] = useState<string>('جاهز لاختبار تهيئة Three.js');
  const [voiceModeFeedback, setVoiceModeFeedback] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [lipLevel, setLipLevel] = useState<number>(0);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string>('');

  const webglProbe = detectWebGLCapabilities();
  const renderProfile = getRenderProfileConfig(state.settings.qualityTier);
  const audioDiag = audioManager.getDiagnostics();
  const worlds = worldRegistry.getAll();
  const savedProfilesCount = Object.keys(state.profiles).length;
  const parentGateUnlocked = Date.now() <= state.parentGateUnlockedUntil;

  useEffect(() => {
    audioManager.syncSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    const unsub = audioManager.subscribeLipSync((speaker, mouthOpen, text) => {
      setActiveSpeaker(speaker);
      setLipLevel(mouthOpen);
      setCaption(text);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let active = true;
    registerOfflineServiceWorker().then((status) => {
      if (active) setSwStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRunDbProbe = async () => {
    audioManager.playSfx('tap');
    const res = await indexedDbService.runSelfTest();
    setDbTest({ ran: true, ...res });
  };

  const handleCreateTestProfile = async () => {
    audioManager.playSfx('success');
    const created = await createProfile('مستكشف تجريبي', 6, CharacterId.Lulu);
    setActionFeedback(`تم إنشاء وحفظ ملف "${created.name}" في IndexedDB وتعيينه في localStorage (أعد تحميل الصفحة للتحقق من بقائه).`);
  };

  const handleTestThreeProbe = () => {
    audioManager.playSfx('tap');
    const res = probeThreeRendererInit();
    setThreeProbeResult(res.message);
  };

  const handleInspectCacheStorage = async () => {
    audioManager.playSfx('tap');
    if (typeof window === 'undefined' || !('caches' in window)) {
      setCacheInfo('CacheStorage غير متاح في هذه البيئة');
      return;
    }
    try {
      const cacheNames = await window.caches.keys();
      if (cacheNames.length === 0) {
        setCacheInfo('لا توجد مخازن CacheStorage مسجلة بعد');
        return;
      }
      const cache = await window.caches.open(cacheNames[0]);
      const keys = await cache.keys();
      setCacheInfo(`المخزن: ${cacheNames[0]} · العناصر المخزنة: ${keys.length}`);
    } catch (err) {
      setCacheInfo(err instanceof Error ? err.message : 'تعذر قراءة CacheStorage');
    }
  };

  const handleTestVoiceAndLipSync = () => {
    audioManager.playSfx('tap');
    const result = audioManager.playVoiceClip('lulu_welcome_01');
    if (result) {
      setVoiceModeFeedback(
        result.playbackMode === 'bundled-audio-file'
          ? 'تم تشغيل ملف صوتي فعلي مدمج من /audio/voices/'
          : 'سجل تعريفي فقط (مزامنة الفم + النص) — بانتظار إرفاق ملف الصوت المسجل'
      );
    }
  };

  const handleTestParentGateGuard = () => {
    audioManager.playSfx('tap');
    navigate(ScreenId.ParentDashboard);
  };

  const handleSimulateGatePass = () => {
    audioManager.playSfx('star');
    unlockParentGate();
    navigate(ScreenId.ParentDashboard);
  };

  const handleResetAll = async () => {
    await resetAllProgress();
    setDbTest({ ran: false, ok: false, latencyMs: 0, message: 'تم مسح البيانات المحلية وإعادة الضبط' });
    setActionFeedback('تم مسح localStorage وIndexedDB وإعادة ضبط مكدس التنقل وبوابة الوالدين.');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5">
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
              مغامرات لولو ونونو – عالم المعرفة
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">
              المرحلة الأولى · مختبر الشخصيات ثلاثية الأبعاد (لولو ونونو)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Phase 1 Character Lab vs Phase 0 Diagnostics Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('character-lab')}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'character-lab'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>مختبر الشخصيات (المرحلة 1)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('phase0-diagnostics')}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'phase0-diagnostics'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>فحص البنية (المرحلة 0)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              {state.settings.soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 text-teal-700" />
                  <span>الصوت مفعل</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 text-slate-500" />
                  <span>الصوت مكتوم</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'character-lab' ? (
        <CharacterLab />
      ) : (
        <main className="mx-auto max-w-6xl space-y-6 px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              شاشة التحقق التشخيصية للمرحلة صفر (جميع أنظمة التخزين والتنقل والعمل دون اتصال محفوظة وتعمل).
            </p>
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          {actionFeedback && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
              {actionFeedback}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            {/* 1. WebGL2 & Fallback */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Smartphone className="h-5 w-5 text-teal-700" />
                <h2 className="font-display text-base font-bold">بيئة الرسوميات وWebGL2</h2>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>حالة WebGL:</dt>
                  <dd className="font-medium text-slate-900">
                    {webglProbe.hasWebGL2 ? 'WebGL2 متاح' : webglProbe.hasWebGL ? 'WebGL1 بديل' : 'غير متوفر (2D Fallback)'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>مسار التصيير:</dt>
                  <dd className="font-medium text-slate-900">{webglProbe.fallbackMode}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>نسبة البكسل والظلال:</dt>
                  <dd className="font-medium text-slate-900">
                    {renderProfile.maxPixelRatio}x · {renderProfile.shadowsEnabled ? 'ظلال مفعلة' : 'دون ظلال'}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  مستوى الجودة الرسومية (لأجهزة Android):
                </label>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
                  {([QualityTier.Low, QualityTier.Medium, QualityTier.High] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        audioManager.playSfx('tap');
                        updateSettings({ qualityTier: tier });
                      }}
                      className={`min-h-10 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                        state.settings.qualityTier === tier
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {tier === QualityTier.Low ? 'منخفض' : tier === QualityTier.Medium ? 'متوسط' : 'عالي'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestThreeProbe}
                className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                اختبار تهيئة Three.js الآن
              </button>
              <p className="mt-2 text-xs text-slate-600">{threeProbeResult}</p>
            </div>

            {/* 2. Dual Storage Verification */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5 text-slate-900">
                <Database className="h-5 w-5 text-teal-700" />
                <h2 className="font-display text-base font-bold">التخزين المحلي وحفظ التقدم</h2>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>الملفات المحفوظة:</dt>
                  <dd className="font-medium text-slate-900">{savedProfilesCount} ملفات في IndexedDB</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>الملف النشط:</dt>
                  <dd className="font-medium text-slate-900">
                    {activeProfile ? `${activeProfile.name} (${activeProfile.age} سنوات)` : 'لا يوجد ملف بعد'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>فحص IndexedDB:</dt>
                  <dd className="font-medium text-slate-900">
                    {dbTest.ran ? `${dbTest.ok ? 'ناجح' : 'فشل'} (${dbTest.latencyMs}ms)` : dbTest.message}
                  </dd>
                </div>
              </dl>
              {dbTest.ran && (
                <p className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                  {dbTest.message}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRunDbProbe}
                  className="min-h-11 flex-1 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  فحص IndexedDB
                </button>
                <button
                  type="button"
                  onClick={handleCreateTestProfile}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                >
                  حفظ ملف تجريبي
                </button>
              </div>
            </div>

            {/* 3. Offline & Audio Distinction */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-teal-700" />
                <h2 className="font-display text-base font-bold">العمل دون إنترنت والصوتيات</h2>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>Service Worker:</dt>
                  <dd className="font-medium text-slate-900">
                    {swStatus.registered
                      ? `مسجل (${swStatus.warmedAssetsCount} أصل مهيأ)`
                      : swStatus.error ?? 'غير مسجل'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>سجلات الكلام التعريفية:</dt>
                  <dd className="font-medium text-slate-900">{audioDiag.totalManifestEntries} سجلات</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>ملفات صوت بشرية مدمجة:</dt>
                  <dd className="font-medium text-slate-900">
                    {audioDiag.bundledAudioFilesCount} مدمج · {audioDiag.pendingAudioFilesCount} بانتظار الإرفاق
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>مزامنة الفم:</dt>
                  <dd className="font-medium text-slate-900">
                    {activeSpeaker ? `${activeSpeaker} (${Math.round(lipLevel * 100)}%)` : 'خامل'}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => audioManager.playSfx('star')}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                >
                  تجربة مؤثر نجمة (Web Audio)
                </button>
                <button
                  type="button"
                  onClick={handleTestVoiceAndLipSync}
                  className="min-h-11 flex-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  تجربة سجل الكلام والمزامنة
                </button>
              </div>
              <button
                type="button"
                onClick={handleInspectCacheStorage}
                className="mt-2 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                فحص ملفات CacheStorage المخزنة
              </button>
              <p className="mt-1.5 text-xs text-slate-600">{cacheInfo}</p>
              {voiceModeFeedback && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
                  {voiceModeFeedback}
                </p>
              )}
              {caption && (
                <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800">
                  {caption}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-teal-700" />
                <h2 className="font-display text-base font-bold">اختبار نظام التنقل وحماية لوحة الوالدين</h2>
              </div>
              <div className="text-xs text-slate-600">
                الشاشات المسجلة: <strong className="text-slate-900">{PLANNED_GAME_SCREEN_COUNT} لعبة + 1 تشخيصية</strong>
                <span className="mx-2">·</span>
                الحالية: <strong className="text-slate-900">{SCREEN_DIRECTORY[currentNav.screen]?.titleAr}</strong>
                <span className="mx-2">·</span>
                البوابة: <strong className="text-slate-900">{parentGateUnlocked ? 'مفتوحة' : 'مقفلة'}</strong>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-700">
              مسار المكدس:{' '}
              {state.navStack
                .map((entry) => SCREEN_DIRECTORY[entry.screen]?.titleAr ?? entry.screen)
                .join(' ← ')}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTestParentGateGuard}
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                محاولة دخول لوحة الوالدين (يجب أن يوجه للبوابة)
              </button>
              <button
                type="button"
                onClick={handleSimulateGatePass}
                className="min-h-11 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-teal-100"
              >
                تجاوز تجريبي للبوابة وفتح اللوحة
              </button>
              <button
                type="button"
                onClick={goBack}
                disabled={state.navStack.length <= 1}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                رجوع للخلف ({state.navStack.length > 1 ? 'متاح' : 'في الجذر'})
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Layers className="h-5 w-5 text-teal-700" />
                <h2 className="font-display text-base font-bold">
                  سجل العوالم السبعة ({worlds.length} عوالم مسجلة في World Registry)
                </h2>
              </div>
              <span className="text-xs text-slate-500">جاهزة للتركيب في المراحل 3 إلى 9</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {worlds.map((world) => (
                <div
                  key={world.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>العالم {world.order}</span>
                    <span>المرحلة {world.plannedPhase}</span>
                  </div>
                  <h3 className="font-display mt-1 text-sm font-bold text-slate-900">{world.nameAr}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{world.subtitleAr}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{world.stages.length} أنشطة مسجلة</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
