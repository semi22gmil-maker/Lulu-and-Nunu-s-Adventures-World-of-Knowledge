import { CharacterController } from '../core/CharacterController';
import { buildLuluModel } from './LuluModel';
import { luluAnimationProfile } from './luluAnimations';
import { luluExpressionOverrides } from './luluExpressions';

export function createLuluCharacter(): CharacterController {
  const built = buildLuluModel();
  return new CharacterController({
    rig: built.rig,
    profile: luluAnimationProfile,
    expressionOverrides: luluExpressionOverrides,
    disposeAssets: built.dispose,
  });
}
