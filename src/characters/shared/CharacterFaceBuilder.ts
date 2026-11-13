import * as THREE from 'three';
import { SharedCharacterMaterialSet } from './CharacterMaterials';
import { CharacterEyeRig, CharacterMouthRig } from './CharacterTypes';

export interface FaceRigCreationOptions {
  irisHex: number;
  eyelidHex: number;
  browHex: number;
  muzzleRadius?: number;
}

export function createCharacterEye(
  materials: SharedCharacterMaterialSet,
  irisMat: THREE.Material,
  eyelidMat: THREE.Material,
  happyArcMat: THREE.Material,
  side: 'left' | 'right'
): CharacterEyeRig {
  const group = new THREE.Group();
  const sign = side === 'left' ? -1 : 1;

  // Eyeball sclera
  const scleraGeo = new THREE.SphereGeometry(0.088, 22, 18);
  const sclera = new THREE.Mesh(scleraGeo, materials.eyeWhite);
  sclera.scale.set(0.95, 1.08, 0.72);
  group.add(sclera);

  // Colored Iris
  const irisGeo = new THREE.SphereGeometry(0.056, 20, 16);
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.set(0, 0, 0.044);
  iris.scale.set(1, 1.06, 0.45);
  group.add(iris);

  // Glossy Pupil
  const pupilGeo = new THREE.SphereGeometry(0.036, 16, 14);
  const pupil = new THREE.Mesh(pupilGeo, materials.pupilDark);
  pupil.position.set(0, 0, 0.017);
  pupil.scale.set(1, 1.05, 0.55);
  iris.add(pupil);

  // Twin catchlights for Pixar-like sparkle
  const mainLightGeo = new THREE.SphereGeometry(0.014, 10, 10);
  const catchlightMain = new THREE.Mesh(mainLightGeo, materials.catchlight);
  catchlightMain.position.set(0.017 * sign * -1 + 0.012, 0.02, 0.022);
  iris.add(catchlightMain);

  const subLightGeo = new THREE.SphereGeometry(0.007, 8, 8);
  const catchlightSub = new THREE.Mesh(subLightGeo, materials.catchlight);
  catchlightSub.position.set(-0.015, -0.016, 0.021);
  iris.add(catchlightSub);

  // Upper eyelid dome (hinged around eye center via rotation.x: -1.45 rad open -> +0.15 rad closed)
  const lidGeo = new THREE.SphereGeometry(0.093, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const upperLid = new THREE.Mesh(lidGeo, eyelidMat);
  upperLid.scale.set(0.98, 1.08, 0.76);
  upperLid.rotation.x = -Math.PI * 0.46;
  upperLid.visible = false;
  group.add(upperLid);

  // Lower eyelid dome (hinged around eye center via rotation.x: +1.45 rad open -> 0 rad closed)
  const lowerLidGeo = new THREE.SphereGeometry(0.092, 18, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
  const lowerLid = new THREE.Mesh(lowerLidGeo, eyelidMat);
  lowerLid.scale.set(0.98, 1.06, 0.75);
  lowerLid.rotation.x = Math.PI * 0.46;
  lowerLid.visible = false;
  group.add(lowerLid);

  // Happy crescent eye arc (shown during cheerful Laugh when eyes squint happily)
  const happyGeo = new THREE.TorusGeometry(0.052, 0.011, 10, 20, Math.PI * 0.84);
  const happyArc = new THREE.Mesh(happyGeo, happyArcMat);
  happyArc.position.set(0, -0.008, 0.068);
  happyArc.rotation.z = Math.PI * 0.08;
  happyArc.visible = false;
  group.add(happyArc);

  const eyeGeometries: THREE.BufferGeometry[] = [
    scleraGeo,
    irisGeo,
    pupilGeo,
    mainLightGeo,
    subLightGeo,
    lidGeo,
    lowerLidGeo,
    happyGeo,
  ];

  return {
    group,
    sclera,
    iris,
    pupil,
    catchlightMain,
    catchlightSub,
    upperLid,
    lowerLid,
    happyArc,
    dispose: () => {
      eyeGeometries.forEach((g) => g.dispose());
    },
  };
}

export function createCharacterMouth(
  materials: SharedCharacterMaterialSet,
  lipMat: THREE.Material,
  lineMat: THREE.Material
): CharacterMouthRig {
  const group = new THREE.Group();

  const upperLipGeo = new THREE.CapsuleGeometry(0.018, 0.055, 6, 12);
  const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
  upperLip.rotation.z = Math.PI / 2;
  upperLip.position.set(0, 0.008, 0.008);
  group.add(upperLip);

  const lowerJawGeo = new THREE.SphereGeometry(0.042, 16, 12);
  const lowerJaw = new THREE.Mesh(lowerJawGeo, lipMat);
  lowerJaw.scale.set(1.25, 0.52, 0.75);
  lowerJaw.position.set(0, -0.015, 0.002);
  group.add(lowerJaw);

  const cavityGeo = new THREE.SphereGeometry(0.044, 16, 12);
  const cavity = new THREE.Mesh(cavityGeo, materials.mouthCavity);
  cavity.scale.set(1.12, 0.65, 0.5);
  cavity.position.set(0, -0.008, 0.008);
  cavity.visible = false;
  group.add(cavity);

  const tongueGeo = new THREE.SphereGeometry(0.025, 12, 10);
  const tongue = new THREE.Mesh(tongueGeo, materials.tongue);
  tongue.scale.set(1.1, 0.45, 0.7);
  tongue.position.set(0, -0.018, 0.02);
  tongue.visible = false;
  group.add(tongue);

  // Smile arc
  const smileGeo = new THREE.TorusGeometry(0.048, 0.0085, 8, 20, Math.PI * 0.78);
  const smileCurve = new THREE.Mesh(smileGeo, lineMat);
  smileCurve.position.set(0, 0.014, 0.022);
  smileCurve.rotation.z = Math.PI + Math.PI * 0.11;
  group.add(smileCurve);

  // Gentle sad arc
  const sadGeo = new THREE.TorusGeometry(0.042, 0.008, 8, 18, Math.PI * 0.72);
  const sadCurve = new THREE.Mesh(sadGeo, lineMat);
  sadCurve.position.set(0, -0.025, 0.022);
  sadCurve.rotation.z = Math.PI * 0.14;
  sadCurve.visible = false;
  group.add(sadCurve);

  const mouthGeometries: THREE.BufferGeometry[] = [
    upperLipGeo,
    lowerJawGeo,
    cavityGeo,
    tongueGeo,
    smileGeo,
    sadGeo,
  ];

  return {
    group,
    upperLip,
    lowerJaw,
    cavity,
    tongue,
    smileCurve,
    sadCurve,
    dispose: () => {
      mouthGeometries.forEach((g) => g.dispose());
    },
  };
}

export function createBeveledStarGeometry(outerR = 0.055, innerR = 0.024, depth = 0.016): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}
