import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '../../audio/audioManager';
import {
  ANIMATION_LABELS_AR,
  CameraPreset,
  CharacterViewMode,
  DualInteractionId,
  EXPRESSION_LABELS_AR,
  FacialExpression,
  LightingPreset,
} from '../../characters/shared/CharacterTypes';
import {
  CharacterCanvas,
  CharacterStageHandle,
  CharacterStageTelemetry,
} from '../../components/characters/CharacterCanvas';
import { CharacterControls } from '../../components/characters/CharacterControls';
import { useGameState } from '../../state/gameStore';
import { CharacterAnimState, CharacterId } from '../../types/game';

export const CharacterLab: React.FC = () => {
  const { state } = useGameState();
  const stageRef = useRef<CharacterStageHandle | null>(null);

  const [viewMode, setViewMode] = useState<CharacterViewMode>('both');
  const [loopAnim, setLoopAnim] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('threeQuarter');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studioWarm');
  const [interactionNote, setInteractionNote] = useState<string | null>(null);
  const [speechCaption, setSpeechCaption] = useState<string | null>(null);

  const [telemetry, setTelemetry] = useState<CharacterStageTelemetry>({
    loaded: false,
    webglMode: 'initializing',
    fps: 0,
    triangles: 0,
    activeAnimationLulu: CharacterAnimState.Idle,
    activeAnimationNono: CharacterAnimState.Idle,
    activeExpressionLulu: FacialExpression.Smile,
    activeExpressionNono: FacialExpression.Smile,
    isPaused: false,
    mouthOpenLulu: false,
    mouthOpenNono: false,
  });

  useEffect(() => {
    const unsub = audioManager.subscribeLipSync((_speaker, _amp, captionText) => {
      setSpeechCaption(captionText);
    });
    return unsub;
  }, []);

  const liveAnim =
    viewMode === 'nono' ? telemetry.activeAnimationNono : telemetry.activeAnimationLulu;
  const liveExpression =
    viewMode === 'nono' ? telemetry.activeExpressionNono : telemetry.activeExpressionLulu;
  const liveMouthOpen =
    viewMode === 'nono'
      ? telemetry.mouthOpenNono
      : viewMode === 'lulu'
      ? telemetry.mouthOpenLulu
      : telemetry.mouthOpenLulu || telemetry.mouthOpenNono;

  const handlePlayAnimation = (anim: CharacterAnimState) => {
    audioManager.playSfx('tap');
    setInteractionNote(null);
    stageRef.current?.playAnimation(viewMode, anim, loopAnim);
  };

  const handleSelectExpression = (exp: FacialExpression) => {
    audioManager.playSfx('tap');
    stageRef.current?.setExpression(viewMode, exp);
  };

  const handleTriggerBlink = () => {
    stageRef.current?.triggerBlink(viewMode);
  };

  const handleToggleMouthOpen = () => {
    audioManager.playSfx('tap');
    stageRef.current?.setManualMouthOpen(viewMode, !liveMouthOpen);
  };

  const handleTestLipSync = (speaker: CharacterId) => {
    audioManager.playSfx('tap');
    const clipId = speaker === CharacterId.Lulu ? 'lulu_welcome_01' : 'nono_encourage_01';
    audioManager.playVoiceClip(clipId);
    stageRef.current?.triggerLipSyncTest(speaker, 2.6);
  };

  const handleRunInteraction = (id: DualInteractionId) => {
    audioManager.playSfx('star');
    setViewMode('both');
    stageRef.current?.runInteraction(id, (msg) => setInteractionNote(msg));
  };

  const handleTogglePause = () => {
    stageRef.current?.setPauseState(!telemetry.isPaused);
  };

  const handleSelectCamera = (preset: CameraPreset) => {
    setCameraPreset(preset);
    stageRef.current?.setCameraPreset(preset);
  };

  const handleResetAll = () => {
    audioManager.playSfx('tap');
    setInteractionNote(null);
    setCameraPreset('threeQuarter');
    stageRef.current?.resetAllToIdle();
    stageRef.current?.setCameraPreset('threeQuarter');
  };

  const liveAnimName = ANIMATION_LABELS_AR[liveAnim];
  const liveExpName = EXPRESSION_LABELS_AR[liveExpression];

  return (
    <div dir="rtl" className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      {/* Compact status bar above the stage */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            حالة المشهد:{' '}
            <strong className="text-slate-900">
              {telemetry.loaded ? 'جاهز ومحمّل' : 'جارٍ التهيئة'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            الحركة الحالية: <strong className="text-teal-800">{liveAnimName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            التعبير الحالي: <strong className="text-amber-700">{liveExpName}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 tabular-nums text-slate-600">
          <span>{telemetry.webglMode}</span>
          <span aria-hidden="true">·</span>
          <span>{telemetry.fps} FPS</span>
          <span aria-hidden="true">·</span>
          <span>{telemetry.triangles.toLocaleString('en-US')} مثلث</span>
        </div>
      </div>

      {/* Main 2-column Character Lab workspace */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-7 flex min-w-0 flex-col">
          <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full min-w-0">
            <CharacterCanvas
              ref={stageRef}
              viewMode={viewMode}
              lightingPreset={lightingPreset}
              qualityTier={state.settings.qualityTier}
              onTelemetry={setTelemetry}
            />

            {speechCaption && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 shadow-sm">
                {speechCaption}
              </div>
            )}
          </div>
          <p className="mt-2.5 text-xs text-slate-500">
            اسحب على المشهد ثلاثي الأبعاد لتدوير الكاميرا 360°، واستخدم عجلة الفأرة أو اللمس للتقريب والإبعاد.
          </p>
        </div>

        <div className="lg:col-span-5 xl:col-span-5 min-w-0">
          <CharacterControls
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            activeAnim={liveAnim}
            loopAnim={loopAnim}
            onToggleLoop={setLoopAnim}
            isPaused={telemetry.isPaused}
            onTogglePause={handleTogglePause}
            onPlayAnimation={handlePlayAnimation}
            activeExpression={liveExpression}
            onSelectExpression={handleSelectExpression}
            onTriggerBlink={handleTriggerBlink}
            mouthOpen={liveMouthOpen}
            onToggleMouthOpen={handleToggleMouthOpen}
            onTestLipSync={handleTestLipSync}
            onRunInteraction={handleRunInteraction}
            activeInteractionLabel={interactionNote}
            cameraPreset={cameraPreset}
            onSelectCamera={handleSelectCamera}
            lightingPreset={lightingPreset}
            onSelectLighting={setLightingPreset}
            onResetAll={handleResetAll}
          />
        </div>
      </div>
    </div>
  );
};
