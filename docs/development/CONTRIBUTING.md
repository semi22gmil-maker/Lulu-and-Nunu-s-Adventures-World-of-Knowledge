# دليل المساهمة الهندسية — CONTRIBUTING (docs/development)

للحصول على الدليل العام المختصر في جذر المستودع انظر [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).

## خطوات تنفيذ أي مهمة جديدة
1. اقرأ [`../handover/AI_HANDOVER.md`](../handover/AI_HANDOVER.md) و[`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md).
2. التزم بنطاق المرحلة الحالية الموصوف في `docs/phases/PHASE_XX_*.md`.
3. لا تغيّر ملفات المراحل المعتمدة السابقة (مثل محرك الشخصيات في المرحلة 1) إلا لإصلاح عيب موثق أو توسيع متوافق للخلف.
4. شغّل `npm run lint` و`npm run build` واختبارات Playwright ذات الصلة قبل طلب الاعتماد.
5. حدّث `PROJECT_STATUS.md` و`SESSION_LOG.md` وتأكد من خلو التقرير من أي نتائج غير منفّذة فعلياً.
