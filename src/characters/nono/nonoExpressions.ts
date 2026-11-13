import { ExpressionTargetState, FacialExpression } from '../shared/CharacterTypes';

/**
 * Nono-specific expression refinements (extra bubbly cheeks and wide playful smile).
 */
export const nonoExpressionOverrides: Partial<Record<FacialExpression, Partial<ExpressionTargetState>>> = {
  [FacialExpression.Smile]: {
    cheekOpacity: 0.7,
    mouthOpen: 0.18,
  },
  [FacialExpression.Laugh]: {
    mouthOpen: 0.82,
    cheekOpacity: 0.84,
  },
};
