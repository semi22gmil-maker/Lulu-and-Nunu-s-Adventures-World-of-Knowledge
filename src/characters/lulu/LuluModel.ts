import * as THREE from 'three';
import { CharacterId } from '../../types/game';
import {
  createBeveledStarGeometry,
  createCharacterEye,
  createCharacterMouth,
} from '../shared/CharacterFaceBuilder';
import {
  createPlushTexture,
  createSharedCharacterMaterials,
} from '../shared/CharacterMaterials';
import { CharacterSkeletonRig } from '../shared/CharacterTypes';

export interface BuiltCharacterModel {
  rig: CharacterSkeletonRig;
  dispose: () => void;
}

/**
 * Builds Lulu (لولو): Cute, smart soft-black plush bunny with long expressive ears,
 * soft rose inner-ear lining, big sparkling amber-teal eyes, explorer collar with golden star pin,
 * and a subtle coral hair ribbon.
 */
export function buildLuluModel(): BuiltCharacterModel {
  const shared = createSharedCharacterMaterials();
  const furTexture = createPlushTexture('#1f2433', '#3d4761', 11);
  const muzzleTexture = createPlushTexture('#363f54', '#505c78', 29);

  const blackFurMat = new THREE.MeshPhysicalMaterial({
    color: 0x222838,
    map: furTexture,
    roughness: 0.84,
    metalness: 0.02,
    sheen: 0.72,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0x64748b),
  });

  const softCharcoalMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b4459,
    map: muzzleTexture,
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.55,
    sheenColor: new THREE.Color(0x94a3b8),
  });

  const innerEarPinkMat = new THREE.MeshStandardMaterial({
    color: 0xf4a7b9,
    roughness: 0.72,
  });

  const nosePinkMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.35,
  });

  const luluIrisMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488, // Luminous warm teal-emerald eyes contrasting beautifully with black fur
    roughness: 0.16,
    metalness: 0.08,
  });

  const browMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
  });

  const mouthLineMat = new THREE.MeshStandardMaterial({
    color: 0xf9a8d4,
    roughness: 0.45,
  });

  const vestTealMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f766e,
    roughness: 0.62,
    sheen: 0.35,
    sheenColor: new THREE.Color(0x5eead4),
  });

  const ribbonCoralMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.48,
  });

  const disposableGeometries: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeometries.push(g);
    return g;
  };

  const root = new THREE.Group();
  root.name = 'LuluRoot';

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Ground contact shadow (y = 0.005)
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(0.95, 0.95));
  const contactShadow = new THREE.Mesh(shadowGeo, shared.contactShadow);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.006;
  root.add(contactShadow);

  // Pelvis (centered at hip height so feet touch y = 0)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.34, 0);
  bodyPivot.add(pelvis);

  // Sculpted Torso via LatheGeometry (pear-shaped plush bunny body)
  const torsoPoints = [
    new THREE.Vector2(0.01, -0.14),
    new THREE.Vector2(0.18, -0.12),
    new THREE.Vector2(0.24, -0.02),
    new THREE.Vector2(0.23, 0.12),
    new THREE.Vector2(0.17, 0.25),
    new THREE.Vector2(0.11, 0.31),
    new THREE.Vector2(0.01, 0.32),
  ];
  const torsoGeo = trackGeo(new THREE.LatheGeometry(torsoPoints, 26));
  const torso = new THREE.Group();
  pelvis.add(torso);

  const torsoMesh = new THREE.Mesh(torsoGeo, blackFurMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);

  // Soft lighter tummy patch
  const bellyGeo = trackGeo(new THREE.SphereGeometry(0.18, 20, 16));
  const bellyMesh = new THREE.Mesh(bellyGeo, softCharcoalMat);
  bellyMesh.scale.set(0.86, 1.05, 0.52);
  bellyMesh.position.set(0, 0.07, 0.14);
  torso.add(bellyMesh);

  // Explorer smart collar / vest trim + Golden Knowledge Star Pin
  const collarGeo = trackGeo(new THREE.TorusGeometry(0.145, 0.036, 12, 24));
  const collarMesh = new THREE.Mesh(collarGeo, vestTealMat);
  collarMesh.rotation.x = Math.PI / 2 + 0.12;
  collarMesh.position.set(0, 0.255, 0.01);
  collarMesh.castShadow = true;
  torso.add(collarMesh);

  const starGeo = trackGeo(createBeveledStarGeometry(0.052, 0.023, 0.014));
  const starPin = new THREE.Mesh(starGeo, shared.goldAccent);
  starPin.position.set(0.08, 0.21, 0.175);
  starPin.rotation.z = -0.15;
  torso.add(starPin);

  // Fluffy pom-pom tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, -0.04, -0.21);
  pelvis.add(tailPivot);

  const tailGeo = trackGeo(new THREE.SphereGeometry(0.095, 16, 14));
  const tailMesh = new THREE.Mesh(tailGeo, softCharcoalMat);
  tailMesh.position.set(0, 0.02, -0.05);
  tailMesh.castShadow = true;
  tailPivot.add(tailMesh);

  // Neck & Big Cartoon Head
  const neck = new THREE.Group();
  neck.position.set(0, 0.31, 0);
  torso.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.01);
  neck.add(head);

  const headGeo = trackGeo(new THREE.SphereGeometry(0.33, 28, 22));
  const headMesh = new THREE.Mesh(headGeo, blackFurMat);
  headMesh.scale.set(1.04, 0.94, 0.96);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  head.add(headMesh);

  // Cute plush cheek-muzzle pads
  const muzzleGeo = trackGeo(new THREE.SphereGeometry(0.15, 20, 16));
  const muzzleMesh = new THREE.Mesh(muzzleGeo, softCharcoalMat);
  muzzleMesh.scale.set(1.22, 0.78, 0.76);
  muzzleMesh.position.set(0, -0.07, 0.23);
  head.add(muzzleMesh);

  // Cute pink bunny nose
  const noseGeo = trackGeo(new THREE.SphereGeometry(0.036, 14, 12));
  const noseMesh = new THREE.Mesh(noseGeo, nosePinkMat);
  noseMesh.scale.set(1.25, 0.88, 0.8);
  noseMesh.position.set(0, -0.02, 0.342);
  head.add(noseMesh);

  // Eyes (angled gently forward for appeal)
  const leftEye = createCharacterEye(shared, luluIrisMat, blackFurMat, mouthLineMat, 'left');
  leftEye.group.position.set(-0.125, 0.045, 0.265);
  leftEye.group.rotation.y = -0.2;
  head.add(leftEye.group);

  const rightEye = createCharacterEye(shared, luluIrisMat, blackFurMat, mouthLineMat, 'right');
  rightEye.group.position.set(0.125, 0.045, 0.265);
  rightEye.group.rotation.y = 0.2;
  head.add(rightEye.group);

  // Expressive Eyebrows
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.014, 0.068, 5, 10));
  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.rotation.z = Math.PI / 2 + 0.08;
  leftBrow.position.set(-0.13, 0.165, 0.285);
  head.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.rotation.z = Math.PI / 2 - 0.08;
  rightBrow.position.set(0.13, 0.165, 0.285);
  head.add(rightBrow);

  // Rosy Cheeks
  const cheekGeo = trackGeo(new THREE.SphereGeometry(0.045, 12, 10));
  const leftCheek = new THREE.Mesh(cheekGeo, shared.cheekRose.clone());
  leftCheek.scale.set(1.2, 0.72, 0.35);
  leftCheek.position.set(-0.205, -0.055, 0.245);
  head.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeo, shared.cheekRose.clone());
  rightCheek.scale.set(1.2, 0.72, 0.35);
  rightCheek.position.set(0.205, -0.055, 0.245);
  head.add(rightCheek);

  // Articulated Mouth
  const mouth = createCharacterMouth(shared, softCharcoalMat, mouthLineMat);
  mouth.group.position.set(0, -0.095, 0.312);
  head.add(mouth.group);

  // Long Sculpted Bunny Ears (LatheGeometry silhouette + rose inner ear)
  const earProfile = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.058, 0.04),
    new THREE.Vector2(0.088, 0.18),
    new THREE.Vector2(0.092, 0.34),
    new THREE.Vector2(0.068, 0.48),
    new THREE.Vector2(0.032, 0.56),
    new THREE.Vector2(0.005, 0.58),
  ];
  const outerEarGeo = trackGeo(new THREE.LatheGeometry(earProfile, 18));
  const innerEarGeo = trackGeo(new THREE.CapsuleGeometry(0.044, 0.32, 6, 12));

  const buildBunnyEar = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const pivot = new THREE.Group();
    pivot.position.set(sign * 0.135, 0.26, -0.02);
    pivot.rotation.z = sign * -0.1;

    const outer = new THREE.Mesh(outerEarGeo, blackFurMat);
    outer.scale.set(1.0, 1.0, 0.48);
    outer.castShadow = true;
    pivot.add(outer);

    const inner = new THREE.Mesh(innerEarGeo, innerEarPinkMat);
    inner.scale.set(0.9, 1.0, 0.28);
    inner.position.set(0, 0.27, 0.034);
    pivot.add(inner);

    head.add(pivot);
    return pivot;
  };

  const leftEarPivot = buildBunnyEar('left');
  const rightEarPivot = buildBunnyEar('right');

  // Subtle cute coral hair ribbon at base of left ear
  const accessoryGroup = new THREE.Group();
  accessoryGroup.position.set(-0.02, 0.05, 0.05);
  const bowLoopGeo = trackGeo(new THREE.SphereGeometry(0.042, 12, 10));
  const bowLeft = new THREE.Mesh(bowLoopGeo, ribbonCoralMat);
  bowLeft.scale.set(1.25, 0.78, 0.55);
  bowLeft.position.set(-0.04, 0, 0);
  bowLeft.rotation.z = 0.25;
  const bowRight = new THREE.Mesh(bowLoopGeo, ribbonCoralMat);
  bowRight.scale.set(1.25, 0.78, 0.55);
  bowRight.position.set(0.04, 0, 0);
  bowRight.rotation.z = -0.25;
  const bowCenter = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.024, 10, 10)), ribbonCoralMat);
  accessoryGroup.add(bowLeft, bowRight, bowCenter);
  leftEarPivot.add(accessoryGroup);

  // Articulated Arms (Shoulder -> Upper Arm -> Elbow -> Forearm -> Paw)
  const upperArmGeo = trackGeo(new THREE.CapsuleGeometry(0.058, 0.12, 6, 12));
  const forearmGeo = trackGeo(new THREE.CapsuleGeometry(0.052, 0.1, 6, 12));
  const pawGeo = trackGeo(new THREE.SphereGeometry(0.062, 14, 12));

  const buildArm = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.23, 0.2, 0.01);
    torso.add(shoulder);

    const upper = new THREE.Mesh(upperArmGeo, blackFurMat);
    upper.position.set(0, -0.09, 0);
    upper.castShadow = true;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.17, 0);
    shoulder.add(elbow);

    const lower = new THREE.Mesh(forearmGeo, blackFurMat);
    lower.position.set(0, -0.07, 0);
    lower.castShadow = true;
    elbow.add(lower);

    const hand = new THREE.Mesh(pawGeo, softCharcoalMat);
    hand.scale.set(0.95, 1.08, 0.85);
    hand.position.set(0, -0.145, 0.01);
    hand.castShadow = true;
    elbow.add(hand);

    return { shoulder, elbow };
  };

  const leftArm = buildArm('left');
  const rightArm = buildArm('right');

  // Articulated Bunny Legs & Cute Feet (flush on ground y = 0)
  const legGeo = trackGeo(new THREE.CapsuleGeometry(0.068, 0.12, 6, 12));
  const footGeo = trackGeo(new THREE.SphereGeometry(0.088, 16, 12));

  const buildLeg = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const hip = new THREE.Group();
    hip.position.set(sign * 0.115, -0.06, 0);
    pelvis.add(hip);

    const thigh = new THREE.Mesh(legGeo, blackFurMat);
    thigh.position.set(0, -0.11, 0);
    thigh.castShadow = true;
    hip.add(thigh);

    const foot = new THREE.Mesh(footGeo, softCharcoalMat);
    foot.scale.set(0.95, 0.62, 1.48);
    foot.position.set(0, -0.228, 0.048);
    foot.castShadow = true;
    hip.add(foot);

    return hip;
  };

  const leftHip = buildLeg('left');
  const rightHip = buildLeg('right');

  const rig: CharacterSkeletonRig = {
    id: CharacterId.Lulu,
    root,
    bodyPivot,
    pelvis,
    torso,
    neck,
    head,
    leftEarPivot,
    rightEarPivot,
    leftShoulder: leftArm.shoulder,
    leftElbow: leftArm.elbow,
    rightShoulder: rightArm.shoulder,
    rightElbow: rightArm.elbow,
    leftHip,
    rightHip,
    tailPivot,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    leftCheek,
    rightCheek,
    mouth,
    accessoryGroup,
    contactShadow,
    baseHeights: {
      pelvisY: 0.34,
      headY: 0.28,
    },
  };

  return {
    rig,
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      furTexture.dispose();
      muzzleTexture.dispose();
      blackFurMat.dispose();
      softCharcoalMat.dispose();
      innerEarPinkMat.dispose();
      nosePinkMat.dispose();
      luluIrisMat.dispose();
      browMat.dispose();
      mouthLineMat.dispose();
      vestTealMat.dispose();
      ribbonCoralMat.dispose();
      (leftCheek.material as THREE.Material).dispose();
      (rightCheek.material as THREE.Material).dispose();
      shared.dispose();
    },
  };
}
