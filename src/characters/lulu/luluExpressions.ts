import { ExpressionTargetState, FacialExpression } from '../shared/CharacterTypes';

/**
 * Lulu-specific expression refinements (slightly wider expressive ears/brows feel).
 */
export const luluExpressionOverrides: Partial<Record<FacialExpression, Partial<ExpressionTargetState>>> = {
  [FacialExpression.Think]: {
    browTiltZ: 0.24,
    mouthOpen: 0.06,
  },
  [FacialExpression.Encourage]: {
    cheekOpacity: 0.72,
    smileWeight: 1,
  },
};
