# هيكل المجلدات والملفات — FOLDER STRUCTURE

## 1. الهيكل الفعلي الموجود حالياً في المستودع

```text
/
├── .github/                      # قوالب البلاغات وخط أنابيب CI
├── capacitor.config.ts           # إعدادات Capacitor الأولية (com.lulunono.adventure)
├── docs/                         # التوثيق الشامل وخارطة الطريق والمراحل (0–16)
├── index.html                    # نقطة الدخول العربية (lang="ar" dir="rtl")
├── metadata.json                 # الاسم والوصف الرسمي للتطبيق في AI Studio
├── package.json                  # الاعتماديات وأوامر build/lint/test:e2e
├── playwright.config.ts          # إعدادات Playwright (Headless Chromium + SwiftShader)
├── public/
│   ├── icon.svg                  # شعار التطبيق الرئيسي
│   ├── manifest.webmanifest      # تعريف تطبيق الويب التقدمي PWA
│   └── sw.js                     # Service Worker للعمل دون إنترنت
├── reports/
│   ├── phase1/                   # تقرير QA المعتمد مشروطاً + qa-results.json + 13 لقطة شاشة
│   └── phase2/                   # qa-results.json (جزئي) + 14 لقطة شاشة (بدون PHASE2_QA_REPORT.md بعد)
├── src/
│   ├── App.tsx                   # الجذر الرئيسي وموجه الشاشات الـ 14 وأوضاع التشخيص
│   ├── assets/assetManifest.ts   # سجل نماذج الشخصيات (procedural / glb مستقبلاً) وكتالوج أزياء
│   ├── audio/                    # محرك المؤثرات الصوتية وسجل المقاطع الكلامية
│   ├── characters/
│   │   ├── core/                 # Animation / Controller / Expression / Interaction Managers
│   │   ├── lulu/                 # نموذج لولو وحركاتها وتعبيراتها
│   │   ├── nono/                 # نموذج نونو وحركاته وتعبيراته
│   │   └── shared/               # أنواع الشخصيات، بناء الوجه، الإضاءة، المواد
│   ├── components/
│   │   ├── characters/           # CharacterCanvas.tsx و CharacterControls.tsx
│   │   ├── layout/               # GameHeader.tsx
│   │   └── ui/                   # CelebrationBurst.tsx
│   ├── data/
│   │   ├── phase2Activities.ts   # أنشطة اختبار هيكلية مؤقتة للمرحلة 2 فقط
│   │   └── rewardsCatalog.ts     # تعريفات الأوسمة الستة ومتجر الأزياء الحالي
│   ├── features/character-lab/   # CharacterLab.tsx (مختبر التحقق ثلاثي الأبعاد)
│   ├── navigation/screenRouter.ts# سجل الشاشات وحارس بوابة الوالدين والمراحل
│   ├── registry/worldRegistry.ts # سجل العوالم السبعة ومراحلها
│   ├── screens/                  # 14 شاشة أساسية + Phase0DiagnosticsScreen.tsx
│   ├── state/gameStore.tsx       # GameStateProvider والمخفض التفاعلي والتكيف التعليمي
│   ├── storage/                  # IndexedDB و localStorage وتسجيل Service Worker
│   ├── types/game.ts             # التعدادات والواجهات البرمجية الموحدة
│   └── utils/performanceProfile.ts # فحص قدرات WebGL وضبط الجودة الرسومية
├── tests/
│   ├── phase1/                   # اختبارات المرحلة 1 (`character-lab.spec.ts` + README)
│   └── phase2/                   # اختبارات المرحلة 2 (`game-flow.spec.ts` + README)
├── tsconfig.json
└── vite.config.ts
```

---

## 2. المجلدات المخططة مستقبلاً (`Planned Directories`)
- `src/worlds/` *(المراحل 3–9)*: مجلد مستقل لكل عالم من العوالم السبعة (`arabic-letters/`, `numbers-math/`, إلخ).
- `public/audio/voices/` *(المرحلة 13)*: التسجيلات الصوتية البشرية بصيغة `.ogg` للشخصيات والدروس.
- `public/models/` *(مستقبلاً اختياري)*: ملفات `.glb` في حال الترقية من النماذج الإجرائية.
- `android/` *(المرحلة 16)*: مشروع Gradle/Android المولّد عبر `npx cap add android`.
