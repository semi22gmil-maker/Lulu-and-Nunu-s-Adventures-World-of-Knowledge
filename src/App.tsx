import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Volume2, VolumeX, Wrench } from 'lucide-react';
import { audioManager } from './audio/audioManager';
import { GameHeader } from './components/layout/GameHeader';
import { CharacterLab } from './features/character-lab/CharacterLab';
import { CreateProfileScreen } from './screens/CreateProfileScreen';
import { GameplayScreen } from './screens/GameplayScreen';
import { HomeDashboardScreen } from './screens/HomeDashboardScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { ParentGateScreen } from './screens/ParentGateScreen';
import { Phase0DiagnosticsScreen } from './screens/Phase0DiagnosticsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { SplashScreen } from './screens/SplashScreen';
import { StageSelectScreen } from './screens/StageSelectScreen';
import { StarRestoreScreen } from './screens/StarRestoreScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { WelcomeStoryScreen } from './screens/WelcomeStoryScreen';
import { WorldDetailsScreen } from './screens/WorldDetailsScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { useGameState } from './state/gameStore';
import { registerOfflineServiceWorker } from './storage/serviceWorkerRegister';
import { ScreenId } from './types/game';

type DevMode = 'game' | 'character-lab' | 'phase0';

function getInitialDevMode(): DevMode {
  if (typeof window === 'undefined') return 'game';
  const mode = new URLSearchParams(window.location.search).get('mode');
  if (mode === 'character-lab') return 'character-lab';
  if (mode === 'phase0') return 'phase0';
  return 'game';
}

export default function App() {
  const { state, currentNav, updateSettings } = useGameState();
  const [devMode, setDevMode] = useState<DevMode>(() => getInitialDevMode());

  useEffect(() => {
    audioManager.syncSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    void registerOfflineServiceWorker();
  }, []);

  if (devMode !== 'game') {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5">
            <div>
              <h1 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                مغامرات لولو ونونو – عالم المعرفة
              </h1>
              <p className="mt-0.5 text-xs text-slate-600">
                أدوات المراحل السابقة · مختبر الشخصيات (المرحلة 1) وفحص البنية (المرحلة 0)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setDevMode('character-lab')}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    devMode === 'character-lab'
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>مختبر الشخصيات (المرحلة 1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevMode('phase0')}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    devMode === 'phase0'
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

              <button
                type="button"
                onClick={() => {
                  audioManager.playSfx('tap');
                  if (typeof window !== 'undefined' && window.location.search) {
                    window.history.replaceState({}, '', window.location.pathname);
                  }
                  setDevMode('game');
                }}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>العودة للعبة</span>
              </button>
            </div>
          </div>
        </header>

        {devMode === 'character-lab' ? <CharacterLab /> : <Phase0DiagnosticsScreen />}
      </div>
    );
  }

  switch (currentNav.screen) {
    case ScreenId.Splash:
      return <SplashScreen />;
    case ScreenId.WelcomeStory:
      return <WelcomeStoryScreen />;
    case ScreenId.CreateProfile:
      return <CreateProfileScreen />;
    case ScreenId.Home:
      return <HomeDashboardScreen />;
    case ScreenId.WorldMap:
      return <WorldMapScreen />;
    case ScreenId.Rewards:
      return <RewardsScreen />;
    case ScreenId.Profile:
      return <ProfileScreen />;
    case ScreenId.ParentGate:
      return <ParentGateScreen />;
    case ScreenId.ParentDashboard:
      return (
        <ParentDashboardScreen onOpenCharacterLab={() => setDevMode('character-lab')} />
      );
    case ScreenId.WorldDetails:
      return <WorldDetailsScreen />;
    case ScreenId.StageSelect:
      return <StageSelectScreen />;
    case ScreenId.Gameplay:
      return (
        <GameplayScreen
          key={`${currentNav.params?.worldId ?? 'w'}_${currentNav.params?.stageId ?? 's'}`}
        />
      );
    case ScreenId.Victory:
      return <VictoryScreen />;
    case ScreenId.StarRestore:
      return <StarRestoreScreen />;
    case ScreenId.Phase0Diagnostics:
      return (
        <div dir="rtl" className="min-h-screen bg-slate-50">
          <GameHeader
            titleAr="فحص البنية (المرحلة 0)"
            showBack={true}
            showNavLinks={false}
            showParentButton={false}
          />
          <Phase0DiagnosticsScreen />
        </div>
      );
    default:
      return <SplashScreen />;
  }
}
