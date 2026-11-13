import React from 'react';
import {
  Camera,
  Eye,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Smile,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import {
  ANIMATION_LABELS_AR,
  CameraPreset,
  CharacterViewMode,
  DualInteractionId,
  EXPRESSION_LABELS_AR,
  FacialExpression,
  INTERACTION_LABELS_AR,
  LightingPreset,
} from '../../characters/shared/CharacterTypes';
import { CharacterAnimState, CharacterId } from '../../types/game';

interface CharacterControlsProps {
  viewMode: CharacterViewMode;
  onChangeViewMode: (mode: CharacterViewMode) => void;
  activeAnim: CharacterAnimState;
  loopAnim: boolean;
  onToggleLoop: (loop: boolean) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onPlayAnimation: (anim: CharacterAnimState) => void;
  activeExpression: FacialExpression;
  onSelectExpression: (exp: FacialExpression) => void;
  onTriggerBlink: () => void;
  mouthOpen: boolean;
  onToggleMouthOpen: () => void;
  onTestLipSync: (speaker: CharacterId) => void;
  onRunInteraction: (id: DualInteractionId) => void;
  activeInteractionLabel: string | null;
  cameraPreset: CameraPreset;
  onSelectCamera: (preset: CameraPreset) => void;
  lightingPreset: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
  onResetAll: () => void;
}

const ALL_ANIMATIONS = Object.values(CharacterAnimState);
const ALL_EXPRESSIONS = Object.values(FacialExpression);
const ALL_INTERACTIONS = Object.keys(INTERACTION_LABELS_AR) as DualInteractionId[];

export const CharacterControls: React.FC<CharacterControlsProps> = ({
  viewMode,
  onChangeViewMode,
  activeAnim,
  loopAnim,
  onToggleLoop,
  isPaused,
  onTogglePause,
  onPlayAnimation,
  activeExpression,
  onSelectExpression,
  onTriggerBlink,
  mouthOpen,
  onToggleMouthOpen,
  onTestLipSync,
  onRunInteraction,
  activeInteractionLabel,
  cameraPreset,
  onSelectCamera,
  lightingPreset,
  onSelectLighting,
  onResetAll,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Character Selector & Reset */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Users className="h-4 w-4 text-teal-700" />
            <h3 className="font-display text-sm font-bold">عرض الشخصيات</h3>
          </div>
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>إعادة الوضع الطبيعي</span>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
          {([
            { id: 'lulu', label: 'لولو' },
            { id: 'nono', label: 'نونو' },
            { id: 'both', label: 'لولو ونونو معاً' },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeViewMode(item.id)}
              className={`min-h-11 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${
                viewMode === item.id
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Camera & Lighting */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <Camera className="h-4 w-4 text-teal-700" />
            <h3 className="font-display text-sm font-bold">زوايا الكاميرا (مع السحب للتدوير)</h3>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {([
              { id: 'threeQuarter', label: 'ثلاثة أرباع' },
              { id: 'front', label: 'أمامي' },
              { id: 'side', label: 'جانبي' },
              { id: 'closeup', label: 'قريب للوجه' },
            ] as const).map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => onSelectCamera(cam.id)}
                className={`min-h-10 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${
                  cameraPreset === cam.id
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <Sun className="h-4 w-4 text-amber-600" />
            <h3 className="font-display text-sm font-bold">إضاءة المشهد</h3>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {([
              { id: 'studioWarm', label: 'استوديو دافئ' },
              { id: 'sunnyMorning', label: 'صباح مشمس' },
              { id: 'cozyEvening', label: 'مساء هادئ' },
            ] as const).map((light) => (
              <button
                key={light.id}
                type="button"
                onClick={() => onSelectLighting(light.id)}
                className={`min-h-10 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${
                  lightingPreset === light.id
                    ? 'border-amber-500 bg-amber-50 text-amber-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {light.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 13 Animations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-slate-900">
            نظام الحركات (13 حالة)
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleLoop(!loopAnim)}
              className={`min-h-9 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                loopAnim
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {loopAnim ? 'تكرار مستمر' : 'مرة واحدة'}
            </button>
            <button
              type="button"
              onClick={onTogglePause}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              <span>{isPaused ? 'استئناف' : 'إيقاف'}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {ALL_ANIMATIONS.map((anim) => (
            <button
              key={anim}
              type="button"
              onClick={() => onPlayAnimation(anim)}
              className={`min-h-10 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${
                activeAnim === anim
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              {ANIMATION_LABELS_AR[anim]}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Facial Expressions & Lip Sync */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Smile className="h-4 w-4 text-teal-700" />
            <h3 className="font-display text-sm font-bold">تعبيرات الوجه وحركة الفم</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onTriggerBlink}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>رمش</span>
            </button>
            <button
              type="button"
              onClick={onToggleMouthOpen}
              className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                mouthOpen
                  ? 'border-amber-500 bg-amber-500 text-slate-950'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>فتح الفم</span>
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {ALL_EXPRESSIONS.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => onSelectExpression(exp)}
              className={`min-h-10 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${
                activeExpression === exp
                  ? 'border-amber-500 bg-amber-500 text-slate-950'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              {EXPRESSION_LABELS_AR[exp]}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => onTestLipSync(CharacterId.Lulu)}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            <MessageCircle className="h-3.5 w-3.5 text-teal-700" />
            <span>محاكاة كلام لولو (فم + نص)</span>
          </button>
          <button
            type="button"
            onClick={() => onTestLipSync(CharacterId.Nono)}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            <MessageCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>محاكاة كلام نونو (فم + نص)</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ملاحظة: يحرك هذا الاختبار الفم والنص التزامني فقط؛ التسجيلات الصوتية البشرية ستُضاف في مرحلة لاحقة.
        </p>
      </div>

      {/* 5. Dual Character Interactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Sparkles className="h-4 w-4 text-teal-700" />
          <h3 className="font-display text-sm font-bold">التفاعل بين لولو ونونو</h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {ALL_INTERACTIONS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onRunInteraction(id)}
              className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-teal-600 hover:bg-teal-50"
            >
              {INTERACTION_LABELS_AR[id]}
            </button>
          ))}
        </div>
        {activeInteractionLabel && (
          <p className="mt-2.5 rounded-xl bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900">
            {activeInteractionLabel}
          </p>
        )}
      </div>
    </div>
  );
};
