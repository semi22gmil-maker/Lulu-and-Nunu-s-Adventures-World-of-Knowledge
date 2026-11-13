import { CharacterAnimState } from '../../types/game';
import { CharacterAnimationProfile, FacialExpression } from '../shared/CharacterTypes';

/**
 * Nono's 13 Animation Evaluators (Bouncier, younger, extra-playful bear energy)
 */
export const nonoAnimationProfile: CharacterAnimationProfile = {
  defaultExpression: {
    [CharacterAnimState.Idle]: FacialExpression.Smile,
    [CharacterAnimState.Walk]: FacialExpression.Smile,
    [CharacterAnimState.Run]: FacialExpression.Laugh,
    [CharacterAnimState.Jump]: FacialExpression.Laugh,
    [CharacterAnimState.Celebrate]: FacialExpression.Laugh,
    [CharacterAnimState.Dance]: FacialExpression.Laugh,
    [CharacterAnimState.Clap]: FacialExpression.Smile,
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
      pelvisYOffset: Math.sin(t * 2.5) * 0.016,
      pelvisTiltZ: Math.sin(t * 1.25) * 0.035,
      torsoTiltX: Math.sin(t * 2.5) * 0.03,
      headTiltZ: Math.sin(t * 1.4 + 0.5) * 0.06,
      headYaw: Math.sin(t * 0.9) * 0.1,
      leftEarZ: Math.sin(t * 2.5) * 0.05,
      rightEarZ: -Math.sin(t * 2.5) * 0.05,
      leftArmZ: 0.3 + Math.sin(t * 2.5) * 0.04,
      rightArmZ: -0.3 - Math.sin(t * 2.5) * 0.04,
      leftElbowX: -0.25,
      rightElbowX: -0.25,
      tailY: Math.sin(t * 4.5) * 0.16,
    }),

    [CharacterAnimState.Walk]: (t) => {
      // Cute toddler-bear waddle
      const s = Math.sin(t * 6.8);
      const c = Math.cos(t * 6.8);
      return {
        pelvisYOffset: Math.abs(c) * 0.045,
        pelvisTiltZ: s * 0.08,
        torsoTiltX: 0.05,
        torsoYaw: -s * 0.1,
        headTiltZ: -s * 0.05,
        leftEarZ: s * 0.06,
        rightEarZ: s * 0.06,
        leftArmX: -s * 0.62,
        rightArmX: s * 0.62,
        leftArmZ: 0.28,
        rightArmZ: -0.28,
        leftElbowX: -0.3,
        rightElbowX: -0.3,
        leftLegX: s * 0.55,
        rightLegX: -s * 0.55,
        tailY: s * 0.25,
      };
    },

    [CharacterAnimState.Run]: (t) => {
      const s = Math.sin(t * 11.2);
      const c = Math.cos(t * 11.2);
      return {
        pelvisYOffset: Math.abs(c) * 0.095,
        pelvisTiltZ: s * 0.09,
        torsoTiltX: 0.25,
        torsoYaw: -s * 0.16,
        headTiltX: -0.14,
        leftArmX: -s * 0.98,
        rightArmX: s * 0.98,
        leftArmZ: 0.34,
        rightArmZ: -0.34,
        leftElbowX: -0.82,
        rightElbowX: -0.82,
        leftLegX: s * 0.85,
        rightLegX: -s * 0.85,
      };
    },

    [CharacterAnimState.Jump]: (_t, phase) => {
      const norm = Math.min(1, phase / 1.15);
      if (norm < 0.2) {
        const p = norm / 0.2;
        return {
          pelvisYOffset: -0.06 * p,
          squashY: 1 - 0.16 * p,
          stretchXZ: 1 + 0.11 * p,
          torsoTiltX: 0.18 * p,
          leftArmX: 0.45 * p,
          rightArmX: 0.45 * p,
        };
      }
      if (norm < 0.78) {
        const air = (norm - 0.2) / 0.58;
        const arc = Math.sin(air * Math.PI);
        return {
          pelvisYOffset: arc * 0.45,
          squashY: 1 + arc * 0.09,
          stretchXZ: 1 - arc * 0.05,
          torsoTiltX: -0.1 * arc,
          headTiltX: -0.14 * arc,
          leftEarZ: 0.12 * arc,
          rightEarZ: -0.12 * arc,
          leftArmZ: 0.3 + arc * 1.35,
          rightArmZ: -0.3 - arc * 1.35,
          leftArmX: -0.45 * arc,
          rightArmX: -0.45 * arc,
          leftLegX: -0.32 * arc,
          rightLegX: 0.28 * arc,
        };
      }
      const land = 1 - (norm - 0.78) / 0.22;
      return {
        pelvisYOffset: -0.05 * land,
        squashY: 1 - 0.13 * land,
        stretchXZ: 1 + 0.09 * land,
      };
    },

    [CharacterAnimState.Celebrate]: (t) => {
      const hop = Math.abs(Math.sin(t * 6.4));
      const wave = Math.sin(t * 10.2);
      return {
        pelvisYOffset: hop * 0.2,
        squashY: 0.92 + hop * 0.12,
        stretchXZ: 1.05 - hop * 0.05,
        torsoTiltZ: Math.sin(t * 3.4) * 0.11,
        headTiltX: -0.12,
        leftArmZ: 2.38 + wave * 0.25,
        rightArmZ: -2.38 - wave * 0.25,
        leftLegX: -hop * 0.24,
        rightLegX: hop * 0.18,
      };
    },

    [CharacterAnimState.Dance]: (t) => {
      const beat = Math.sin(t * 5.8);
      const bounce = Math.abs(Math.cos(t * 5.8));
      return {
        pelvisYOffset: bounce * 0.09,
        pelvisTiltZ: beat * 0.14,
        pelvisYaw: beat * 0.26,
        torsoTiltZ: -beat * 0.14,
        headTiltZ: beat * 0.16,
        leftArmZ: 0.9 + beat * 0.95,
        rightArmZ: -0.9 + beat * 0.95,
        leftElbowX: -0.65,
        rightElbowX: -0.65,
        leftLegZ: Math.max(0, beat) * 0.2,
        rightLegZ: Math.min(0, beat) * 0.2,
        tailY: beat * 0.5,
      };
    },

    [CharacterAnimState.Clap]: (t) => {
      const clapCycle = (Math.sin(t * 12.2) + 1) * 0.5;
      return {
        pelvisYOffset: clapCycle * 0.045,
        torsoTiltX: 0.05,
        headTiltZ: Math.sin(t * 3.8) * 0.08,
        leftArmX: -1.08,
        rightArmX: -1.08,
        leftArmZ: -0.14 - clapCycle * 0.34,
        rightArmZ: 0.14 + clapCycle * 0.34,
        leftElbowX: -0.78,
        rightElbowX: -0.78,
      };
    },

    [CharacterAnimState.Encourage]: (t) => {
      const nod = Math.sin(t * 3.8);
      const wave = Math.sin(t * 6.2);
      return {
        pelvisYOffset: Math.abs(Math.sin(t * 3.8)) * 0.03,
        torsoTiltX: 0.09,
        headTiltX: 0.06 + nod * 0.08,
        leftArmZ: 0.42,
        rightArmX: -0.92,
        rightArmZ: -1.52 - wave * 0.35,
        rightElbowX: -0.4 + wave * 0.22,
      };
    },

    [CharacterAnimState.Point]: (t) => ({
      pelvisYaw: 0.18,
      torsoTiltX: 0.08,
      torsoYaw: 0.14,
      headYaw: 0.26,
      leftArmX: -1.35 + Math.sin(t * 3.8) * 0.06,
      leftArmZ: 0.52,
      leftElbowX: -0.05,
      rightArmZ: -0.3,
    }),

    [CharacterAnimState.Think]: (t) => ({
      pelvisYOffset: Math.sin(t * 1.9) * 0.01,
      torsoTiltZ: 0.06,
      headTiltZ: -0.18,
      headTiltX: -0.08,
      headYaw: Math.sin(t * 1.2) * 0.12,
      leftArmX: -1.08,
      leftArmZ: -0.25,
      leftElbowX: -1.3 + Math.sin(t * 2.4) * 0.06,
      rightArmZ: -0.28,
    }),

    [CharacterAnimState.Surprise]: (_t, phase) => {
      const pop = Math.sin(Math.min(1, phase / 0.45) * Math.PI);
      const settle = Math.exp(-phase * 1.7);
      return {
        pelvisYOffset: pop * 0.16,
        torsoTiltX: -0.16 * settle,
        headTiltX: -0.12 * settle,
        leftEarZ: 0.14 * settle,
        rightEarZ: -0.14 * settle,
        leftArmZ: 1.25 * settle + 0.4,
        rightArmZ: -1.25 * settle - 0.4,
        leftArmX: -0.35,
        rightArmX: -0.35,
      };
    },

    [CharacterAnimState.Laugh]: (t) => {
      const chuckle = Math.sin(t * 15.0);
      return {
        pelvisYOffset: Math.abs(chuckle) * 0.05,
        torsoTiltX: -0.12 + chuckle * 0.06,
        headTiltX: -0.2 + chuckle * 0.09,
        leftArmX: -0.78,
        rightArmX: -0.78,
        leftArmZ: -0.18,
        rightArmZ: 0.18,
        leftElbowX: -1.1 + chuckle * 0.15,
        rightElbowX: -1.1 + chuckle * 0.15,
      };
    },

    [CharacterAnimState.GentleSad]: (t) => ({
      pelvisYOffset: -0.035 + Math.sin(t * 1.8) * 0.008,
      torsoTiltX: 0.15,
      headTiltX: 0.24,
      headTiltZ: Math.sin(t * 1.4) * 0.07,
      leftEarZ: 0.14,
      rightEarZ: -0.14,
      leftArmX: -0.16,
      rightArmX: -0.16,
      leftArmZ: 0.18,
      rightArmZ: -0.18,
      leftElbowX: -0.35,
      rightElbowX: -0.35,
    }),
  },
};
