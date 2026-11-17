# المرحلة 00: تهيئة البيئة والمعمارية الأساسية (`PHASE_00_ENVIRONMENT`)

**الحالة الحالية:** `COMPLETED — Verified`

## 1. اسم المرحلة
تهيئة البيئة والمعمارية الأساسية والخدمات المشتركة (`Environment & Core Architecture Setup`)

## 2. رقم المرحلة
المرحلة 0 (`Phase 00`)

## 3. الهدف الرئيسي
إرساء البنية التحتية الكاملة للتطبيق، نظام الحالة المركزي، التخزين المحلي المزدوج، التوجيه المحروس، الصوتيات الأساسية، وملفات PWA وCapacitor Config دون أخطاء بناء.

## 4. وصف المرحلة
بناء النواة التقنية المستقلة التي تستند إليها جميع المراحل اللاحقة، مع عزل طبقة الأصول (`assetManifest`) وطبقة الصوت (`voiceManifest`) وسجل العوالم (`worldRegistry`) لتسهيل التوسع المرحلي.

## 5. المتطلبات السابقة
- توفر بيئة Node.js (`v22+`) وnpm (`10+`) وتهيئة Vite + React 19 + TypeScript + Tailwind v4.

## 6. المهام التفصيلية
1. فحص البيئة وتهيئة `index.html` باللغة العربية `lang="ar" dir="rtl"` وخطوط `Cairo` و`Tajawal`.
2. بناء `src/types/game.ts` وتوحيد التعدادات (`ScreenId`, `WorldId`, `CharacterAnimState`, `DifficultyLevel`, `QualityTier`).
3. بناء طبقة التخزين: `src/storage/indexedDbService.ts` و`src/storage/localStorageService.ts`.
4. بناء `src/state/gameStore.tsx` وإضافة حراس التنقل في `src/navigation/screenRouter.ts`.
5. تسجيل العوالم السبعة في `src/registry/worldRegistry.ts` وتهيئة الصوتيات في `src/audio/*`.
6. تجهيز `public/manifest.webmanifest`، `public/sw.js`، `capacitor.config.ts`، و`Phase0DiagnosticsScreen.tsx`.

## 7. الملفات والمكونات المتوقع إنشاؤها أو تعديلها
- `index.html`, `metadata.json`, `capacitor.config.ts`, `public/sw.js`, `public/manifest.webmanifest`, `public/icon.svg`
- `src/types/game.ts`, `src/state/gameStore.tsx`, `src/navigation/screenRouter.ts`, `src/registry/worldRegistry.ts`
- `src/storage/*`, `src/audio/*`, `src/assets/assetManifest.ts`, `src/utils/performanceProfile.ts`
- `src/screens/Phase0DiagnosticsScreen.tsx`, `docs/TECHNICAL_ARCHITECTURE.md`

## 8. التقنيات المستخدمة
React 19, TypeScript, Vite, Tailwind CSS v4, IndexedDB, localStorage, Web Audio API, Service Worker API, `@capacitor/core`.

## 9. الوظائف المطلوبة
- حفظ واسترجاع ملفات الأطفال والسجلات من `IndexedDB`.
- حفظ الإعدادات الفوري في `localStorage`.
- توليد المؤثرات الصوتية غير الكلامية عبر Web Audio.
- كشف قدرات WebGL واقتراح مستوى الجودة (`low`/`medium`/`high`).

## 10. المتطلبات الأمنية
- عدم إرسال أي بيانات خارج الجهاز؛ تهيئة حارس `resolveNavigationTarget` لبوابة الوالدين؛ تفعيل `allowMixedContent: false` في `capacitor.config.ts`.

## 11. اختبارات الوحدة
- التحقق من صحة دوال `screenRouter.ts` وحسابات `difficulty` و`explorerLevel`.

## 12. اختبارات التكامل
- التحقق من اتصال `gameStore` مع `indexedDbService` و`localStorageService` عبر شاشة `?mode=phase0`.

## 13. اختبارات الواجهة
- التأكد من اتجاه `RTL` وسلامة عرض شاشة تشخيص المرحلة صفر دون أخطاء `Console`.

## 14. اختبارات Offline عند الحاجة
- التحقق من تسجيل `/sw.js` عبر `serviceWorkerRegister.ts`.

## 15. معايير قبول المرحلة
- نجاح `npm run lint` و`npm run build` بصفر أخطاء، وعمل شاشة `?mode=phase0`.

## 16. الأدلة المطلوبة
- مخرجات البناء النظيفة وملف `docs/TECHNICAL_ARCHITECTURE.md` وكود النواة في `src/`.

## 17. المخاطر المحتملة
- عدم توفر أدوات Android SDK في السحابة -> تم التخفيف بتجهيز `capacitor.config.ts` وتأجيل التغليف الفعلي للمرحلة 16.

## 18. الاعتماديات على المراحل السابقة
- لا توجد (مرحلة التأسيس الأولى).

## 19. تعريف واضح لما هو خارج نطاق المرحلة
- بناء المجسمات ثلاثية الأبعاد، الشاشات الـ 14، والمحتوى التعليمي للعوالم السبعة.

## 20. شروط اعتماد المرحلة والانتقال لما بعدها
- ثبات الأنواع والبناء وتوفر جميع خدمات النواة للمرحلة 1 (`COMPLETED — Verified`).
