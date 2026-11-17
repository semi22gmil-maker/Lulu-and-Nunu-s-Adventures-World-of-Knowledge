# الخطوات التالية المرتبة بالأولوية — NEXT ACTIONS

## الأولوية القصوى (قبل بدء أي تطوير تعليمي جديد)
1. **إغلاق اختبار المرحلة 2 كاملاً:**
   - تشغيل `npm run test:e2e -- tests/phase2` على جهاز/بيئة بمهلة كافية حتى انتهاء الاختبارات الثلاثة كلها في تشغيل واحد (`3/3 PASS`) وتحديث `reports/phase2/qa-results.json` و`reports/phase2/screenshots/03-create-profile.png`.
2. **التحقق من عدم انحدار المرحلة 1:**
   - تشغيل `npm run test:e2e -- tests/phase1` للتأكد من مرور الاختبارات السبعة على `/?mode=character-lab`.
3. **إصدار تقرير QA المرحلة 2:**
   - كتابة `reports/phase2/PHASE2_QA_REPORT.md` استناداً إلى [`../templates/QA_REPORT_TEMPLATE.md`](../templates/QA_REPORT_TEMPLATE.md) مع رصد أي قيود.
4. **مزامنة المستودع مع GitHub:**
   - تصدير/دفع جميع الملفات (بما فيها `docs/`, `.github/`, root docs, و`reports/`) إلى `https://github.com/semi22gmil-maker/Lulu-and-Nunu-s-Adventures-World-of-Knowledge` والتحقق من مرور خط CI في `.github/workflows/ci.yml`.
5. **الحصول على اعتماد المرحلة 2 ثم بدء المرحلة 3 (`عالم الحروف العربية`).**
