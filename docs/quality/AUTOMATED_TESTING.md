# الاختبار الآلي (Playwright & CI) — AUTOMATED TESTING

## 1. الإعداد المعتمد (`playwright.config.ts`)
- مجلد الاختبارات: `./tests`
- المتصفح: Headless Chromium مع رايات WebGL البرمجية:
  `--use-gl=angle --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist`
- خادم الاختبار التلقائي: `npm run build && npm run preview -- --port 4173 --host 127.0.0.1`
- عدد العمال: `workers: 1` (`fullyParallel: false`) لتجنب تداخل سياقات WebGL وموارد CPU أثناء قياس البكسلات.

---

## 2. الحزم الموجودة حالياً في المستودع

### أ. حزمة المرحلة الأولى: `tests/phase1/character-lab.spec.ts`
- **المسار المختبر:** `/?mode=character-lab` *(حُدِّث المسار خلال المرحلة 2 بعد إسناد `/` لشاشات اللعبة الرئيسية)*.
- **النطاق:** 7 اختبارات شاملة تغطي لولو ونونو، 13 حركة لكل شخصية، 8 تعبيرات، 9 تفاعلات ثنائية، 4 زوايا كاميرا، 3 إضاءات، الإيقاف الدقيق، استجابة الجوال باللمس، تسرب الذاكرة (`3` دورات)، وإنتاج 13 لقطة في `reports/phase1/screenshots/`.
- **الحالة الموثقة:** `7/7 PASS` في `reports/phase1/PHASE1_QA_REPORT.md` (قبل تعديل مسار `?mode=character-lab`؛ يوصى بإعادة تشغيلها ضمن التحقق القادم).

### ب. حزمة المرحلة الثانية: `tests/phase2/game-flow.spec.ts`
- **النطاق:** 3 اختبارات (`1`: التدفق الكامل عبر الشاشات الـ 14 وإكمال مراحل العالم الأول واستعادة النجمة وفتح العالم الثاني والمكافآت وبوابة/لوحة الوالدين وتبديل الملفات؛ `2`: التجاوب RTL واللمس على الجوال `390×844`؛ `3`: العمل دون إنترنت عبر Service Worker `context.setOffline(true)`).
- **الحالة الفعلية الموثقة بصدق:** **غير مكتمل التشغيل المجمع النهائي (`IN REVIEW / INCOMPLETE EVIDENCE`)**. تم التقاط جميع اللقطات الـ 14 (`reports/phase2/screenshots/01-*.png` حتى `14-*.png`)، واجتازت اختبارات التجاوب والأوفلاين بشكل منفرد، بينما انقطع التشغيل المتكامل للحزمة قبل استكماله وإصدار `PHASE2_QA_REPORT.md`. الملف `reports/phase2/qa-results.json` حالياً يعكس الفحص المنفرد الأخير (`offlineServiceWorker`) فقط.

---

## 3. أوامر التشغيل
```bash
npm run test:e2e -- tests/phase1   # اختبارات المرحلة 1
npm run test:e2e -- tests/phase2   # اختبارات المرحلة 2
npm run test:e2e                   # جميع الاختبارات
```
