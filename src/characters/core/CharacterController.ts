import * as THREE from 'three';
import { CharacterAnimState, CharacterId } from '../../types/game';
import { CharacterAnimationManager, PlayAnimationOptions } from './CharacterAnimationManager';
import { CharacterExpressionManager } from './CharacterExpressionManager';
import {
  CharacterAnimationProfile,
  CharacterSkeletonRig,
  ExpressionTargetState,
  FacialExpression,
} from '../shared/CharacterTypes';

export interface CharacterBundle {
  rig: CharacterSkeletonRig;
  profile: CharacterAnimationProfile;
  expressionOverrides?: Partial<Record<FacialExpression, Partial<ExpressionTargetState>>>;
  disposeAssets: () => void;
}

/**
 * Unified CharacterController
 * Wraps either procedural Three.js rigs (Phase 1) or future GLB/GLTF character assets
 * behind one consistent API for animations, expressions, lip-sync, and facing.
 */
export class CharacterController {
  readonly id: CharacterId;
  readonly rig: CharacterSkeletonRig;
  readonly animations: CharacterAnimationManager;
  readonly expressions: CharacterExpressionManager;

  private targetYaw = 0;
  private targetPosX = 0;
  private targetPosZ = 0;
  private readonly disposeAssets: () => void;

  constructor(bundle: CharacterBundle) {
    this.id = bundle.rig.id;
    this.rig = bundle.rig;
    this.disposeAssets = bundle.disposeAssets;
    this.expressions = new CharacterExpressionManager(bundle.rig, bundle.expressionOverrides);
    this.animations = new CharacterAnimationManager(bundle.rig, bundle.profile, this.expressions);
  }

  getObject3D(): THREE.Group {
    return this.rig.root;
  }

  setPlacement(x: number, z: number, yaw = 0, immediate = false): void {
    this.targetPosX = x;
    this.targetPosZ = z;
    this.targetYaw = yaw;
    if (immediate) {
      this.rig.root.position.set(x, 0, z);
      this.rig.root.rotation.y = yaw;
    }
  }

  setFacingYaw(yaw: number): void {
    this.targetYaw = yaw;
  }

  playAnimation(state: CharacterAnimState, options?: PlayAnimationOptions): void {
    this.animations.play(state, options);
  }

  setExpression(expression: FacialExpression): void {
    this.expressions.setExpression(expression);
  }

  setSpeechAmplitude(amplitude: number): void {
    this.expressions.setSpeechMouthAmplitude(amplitude);
  }

  speakTimed(durationSeconds: number): void {
    this.expressions.triggerSpeechEnvelope(durationSeconds);
  }

  update(dt: number): void {
    const safeDt = Math.min(dt, 0.05);
    this.rig.root.position.x = THREE.MathUtils.damp(this.rig.root.position.x, this.targetPosX, 10, safeDt);
    this.rig.root.position.z = THREE.MathUtils.damp(this.rig.root.position.z, this.targetPosZ, 10, safeDt);
    this.rig.root.rotation.y = THREE.MathUtils.damp(this.rig.root.rotation.y, this.targetYaw, 10, safeDt);
    this.animations.update(safeDt);
  }

  dispose(): void {
    this.animations.dispose();
    this.disposeAssets();
  }
}
