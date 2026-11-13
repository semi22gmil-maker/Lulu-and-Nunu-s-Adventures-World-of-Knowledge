import { DifficultyLevel, WorldDefinition, WorldId } from '../types/game';

/**
 * World Registry
 * Allows adding and updating educational worlds independently without modifying the core engine.
 */
class WorldRegistryStore {
  private worlds = new Map<WorldId, WorldDefinition>();

  register(definition: WorldDefinition): void {
    this.worlds.set(definition.id, definition);
  }

  getById(id: WorldId): WorldDefinition | undefined {
    return this.worlds.get(id);
  }

  getAll(): WorldDefinition[] {
    return Array.from(this.worlds.values()).sort((a, b) => a.order - b.order);
  }

  count(): number {
    return this.worlds.size;
  }
}

export const worldRegistry = new WorldRegistryStore();

// Register the 7 Knowledge Worlds (gameplay modules will plug into these slots in Phases 3–9)
const INITIAL_WORLDS: WorldDefinition[] = [
  {
    id: WorldId.ArabicLetters,
    order: 1,
    nameAr: 'عالم الحروف العربية',
    nameEn: 'Arabic Letters World',
    subtitleAr: 'مزرعة الكلمات وصيد الحروف وتتبعها',
    starNameAr: 'نجمة البيان',
    primaryColor: '#0d9488',
    accentColor: '#f59e0b',
    skyColor: '#e0f2fe',
    implemented: false,
    plannedPhase: 3,
    stages: [
      { id: 'ar-1', order: 1, titleAr: 'مزرعة الكلمات', titleEn: 'Word Farm', descriptionAr: 'لمس العناصر واكتشاف أسمائها وحروفها', targetSkill: 'letter-recognition', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'ar-2', order: 2, titleAr: 'صيد الحروف', titleEn: 'Letter Catch', descriptionAr: 'التقاط الحرف المطلوب من العناصر المتحركة', targetSkill: 'letter-matching', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'ar-3', order: 3, titleAr: 'تتبع الحروف', titleEn: 'Letter Tracing', descriptionAr: 'كتابة الحرف بالإصبع على المسار المضيء', targetSkill: 'letter-writing', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'ar-4', order: 4, titleAr: 'أشكال الحروف', titleEn: 'Letter Forms', descriptionAr: 'التعرف على الحرف في أول ووسط وآخر الكلمة', targetSkill: 'letter-positions', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'ar-5', order: 5, titleAr: 'تركيب الكلمات', titleEn: 'Word Builder', descriptionAr: 'سحب الحروف وترتيبها لتكوين كلمة', targetSkill: 'word-building', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'ar-6', order: 6, titleAr: 'تحديات صوتية', titleEn: 'Phonics Challenge', descriptionAr: 'سماع صوت الحرف واختيار العنصر المناسب', targetSkill: 'phonics', recommendedLevel: DifficultyLevel.Advanced },
    ],
  },
  {
    id: WorldId.NumbersMath,
    order: 2,
    nameAr: 'عالم الأرقام والحساب',
    nameEn: 'Numbers & Math World',
    subtitleAr: 'بستان التفاح والميزان والأشكال الهندسية',
    starNameAr: 'نجمة الحساب',
    primaryColor: '#2563eb',
    accentColor: '#fbbf24',
    skyColor: '#eff6ff',
    implemented: false,
    plannedPhase: 4,
    stages: [
      { id: 'math-1', order: 1, titleAr: 'جمع التفاح', titleEn: 'Apple Counting', descriptionAr: 'سحب التفاح إلى السلة وعدّه عملياً', targetSkill: 'addition', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'math-2', order: 2, titleAr: 'سلة الطرح', titleEn: 'Basket Subtraction', descriptionAr: 'طرح العناصر ومشاهدة الباقي مباشرة', targetSkill: 'subtraction', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'math-3', order: 3, titleAr: 'ميزان المقارنة', titleEn: 'Balance Scale', descriptionAr: 'مقارنة الكميات والأوزان على الميزان', targetSkill: 'comparison', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'math-4', order: 4, titleAr: 'الأشكال الهندسية', titleEn: 'Shapes Discovery', descriptionAr: 'اكتشاف الأشكال ومطابقتها ثلاثياً', targetSkill: 'geometry', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'math-5', order: 5, titleAr: 'الأنماط والترتيب', titleEn: 'Patterns & Ordering', descriptionAr: 'إكمال الأنماط العددية وترتيب الأرقام', targetSkill: 'patterns', recommendedLevel: DifficultyLevel.Advanced },
    ],
  },
  {
    id: WorldId.AnimalsKingdom,
    order: 3,
    nameAr: 'مملكة الحيوانات',
    nameEn: 'Animals Kingdom',
    subtitleAr: 'اكتشاف المواطن وإطعام الحيوانات ومراحل النمو',
    starNameAr: 'نجمة الطبيعة',
    primaryColor: '#16a34a',
    accentColor: '#f97316',
    skyColor: '#ecfdf5',
    implemented: false,
    plannedPhase: 5,
    stages: [
      { id: 'ani-1', order: 1, titleAr: 'حيوانات البر والبحر والبيت', titleEn: 'Animal Explorer', descriptionAr: 'اكتشاف الحيوانات وسماع أصواتها وأسمائها', targetSkill: 'animal-identification', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'ani-2', order: 2, titleAr: 'مطبخ الحيوانات', titleEn: 'Feed the Animals', descriptionAr: 'إطعام كل حيوان طعامه المناسب', targetSkill: 'animal-diets', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'ani-3', order: 3, titleAr: 'مواطن المخلوقات', titleEn: 'Habitats', descriptionAr: 'تصنيف الحيوانات حسب بيئتها الطبيعية', targetSkill: 'habitats', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'ani-4', order: 4, titleAr: 'دورة النمو', titleEn: 'Growth Stages', descriptionAr: 'ترتيب مراحل نمو الفراشة والضفدع والدجاجة', targetSkill: 'life-cycles', recommendedLevel: DifficultyLevel.Advanced },
    ],
  },
  {
    id: WorldId.ScienceLab,
    order: 4,
    nameAr: 'عالم العلوم والاكتشاف',
    nameEn: 'Science & Discovery Lab',
    subtitleAr: 'المختبر التفاعلي والفضاء والمغناطيس',
    starNameAr: 'نجمة الاكتشاف',
    primaryColor: '#0284c7',
    accentColor: '#10b981',
    skyColor: '#f0f9ff',
    implemented: false,
    plannedPhase: 6,
    stages: [
      { id: 'sci-1', order: 1, titleAr: 'نمو البذرة', titleEn: 'Seed Growth', descriptionAr: 'توفير الماء والشمس ومراقبة نمو النبات', targetSkill: 'botany', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'sci-2', order: 2, titleAr: 'دورة الماء', titleEn: 'Water Cycle', descriptionAr: 'محاكاة التبخر والتكثف والمطر', targetSkill: 'water-cycle', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'sci-3', order: 3, titleAr: 'حالات المادة', titleEn: 'States of Matter', descriptionAr: 'اكتشاف الصلب والسائل والغازي بالحرارة', targetSkill: 'matter-states', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'sci-4', order: 4, titleAr: 'تجربة المغناطيس', titleEn: 'Magnetism', descriptionAr: 'اختبار المواد التي تنجذب للمغناطيس', targetSkill: 'magnetism', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'sci-5', order: 5, titleAr: 'الكواكب وجسم الإنسان', titleEn: 'Space & Body', descriptionAr: 'رحلة بين الكواكب وأعضاء الجسم', targetSkill: 'astronomy-anatomy', recommendedLevel: DifficultyLevel.Advanced },
    ],
  },
  {
    id: WorldId.SmartPuzzles,
    order: 5,
    nameAr: 'عالم الذكاء والألغاز',
    nameEn: 'Logic & Puzzles World',
    subtitleAr: 'الذاكرة والمنطق والتركيب والأنماط',
    starNameAr: 'نجمة الحكمة',
    primaryColor: '#d97706',
    accentColor: '#0ea5e9',
    skyColor: '#fffbeb',
    implemented: false,
    plannedPhase: 7,
    stages: [
      { id: 'puz-1', order: 1, titleAr: 'تركيب الصور', titleEn: 'Jigsaw', descriptionAr: 'تجميع القطع لإظهار المشهد الكامل', targetSkill: 'spatial-puzzle', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'puz-2', order: 2, titleAr: 'بطاقات الذاكرة', titleEn: 'Memory Cards', descriptionAr: 'تذكر مواقع الأزواج المتطابقة', targetSkill: 'memory', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'puz-3', order: 3, titleAr: 'اكتشاف الاختلافات', titleEn: 'Spot Differences', descriptionAr: 'ملاحظة الفروق الدقيقة بين مشهدين', targetSkill: 'observation', recommendedLevel: DifficultyLevel.Intermediate },
      { id: 'puz-4', order: 4, titleAr: 'ألغاز المنطق والأنماط', titleEn: 'Logic & Sequences', descriptionAr: 'ترتيب الأشكال وإكمال التسلسل الذكي', targetSkill: 'logic', recommendedLevel: DifficultyLevel.Advanced },
    ],
  },
  {
    id: WorldId.EnglishWorld,
    order: 6,
    nameAr: 'عالم اللغة الإنجليزية',
    nameEn: 'English World',
    subtitleAr: 'الحروف والألوان والأرقام والكلمات بالصوت والصورة',
    starNameAr: 'نجمة اللغات',
    primaryColor: '#e11d48',
    accentColor: '#3b82f6',
    skyColor: '#fff1f2',
    implemented: false,
    plannedPhase: 8,
    stages: [
      { id: 'en-1', order: 1, titleAr: 'حروف A-Z', titleEn: 'Alphabet A-Z', descriptionAr: 'سماع نطق الحروف الإنجليزية وربطها بالصور', targetSkill: 'english-alphabet', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'en-2', order: 2, titleAr: 'الأرقام والألوان', titleEn: 'Numbers & Colors', descriptionAr: 'تلوين وعدّ العناصر بالإنجليزية والعربية', targetSkill: 'english-basics', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'en-3', order: 3, titleAr: 'الحيوانات والكلمات', titleEn: 'Animals & Words', descriptionAr: 'ربط الكلمة المنطوقة بالمعنى والصورة', targetSkill: 'english-vocabulary', recommendedLevel: DifficultyLevel.Intermediate },
    ],
  },
  {
    id: WorldId.ArtStudio,
    order: 7,
    nameAr: 'عالم الفن والإبداع',
    nameEn: 'Art & Creativity Studio',
    subtitleAr: 'الرسم ومزج الألوان وتزيين لولو ونونو',
    starNameAr: 'نجمة الإبداع',
    primaryColor: '#ea580c',
    accentColor: '#14b8a6',
    skyColor: '#fff7ed',
    implemented: false,
    plannedPhase: 9,
    stages: [
      { id: 'art-1', order: 1, titleAr: 'مرسم الأصابع والتلوين', titleEn: 'Free Draw & Color', descriptionAr: 'الرسم الحر وحفظ اللوحات في المعرض', targetSkill: 'drawing', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'art-2', order: 2, titleAr: 'مختبر مزج الألوان', titleEn: 'Color Mixing', descriptionAr: 'اكتشاف الألوان الثانوية بالتجربة', targetSkill: 'color-theory', recommendedLevel: DifficultyLevel.Beginner },
      { id: 'art-3', order: 3, titleAr: 'تزيين لولو ونونو', titleEn: 'Character Dress-Up', descriptionAr: 'تجربة القبعات والحقائب والشارات المفتوحة', targetSkill: 'creativity', recommendedLevel: DifficultyLevel.Intermediate },
    ],
  },
];

for (const world of INITIAL_WORLDS) {
  worldRegistry.register(world);
}
