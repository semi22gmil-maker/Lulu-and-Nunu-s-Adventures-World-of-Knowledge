import { StageMetadata, WorldDefinition } from '../types/game';

export interface StageStepPrompt {
  promptAr: string;
  helperAr: string;
  options: Array<{
    id: string;
    labelAr: string;
    isCorrect: boolean;
  }>;
}

/**
 * Generates lightweight Phase 2 structural interaction steps for the Gameplay shell.
 * Full educational mini-games and question banks belong strictly to Phases 3–9.
 */
export function buildStructuralStageSteps(
  world: WorldDefinition,
  stage: StageMetadata
): StageStepPrompt[] {
  return [
    {
      promptAr: `استعد مع لولو ونونو لبدء نشاط «${stage.titleAr}»`,
      helperAr: stage.descriptionAr,
      options: [
        { id: 's1-ready', labelAr: `تجهيز أدوات ${stage.titleAr}`, isCorrect: true },
        { id: 's1-skip-wrong', labelAr: 'العودة دون تجهيز', isCorrect: false },
      ],
    },
    {
      promptAr: `ساعد نونو في اختيار الهدف الصحيح داخل «${world.nameAr}»`,
      helperAr: `الهدف الحالي: استكشاف ${stage.titleAr} للاقتراب من ${world.starNameAr}.`,
      options: [
        { id: 's2-explore', labelAr: `تنفيذ تحدي ${stage.titleAr}`, isCorrect: true },
        { id: 's2-pause', labelAr: 'ترك التحدي في منتصفه', isCorrect: false },
        { id: 's2-mistake', labelAr: 'اختيار بطاقة غير مطابقة', isCorrect: false },
      ],
    },
    {
      promptAr: `الخطوة الأخيرة! أكمل «${stage.titleAr}» لجمع الطاقة نحو ${world.starNameAr}`,
      helperAr: 'اضغط على الإجراء الصحيح لإتمام هذه المرحلة.',
      options: [
        { id: 's3-complete', labelAr: `إتمام ${stage.titleAr} بنجاح`, isCorrect: true },
        { id: 's3-wrong', labelAr: 'تجاهل التحدي', isCorrect: false },
      ],
    },
  ];
}
