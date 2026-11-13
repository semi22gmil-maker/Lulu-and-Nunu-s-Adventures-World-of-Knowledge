import { CharacterAnimState } from '../../types/game';
import { CharacterAnimationProfile, FacialExpression } from '../shared/CharacterTypes';

/**
 * Lulu's 13 Animation Evaluators (Graceful, confident, intelligent guide movements)
 */
export const luluAnimationProfile: CharacterAnimationProfile = {
  defaultExpression: {
    [CharacterAnimState.Idle]: FacialExpression.Smile,
    [CharacterAnimState.Walk]: FacialExpression.Smile,
    [CharacterAnimState.Run]: FacialExpression.Encourage,
    [CharacterAnimState.Jump]: FacialExpression.Laugh,
    [CharacterAnimState.Celebrate]: FacialExpression.Laugh,
    [CharacterAnimState.Dance]: FacialExpression.Smile,
    [CharacterAnimState.Clap]: FacialExpression.Encourage,
    [CharacterAnimState.Encourage]: FacialExpression.Encourage,
    [CharacterAnimState.Point]: FacialExpression.Focus,
    [CharacterAnimState.Think]: FacialExpression.Think,
    [CharacterAnimState.Surprise]: FacialExpression.Surprise,
    [CharacterAnimState.Laugh]: FacialExpression.Laugh,
    [CharacterAnimState.GentleSad]: FacialExpression.GentleSad,
  },
  oneShotDurations: {
    [CharacterAnimState.Jump]: 1.15,
    [CharacterAnimState.Surprise]: 1.35,
    [CharacterAnimState.Laugh]: 1.85,
  },
  evaluators: {
    [CharacterAnimState.Idle]: (t) => ({
      pelvisYOffset: Math.sin(t * 2.1) * 0.012,
      torsoTiltX: Math.sin(t * 2.1) * 0.025,
      headTiltZ: Math.sin(t * 1.1) * 0.04,
      headYaw: Math.sin(t * 0.7) * 0.08,
      leftEarZ: 0.1 + Math.sin(t * 2.1) * 0.045,
      rightEarZ: -0.1 - Math.sin(t * 2.1 + 0.6) * 0.045,
      leftEarX: Math.sin(t * 1.5) * 0.05,
      rightEarX: Math.sin(t * 1.5 + 0.4) * 0.05,
      leftArmZ: 0.24 + Math.sin(t * 2.1) * 0.03,
      rightArmZ: -0.24 - Math.sin(t * 2.1) * 0.03,
      leftElbowX: -0.22,
      rightElbowX: -0.22,
      tailY: Math.sin(t * 3.5) * 0.12,
    }),

    [CharacterAnimState.Walk]: (t) => {
      const s = Math.sin(t * 6.2);
      const c = Math.cos(t * 6.2);
      return {
        pelvisYOffset: Math.abs(c) * 0.04,
        pelvisTiltZ: s * 0.045,
        torsoTiltX: 0.06,
        torsoYaw: -s * 0.08,
        headTiltX: -0.04 + Math.abs(c) * 0.03,
        leftEarX: -0.12 - Math.abs(s) * 0.14,
        rightEarX: -0.12 - Math.abs(c) * 0.14,
        leftArmX: -s * 0.55,
        rightArmX: s * 0.55,
        leftArmZ: 0.22,
        rightArmZ: -0.22,
        leftElbowX: -0.35 - Math.max(0, -s) * 0.25,
        rightElbowX: -0.35 - Math.max(0, s) * 0.25,
        leftLegX: s * 0.52,
        rightLegX: -s * 0.52,
        tailY: s * 0.2,
      };
    },

    [CharacterAnimState.Run]: (t) => {
      const s = Math.sin(t * 10.5);
      const c = Math.cos(t * 10.5);
      return {
        pelvisYOffset: Math.abs(c) * 0.085,
        pelvisTiltZ: s * 0.06,
        torsoTiltX: 0.22,
        torsoYaw: -s * 0.14,
        headTiltX: -0.14,
        leftEarX: -0.38 - Math.abs(s) * 0.22,
        rightEarX: -0.38 - Math.abs(c) * 0.22,
        leftArmX: -s * 0.92,
        rightArmX: s * 0.92,
        leftArmZ: 0.28,
        rightArmZ: -0.28,
        leftElbowX: -0.85,
        rightElbowX: -0.85,
        leftLegX: s * 0.82,
        rightLegX: -s * 0.82,
        tailX: 0.25,
      };
    },

    [CharacterAnimState.Jump]: (_t, phase) => {
      const norm = Math.min(1, phase / 1.15);
      if (norm < 0.2) {
        // Anticipation crouch
        const p = norm / 0.2;
        return {
          pelvisYOffset: -0.055 * p,
          squashY: 1 - 0.14 * p,
          stretchXZ: 1 + 0.09 * p,
          torsoTiltX: 0.16 * p,
          leftEarX: -0.2 * p,
          rightEarX: -0.2 * p,
          leftArmX: 0.4 * p,
          rightArmX: 0.4 * p,
          leftLegX: -0.25 * p,
          rightLegX: -0.25 * p,
        };
      }
      if (norm < 0.78) {
        // Parabolic airborne arc
        const air = (norm - 0.2) / 0.58;
        const arc = Math.sin(air * Math.PI);
        return {
          pelvisYOffset: arc * 0.42,
          squashY: 1 + arc * 0.08,
          stretchXZ: 1 - arc * 0.05,
          torsoTiltX: -0.08 * arc,
          headTiltX: -0.12 * arc,
          leftEarX: 0.24 * arc,
          rightEarX: 0.24 * arc,
          leftEarZ: 0.25 * arc,
          rightEarZ: -0.25 * arc,
          leftArmZ: 0.24 + arc * 1.1,
          rightArmZ: -0.24 - arc * 1.1,
          leftArmX: -0.5 * arc,
          rightArmX: -0.5 * arc,
          leftLegX: -0.35 * arc,
          rightLegX: 0.25 * arc,
        };
      }
      // Soft landing squash
      const land = 1 - (norm - 0.78) / 0.22;
      return {
        pelvisYOffset: -0.04 * land,
        squashY: 1 - 0.11 * land,
        stretchXZ: 1 + 0.07 * land,
        leftEarX: -0.18 * land,
        rightEarX: -0.18 * land,
      };
    },

    [CharacterAnimState.Celebrate]: (t) => {
      const hop = Math.abs(Math.sin(t * 5.8));
      const wave = Math.sin(t * 9.0);
      return {
        pelvisYOffset: hop * 0.18,
        squashY: 0.94 + hop * 0.1,
        stretchXZ: 1.04 - hop * 0.05,
        torsoTiltZ: Math.sin(t * 2.9) * 0.09,
        headTiltX: -0.1,
        leftEarZ: 0.22 + wave * 0.14,
        rightEarZ: -0.22 - wave * 0.14,
        leftArmZ: 2.35 + wave * 0.22,
        rightArmZ: -2.35 - wave * 0.22,
        leftElbowX: -0.2,
        rightElbowX: -0.2,
        leftLegX: -hop * 0.22,
        rightLegX: hop * 0.15,
      };
    },

    [CharacterAnimState.Dance]: (t) => {
      const beat = Math.sin(t * 5.2);
      const bounce = Math.abs(Math.cos(t * 5.2));
      return {
        pelvisYOffset: bounce * 0.075,
        pelvisTiltZ: beat * 0.1,
        pelvisYaw: beat * 0.22,
        torsoTiltZ: -beat * 0.12,
        headTiltZ: beat * 0.14,
        leftEarZ: 0.15 + beat * 0.22,
        rightEarZ: -0.15 + beat * 0.22,
        leftArmZ: 0.8 + beat * 0.9,
        rightArmZ: -0.8 + beat * 0.9,
        leftElbowX: -0.7,
        rightElbowX: -0.7,
        leftLegZ: Math.max(0, beat) * 0.18,
        rightLegZ: Math.min(0, beat) * 0.18,
        tailY: beat * 0.45,
      };
    },

    [CharacterAnimState.Clap]: (t) => {
      const clapCycle = (Math.sin(t * 11.5) + 1) * 0.5; // 0..1 fast rhythmic clap
      return {
        pelvisYOffset: clapCycle * 0.035,
        torsoTiltX: 0.04,
        headTiltZ: Math.sin(t * 3.2) * 0.06,
        leftEarZ: 0.14 + clapCycle * 0.08,
        rightEarZ: -0.14 - clapCycle * 0.08,
        leftArmX: -1.05,
        rightArmX: -1.05,
        leftArmZ: -0.12 - clapCycle * 0.36,
        rightArmZ: 0.12 + clapCycle * 0.36,
        leftElbowX: -0.85,
        rightElbowX: -0.85,
      };
    },

    [CharacterAnimState.Encourage]: (t) => {
      const nod = Math.sin(t * 3.4);
      const wave = Math.sin(t * 5.8);
      return {
        pelvisYOffset: Math.sin(t * 3.4) * 0.02,
        torsoTiltX: 0.08,
        headTiltX: 0.08 + nod * 0.07,
        headTiltZ: 0.07,
        leftEarZ: 0.16,
        rightEarZ: -0.22 - wave * 0.1,
        leftArmZ: 0.35,
        leftElbowX: -0.35,
        rightArmX: -0.95,
        rightArmZ: -1.45 - wave * 0.32,
        rightElbowX: -0.45 + wave * 0.2,
      };
    },

    [CharacterAnimState.Point]: (t) => ({
      pelvisYaw: -0.18,
      torsoTiltX: 0.06,
      torsoYaw: -0.15,
      headYaw: -0.28,
      headTiltZ: -0.05,
      leftEarZ: 0.1,
      rightEarZ: -0.18,
      leftArmZ: 0.25,
      leftElbowX: -0.3,
      rightArmX: -1.38 + Math.sin(t * 3.6) * 0.06,
      rightArmZ: -0.52,
      rightElbowX: -0.05,
    }),

    [CharacterAnimState.Think]: (t) => ({
      pelvisYOffset: Math.sin(t * 1.8) * 0.008,
      torsoTiltZ: -0.05,
      headTiltZ: 0.18,
      headTiltX: -0.08,
      headYaw: Math.sin(t * 1.1) * 0.1,
      leftEarZ: 0.22,
      rightEarZ: -0.04,
      rightEarX: 0.15,
      leftArmZ: 0.22,
      rightArmX: -1.12,
      rightArmZ: 0.28,
      rightElbowX: -1.35 + Math.sin(t * 2.2) * 0.06,
    }),

    [CharacterAnimState.Surprise]: (_t, phase) => {
      const pop = Math.sin(Math.min(1, phase / 0.45) * Math.PI);
      const settle = Math.exp(-phase * 1.8);
      return {
        pelvisYOffset: pop * 0.14,
        torsoTiltX: -0.14 * settle,
        headTiltX: -0.1 * settle,
        leftEarZ: 0.02,
        rightEarZ: -0.02,
        leftEarX: -0.08,
        rightEarX: -0.08,
        leftArmZ: 1.15 * settle + 0.35,
        rightArmZ: -1.15 * settle - 0.35,
        leftArmX: -0.35,
        rightArmX: -0.35,
        leftElbowX: -0.55,
        rightElbowX: -0.55,
      };
    },

    [CharacterAnimState.Laugh]: (t) => {
      const chuckle = Math.sin(t * 14.0);
      return {
        pelvisYOffset: Math.abs(chuckle) * 0.035,
        torsoTiltX: -0.1 + chuckle * 0.05,
        headTiltX: -0.18 + chuckle * 0.08,
        leftEarZ: 0.24 + chuckle * 0.1,
        rightEarZ: -0.24 - chuckle * 0.1,
        leftArmX: -0.75,
        rightArmX: -0.75,
        leftArmZ: -0.15,
        rightArmZ: 0.15,
        leftElbowX: -1.15 + chuckle * 0.12,
        rightElbowX: -1.15 + chuckle * 0.12,
      };
    },

    [CharacterAnimState.GentleSad]: (t) => ({
      pelvisYOffset: -0.03 + Math.sin(t * 1.6) * 0.008,
      torsoTiltX: 0.14,
      headTiltX: 0.24,
      headTiltZ: Math.sin(t * 1.3) * 0.06,
      leftEarZ: 0.65,
      rightEarZ: -0.65,
      leftEarX: 0.32,
      rightEarX: 0.32,
      leftArmX: -0.15,
      rightArmX: -0.15,
      leftArmZ: 0.12,
      rightArmZ: -0.12,
      leftElbowX: -0.35,
      rightElbowX: -0.35,
    }),
  },
};
