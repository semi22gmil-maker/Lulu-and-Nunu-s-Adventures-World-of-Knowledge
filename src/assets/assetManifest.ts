import { CharacterId } from '../types/game';

export type ModelAdapterType = 'procedural-threejs' | 'glb-gltf';

export interface CharacterAssetDescriptor {
  id: CharacterId;
  displayNameAr: string;
  adapterType: ModelAdapterType;
  /** Optional local GLB/GLTF path inside public/models/ when swapping to external rigged models */
  glbPath?: string;
  scale: number;
  defaultOutfitId: string;
}

export interface OutfitDescriptor {
  id: string;
  nameAr: string;
  unlockCostCoins: number;
  applicableTo: CharacterId[];
  accentHex: string;
}

/**
 * Asset Manifest & Swappable 3D Model Registry
 * Allows starting with high-craft procedural Three.js articulated rigs in Phase 1
 * and seamlessly swapping to GLB/GLTF models later without rewriting game logic.
 */
export const CHARACTER_ASSETS: Record<CharacterId, CharacterAssetDescriptor> = {
  [CharacterId.Lulu]: {
    id: CharacterId.Lulu,
    displayNameAr: 'لولو',
    adapterType: 'procedural-threejs',
    glbPath: undefined, // Future drop-in: '/models/lulu.glb'
    scale: 1,
    defaultOutfitId: 'explorer-default',
  },
  [CharacterId.Nono]: {
    id: CharacterId.Nono,
    displayNameAr: 'نونو',
    adapterType: 'procedural-threejs',
    glbPath: undefined, // Future drop-in: '/models/nono.glb'
    scale: 1,
    defaultOutfitId: 'explorer-default',
  },
};

export const OUTFIT_CATALOG: OutfitDescriptor[] = [
  {
    id: 'explorer-default',
    nameAr: 'زي المستكشف الأساسي',
    unlockCostCoins: 0,
    applicableTo: [CharacterId.Lulu, CharacterId.Nono],
    accentHex: '#0d9488',
  },
  {
    id: 'scientist-coat',
    nameAr: 'معطف العالم الصغير',
    unlockCostCoins: 40,
    applicableTo: [CharacterId.Lulu, CharacterId.Nono],
    accentHex: '#0284c7',
  },
  {
    id: 'space-helmet',
    nameAr: 'خوذة رائد الفضاء',
    unlockCostCoins: 75,
    applicableTo: [CharacterId.Lulu, CharacterId.Nono],
    accentHex: '#f59e0b',
  },
  {
    id: 'artist-beret',
    nameAr: 'قبعة الرسام المبدع',
    unlockCostCoins: 50,
    applicableTo: [CharacterId.Lulu, CharacterId.Nono],
    accentHex: '#ea580c',
  },
];
