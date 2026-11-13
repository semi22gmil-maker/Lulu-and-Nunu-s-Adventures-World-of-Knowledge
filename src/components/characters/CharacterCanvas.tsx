import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { audioManager } from '../../audio/audioManager';
import { CharacterController } from '../../characters/core/CharacterController';
import { CharacterInteractionManager } from '../../characters/core/CharacterInteractionManager';
import { createLuluCharacter } from '../../characters/lulu/LuluCharacter';
import { createNonoCharacter } from '../../characters/nono/NonoCharacter';
import { createCharacterStudioLighting, CharacterStudioRig } from '../../characters/shared/CharacterLighting';
import {
  CameraPreset,
  CharacterViewMode,
  DualInteractionId,
  FacialExpression,
  LightingPreset,
} from '../../characters/shared/CharacterTypes';
import { CharacterAnimState, CharacterId, QualityTier } from '../../types/game';
import { detectWebGLCapabilities, getRenderProfileConfig } from '../../utils/performanceProfile';

export interface CharacterStageTelemetry {
  loaded: boolean;
  webglMode: string;
  fps: number;
  triangles: number;
  activeAnimationLulu: CharacterAnimState;
  activeAnimationNono: CharacterAnimState;
  activeExpressionLulu: FacialExpression;
  activeExpressionNono: FacialExpression;
  isPaused: boolean;
  mouthOpenLulu: boolean;
  mouthOpenNono: boolean;
}

export interface CharacterStageHandle {
  playAnimation: (target: CharacterViewMode, anim: CharacterAnimState, loop: boolean) => void;
  setExpression: (target: CharacterViewMode, exp: FacialExpression) => void;
  triggerBlink: (target: CharacterViewMode) => void;
  setManualMouthOpen: (target: CharacterViewMode, open: boolean) => void;
  triggerLipSyncTest: (speaker: CharacterId, durationSec?: number) => void;
  runInteraction: (id: DualInteractionId, onLabel?: (msg: string) => void) => void;
  setPauseState: (paused: boolean) => void;
  resetAllToIdle: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
}

interface CharacterCanvasProps {
  viewMode: CharacterViewMode;
  lightingPreset: LightingPreset;
  qualityTier: QualityTier;
  onTelemetry?: (stats: CharacterStageTelemetry) => void;
}

const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();

function computeCameraPresetTargets(
  preset: CameraPreset,
  viewMode: CharacterViewMode
): { pos: THREE.Vector3; look: THREE.Vector3 } {
  const focusY = viewMode === 'nono' ? 0.72 : 0.8;
  const distScale = viewMode === 'both' ? 1.24 : 1.0;

  if (preset === 'front') {
    return {
      pos: new THREE.Vector3(0, focusY + 0.25, 3.05 * distScale),
      look: new THREE.Vector3(0, focusY, 0),
    };
  }
  if (preset === 'side') {
    return {
      pos: new THREE.Vector3(2.9 * distScale, focusY + 0.3, 0.45),
      look: new THREE.Vector3(0, focusY, 0),
    };
  }
  if (preset === 'closeup') {
    const faceY = viewMode === 'nono' ? 0.86 : 0.96;
    return {
      pos: new THREE.Vector3(0.28, faceY + 0.1, 1.55 * (viewMode === 'both' ? 1.35 : 1)),
      look: new THREE.Vector3(0, faceY, 0.12),
    };
  }
  // threeQuarter
  return {
    pos: new THREE.Vector3(1.55 * distScale, focusY + 0.42, 2.65 * distScale),
    look: new THREE.Vector3(0, focusY, 0),
  };
}

