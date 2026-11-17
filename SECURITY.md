# السياسة الأمنية — SECURITY POLICY

## التزامنا بأمان الأطفال والبيانات
صُمِّم تطبيق **مغامرات لولو ونونو – عالم المعرفة** ليعمل **محلياً بالكامل (`Offline-First / Local-First`)** دون خوادم خلفية لحسابات الأطفال، ودون جمع أو نقل أي بيانات تعريف شخصية (`Zero PII Telemetry`).

- لتفاصيل حماية الخصوصية وبوابة الوالدين انظر:
  - [`docs/security/CHILD_SAFETY.md`](./docs/security/CHILD_SAFETY.md)
  - [`docs/security/DATA_PROTECTION.md`](./docs/security/DATA_PROTECTION.md)
  - [`docs/security/SECURITY_CHECKLIST.md`](./docs/security/SECURITY_CHECKLIST.md)

## الإبلاغ عن ثغرة أمنية
إذا اكتشفت ثغرة أمنية (مثل إمكانية تجاوز بوابة الوالدين، ثغرة XSS في معالجة النصوص، أو طلب شبكة غير مصرح به):
1. **لا تنشر تفاصيل الاستغلال في Issue عامة** قبل معالجتها.
2. أبلغ مالك المستودع مباشرة عبر خاصية **Private Vulnerability Reporting** في GitHub Security Advisories أو عبر Issue سرية مختصرة دون تفاصيل استغلال.
3. سيُراجَع البلاغ ويُوثق الإصلاح في `docs/handover/KNOWN_ISSUES.md` و`CHANGELOG.md` مع إصدار اختبار انحدار يمنع عودة الخلل.
