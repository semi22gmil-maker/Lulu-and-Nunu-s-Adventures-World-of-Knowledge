import * as THREE from 'three';
import { CharacterAnimState } from '../../types/game';
import {
  CharacterAnimationProfile,
  CharacterPoseSample,
  CharacterSkeletonRig,
} from '../shared/CharacterTypes';
import { CharacterExpressionManager } from './CharacterExpressionManager';

export interface PlayAnimationOptions {
  loop?: boolean;
  speed?: number;
  preserveExpression?: boolean;
  onComplete?: () => void;
}

export class CharacterAnimationManager {
  private rig: CharacterSkeletonRig;
  private profile: CharacterAnimationProfile;
  private expressionManager: CharacterExpressionManager;
  private mixer: THREE.AnimationMixer;
  private subtleAccentAction: THREE.AnimationAction;

  private activeState: CharacterAnimState = CharacterAnimState.Idle;
  private loopCurrent = true;
  private paused = false;
  private speedScale = 1;
  private stateElapsed = 0;
  private totalElapsed = 0;
  private pendingOnComplete?: () => void;
  private commandNonce = 0;

  // Current smoothed pose values to prevent abrupt snaps across transitions
  private pose: Required<CharacterPoseSample> = {
    pelvisYOffset: 0,
    pelvisTiltX: 0,
    pelvisTiltZ: 0,
    pelvisYaw: 0,
    torsoTiltX: 0,
    torsoTiltZ: 0,
    torsoYaw: 0,
    headTiltX: 0,
    headTiltZ: 0,
    headYaw: 0,
    leftEarX: 0,
    leftEarZ: 0,
    rightEarX: 0,
    rightEarZ: 0,
    leftArmX: 0,
    leftArmZ: -0.24,
    leftElbowX: -0.15,
    rightArmX: 0,
    rightArmZ: 0.24,
    rightElbowX: -0.15,
    leftLegX: 0,
    leftLegZ: 0,
    rightLegX: 0,
    rightLegZ: 0,
    tailX: 0,
    tailY: 0,
    squashY: 1,
    stretchXZ: 1,
  };

  constructor(
    rig: CharacterSkeletonRig,
    profile: CharacterAnimationProfile,
    expressionManager: CharacterExpressionManager
  ) {
    this.rig = rig;
    this.profile = profile;
    this.expressionManager = expressionManager;

    // Three.js AnimationMixer driving a subtle harmonic ambient clip on the root aura/breathing layer
    this.mixer = new THREE.AnimationMixer(rig.bodyPivot);
    const breatheTrack = new THREE.NumberKeyframeTrack(
      '.scale[y]',
      [0, 1.2, 2.4],
      [1.0, 1.012, 1.0]
    );
    const ambientClip = new THREE.AnimationClip('AmbientBreathe', 2.4, [breatheTrack]);
    this.subtleAccentAction = this.mixer.clipAction(ambientClip);
    this.subtleAccentAction.play();
  }

  getState(): CharacterAnimState {
    return this.activeState;
  }

  isPaused(): boolean {
    return this.paused;
  }

  isLooping(): boolean {
    return this.loopCurrent;
  }

  play(state: CharacterAnimState, options: PlayAnimationOptions = {}): void {
    this.commandNonce += 1;
    const isSameState = this.activeState === state && !this.paused;

    this.activeState = state;
    this.paused = false;
    this.subtleAccentAction.paused = false;
    this.speedScale = options.speed ?? 1;
    this.pendingOnComplete = options.onComplete;

    const hasOneShotDefault = Boolean(this.profile.oneShotDurations[state]);
    this.loopCurrent = options.loop ?? !hasOneShotDefault;

    if (!isSameState || !this.loopCurrent) {
      this.stateElapsed = 0;
    }

    if (!options.preserveExpression) {
      const mappedExp = this.profile.defaultExpression[state];
      if (mappedExp) {
        this.expressionManager.setExpression(mappedExp);
      }
    }
  }

  pause(): void {
    this.paused = true;
    this.subtleAccentAction.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.subtleAccentAction.paused = false;
  }

  reset(): void {
    this.play(CharacterAnimState.Idle, { loop: true, speed: 1 });
  }

