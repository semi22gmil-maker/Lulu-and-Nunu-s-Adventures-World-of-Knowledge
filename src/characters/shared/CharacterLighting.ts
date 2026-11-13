import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LightingPreset } from './CharacterTypes';

export interface CharacterStudioRig {
  hemiLight: THREE.HemisphereLight;
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  applyPreset: (preset: LightingPreset, scene: THREE.Scene) => void;
  dispose: (renderer?: THREE.WebGLRenderer, scene?: THREE.Scene) => void;
}

export function createCharacterStudioLighting(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  shadowsEnabled: boolean,
  shadowMapSize: number
): CharacterStudioRig {
  // Mandatory procedural environment reflection for shiny eyes and gold explorer pins
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
  roomEnv.dispose();
  scene.environment = envRT.texture;
  pmremGenerator.dispose();

  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0xfef3c7, 0.85);
  hemiLight.position.set(0, 6, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.55);
  keyLight.position.set(3.2, 5.2, 4.0);
  keyLight.castShadow = shadowsEnabled;
  if (shadowsEnabled) {
    keyLight.shadow.mapSize.width = shadowMapSize;
    keyLight.shadow.mapSize.height = shadowMapSize;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 3.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  // Soft cool fill light so Lulu's black fur always reveals sculpting and face contours
  const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.72);
  fillLight.position.set(-3.5, 2.6, 3.2);
  scene.add(fillLight);

  // Rim/backlight separates Lulu's dark silhouette cleanly from the background
  const rimLight = new THREE.DirectionalLight(0xfef9c3, 0.95);
  rimLight.position.set(0.5, 3.4, -4.0);
  scene.add(rimLight);

  const applyPreset = (preset: LightingPreset, targetScene: THREE.Scene) => {
    if (preset === 'studioWarm') {
      targetScene.background = new THREE.Color(0xeef6f9);
      targetScene.fog = new THREE.FogExp2(0xeef6f9, 0.042);
      hemiLight.color.setHex(0xdbeafe);
      hemiLight.groundColor.setHex(0xfef3c7);
      hemiLight.intensity = 0.85;
      keyLight.color.setHex(0xfff3e0);
      keyLight.intensity = 1.55;
      fillLight.color.setHex(0xe0f2fe);
      fillLight.intensity = 0.72;
      rimLight.color.setHex(0xfef08a);
      rimLight.intensity = 0.95;
    } else if (preset === 'sunnyMorning') {
      targetScene.background = new THREE.Color(0xdff4ff);
      targetScene.fog = new THREE.FogExp2(0xdff4ff, 0.036);
      hemiLight.color.setHex(0xbae6fd);
      hemiLight.groundColor.setHex(0xd9f99d);
      hemiLight.intensity = 0.98;
      keyLight.color.setHex(0xfffbeb);
      keyLight.intensity = 1.8;
      fillLight.color.setHex(0xe0f2fe);
      fillLight.intensity = 0.8;
      rimLight.color.setHex(0xffffff);
      rimLight.intensity = 1.05;
    } else {
      // cozyEvening
      targetScene.background = new THREE.Color(0xe9e7f7);
      targetScene.fog = new THREE.FogExp2(0xe9e7f7, 0.045);
      hemiLight.color.setHex(0xc7d2fe);
      hemiLight.groundColor.setHex(0xfde68a);
      hemiLight.intensity = 0.75;
      keyLight.color.setHex(0xfed7aa);
      keyLight.intensity = 1.45;
      fillLight.color.setHex(0xddd6fe);
      fillLight.intensity = 0.65;
      rimLight.color.setHex(0xfbbf24);
      rimLight.intensity = 1.15;
    }
  };

  applyPreset('studioWarm', scene);

  return {
    hemiLight,
    keyLight,
    fillLight,
    rimLight,
    applyPreset,
    dispose: (_renderer?: THREE.WebGLRenderer, targetScene?: THREE.Scene) => {
      if (targetScene) {
        targetScene.environment = null;
      }
      keyLight.shadow.map?.dispose();
      envRT.dispose();
    },
  };
}
