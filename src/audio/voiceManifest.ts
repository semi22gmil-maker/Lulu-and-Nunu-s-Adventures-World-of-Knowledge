import { CharacterId, WorldId } from '../types/game';

export type VoiceClipCategory =
  | 'welcome'
  | 'activity-intro'
  | 'encourage'
  | 'hint'
  | 'celebrate'
  | 'surprise'
  | 'phonics-ar'
  | 'phonics-en';

export interface VoiceClipDescriptor {
  id: string;
  speaker: CharacterId;
  category: VoiceClipCategory;
  textAr: string;
  /** Local bundled audio path under /audio/voices/... (pre-recorded native Arabic/English clips) */
  localAssetPath: string | null;
  /** Approximate duration in ms for caption & lip-sync timing when local clip is pending */
  estimatedDurationMs: number;
  worldId?: WorldId;
}

/**
 * Local Voice Clip Manifest
 * Architecture note: Human speech MUST use pre-recorded local audio files bundled in /public/audio/
 * rather than synthetic Web Audio oscillators or unreliable OS SpeechSynthesis.
 * New studio recordings can be dropped into /public/audio/voices/ and mapped here without changing game logic.
 */
export const VOICE_CLIP_MANIFEST: Record<string, VoiceClipDescriptor> = {
  'lulu_welcome_01': {
    id: 'lulu_welcome_01',
    speaker: CharacterId.Lulu,
    category: 'welcome',
    textAr: 'أهلاً بك يا صديقي! أنا لولو، وهذه مغامرتنا لاستعادة النجوم السبع!',
    localAssetPath: null, // Ready for '/audio/voices/lulu_welcome_01.ogg'
    estimatedDurationMs: 3200,
  },
  'nono_encourage_01': {
    id: 'nono_encourage_01',
    speaker: CharacterId.Nono,
    category: 'encourage',
    textAr: 'هيا بنا! أنا نونو ومستعد للمغامرة معك!',
    localAssetPath: null, // Ready for '/audio/voices/nono_encourage_01.ogg'
    estimatedDurationMs: 2400,
  },
  'lulu_hint_gentle': {
    id: 'lulu_hint_gentle',
    speaker: CharacterId.Lulu,
    category: 'hint',
    textAr: 'لا بأس، لنجرب معاً خطوة بخطوة!',
    localAssetPath: null,
    estimatedDurationMs: 2100,
  },
  'nono_celebrate_01': {
    id: 'nono_celebrate_01',
    speaker: CharacterId.Nono,
    category: 'celebrate',
    textAr: 'رائع! لقد فعلتها بنجاح!',
    localAssetPath: null,
    estimatedDurationMs: 1800,
  },
};

export function getVoiceClip(clipId: string): VoiceClipDescriptor | undefined {
  return VOICE_CLIP_MANIFEST[clipId];
}