  update(dt: number): void {
    const safeDt = Math.min(dt, 0.05);
    if (!this.paused) {
      this.mixer.update(safeDt * this.speedScale);
      this.totalElapsed += safeDt * this.speedScale;
      this.stateElapsed += safeDt * this.speedScale;
    }

    const oneShotDuration = this.profile.oneShotDurations[this.activeState] ?? 1.25;
    let phase = this.stateElapsed;
    if (!this.loopCurrent && this.stateElapsed >= oneShotDuration) {
      const callback = this.pendingOnComplete;
      const nonceAtCall = this.commandNonce;
      this.pendingOnComplete = undefined;
      this.play(CharacterAnimState.Idle, { loop: true });
      if (callback && nonceAtCall === this.commandNonce - 1) {
        callback();
      }
      phase = 0;
    }

    const evaluator = this.profile.evaluators[this.activeState];
    const targetSample = evaluator(this.totalElapsed, phase);

    const dampRate = 11.5;
    const damp = (curr: number, target = 0) => THREE.MathUtils.damp(curr, target, dampRate, safeDt);

    this.pose.pelvisYOffset = damp(this.pose.pelvisYOffset, targetSample.pelvisYOffset ?? 0);
    this.pose.pelvisTiltX = damp(this.pose.pelvisTiltX, targetSample.pelvisTiltX ?? 0);
    this.pose.pelvisTiltZ = damp(this.pose.pelvisTiltZ, targetSample.pelvisTiltZ ?? 0);
    this.pose.pelvisYaw = damp(this.pose.pelvisYaw, targetSample.pelvisYaw ?? 0);

    this.pose.torsoTiltX = damp(this.pose.torsoTiltX, targetSample.torsoTiltX ?? 0);
    this.pose.torsoTiltZ = damp(this.pose.torsoTiltZ, targetSample.torsoTiltZ ?? 0);
    this.pose.torsoYaw = damp(this.pose.torsoYaw, targetSample.torsoYaw ?? 0);

    this.pose.headTiltX = damp(this.pose.headTiltX, targetSample.headTiltX ?? 0);
    this.pose.headTiltZ = damp(this.pose.headTiltZ, targetSample.headTiltZ ?? 0);
    this.pose.headYaw = damp(this.pose.headYaw, targetSample.headYaw ?? 0);

    this.pose.leftEarX = damp(this.pose.leftEarX, targetSample.leftEarX ?? 0);
    this.pose.leftEarZ = damp(this.pose.leftEarZ, targetSample.leftEarZ ?? 0.08);
    this.pose.rightEarX = damp(this.pose.rightEarX, targetSample.rightEarX ?? 0);
    this.pose.rightEarZ = damp(this.pose.rightEarZ, targetSample.rightEarZ ?? -0.08);

    this.pose.leftArmX = damp(this.pose.leftArmX, targetSample.leftArmX ?? 0);
    this.pose.leftArmZ = damp(this.pose.leftArmZ, targetSample.leftArmZ ?? -0.24);
    this.pose.leftElbowX = damp(this.pose.leftElbowX, targetSample.leftElbowX ?? -0.18);

    this.pose.rightArmX = damp(this.pose.rightArmX, targetSample.rightArmX ?? 0);
    this.pose.rightArmZ = damp(this.pose.rightArmZ, targetSample.rightArmZ ?? 0.24);
    this.pose.rightElbowX = damp(this.pose.rightElbowX, targetSample.rightElbowX ?? -0.18);

    this.pose.leftLegX = damp(this.pose.leftLegX, targetSample.leftLegX ?? 0);
    this.pose.leftLegZ = damp(this.pose.leftLegZ, targetSample.leftLegZ ?? 0);
    this.pose.rightLegX = damp(this.pose.rightLegX, targetSample.rightLegX ?? 0);
    this.pose.rightLegZ = damp(this.pose.rightLegZ, targetSample.rightLegZ ?? 0);

    this.pose.tailX = damp(this.pose.tailX, targetSample.tailX ?? 0);
    this.pose.tailY = damp(this.pose.tailY, targetSample.tailY ?? 0);
    this.pose.squashY = damp(this.pose.squashY, targetSample.squashY ?? 1);
    this.pose.stretchXZ = damp(this.pose.stretchXZ, targetSample.stretchXZ ?? 1);

    // Apply smoothed transforms cleanly to hierarchical joints
    this.rig.pelvis.position.y = this.rig.baseHeights.pelvisY + this.pose.pelvisYOffset;
    this.rig.pelvis.rotation.set(this.pose.pelvisTiltX, this.pose.pelvisYaw, this.pose.pelvisTiltZ);
    this.rig.pelvis.scale.set(this.pose.stretchXZ, this.pose.squashY, this.pose.stretchXZ);

    this.rig.torso.rotation.set(this.pose.torsoTiltX, this.pose.torsoYaw, this.pose.torsoTiltZ);
    this.rig.head.rotation.set(this.pose.headTiltX, this.pose.headYaw, this.pose.headTiltZ);

    this.rig.leftEarPivot.rotation.set(this.pose.leftEarX, 0, this.pose.leftEarZ);
    this.rig.rightEarPivot.rotation.set(this.pose.rightEarX, 0, this.pose.rightEarZ);

    this.rig.leftShoulder.rotation.set(this.pose.leftArmX, 0, this.pose.leftArmZ);
    this.rig.leftElbow.rotation.set(this.pose.leftElbowX, 0, 0);
    this.rig.rightShoulder.rotation.set(this.pose.rightArmX, 0, this.pose.rightArmZ);
    this.rig.rightElbow.rotation.set(this.pose.rightElbowX, 0, 0);

    this.rig.leftHip.rotation.set(this.pose.leftLegX, 0, this.pose.leftLegZ);
    this.rig.rightHip.rotation.set(this.pose.rightLegX, 0, this.pose.rightLegZ);

    this.rig.tailPivot.rotation.set(this.pose.tailX, this.pose.tailY, 0);

    // Grounded contact shadow reacts subtly when jumping
    const heightFactor = Math.max(0, this.pose.pelvisYOffset);
    const shadowScale = Math.max(0.55, 1 - heightFactor * 0.45);
    this.rig.contactShadow.scale.setScalar(shadowScale);
    const shadowMat = this.rig.contactShadow.material as THREE.MeshBasicMaterial;
    shadowMat.opacity = Math.max(0.22, 0.65 - heightFactor * 0.35);

    this.expressionManager.update(safeDt, this.totalElapsed);
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.rig.bodyPivot);
  }
}