export const CharacterCanvas = React.forwardRef<CharacterStageHandle, CharacterCanvasProps>(
  ({ viewMode, lightingPreset, qualityTier, onTelemetry }, ref) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [noWebglFallback, setNoWebglFallback] = useState(false);

    const viewModeRef = useRef(viewMode);
    viewModeRef.current = viewMode;
    const onTelemetryRef = useRef(onTelemetry);
    onTelemetryRef.current = onTelemetry;

    const sceneObjectsRef = useRef<{
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      lulu: CharacterController;
      nono: CharacterController;
      interactions: CharacterInteractionManager;
      lighting: CharacterStudioRig;
      cameraTransitionActive: boolean;
      pushTelemetry: () => void;
    } | null>(null);

    const applyPlacementForMode = (
      mode: CharacterViewMode,
      lulu: CharacterController,
      nono: CharacterController,
      immediate = false
    ) => {
      if (mode === 'lulu') {
        lulu.getObject3D().visible = true;
        nono.getObject3D().visible = false;
        lulu.setPlacement(0, 0, 0, immediate);
      } else if (mode === 'nono') {
        lulu.getObject3D().visible = false;
        nono.getObject3D().visible = true;
        nono.setPlacement(0, 0, 0, immediate);
      } else {
        lulu.getObject3D().visible = true;
        nono.getObject3D().visible = true;
        lulu.setPlacement(-0.62, 0, 0.14, immediate);
        nono.setPlacement(0.62, 0.04, -0.14, immediate);
      }
    };

    useImperativeHandle(ref, () => ({
      playAnimation: (target, anim, loop) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        ctx.interactions.clearPending();
        if (target === 'lulu' || target === 'both') ctx.lulu.playAnimation(anim, { loop });
        if (target === 'nono' || target === 'both') ctx.nono.playAnimation(anim, { loop });
        ctx.pushTelemetry();
      },
      setExpression: (target, exp) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        if (target === 'lulu' || target === 'both') ctx.lulu.setExpression(exp);
        if (target === 'nono' || target === 'both') ctx.nono.setExpression(exp);
        ctx.pushTelemetry();
      },
      triggerBlink: (target) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        if (target === 'lulu' || target === 'both') ctx.lulu.expressions.triggerBlink();
        if (target === 'nono' || target === 'both') ctx.nono.expressions.triggerBlink();
      },
      setManualMouthOpen: (target, open) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        if (target === 'lulu' || target === 'both') ctx.lulu.expressions.setManualMouthOpen(open);
        if (target === 'nono' || target === 'both') ctx.nono.expressions.setManualMouthOpen(open);
        ctx.pushTelemetry();
      },
      triggerLipSyncTest: (speaker, durationSec = 2.4) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        if (speaker === CharacterId.Lulu) {
          ctx.lulu.speakTimed(durationSec);
        } else {
          ctx.nono.speakTimed(durationSec);
        }
      },
      runInteraction: (id, onLabel) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        ctx.lulu.getObject3D().visible = true;
        ctx.nono.getObject3D().visible = true;
        ctx.lulu.setPlacement(-0.62, 0, 0.14, false);
        ctx.nono.setPlacement(0.62, 0.04, -0.14, false);
        ctx.interactions.runInteraction(id, ctx.lulu, ctx.nono, onLabel);
        ctx.pushTelemetry();
      },
      setPauseState: (paused) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        if (paused) {
          ctx.lulu.animations.pause();
          ctx.nono.animations.pause();
        } else {
          ctx.lulu.animations.resume();
          ctx.nono.animations.resume();
        }
        ctx.pushTelemetry();
      },
      resetAllToIdle: () => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        ctx.interactions.clearPending();
        audioManager.stopVoice();
        ctx.lulu.expressions.resetSpeechAndMouth();
        ctx.nono.expressions.resetSpeechAndMouth();
        ctx.lulu.animations.reset();
        ctx.nono.animations.reset();
        applyPlacementForMode(viewModeRef.current, ctx.lulu, ctx.nono, false);
        ctx.pushTelemetry();
      },
      setCameraPreset: (preset) => {
        const ctx = sceneObjectsRef.current;
        if (!ctx) return;
        const targets = computeCameraPresetTargets(preset, viewModeRef.current);
        _camTargetPos.copy(targets.pos);
        _camTargetLook.copy(targets.look);
        ctx.cameraTransitionActive = true;
      },
    }));

    // Mount WebGLRenderer & Scene once per qualityTier change
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const caps = detectWebGLCapabilities();
      if (!caps.hasWebGL) {
        setNoWebglFallback(true);
        return;
      }

      const profile = getRenderProfileConfig(qualityTier);
      const width = Math.max(300, container.clientWidth);
      const height = Math.max(320, container.clientHeight);

      const renderer = new THREE.WebGLRenderer({
        antialias: profile.antialias,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setPixelRatio(profile.maxPixelRatio);
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = profile.shadowsEnabled;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const handleContextRestored = () => {
        setContextLost(false);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
      const initCam = computeCameraPresetTargets('threeQuarter', viewModeRef.current);
      camera.position.copy(initCam.pos);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(initCam.look);
      controls.enableDamping = !profile.isSoftwareGl;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 1.25;
      controls.maxDistance = 6.5;
      controls.minPolarAngle = 0.28;
      controls.maxPolarAngle = Math.PI * 0.49;

      const lighting = createCharacterStudioLighting(
        scene,
        renderer,
        profile.shadowsEnabled,
        profile.shadowMapSize
      );
      lighting.applyPreset(lightingPreset, scene);

      // Stylized 3D Storybook Stage Floor + Natural Meadow Perimeter
      const stageDisposables: Array<{ dispose: () => void }> = [];

      const groundGeo = new THREE.CircleGeometry(18, 48);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0xd9f2d0,
        roughness: 0.92,
      });
      const groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.receiveShadow = true;
      scene.add(groundMesh);
      stageDisposables.push(groundGeo, groundMat);

      // Cozy wooden/stone showcase dais under characters (offset Y = 0.015 to avoid Z-fighting)
      const daisGeo = new THREE.CylinderGeometry(1.45, 1.58, 0.06, 36);
      const daisMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.78,
      });
      const daisMesh = new THREE.Mesh(daisGeo, daisMat);
      daisMesh.position.y = -0.025;
      daisMesh.receiveShadow = true;
      scene.add(daisMesh);
      stageDisposables.push(daisGeo, daisMat);

      const daisRimGeo = new THREE.TorusGeometry(1.48, 0.032, 10, 48);
      const daisRimMat = new THREE.MeshStandardMaterial({
        color: 0x14b8a6,
        roughness: 0.45,
      });
      const daisRim = new THREE.Mesh(daisRimGeo, daisRimMat);
      daisRim.rotation.x = Math.PI / 2;
      daisRim.position.y = 0.005;
      scene.add(daisRim);
      stageDisposables.push(daisRimGeo, daisRimMat);

      // Stylized natural horizon bushes & smooth stepping stones (depth without clutter)
      const bushGeo = new THREE.SphereGeometry(0.45, 14, 12);
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.88 });
      const stoneGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.05, 16);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 });
      stageDisposables.push(bushGeo, bushMat, stoneGeo, stoneMat);

      const bushPositions: Array<[number, number, number]> = [
        [-3.4, -3.2, 1.25],
        [-2.7, -3.7, 0.95],
        [3.3, -3.0, 1.15],
        [2.6, -3.6, 0.9],
        [0.1, -4.6, 1.4],
      ];
      bushPositions.forEach(([bx, bz, bs]) => {
        const bush = new THREE.Mesh(bushGeo, bushMat);
        bush.position.set(bx, 0.28 * bs, bz);
        bush.scale.set(bs * 1.15, bs * 0.85, bs);
        bush.receiveShadow = true;
        scene.add(bush);
      });

      [
        [-1.85, 0.9],
        [1.92, 0.82],
      ].forEach(([sx, sz]) => {
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        stone.position.set(sx, 0.02, sz);
        stone.receiveShadow = true;
        scene.add(stone);
      });

      // Instantiate Lulu & Nono
      const lulu = createLuluCharacter();
      const nono = createNonoCharacter();
      scene.add(lulu.getObject3D());
      scene.add(nono.getObject3D());
      applyPlacementForMode(viewModeRef.current, lulu, nono, true);

      const interactions = new CharacterInteractionManager();

      if (!profile.isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      const pushTelemetryFn = () => {
        onTelemetryRef.current?.({
          loaded: true,
          webglMode: profile.fallbackMode,
          fps: currentFps,
          triangles: renderer.info.render.triangles,
          activeAnimationLulu: lulu.animations.getState(),
          activeAnimationNono: nono.animations.getState(),
          activeExpressionLulu: lulu.expressions.getExpression(),
          activeExpressionNono: nono.expressions.getExpression(),
          isPaused:
            viewModeRef.current === 'nono'
              ? nono.animations.isPaused()
              : lulu.animations.isPaused(),
          mouthOpenLulu: lulu.expressions.isManualMouthOpen(),
          mouthOpenNono: nono.expressions.isManualMouthOpen(),
        });
      };

      const sceneCtx = {
        scene,
        camera,
        controls,
        lulu,
        nono,
        interactions,
        lighting,
        cameraTransitionActive: false,
        pushTelemetry: pushTelemetryFn,
      };
      sceneObjectsRef.current = sceneCtx;

      const handleControlsStart = () => {
        sceneCtx.cameraTransitionActive = false;
      };
      controls.addEventListener('start', handleControlsStart);

      // Subscribe to Phase 0 audioManager lip-sync events so voice clips move character mouths automatically
      const unsubLipSync = audioManager.subscribeLipSync((speaker, mouthOpen) => {
        if (speaker === CharacterId.Lulu) lulu.setSpeechAmplitude(mouthOpen);
        else if (speaker === CharacterId.Nono) nono.setSpeechAmplitude(mouthOpen);
        else {
          lulu.setSpeechAmplitude(0);
          nono.setSpeechAmplitude(0);
        }
      });

      const handleResize = () => {
        if (!container) return;
        const w = Math.max(300, container.clientWidth);
        const h = Math.max(320, container.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      let frameId = 0;
      let disposed = false;
      let lastTime = performance.now();
      let fpsAccum = 0;
      let fpsFrames = 0;
      let currentFps = 60;
      let telemetryTimer = 0;

      const afterDraw = (cb: () => void) => {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 80);
        }
      };

      const tick = () => {
        if (disposed) return;
        if (document.hidden) {
          lastTime = performance.now();
          frameId = window.setTimeout(tick, 250);
          return;
        }

        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        if (sceneCtx.cameraTransitionActive) {
          camera.position.lerp(_camTargetPos, 1 - Math.exp(-7 * dt));
          controls.target.lerp(_camTargetLook, 1 - Math.exp(-7 * dt));
          if (camera.position.distanceTo(_camTargetPos) < 0.015) {
            camera.position.copy(_camTargetPos);
            controls.target.copy(_camTargetLook);
            sceneCtx.cameraTransitionActive = false;
          }
        }

        controls.update();
        lulu.update(dt);
        nono.update(dt);
        renderer.render(scene, camera);

        fpsAccum += dt;
        fpsFrames += 1;
        telemetryTimer += dt;
        if (telemetryTimer >= 0.3) {
          currentFps = fpsAccum > 0 ? Math.round(fpsFrames / fpsAccum) : 60;
          fpsAccum = 0;
          fpsFrames = 0;
          telemetryTimer = 0;
          pushTelemetryFn();
        }

        if (profile.isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        window.removeEventListener('resize', handleResize);
        controls.removeEventListener('start', handleControlsStart);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        unsubLipSync();
        interactions.dispose();
        lulu.dispose();
        nono.dispose();
        lighting.dispose(renderer, scene);
        stageDisposables.forEach((d) => d.dispose());
        controls.dispose();
        renderer.dispose();
        sceneObjectsRef.current = null;
      };
    }, [qualityTier]);

    // Respond smoothly to viewMode changes without rebuilding WebGL scene
    useEffect(() => {
      const ctx = sceneObjectsRef.current;
      if (!ctx) return;
      ctx.interactions.clearPending();
      applyPlacementForMode(viewMode, ctx.lulu, ctx.nono, false);
      const targets = computeCameraPresetTargets('threeQuarter', viewMode);
      _camTargetPos.copy(targets.pos);
      _camTargetLook.copy(targets.look);
      ctx.cameraTransitionActive = true;
    }, [viewMode]);

    // Respond to lightingPreset changes without rebuilding WebGL scene
    useEffect(() => {
      const ctx = sceneObjectsRef.current;
      if (!ctx) return;
      ctx.lighting.applyPreset(lightingPreset, ctx.scene);
    }, [lightingPreset]);

    if (noWebglFallback) {
      return (
        <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-display text-base font-bold text-amber-950">
            تم تفعيل المسار الاحتياطي (WebGL غير متاح على هذا المتصفح)
          </p>
          <p className="mt-2 max-w-md text-sm text-amber-800">
            التطبيق مستمر في العمل بأمان دون تعطل، يرجى تشغيله على جهاز يدعم WebGL أو WebGL2 لعرض النماذج ثلاثية الأبعاد.
          </p>
        </div>
      );
    }

    return (
      <div className="relative h-full min-h-[440px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-sky-50">
        <div ref={mountRef} className="h-full min-h-[440px] w-full cursor-grab active:cursor-grabbing" />
        {contextLost && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/75 p-4 text-center text-white">
            <p className="font-display text-sm font-bold">
              تم إيقاف سياق الرسوميات مؤقتاً — جارٍ استعادة المشهد ثلاثي الأبعاد...
            </p>
          </div>
        )}
      </div>
    );
  }
);

CharacterCanvas.displayName = 'CharacterCanvas';
