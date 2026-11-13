import * as THREE from 'three';
import { QualityTier } from '../types/game';

export type WebGLFallbackMode =
  | 'webgl2-hardware'
  | 'webgl2-software'
  | 'webgl1-fallback'
  | 'no-webgl-2d-fallback';

export interface WebGLCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  isSoftwareGl: boolean;
  gpuRenderer: string;
  fallbackMode: WebGLFallbackMode;
}

export interface RenderProfileConfig {
  tier: QualityTier;
  isSoftwareGl: boolean;
  gpuRenderer: string;
  fallbackMode: WebGLFallbackMode;
  maxPixelRatio: number;
  antialias: boolean;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  particleBudget: number;
}

let cachedCapabilities: WebGLCapabilities | null = null;

/**
 * Probes WebGL2 / WebGL1 capabilities once and detects software rasterizers (SwiftShader/llvmpipe/WARP).
 */
export function detectWebGLCapabilities(): WebGLCapabilities {
  if (cachedCapabilities !== null) {
    return cachedCapabilities;
  }

  if (typeof document === 'undefined') {
    return {
      hasWebGL: false,
      hasWebGL2: false,
      isSoftwareGl: false,
      gpuRenderer: 'SSR',
      fallbackMode: 'no-webgl-2d-fallback',
    };
  }

  const canvas = document.createElement('canvas');
  const gl2 = canvas.getContext('webgl2');
  const gl = gl2 || canvas.getContext('webgl');

  if (!gl) {
    cachedCapabilities = {
      hasWebGL: false,
      hasWebGL2: false,
      isSoftwareGl: true,
      gpuRenderer: 'No WebGL Context',
      fallbackMode: 'no-webgl-2d-fallback',
    };
    return cachedCapabilities;
  }

  const hasWebGL2 = Boolean(gl2);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const rendererStr = String(gl.getParameter(param) || 'WebGL Renderer');
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

  let fallbackMode: WebGLFallbackMode = 'webgl2-hardware';
  if (!hasWebGL2) fallbackMode = 'webgl1-fallback';
  else if (isSoftwareGl) fallbackMode = 'webgl2-software';

  cachedCapabilities = {
    hasWebGL: true,
    hasWebGL2,
    isSoftwareGl,
    gpuRenderer: rendererStr,
    fallbackMode,
  };

  return cachedCapabilities;
}

/**
 * Verifies Three.js WebGLRenderer initialization & immediate disposal for Phase 0 QA.
 */
export function probeThreeRendererInit(): { ok: boolean; message: string } {
  const caps = detectWebGLCapabilities();
  if (!caps.hasWebGL) {
    return {
      ok: false,
      message: 'WebGL غير متوفر — تم تفعيل مسار البديل ثنائي الأبعاد (no-webgl-2d-fallback)',
    };
  }

  try {
    const renderer = new THREE.WebGLRenderer({
      antialias: !caps.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(64, 64, false);
    const gl = renderer.getContext();
    const valid = Boolean(gl && !gl.isContextLost());
    renderer.dispose();
    return {
      ok: valid,
      message: valid
        ? `تمت تهيئة Three.js بنجاح (${caps.fallbackMode})`
        : 'تم فقدان سياق WebGL أثناء الاختبار',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'فشل إنشاء Three.WebGLRenderer',
    };
  }
}

/**
 * Computes Three.js rendering limits tailored for low/mid/high Android devices.
 */
export function getRenderProfileConfig(tier: QualityTier): RenderProfileConfig {
  const { isSoftwareGl, gpuRenderer, fallbackMode } = detectWebGLCapabilities();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  if (isSoftwareGl || tier === QualityTier.Low) {
    return {
      tier,
      isSoftwareGl,
      gpuRenderer,
      fallbackMode,
      maxPixelRatio: 1,
      antialias: false,
      shadowsEnabled: false,
      shadowMapSize: 512,
      particleBudget: 18,
    };
  }

  if (tier === QualityTier.Medium) {
    return {
      tier,
      isSoftwareGl,
      gpuRenderer,
      fallbackMode,
      maxPixelRatio: Math.min(dpr, 1.5),
      antialias: true,
      shadowsEnabled: true,
      shadowMapSize: 1024,
      particleBudget: 36,
    };
  }

  return {
    tier,
    isSoftwareGl,
    gpuRenderer,
    fallbackMode,
    maxPixelRatio: Math.min(dpr, 2),
    antialias: true,
    shadowsEnabled: true,
    shadowMapSize: 2048,
    particleBudget: 64,
  };
}
