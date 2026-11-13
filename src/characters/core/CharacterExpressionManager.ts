import * as THREE from 'three';
import {
  CharacterEyeRig,
  CharacterSkeletonRig,
  ExpressionTargetState,
  FacialExpression,
} from '../shared/CharacterTypes';

const EXPRESSION_PRESETS: Record<FacialExpression, ExpressionTargetState> = {
  [FacialExpression.Neutral]: {
    eyeScaleY: 1,
    eyeScaleX: 1,
    pupilScale: 1,
    lidClosure: 0,
    happyEyeWeight: 0,
    browYOffset: 0,
    browTiltZ: 0,
    cheekOpacity: 0.36,
    mouthOpen: 0.04,
    smileWeight: 0.45,
    sadWeight: 0,
    oShapeWeight: 0,
  },
  [FacialExpression.Smile]: {
    eyeScaleY: 0.94,
    eyeScaleX: 1.03,
    pupilScale: 1.06,
    lidClosure: 0.08,
    happyEyeWeight: 0.35,
    browYOffset: 0.015,
    browTiltZ: 0.08,
    cheekOpacity: 0.6,
    mouthOpen: 0.14,
    smileWeight: 1,
    sadWeight: 0,
    oShapeWeight: 0,
  },
  [FacialExpression.Laugh]: {
    eyeScaleY: 0.55,
    eyeScaleX: 1.12,
    pupilScale: 1.08,
    lidClosure: 0.35,
    happyEyeWeight: 1,
    browYOffset: 0.03,
    browTiltZ: 0.12,
    cheekOpacity: 0.78,
    mouthOpen: 0.72,
    smileWeight: 1,
    sadWeight: 0,
    oShapeWeight: 0,
  },
  [FacialExpression.GentleSad]: {
    eyeScaleY: 0.88,
    eyeScaleX: 0.98,
    pupilScale: 1.02,
    lidClosure: 0.28,
    happyEyeWeight: 0,
    browYOffset: -0.012,
    browTiltZ: -0.26,
    cheekOpacity: 0.25,
    mouthOpen: 0.02,
    smileWeight: 0,
    sadWeight: 1,
    oShapeWeight: 0,
  },
  [FacialExpression.Surprise]: {
    eyeScaleY: 1.24,
    eyeScaleX: 1.18,
    pupilScale: 0.86,
    lidClosure: 0,
    happyEyeWeight: 0,
    browYOffset: 0.048,
    browTiltZ: 0.05,
    cheekOpacity: 0.48,
    mouthOpen: 0.78,
    smileWeight: 0,
    sadWeight: 0,
    oShapeWeight: 1,
  },
  [FacialExpression.Focus]: {
    eyeScaleY: 0.86,
    eyeScaleX: 1.0,
    pupilScale: 1.04,
    lidClosure: 0.14,
    happyEyeWeight: 0,
    browYOffset: -0.01,
    browTiltZ: -0.1,
    cheekOpacity: 0.3,
    mouthOpen: 0.03,
    smileWeight: 0.2,
    sadWeight: 0,
    oShapeWeight: 0,
  },
  [FacialExpression.Think]: {
    eyeScaleY: 0.88,
    eyeScaleX: 0.98,
    pupilScale: 0.96,
    lidClosure: 0.2,
    happyEyeWeight: 0,
    browYOffset: 0.02,
    browTiltZ: 0.2,
    cheekOpacity: 0.34,
    mouthOpen: 0.05,
    smileWeight: 0.15,
    sadWeight: 0,
    oShapeWeight: 0.28,
  },
  [FacialExpression.Encourage]: {
    eyeScaleY: 0.96,
    eyeScaleX: 1.05,
    pupilScale: 1.08,
    lidClosure: 0.05,
    happyEyeWeight: 0.55,
    browYOffset: 0.026,
    browTiltZ: 0.1,
    cheekOpacity: 0.65,
    mouthOpen: 0.28,
    smileWeight: 0.95,
    sadWeight: 0,
    oShapeWeight: 0,
  },
};

export class CharacterExpressionManager {
  private rig: CharacterSkeletonRig;
  private customOverrides: Partial<Record<FacialExpression, Partial<ExpressionTargetState>>>;
  private activeExpression: FacialExpression = FacialExpression.Smile;
  private current: ExpressionTargetState = { ...EXPRESSION_PRESETS[FacialExpression.Smile] };

