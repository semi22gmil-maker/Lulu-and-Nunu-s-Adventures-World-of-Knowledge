import React, { useState } from 'react';
import { Award, CheckCircle2, Edit3, Sparkles, Star, UserPlus } from 'lucide-react';
import { audioManager } from '../audio/audioManager';
import { CharacterCanvas } from '../components/characters/CharacterCanvas';
import { GameHeader } from '../components/layout/GameHeader';
import { FacialExpression } from '../characters/shared/CharacterTypes';
import { BADGE_CATALOG, countRestoredStars } from '../data/rewardsCatalog';
import { worldRegistry } from '../registry/worldRegistry';
import { useGameState } from '../state/gameStore';
import { CharacterAnimState, CharacterId, ScreenId } from '../types/game';

export const ProfileScreen: React.FC = () => {
  const { state, activeProfile, navigate, selectProfile, updateProfileDetails } = useGameState();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(activeProfile?.name ?? '');
  const [editCompanion, setEditCompanion] = useState<CharacterId>(
    activeProfile?.avatarCompanion ?? CharacterId.Lulu
  );
  const [editError, setEditError] = useState<string | null>(null);

  if (!activeProfile) return null;

  const allProfiles = Object.values(state.profiles);
  const worlds = worldRegistry.getAll();
  const restoredStars = countRestoredStars(activeProfile);
  const xpIntoLevel = activeProfile.xp % 100;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = editName.trim().replace(/\s+/g, ' ');
    if (cleaned.length < 2) {
      audioManager.playSfx('gentle-try');
      setEditError('يجب أن يتكون الاسم من حرفين على الأقل.');
      return;
    }
    setEditError(null);
    await updateProfileDetails(activeProfile.id, {
      name: cleaned,
      avatarCompanion: editCompanion,
    });
    audioManager.playSfx('success');
    setEditing(false);
  };

  return (
    <div dir="rtl" data-testid="screen-profile" className="min-h-screen bg-slate-50">
      <GameHeader titleAr="الملف الشخصي" showBack={true} />

      <main className="animate-screen-enter mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            {/* Live 3D Avatar Companion */}
            <div className="lg:col-span-5">
              <div className="h-[280px] sm:h-[330px] w-full">
                <CharacterCanvas
                  viewMode={activeProfile.avatarCompanion === CharacterId.Nono ? 'nono' : 'lulu'}
                  lightingPreset="studioWarm"
                  qualityTier={state.settings.qualityTier}
                  initialAnimation={CharacterAnimState.Idle}
                  initialExpression={FacialExpression.Smile}
                  allowOrbit={true}
                  minHeightClass="min-h-[280px]"
                />
              </div>
            </div>

            {/* Child Info, XP Bar & Local Profile Settings */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-teal-800">
                    ملف محلي محفوظ · العمر {activeProfile.age} سنوات
                  </p>
                  <h1 className="font-display mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {activeProfile.name}
                  </h1>
                  <p className="mt-1 text-xs text-slate-600">
                    الرفيق المختار: {activeProfile.avatarCompanion === CharacterId.Lulu ? 'لولو الأرنبة' : 'نونو الدب'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('tap');
                      setEditName(activeProfile.name);
                      setEditCompanion(activeProfile.avatarCompanion);
                      setEditing((v) => !v);
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                  >
                    <Edit3 className="h-4 w-4 text-teal-700" />
                    <span>{editing ? 'إلغاء التعديل' : 'تعديل الملف'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playSfx('tap');
                      navigate(ScreenId.CreateProfile);
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>ملف جديد</span>
                  </button>
                </div>
              </div>

              {editing && (
                <form
                  onSubmit={handleSaveEdit}
                  className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 space-y-3"
                >
                  <div>
                    <label
                      htmlFor="edit-profile-name"
                      className="block text-xs font-bold text-slate-800 mb-1"
                    >
                      الاسم المستعار الجديد
                    </label>
                    <input
                      id="edit-profile-name"
                      type="text"
                      value={editName}
                      maxLength={24}
                      onChange={(e) => setEditName(e.target.value)}
                      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: CharacterId.Lulu, label: 'لولو' },
                      { id: CharacterId.Nono, label: 'نونو' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditCompanion(c.id)}
                        className={`min-h-10 flex-1 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                          editCompanion === c.id
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {editError && <p className="text-xs font-bold text-rose-700">{editError}</p>}
                  <button
                    type="submit"
                    className="min-h-11 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              )}

              {/* Explorer Level & XP */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 text-teal-900">
                    <Sparkles className="h-4 w-4 text-teal-700" />
                    <span>المستوى {activeProfile.explorerLevel} · إجمالي XP: {activeProfile.xp}</span>
                  </span>
                  <span className="tabular-nums text-slate-600">
                    {xpIntoLevel} / 100 نحو المستوى التالي
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${xpIntoLevel}%` }}
                  />
                </div>
              </div>

              {/* Earned Achievements Summary */}
              <div className="space-y-2">
                <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span>إنجازاتي المفتوحة ({activeProfile.unlockedBadges.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {activeProfile.unlockedBadges.map((id) => {
                    const b = BADGE_CATALOG.find((item) => item.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-950"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                        <span>{b?.titleAr ?? id}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Quick Local Profile Switcher if more than 1 profile saved */}
              {allProfiles.length > 1 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold text-slate-600 mb-2">التبديل بين الملفات المحلية:</p>
                  <div className="flex flex-wrap gap-2">
                    {allProfiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          audioManager.playSfx('tap');
                          selectProfile(p.id);
                        }}
                        className={`min-h-10 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                          p.id === activeProfile.id
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Per-World Progress */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              التقدم في العوالم السبعة
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 tabular-nums">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{restoredStars} / 7 نجوم مستعادة</span>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {worlds.map((world) => {
              const wp = activeProfile.worldProgress[world.id];
              const completed = wp?.completedStageIds.length ?? 0;
              const total = world.stages.length;
              const pct = Math.round((completed / Math.max(1, total)) * 100);

              return (
                <div
                  key={world.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">{world.nameAr}</span>
                    <span className="tabular-nums text-slate-600">
                      {completed}/{total} · {wp?.starRestored ? 'النجمة مستعادة' : wp?.unlocked ? 'مفتوح' : 'مقفل'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        wp?.starRestored ? 'bg-amber-500' : 'bg-teal-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
