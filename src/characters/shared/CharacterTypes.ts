import * as THREE from 'three';
import { CharacterAnimState, CharacterId } from '../../types/game';

export enum FacialExpression {
  Neutral = 'Neutral',
  Smile = 'Smile',
  Laugh = 'Laugh',
  GentleSad = 'GentleSad',
  Surprise = 'Surprise',
  Focus = 'Focus',
  Think = 'Think',
  Encourage = 'Encourage',
}

export type CameraPreset = 'front' | 'threeQuarter' | 'side' | 'closeup';
export type LightingPreset = 'studioWarm' | 'sunnyMorning' | 'cozyEvening';
export type CharacterViewMode = 'lulu' | 'nono' | 'both';

export type DualInteractionId =
  | 'luluWelcomesNono'
  | 'nonoWavesToLulu'
  | 'luluPointsToNono'
  | 'nonoJumpsHappily'
  | 'celebrateTogether'
  | 'nonoSurprisedLuluLooks'
  | 'welcomeChild'
  | 'nonoClapsForLulu'
  | 'luluEncouragesNono';

export interface CharacterEyeRig {
  group: THREE.Group;
  sclera: THREE.Mesh;
  iris: THREE.Mesh;
  pupil: THREE.Mesh;
  catchlightMain: THREE.Mesh;
  catchlightSub: THREE.Mesh;
  upperLid: THREE.Mesh;
  lowerLid: THREE.Mesh;
  happyArc: THREE.Mesh;
}

export interface CharacterMouthRig {
  group: THREE.Group;
  upperLip: THREE.Mesh;
  lowerJaw: THREE.Mesh;
  cavity: THREE.Mesh;
  tongue: THREE.Mesh;
  smileCurve: THREE.Mesh;
  sadCurve: THREE.Mesh;
}

export interface CharacterSkeletonRig {
  id: CharacterId;
  root: THREE.Group;
  bodyPivot: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  leftEarPivot: THREE.Group;
  rightEarPivot: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  leftHip: THREE.Group;
  rightHip: THREE.Group;
  tailPivot: THREE.Group;
  leftEye: CharacterEyeRig;
  rightEye: CharacterEyeRig;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  leftCheek: THREE.Mesh;
  rightCheek: THREE.Mesh;
  mouth: CharacterMouthRig;
  accessoryGroup?: THREE.Group;
  contactShadow: THREE.Mesh;
  baseHeights: {
    pelvisY: number;
    headY: number;
  };
}

export interface CharacterPoseSample {
  pelvisYOffset?: number;
  pelvisTiltX?: number;
  pelvisTiltZ?: number;
  pelvisYaw?: number;
  torsoTiltX?: number;
  torsoTiltZ?: number;
  torsoYaw?: number;
  headTiltX?: number;
  headTiltZ?: number;
  headYaw?: number;
  leftEarX?: number;
  leftEarZ?: number;
  rightEarX?: number;
  rightEarZ?: number;
  leftArmX?: number;
  leftArmZ?: number;
  leftElbowX?: number;
  rightArmX?: number;
  rightArmZ?: number;
  rightElbowX?: number;
  leftLegX?: number;
  leftLegZ?: number;
  rightLegX?: number;
  rightLegZ?: number;
  tailX?: number;
  tailY?: number;
  squashY?: number;
  stretchXZ?: number;
}

export type AnimationPoseEvaluator = (elapsed: number, phase: number) => CharacterPoseSample;

export interface CharacterAnimationProfile {
  defaultExpression: Partial<Record<CharacterAnimState, FacialExpression>>;
  evaluators: Record<CharacterAnimState, AnimationPoseEvaluator>;
  oneShotDurations: Partial<Record<CharacterAnimState, number>>;
}

export interface ExpressionTargetState {
  eyeScaleY: number;
  eyeScaleX: number;
  pupilScale: number;
  lidClosure: number;
  happyEyeWeight: number;
  browYOffset: number;
  browTiltZ: number;
  cheekOpacity: number;
  mouthOpen: number;
  smileWeight: number;
  sadWeight: number;
  oShapeWeight: number;
}

export const ANIMATION_LABELS_AR: Record<CharacterAnimState, string> = {
  [CharacterAnimState.Idle]: 'الوقوف والتنفس',
  [CharacterAnimState.Walk]: 'المشي',
  [CharacterAnimState.Run]: 'الجري',
  [CharacterAnimState.Jump]: 'القفز',
  [CharacterAnimState.Celebrate]: 'الاحتفال',
  [CharacterAnimState.Dance]: 'الرقص',
  [CharacterAnimState.Clap]: 'التصفيق',
  [CharacterAnimState.Encourage]: 'التشجيع',
  [CharacterAnimState.Point]: 'الإشارة',
  [CharacterAnimState.Think]: 'التفكير',
  [CharacterAnimState.Surprise]: 'الدهشة',
  [CharacterAnimState.Laugh]: 'الضحك',
  [CharacterAnimState.GentleSad]: 'الحزن اللطيف',
};

export const EXPRESSION_LABELS_AR: Record<FacialExpression, string> = {
  [FacialExpression.Neutral]: 'طبيعي',
  [FacialExpression.Smile]: 'ابتسامة',
  [FacialExpression.Laugh]: 'ضحك',
  [FacialExpression.GentleSad]: 'حزن لطيف',
  [FacialExpression.Surprise]: 'دهشة',
  [FacialExpression.Focus]: 'تركيز',
  [FacialExpression.Think]: 'تفكير',
  [FacialExpression.Encourage]: 'تشجيع',
};

export const INTERACTION_LABELS_AR: Record<DualInteractionId, string> = {
  luluWelcomesNono: 'لولو ترحب بنونو',
  nonoWavesToLulu: 'نونو يلوّح للولو',
  luluPointsToNono: 'لولو تشير إلى نونو',
  nonoJumpsHappily: 'نونو يقفز بسعادة',
  celebrateTogether: 'لولو ونونو يحتفلان معاً',
  nonoSurprisedLuluLooks: 'نونو يتفاجأ وتنظر إليه لولو',
  welcomeChild: 'الشخصيتان ترحبان بالطفل',
  nonoClapsForLulu: 'نونو يصفق للولو',
  luluEncouragesNono: 'لولو تشجع نونو',
};
