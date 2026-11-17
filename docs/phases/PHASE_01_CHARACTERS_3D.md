# المرحلة 01: الشخصيات ثلاثية الأبعاد — لولو ونونو (`PHASE_01_CHARACTERS_3D`)

**الحالة الحالية:** `CONDITIONALLY APPROVED` *(مكتملة هندسياً ومختبرة بـ SwiftShader؛ اختبار GPU Android الحقيقي و`.ogg` مؤجلان)*

## 1. اسم المرحلة
تصميم وتحريك شخصيتي لولو ونونو ثلاثيتي الأبعاد ومختبر الشخصيات (`3D Characters & Character Lab`)

## 2. رقم المرحلة
المرحلة 1 (`Phase 01`)

## 3. الهدف الرئيسي
بناء مجسمي الأرنبة **لولو** والدب **نونو** في Three.js بنظام حركات وتعبيرات وتفاعلات ثنائية مستقل وقابل للتحقق البصري والهندسي دون تسرب ذاكرة WebGL.

## 4. وصف المرحلة
تطوير النواة ثلاثية الأبعاد (`CharacterController`, `AnimationManager`, `ExpressionManager`, `InteractionManager`) ومكون `CharacterCanvas.tsx` ومختبر الشخصيات `CharacterLab.tsx` لاختبار 13 حركة، 8 تعبيرات، مزامنة الشفاه، الكاميرا، الإضاءة، و9 تفاعلات مشتركة.

## 5. المتطلبات السابقة
- اعتماد المرحلة 0 (`types/game.ts`, `audioManager.ts`, `performanceProfile.ts`).

## 6. المهام التفصيلية
1. بناء `LuluModel.ts` (أرنبة سوداء لطيفة بأذنين وذيل) و`NonoModel.ts` (دب بني بحقيبة ظهر).
2. بناء `CharacterFaceBuilder.ts` و`CharacterMaterials.ts` و`CharacterLighting.ts`.
3. تنفيذ الحركات الـ 13 لكل شخصية مع انتقالات ناعمة (`crossfade`) وعودة تلقائية في نمط `مرة واحدة`.
4. تنفيذ 8 تعبيرات وجه + رمش تلقائي/يدوي + حركة الفم ومزامنة الكلام.
5. تنفيذ 9 تفاعلات ثنائية مع حفظ المؤقتات عند الانتقال من العرض الفردي إلى الثنائي.
6. بناء `CharacterLab.tsx` متاح عبر `/?mode=character-lab` مع ضوابط الكاميرا (4 أوضاع + OrbitControls) والإضاءة (3 أوضاع) والإيقاف والاستئناف.
7. إضافة حزمة اختبارات Playwright (`tests/phase1/character-lab.spec.ts`) والتقاط 13 لقطة شاشة موثقة.

## 7. الملفات والمكونات المتوقع إنشاؤها أو تعديلها
- `src/characters/core/*` (`CharacterAnimationManager.ts`, `CharacterController.ts`, `CharacterExpressionManager.ts`, `CharacterInteractionManager.ts`)
- `src/characters/lulu/*`, `src/characters/nono/*`, `src/characters/shared/*`
- `src/components/characters/CharacterCanvas.tsx`, `CharacterControls.tsx`
- `src/features/character-lab/CharacterLab.tsx`
- `tests/phase1/character-lab.spec.ts`, `tests/phase1/README.md`, `reports/phase1/*`

## 8. التقنيات المستخدمة
Three.js (`^0.187.0`), `OrbitControls`, `RoomEnvironment` + `PMREMGenerator`, React 19, TypeScript, Playwright (`SwiftShader WebGL2`).

## 9. الوظائف المطلوبة
- تبديل العرض (`لولو` / `نونو` / `كلاهما`) مع استقلالية حالة كل شخصية.
- 13 حركة × 2 شخصية، 8 تعبيرات وجه، 9 تفاعلات ثنائية، رمش وفتح الفم، إيقاف وتجميد تام للإطارات، وتجاوب `ResizeObserver`.

## 10. المتطلبات الأمنية
- تحرير كامل موارد GPU (`BufferGeometry`, `Material`, `Texture`, `shadow.map`) لتفادي انهيار تبويب المتصفح أو WebView؛ حماية `webglcontextlost`.

## 11. اختبارات الوحدة
- فحص الأنواع (`tsc --noEmit`) وسلامة تعداد الحركات والتعبيرات.

## 12. اختبارات التكامل
- ربط `CharacterCanvas` مع `audioManager.subscribeLipSync` ومتابعة عدد المثلثات (`17,362` للولو، `18,242` لنونو، `33,528` لكليهما).

## 13. اختبارات الواجهة
- `tests/phase1/character-lab.spec.ts` (7/7 PASS): فحص تغير البكسلات في `<canvas>`، ثبات الذاكرة (`geometries: 74`, `textures: 8`)، محاكاة اللمس `390×844`، والتقاط 13 لقطة في `reports/phase1/screenshots/`.

## 14. اختبارات Offline عند الحاجة
- التحقق من عدم طلب أي أصول أو نماذج خارجية من الشبكة (`failedRequests: []`).

## 15. معايير قبول المرحلة
- 0 أخطاء Console/Page، 0 تسرب ذاكرة WebGL عبر 3 دورات تركيب/فك، ووجود 13 لقطة شاشة مطابقة للتقرير.

## 16. الأدلة المطلوبة
- `reports/phase1/PHASE1_QA_REPORT.md` + `reports/phase1/qa-results.json` + 13 صورة في `reports/phase1/screenshots/`.

## 17. المخاطر المحتملة
- قياس SwiftShader CPU (`1–3 FPS`) لا يعكس أداء GPU الهاتف الحقيقي -> مؤجل للتحقق الميداني على Android في المرحلة 16.

## 18. الاعتماديات على المراحل السابقة
- المرحلة 0.

## 19. تعريف واضح لما هو خارج نطاق المرحلة
- الشاشات الـ 14، المناهج التعليمية، تسجيل ملفات `.ogg` البشرية، وبناء APK.

## 20. شروط اعتماد المرحلة والانتقال لما بعدها
- معتمدة مشروطاً (`CONDITIONALLY APPROVED`) مع توضيح إعادة التحقق لاحقاً على مسار `/?mode=character-lab` في الانحدار الشامل.
