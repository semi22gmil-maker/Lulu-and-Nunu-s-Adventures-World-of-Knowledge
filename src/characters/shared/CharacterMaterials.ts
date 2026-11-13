import * as THREE from 'three';

/**
 * Generates a lightweight procedural plush-fur CanvasTexture so characters feel soft and tactile
 * without external image dependencies or heavy shader overhead on Android GPUs.
 */
export function createPlushTexture(baseHex: string, highlightHex: string, seedOffset = 0): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, size, size);

    // Subtle soft velvet fibers
    for (let i = 0; i < 420; i++) {
      const rx = ((Math.sin(i * 12.9898 + seedOffset) * 43758.5453) % 1 + 1) % 1;
      const ry = ((Math.sin(i * 78.233 + seedOffset) * 28471.1357) % 1 + 1) % 1;
      const x = rx * size;
      const y = ry * size;
      ctx.fillStyle = highlightHex;
      ctx.globalAlpha = 0.09 + (i % 4) * 0.025;
      ctx.beginPath();
      ctx.ellipse(x, y, 2.2, 0.9, (i % 6) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a soft radial contact shadow CanvasTexture for grounded feet placement.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 6, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.18)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface SharedCharacterMaterialSet {
  eyeWhite: THREE.MeshStandardMaterial;
  pupilDark: THREE.MeshStandardMaterial;
  catchlight: THREE.MeshBasicMaterial;
  mouthCavity: THREE.MeshStandardMaterial;
  tongue: THREE.MeshStandardMaterial;
  cheekRose: THREE.MeshStandardMaterial;
  goldAccent: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  dispose: () => void;
}

export function createSharedCharacterMaterials(): SharedCharacterMaterialSet {
  const shadowTex = createContactShadowTexture();

  const eyeWhite = new THREE.MeshStandardMaterial({
    color: 0xfefefe,
    roughness: 0.18,
    metalness: 0.0,
  });

  const pupilDark = new THREE.MeshStandardMaterial({
    color: 0x0b0f19,
    roughness: 0.1,
    metalness: 0.05,
  });

  const catchlight = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const mouthCavity = new THREE.MeshStandardMaterial({
    color: 0x3b1320,
    roughness: 0.75,
  });

  const tongue = new THREE.MeshStandardMaterial({
    color: 0xf47296,
    roughness: 0.55,
  });

  const cheekRose = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.85,
    transparent: true,
    opacity: 0.42,
  });

  const goldAccent = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.8,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });

  return {
    eyeWhite,
    pupilDark,
    catchlight,
    mouthCavity,
    tongue,
    cheekRose,
    goldAccent,
    contactShadow,
    dispose: () => {
      shadowTex.dispose();
      eyeWhite.dispose();
      pupilDark.dispose();
      catchlight.dispose();
      mouthCavity.dispose();
      tongue.dispose();
      cheekRose.dispose();
      goldAccent.dispose();
      contactShadow.dispose();
    },
  };
}
