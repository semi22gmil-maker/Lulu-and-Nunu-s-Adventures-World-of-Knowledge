import * as THREE from 'three';
import { CharacterId } from '../../types/game';
import {
  createCharacterEye,
  createCharacterMouth,
} from '../shared/CharacterFaceBuilder';
import {
  createPlushTexture,
  createSharedCharacterMaterials,
} from '../shared/CharacterMaterials';
import { CharacterSkeletonRig } from '../shared/CharacterTypes';
import { BuiltCharacterModel } from '../lulu/LuluModel';

/**
 * Builds Nono (نونو): Playful, younger, chubby caramel-brown plush bear
 * with creamy-tan belly & muzzle, round ears, cheerful amber eyes, explorer scarf,
 * and a mini adventurer backpack with brass buckle.
 */
export function buildNonoModel(): BuiltCharacterModel {
  const shared = createSharedCharacterMaterials();
  const brownFurTex = createPlushTexture('#8c5a3c', '#a8704e', 37);
  const creamFurTex = createPlushTexture('#ebd1af', '#f7e5cc', 53);

  const brownFurMat = new THREE.MeshPhysicalMaterial({
    color: 0x8c5a3c,
    map: brownFurTex,
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.68,
    sheenRoughness: 0.72,
    sheenColor: new THREE.Color(0xfde68a),
  });

  const creamTanMat = new THREE.MeshPhysicalMaterial({
    color: 0xedd3b1,
    map: creamFurTex,
    roughness: 0.86,
    metalness: 0.0,
    sheen: 0.52,
    sheenColor: new THREE.Color(0xffffff),
  });

  const noseEspressoMat = new THREE.MeshStandardMaterial({
    color: 0x3b2316,
    roughness: 0.3,
  });

  const nonoIrisMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // Warm playful honey-amber iris
    roughness: 0.16,
    metalness: 0.06,
  });

  const browMat = new THREE.MeshStandardMaterial({
    color: 0x4b2e1e,
    roughness: 0.65,
  });

  const mouthLineMat = new THREE.MeshStandardMaterial({
    color: 0x5c3420,
    roughness: 0.5,
  });

  const scarfAmberMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.68,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xfef3c7),
  });

  const backpackBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.7,
  });

  const backpackFlapMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.62,
  });

  const disposableGeometries: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeometries.push(g);
    return g;
  };

  const root = new THREE.Group();
  root.name = 'NonoRoot';

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Ground contact shadow
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(0.98, 0.98));
  const contactShadow = new THREE.Mesh(shadowGeo, shared.contactShadow);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.006;
  root.add(contactShadow);

  // Pelvis (slightly lower/chubbier than Lulu so Nono feels younger)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.28, 0);
  bodyPivot.add(pelvis);

  // Round chubby bear torso via LatheGeometry
  const torsoPoints = [
    new THREE.Vector2(0.01, -0.14),
    new THREE.Vector2(0.22, -0.12),
    new THREE.Vector2(0.29, 0.01),
    new THREE.Vector2(0.27, 0.14),
    new THREE.Vector2(0.2, 0.24),
    new THREE.Vector2(0.13, 0.29),
    new THREE.Vector2(0.01, 0.3),
  ];
  const torsoGeo = trackGeo(new THREE.LatheGeometry(torsoPoints, 26));
  const torso = new THREE.Group();
  pelvis.add(torso);

  const torsoMesh = new THREE.Mesh(torsoGeo, brownFurMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);

  // Creamy-tan round belly patch (positioned cleanly proud of Lathe torso)
  const bellyGeo = trackGeo(new THREE.SphereGeometry(0.198, 20, 16));
  const bellyMesh = new THREE.Mesh(bellyGeo, creamTanMat);
  bellyMesh.scale.set(0.84, 0.9, 0.46);
  bellyMesh.position.set(0, 0.055, 0.22);
  bellyMesh.rotation.x = 0.08;
  torso.add(bellyMesh);

  // Adventurer Scarf around neck
  const scarfGeo = trackGeo(new THREE.TorusGeometry(0.165, 0.042, 12, 24));
  const scarfMesh = new THREE.Mesh(scarfGeo, scarfAmberMat);
  scarfMesh.rotation.x = Math.PI / 2 + 0.08;
  scarfMesh.position.set(0, 0.25, 0.01);
  scarfMesh.castShadow = true;
  torso.add(scarfMesh);

  const scarfTailGeo = trackGeo(new THREE.CapsuleGeometry(0.032, 0.09, 5, 10));
  const scarfTail = new THREE.Mesh(scarfTailGeo, scarfAmberMat);
  scarfTail.position.set(-0.1, 0.19, 0.165);
  scarfTail.rotation.set(0.25, 0, -0.45);
  torso.add(scarfTail);

  // Mini Adventurer Backpack (multi-part composite prop on back)
  const accessoryGroup = new THREE.Group();
  accessoryGroup.position.set(0, 0.09, -0.255);

  const packBodyGeo = trackGeo(new THREE.BoxGeometry(0.26, 0.24, 0.14));
  const packBody = new THREE.Mesh(packBodyGeo, backpackBlueMat);
  packBody.scale.set(1, 1, 0.92);
  packBody.castShadow = true;
  accessoryGroup.add(packBody);

  const packFlapGeo = trackGeo(new THREE.CylinderGeometry(0.135, 0.135, 0.145, 16, 1, false, 0, Math.PI));
  const packFlap = new THREE.Mesh(packFlapGeo, backpackFlapMat);
  packFlap.rotation.z = Math.PI / 2;
  packFlap.rotation.y = Math.PI / 2;
  packFlap.position.set(0, 0.06, -0.005);
  accessoryGroup.add(packFlap);

  const buckleGeo = trackGeo(new THREE.BoxGeometry(0.065, 0.045, 0.025));
  const buckle = new THREE.Mesh(buckleGeo, shared.goldAccent);
  buckle.position.set(0, 0.01, -0.072);
  accessoryGroup.add(buckle);

  const strapGeo = trackGeo(new THREE.TorusGeometry(0.14, 0.022, 8, 16, Math.PI));
  const strapLeft = new THREE.Mesh(strapGeo, backpackBlueMat);
  strapLeft.rotation.y = Math.PI / 2;
  strapLeft.position.set(-0.11, 0.06, 0.11);
  const strapRight = new THREE.Mesh(strapGeo, backpackBlueMat);
  strapRight.rotation.y = Math.PI / 2;
  strapRight.position.set(0.11, 0.06, 0.11);
  accessoryGroup.add(strapLeft, strapRight);

  torso.add(accessoryGroup);

  // Round bear tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, -0.06, -0.24);
  pelvis.add(tailPivot);

  const tailGeo = trackGeo(new THREE.SphereGeometry(0.072, 14, 12));
  const tailMesh = new THREE.Mesh(tailGeo, creamTanMat);
  tailMesh.position.set(0, 0, -0.03);
  tailMesh.castShadow = true;
  tailPivot.add(tailMesh);

  // Neck & Big Round Teddy Head
  const neck = new THREE.Group();
  neck.position.set(0, 0.28, 0);
  torso.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 0.28, 0.015);
  neck.add(head);

  const headGeo = trackGeo(new THREE.SphereGeometry(0.35, 28, 22));
  const headMesh = new THREE.Mesh(headGeo, brownFurMat);
  headMesh.scale.set(1.06, 0.94, 0.98);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  head.add(headMesh);

  // Creamy-tan Bear Snout / Muzzle
  const muzzleGeo = trackGeo(new THREE.SphereGeometry(0.165, 22, 18));
  const muzzleMesh = new THREE.Mesh(muzzleGeo, creamTanMat);
  muzzleMesh.scale.set(1.16, 0.84, 0.85);
  muzzleMesh.position.set(0, -0.075, 0.255);
  head.add(muzzleMesh);

  // Cute glossy brown bear nose
  const noseGeo = trackGeo(new THREE.SphereGeometry(0.052, 16, 14));
  const noseMesh = new THREE.Mesh(noseGeo, noseEspressoMat);
  noseMesh.scale.set(1.28, 0.88, 0.85);
  noseMesh.position.set(0, -0.015, 0.392);
  head.add(noseMesh);

  // Big Expressive Eyes
  const leftEye = createCharacterEye(shared, nonoIrisMat, brownFurMat, mouthLineMat, 'left');
  leftEye.group.position.set(-0.132, 0.052, 0.282);
  leftEye.group.rotation.y = -0.2;
  head.add(leftEye.group);

  const rightEye = createCharacterEye(shared, nonoIrisMat, brownFurMat, mouthLineMat, 'right');
  rightEye.group.position.set(0.132, 0.052, 0.282);
  rightEye.group.rotation.y = 0.2;
  head.add(rightEye.group);

  // Playful Eyebrows
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.015, 0.066, 5, 10));
  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.rotation.z = Math.PI / 2 + 0.08;
  leftBrow.position.set(-0.135, 0.172, 0.3);
  head.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.rotation.z = Math.PI / 2 - 0.08;
  rightBrow.position.set(0.135, 0.172, 0.3);
  head.add(rightBrow);

  // Rosy Cheeks
  const cheekGeo = trackGeo(new THREE.SphereGeometry(0.048, 12, 10));
  const leftCheek = new THREE.Mesh(cheekGeo, shared.cheekRose.clone());
  leftCheek.scale.set(1.25, 0.72, 0.35);
  leftCheek.position.set(-0.22, -0.06, 0.255);
  head.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeo, shared.cheekRose.clone());
  rightCheek.scale.set(1.25, 0.72, 0.35);
  rightCheek.position.set(0.22, -0.06, 0.255);
  head.add(rightCheek);

  // Articulated Mouth on bear muzzle
  const mouth = createCharacterMouth(shared, creamTanMat, mouthLineMat);
  mouth.group.position.set(0, -0.105, 0.365);
  head.add(mouth.group);

  // Round Plush Bear Ears
  const earOuterGeo = trackGeo(new THREE.SphereGeometry(0.115, 18, 16));
  const earInnerGeo = trackGeo(new THREE.SphereGeometry(0.068, 14, 12));

  const buildBearEar = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const pivot = new THREE.Group();
    pivot.position.set(sign * 0.25, 0.245, -0.01);

    const outer = new THREE.Mesh(earOuterGeo, brownFurMat);
    outer.scale.set(1.0, 0.96, 0.52);
    outer.position.set(sign * 0.03, 0.04, 0);
    outer.castShadow = true;
    pivot.add(outer);

    const inner = new THREE.Mesh(earInnerGeo, creamTanMat);
    inner.scale.set(1.0, 0.95, 0.38);
    inner.position.set(sign * 0.03, 0.04, 0.038);
    pivot.add(inner);

    head.add(pivot);
    return pivot;
  };

  const leftEarPivot = buildBearEar('left');
  const rightEarPivot = buildBearEar('right');

  // Short Chubby Arms
  const upperArmGeo = trackGeo(new THREE.CapsuleGeometry(0.072, 0.095, 6, 12));
  const forearmGeo = trackGeo(new THREE.CapsuleGeometry(0.066, 0.085, 6, 12));
  const pawGeo = trackGeo(new THREE.SphereGeometry(0.074, 14, 12));

  const buildArm = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.26, 0.185, 0.01);
    torso.add(shoulder);

    const upper = new THREE.Mesh(upperArmGeo, brownFurMat);
    upper.position.set(0, -0.075, 0);
    upper.castShadow = true;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.145, 0);
    shoulder.add(elbow);

    const lower = new THREE.Mesh(forearmGeo, brownFurMat);
    lower.position.set(0, -0.055, 0);
    lower.castShadow = true;
    elbow.add(lower);

    const hand = new THREE.Mesh(pawGeo, creamTanMat);
    hand.scale.set(0.95, 1.0, 0.9);
    hand.position.set(0, -0.12, 0.01);
    hand.castShadow = true;
    elbow.add(hand);

    return { shoulder, elbow };
  };

  const leftArm = buildArm('left');
  const rightArm = buildArm('right');

  // Short Chubby Bear Legs & Round Feet (flush on ground y = 0)
  const legGeo = trackGeo(new THREE.CapsuleGeometry(0.082, 0.085, 6, 12));
  const footGeo = trackGeo(new THREE.SphereGeometry(0.096, 16, 12));

  const buildLeg = (side: 'left' | 'right') => {
    const sign = side === 'left' ? -1 : 1;
    const hip = new THREE.Group();
    hip.position.set(sign * 0.135, -0.06, 0);
    pelvis.add(hip);

    const thigh = new THREE.Mesh(legGeo, brownFurMat);
    thigh.position.set(0, -0.085, 0);
    thigh.castShadow = true;
    hip.add(thigh);

    const foot = new THREE.Mesh(footGeo, creamTanMat);
    foot.scale.set(0.98, 0.62, 1.32);
    foot.position.set(0, -0.172, 0.04);
    foot.castShadow = true;
    hip.add(foot);

    return hip;
  };

  const leftHip = buildLeg('left');
  const rightHip = buildLeg('right');

  const rig: CharacterSkeletonRig = {
    id: CharacterId.Nono,
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
      pelvisY: 0.28,
      headY: 0.28,
    },
  };

  return {
    rig,
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      leftEye.dispose();
      rightEye.dispose();
      mouth.dispose();
      brownFurTex.dispose();
      creamFurTex.dispose();
      brownFurMat.dispose();
      creamTanMat.dispose();
      noseEspressoMat.dispose();
      nonoIrisMat.dispose();
      browMat.dispose();
      mouthLineMat.dispose();
      scarfAmberMat.dispose();
      backpackBlueMat.dispose();
      backpackFlapMat.dispose();
      (leftCheek.material as THREE.Material).dispose();
      (rightCheek.material as THREE.Material).dispose();
      shared.dispose();
    },
  };
}
