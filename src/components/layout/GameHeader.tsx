import React from 'react';
import { ArrowRight, Lock, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../../audio/audioManager';
import { useGameState } from '../../state/gameStore';
import { ScreenId } from '../../types/game';

interface GameHeaderProps {
  titleAr: string;
  showBack?: boolean;
  onBack?: () => void;
  showNavLinks?: boolean;
  showParentButton?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  titleAr,
  showBack = false,
  onBack,
  showNavLinks = true,
  showParentButton = true,
}) => {
  const { state, currentNav, activeProfile, navigate, goBack, resetNav, updateSettings } = useGameState();

  const handleBack = () => {
    audioManager.playSfx('tap');
    if (onBack) onBack();
    else goBack();
  };

  const navItems: Array<{ screen: ScreenId; label: string }> = [
    { screen: ScreenId.Home, label: 'الرئيسية' },
    { screen: ScreenId.WorldMap, label: 'العوالم' },
    { screen: ScreenId.Rewards, label: 'المكافآت' },
    { screen: ScreenId.Profile, label: 'ملفي' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand or Back */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && state.navStack.length > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="العودة للشاشة السابقة"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              <ArrowRight className="h-4 w-4 text-teal-700" />
              <span>رجوع</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                audioManager.playSfx('tap');
                if (activeProfile) resetNav(ScreenId.Home);
              }}
              className="font-display text-base font-extrabold text-teal-900 sm:text-lg whitespace-nowrap shrink-0"
            >
              لولو ونونو
            </button>
          )}
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="truncate font-display text-sm font-bold text-slate-700">{titleAr}</span>
        </div>

        {/* Zone 2: Clean single-line child navigation links (shown when activeProfile exists) */}
        {showNavLinks && activeProfile && (
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-5 text-sm font-bold text-slate-600"
          >
            {navItems.map((item) => {
              const isActive = currentNav.screen === item.screen;
              return (
                <button
                  key={item.screen}
                  type="button"
                  onClick={() => {
                    audioManager.playSfx('tap');
                    navigate(item.screen);
                  }}
                  className={`min-h-10 border-b-2 px-1 py-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-teal-700 text-teal-900'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Sound toggle + Parent Gate access */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
            aria-label={state.settings.soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {state.settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-teal-700" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">
              {state.settings.soundEnabled ? 'الصوت' : 'مكتوم'}
            </span>
          </button>

          {showParentButton && (
            <button
              type="button"
              onClick={() => {
                audioManager.playSfx('tap');
                navigate(ScreenId.ParentDashboard);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-100 whitespace-nowrap shrink-0"
            >
              <Lock className="h-3.5 w-3.5 text-amber-700" />
              <span>للوالدين</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
