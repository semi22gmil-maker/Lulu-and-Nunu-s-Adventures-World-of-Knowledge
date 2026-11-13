import { CharacterController } from '../core/CharacterController';
import { buildNonoModel } from './NonoModel';
import { nonoAnimationProfile } from './nonoAnimations';
import { nonoExpressionOverrides } from './nonoExpressions';

export function createNonoCharacter(): CharacterController {
  const built = buildNonoModel();
  return new CharacterController({
    rig: built.rig,
    profile: nonoAnimationProfile,
    expressionOverrides: nonoExpressionOverrides,
    disposeAssets: built.dispose,
  });
}
