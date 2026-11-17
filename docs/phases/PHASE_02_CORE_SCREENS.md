# المرحلة 02: الشاشات الأساسية الـ 14 وتجربة المستخدم (`PHASE_02_CORE_SCREENS`)

**الحالة الحالية:** `IN PROGRESS` / `IN REVIEW` *(الشاشات الـ 14 وحزمة Playwright والصور الـ 14 مبنية، لكن تشغيل Playwright الكامل من أوله لآخره وإعداد `PHASE2_QA_REPORT.md` لم يُستكملا بعد)*

## 1. اسم المرحلة
بناء الشاشات الأساسية الـ 14 ونظام التنقل وتجربة المستخدم (`Core Screens & UX Flow`)

## 2. رقم المرحلة
المرحلة 2 (`Phase 02`)

## 3. الهدف الرئيسي
تحويل النواة والشخصيات ثلاثية الأبعاد إلى تجربة تطبيق متكاملة من 14 شاشة عربية (`RTL`) متجاوبة، تربط إنشاء الملف باللعب والفوز واستعادة النجوم والمكافآت وبوابة ولوحة الوالدين وحفظ البيانات محلياً.

## 4. وصف المرحلة
تنفيذ جميع شاشات التدفق الرئيسي مع إظهار لولو ونونو ثلاثيي الأبعاد في مواضعهما السياقية، وتطبيق حراس الوصول والمراحل، مع استخدام أنشطة اختبار هيكلية مؤقتة في `src/data/phase2Activities.ts` للتحقق من الحلقة التعليمية الكاملة ريثما تُبنى العوالم السبعة في المراحل 3–9.

## 5. المتطلبات السابقة
- المرحلة 0 (`gameStore`, `screenRouter`, `IndexedDB`, `localStorage`, `sw.js`).
- المرحلة 1 (`CharacterCanvas` والشخصيات ثلاثية الأبعاد).

## 6. المهام التفصيلية
1. ربط الشاشات الـ 14 في `src/App.tsx` مع الإبقاء على `/?mode=character-lab` و`/?mode=phase0`.
2. بناء شاشات البداية: `SplashScreen`, `WelcomeStoryScreen` (4 مشاهد تفاعلية), `CreateProfileScreen`.
3. بناء شاشات اللعب والتصفح: `HomeDashboardScreen`, `WorldMapScreen`, `WorldDetailsScreen`, `StageSelectScreen`, `GameplayScreen`, `VictoryScreen`, `StarRestoreScreen`.
4. بناء شاشات التقدم والأهل: `RewardsScreen`, `ProfileScreen`, `ParentGateScreen`, `ParentDashboardScreen`.
5. ضبط `GameHeader.tsx`، معالجة العناصر المقفلة عبر `data-locked`، وضبط الاستجابة واللمس (`390×844` و`1440×960`).
6. كتابة حزمة `tests/phase2/game-flow.spec.ts` وتشغيلها بالكامل وتوليد `PHASE2_QA_REPORT.md`.

## 7. الملفات والمكونات المتوقع إنشاؤها أو تعديلها
- `src/App.tsx`, `src/components/layout/GameHeader.tsx`, `src/components/ui/CelebrationBurst.tsx`
- `src/screens/*.tsx` (الشاشات الـ 14)
- `src/data/phase2Activities.ts`, `src/data/rewardsCatalog.ts`
- `tests/phase2/game-flow.spec.ts`, `tests/phase2/README.md`
- `reports/phase2/qa-results.json`, `reports/phase2/PHASE2_QA_REPORT.md` *(مطلوب إنشاؤه عند إتمام الاختبار)*

## 8. التقنيات المستخدمة
React 19, TypeScript, Tailwind CSS v4 RTL, Motion, Lucide React, Three.js (`CharacterCanvas`), IndexedDB, Service Worker, Playwright.

## 9. الوظائف المطلوبة
- إنشاء عدة ملفات أطفال وتبديلها وحفظها في `IndexedDB`.
- منع دخول العالم أو المرحلة المقفلة، وفتح العالم الثاني بعد استعادة نجمة العالم الأول.
- احتساب XP والعملات والأوسمة، وشراء وتجهيز الأزياء، وعرض السجلات الحقيقية في لوحة الوالدين.

## 10. المتطلبات الأمنية
- فرض بوابة الوالدين (`ParentGate`) وPIN الاختياري قبل عرض لوحة الوالدين أو حذف/تصفير بيانات الطفل.

## 11. اختبارات الوحدة
- `npm run lint` (`tsc --noEmit`) و`npm run build`.

## 12. اختبارات التكامل
- التحقق من استمرارية الملف الشخصي، السجلات (`activity_logs`)، والإعدادات بعد إعادة تحميل الصفحة (`page.reload`).

## 13. اختبارات الواجهة
- التقاط ومراجعة 14 لقطة شاشة (`01-splash-screen.png` إلى `14-star-restore.png`) والتحقق من الجوال `390×844` واللمس.

## 14. اختبارات Offline عند الحاجة
- إعادة تحميل التطبيق في Playwright تحت وضع `context.setOffline(true)` والتحقق من عمل `Service Worker` وبقاء ملف الطفل سليماً.

## 15. معايير قبول المرحلة
- اجتياز **جميع** اختبارات `tests/phase2/game-flow.spec.ts` في تشغيل واحد نظيف متكامل (وليس اختبارات مجتزأة)، وتوليد `PHASE2_QA_REPORT.md` و`qa-results.json` كاملين.

## 16. الأدلة المطلوبة
- `reports/phase2/PHASE2_QA_REPORT.md` + `reports/phase2/qa-results.json` كامل + 14 لقطة شاشة محدثة (بما فيها `03-create-profile.png` بعد إصلاح `CharacterCanvas`) + مراجعة `tests/phase1` بعد تعديل المسار.

## 17. المخاطر المحتملة
- مهلة تشغيل Playwright تحت SwiftShader CPU عند تعدد مشاهد WebGL -> تم رفع مهلة الاختبار الأول إلى `360_000 ms` ويجب التحقق من نجاح التشغيل الكامل بدون انقطاع.

## 18. الاعتماديات على المراحل السابقة
- المرحلتان 0 و1.

## 19. تعريف واضح لما هو خارج نطاق المرحلة
- المحتوى التعليمي الحقيقي للعوالم السبعة (المراحل 3–9)، الأزياء ثلاثية الأبعاد على المجسم، والتسجيلات الصوتية `.ogg`.

## 20. شروط اعتماد المرحلة والانتقال لما بعدها
- **لا يجوز الانتقال للمرحلة 3** إلا بعد إتمام تشغيل حزمة `tests/phase1` + `tests/phase2` بالكامل بنجاح وكتابة `reports/phase2/PHASE2_QA_REPORT.md` والحصول على الموافقة الصريحة.
