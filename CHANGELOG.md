# سجل التغييرات — CHANGELOG

يتبع هذا السجل نمط [Keep a Changelog](https://keepachangelog.com/ar/1.0.0/) والترقيم الدلالي المرحلي.

## [Unreleased / Docs & Phase 2 Review] — 2026-11-17
### المضاف (Added)
- منظومة التوثيق الشاملة في `docs/` (`project/`, `architecture/`, `roadmap/`, `phases/PHASE_00..16`, `quality/`, `security/`, `development/`, `handover/`, `templates/`, `diagrams/`).
- ملفات حوكمة المستودع في الجذر: `README.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- قوالب GitHub Issues (`.github/ISSUE_TEMPLATE/*`) وخط أنابيب التحقق المستمر (`.github/workflows/ci.yml`).

### قيد المراجعة (In Review — Phase 2 Code Implemented)
- ربط الشاشات الـ 14 الأساسية في `src/App.tsx` و`src/screens/`.
- حزمة اختبارات `tests/phase2/game-flow.spec.ts` مع 14 لقطة شاشة في `reports/phase2/screenshots/` (بانتظار إغلاق التشغيل المجمع الكامل وإصدار `PHASE2_QA_REPORT.md`).

## [0.1.0-phase1] — 2026-11-15
### المضاف والمُتحقق منه
- استكمال والتحقق من المرحلة الأولى (`CONDITIONALLY APPROVED`): مجسما **لولو** و**نونو** ثلاثيا الأبعاد، 13 حركة، 8 تعبيرات، 9 تفاعلات ثنائية، ومختبر الشخصيات (`?mode=character-lab`).
- معالجة تسرب 22 هندسية وجه وتصفية `RoomEnvironment` و`shadow.map` وحساب `rawDt` الحقيقي.
- حزمة `tests/phase1/character-lab.spec.ts` (`7/7 PASS`) و`reports/phase1/PHASE1_QA_REPORT.md` + 13 لقطة شاشة.

## [0.0.0-phase0] — المرحلة صفر
### المضاف
- تأسيس النواة التقنية: `gameStore.tsx`, `screenRouter.ts`, `worldRegistry.ts`, `indexedDbService.ts`, `localStorageService.ts`, `audioManager.ts`, `public/sw.js`, `capacitor.config.ts`, و`docs/TECHNICAL_ARCHITECTURE.md`.
