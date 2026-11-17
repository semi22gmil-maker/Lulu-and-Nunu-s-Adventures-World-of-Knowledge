# استكشاف الأخطاء وإصلاحها — TROUBLESHOOTING

## 1. فشل WebGL في Headless Chromium أو بطء التصيير
- **الأعراض:** تجمّد `<canvas>` أو انخفاض FPS إلى `1–3 FPS` في الاختبارات الآلية.
- **السبب:** بيئات CI/السحابة تستخدم محرك SwiftShader البرمجي على المعالج المركزي (CPU).
- **الحل:** تأكد من وجود رايات Launch في `playwright.config.ts` (`--use-gl=angle --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist`) وامنح الاختبارات متعددة المشاهد مهلة مناسبة (`test.setTimeout(360_000)` في المرحلة 2).

## 2. عدم ظهور الكاش القديم بعد تحديث `public/sw.js`
- **الأعراض:** استمرار تحميل نسخة قديمة من الصفحات عند اختبار `Offline`.
- **الحل:** ارفع رقم الإصدار في `CACHE_NAME` داخل `public/sw.js`، وامسح Application Storage في أدوات المطور (`Clear site data`).

## 3. تحذير حجم الحزمة `Some chunks are larger than 500 kB`
- **الحالة الحالية:** معروف (`KI-004`) لأن `three` مجمّع في ملف واحد (`dist/assets/index-*.js` ~1.3 MB).
- **الحل المجدول:** سيُعالج عبر `React.lazy` و`manualChunks` في **المرحلة 14**.

## 4. خطأ `fatal: not a git repository` في بيئة السحابة
- **السبب:** حاوية AI Studio السحابية لا تضم مجلد `.git` أو بيانات اعتماد GitHub.
- **الحل:** مزامنة الملفات عبر أداة التصدير/GitHub في المنصة أو محلياً عبر `git push`.