  private blinkElapsed = 0;
  private nextBlinkDelay = 2.8;
  private isBlinking = false;
  private speechMouthAmplitude = 0;
  private speechEnvelopeTimer = 0;
  private manualMouthOpen = false;
  private gazeOffsetX = 0;
  private gazeOffsetY = 0;

  private readonly leftBrowBaseY: number;
  private readonly rightBrowBaseY: number;
  private readonly leftEyeBaseScale: THREE.Vector3;
  private readonly rightEyeBaseScale: THREE.Vector3;

  constructor(
    rig: CharacterSkeletonRig,
    customOverrides: Partial<Record<FacialExpression, Partial<ExpressionTargetState>>> = {}
  ) {
    this.rig = rig;
    this.customOverrides = customOverrides;
    this.leftBrowBaseY = rig.leftBrow.position.y;
    this.rightBrowBaseY = rig.rightBrow.position.y;
    this.leftEyeBaseScale = rig.leftEye.group.scale.clone();
    this.rightEyeBaseScale = rig.rightEye.group.scale.clone();
  }

  setExpression(expression: FacialExpression): void {
    this.activeExpression = expression;
  }

  getExpression(): FacialExpression {
    return this.activeExpression;
  }

  triggerBlink(): void {
    this.isBlinking = true;
    this.blinkElapsed = 0;
  }

  /**
   * External API for audio lip-sync amplitude (0..1) or scripted speech envelope.
   */
  setSpeechMouthAmplitude(amplitude: number): void {
    this.speechMouthAmplitude = THREE.MathUtils.clamp(amplitude, 0, 1);
  }

  triggerSpeechEnvelope(durationSeconds: number): void {
    this.speechEnvelopeTimer = Math.max(0, durationSeconds);
  }

  setManualMouthOpen(open: boolean): void {
    this.manualMouthOpen = open;
  }

  isManualMouthOpen(): boolean {
    return this.manualMouthOpen;
  }

  resetSpeechAndMouth(): void {
    this.speechMouthAmplitude = 0;
    this.speechEnvelopeTimer = 0;
    this.manualMouthOpen = false;
  }

  setGazeTarget(x: number, y: number): void {
    this.gazeOffsetX = THREE.MathUtils.clamp(x, -0.022, 0.022);
    this.gazeOffsetY = THREE.MathUtils.clamp(y, -0.015, 0.018);
  }

  update(dt: number, elapsed: number): void {
    const safeDt = Math.min(dt, 0.05);
    const baseTarget = EXPRESSION_PRESETS[this.activeExpression];
    const override = this.customOverrides[this.activeExpression];
    const target: ExpressionTargetState = override ? { ...baseTarget, ...override } : baseTarget;

    // Natural automatic blink loop
    this.blinkElapsed += safeDt;
    if (!this.isBlinking && this.blinkElapsed >= this.nextBlinkDelay) {
      this.isBlinking = true;
      this.blinkElapsed = 0;
      this.nextBlinkDelay = 2.6 + ((Math.sin(elapsed * 7.3) + 1) * 0.9);
    }

    let blinkFactor = 0;
    if (this.isBlinking) {
      const blinkDuration = 0.16;
      const t = this.blinkElapsed / blinkDuration;
      if (t >= 1) {
        this.isBlinking = false;
        this.blinkElapsed = 0;
      } else {
        blinkFactor = Math.sin(t * Math.PI);
      }
    }

    // Speech envelope modulation
    let speechLevel = this.speechMouthAmplitude;
    if (this.speechEnvelopeTimer > 0) {
      this.speechEnvelopeTimer = Math.max(0, this.speechEnvelopeTimer - safeDt);
      const syllable = Math.abs(Math.sin(elapsed * 16)) * 0.65 + Math.abs(Math.sin(elapsed * 27)) * 0.35;
      speechLevel = Math.max(speechLevel, syllable * 0.92);
    }

    const speed = 13;
    this.current.eyeScaleY = THREE.MathUtils.damp(this.current.eyeScaleY, target.eyeScaleY, speed, safeDt);
    this.current.eyeScaleX = THREE.MathUtils.damp(this.current.eyeScaleX, target.eyeScaleX, speed, safeDt);
    this.current.pupilScale = THREE.MathUtils.damp(this.current.pupilScale, target.pupilScale, speed, safeDt);
    this.current.lidClosure = THREE.MathUtils.damp(this.current.lidClosure, target.lidClosure, speed, safeDt);
    this.current.happyEyeWeight = THREE.MathUtils.damp(
      this.current.happyEyeWeight,
      target.happyEyeWeight,
      speed,
      safeDt
    );
    this.current.browYOffset = THREE.MathUtils.damp(this.current.browYOffset, target.browYOffset, speed, safeDt);
    this.current.browTiltZ = THREE.MathUtils.damp(this.current.browTiltZ, target.browTiltZ, speed, safeDt);
    this.current.cheekOpacity = THREE.MathUtils.damp(this.current.cheekOpacity, target.cheekOpacity, speed, safeDt);

    const manualOpenLevel = this.manualMouthOpen ? 0.82 : 0;
    const desiredMouthOpen = Math.max(target.mouthOpen, speechLevel * 0.88, manualOpenLevel);
    this.current.mouthOpen = THREE.MathUtils.damp(this.current.mouthOpen, desiredMouthOpen, 18, safeDt);
    this.current.smileWeight = THREE.MathUtils.damp(this.current.smileWeight, target.smileWeight, speed, safeDt);
    this.current.sadWeight = THREE.MathUtils.damp(this.current.sadWeight, target.sadWeight, speed, safeDt);
    this.current.oShapeWeight = THREE.MathUtils.damp(this.current.oShapeWeight, target.oShapeWeight, speed, safeDt);

    const totalLidClose = THREE.MathUtils.clamp(Math.max(this.current.lidClosure, blinkFactor), 0, 1);

    this.applyEyeState(this.rig.leftEye, this.leftEyeBaseScale, totalLidClose);
    this.applyEyeState(this.rig.rightEye, this.rightEyeBaseScale, totalLidClose);

    // Eyebrows
    this.rig.leftBrow.position.y = this.leftBrowBaseY + this.current.browYOffset;
    this.rig.rightBrow.position.y = this.rightBrowBaseY + this.current.browYOffset;
    this.rig.leftBrow.rotation.z = this.current.browTiltZ;
    this.rig.rightBrow.rotation.z = -this.current.browTiltZ;

    // Rosy cheeks
    const leftCheekMat = this.rig.leftCheek.material as THREE.MeshStandardMaterial;
    const rightCheekMat = this.rig.rightCheek.material as THREE.MeshStandardMaterial;
    leftCheekMat.opacity = this.current.cheekOpacity;
    rightCheekMat.opacity = this.current.cheekOpacity;

    // Mouth articulation (jaw drop + cavity + tongue + smile/sad curves)
    const mouth = this.rig.mouth;
    const open = this.current.mouthOpen;
    const oShape = this.current.oShapeWeight;

    mouth.lowerJaw.position.y = -0.015 - open * 0.042;
    mouth.lowerJaw.scale.x = 1 - oShape * 0.36;
    mouth.cavity.scale.set(1 - oShape * 0.32, 0.18 + open * 1.15, 1);
    mouth.cavity.visible = open > 0.06;
    mouth.tongue.visible = open > 0.18;
    mouth.tongue.scale.y = 0.6 + open * 0.55;

    mouth.smileCurve.visible = this.current.smileWeight > 0.12 && oShape < 0.5;
    mouth.smileCurve.scale.set(
      0.7 + this.current.smileWeight * 0.35,
      0.85 + open * 0.45,
      1
    );

    mouth.sadCurve.visible = this.current.sadWeight > 0.15;
    mouth.sadCurve.scale.setScalar(0.85 + this.current.sadWeight * 0.2);
  }

  private applyEyeState(eye: CharacterEyeRig, baseScale: THREE.Vector3, lidClose: number): void {
    eye.group.scale.set(
      baseScale.x * this.current.eyeScaleX,
      baseScale.y * this.current.eyeScaleY,
      baseScale.z
    );

    eye.iris.position.x = this.gazeOffsetX;
    eye.iris.position.y = this.gazeOffsetY;
    eye.pupil.scale.setScalar(this.current.pupilScale);

    // Upper & lower eyelids close toward eye center smoothly
    eye.upperLid.scale.y = Math.max(0.05, lidClose * 1.05);
    eye.upperLid.visible = lidClose > 0.04;
    eye.lowerLid.scale.y = Math.max(0.05, lidClose * 0.65);
    eye.lowerLid.visible = lidClose > 0.12;

    const showHappyArc = this.current.happyEyeWeight > 0.42 && lidClose < 0.7;
    eye.happyArc.visible = showHappyArc;
    eye.happyArc.scale.setScalar(0.75 + this.current.happyEyeWeight * 0.3);
  }
}
