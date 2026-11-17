# دليل المساهمة — CONTRIBUTING

شكراً لاهتمامك بالمساهمة في تطوير **مغامرات لولو ونونو – عالم المعرفة**!

## قواعد العمل الأساسية
1. **اقرأ السياق أولاً:** ابدأ دائماً بقراءة [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) و[`docs/handover/AI_HANDOVER.md`](./docs/handover/AI_HANDOVER.md).
2. **احترم حدود المراحل:** لا تخلط مهام مرحلتين في تعديل واحد، ولا تبدأ مرحلة جديدة قبل اعتماد السابقة في [`docs/quality/ACCEPTANCE_CRITERIA.md`](./docs/quality/ACCEPTANCE_CRITERIA.md).
3. **سلامة الأطفال خط أحمر:** يُمنع إضافة إعلانات، روابط خارجية، دردشة، أدوات تتبع، `window.alert`, أو `window.open`.
4. **حافظ على العربية RTL وجودة Three.js:** كل واجهة يجب أن تعمل بانسيابية على الجوال `390×844` وسطح المكتب، مع تحرير كافة موارد WebGL عند التدمير (`dispose()`).

## خطوات رفع مساهمة (`Pull Request`)
```bash
git checkout -b phase/XX-short-description
npm ci
npm run lint
npm run build
npm run test:e2e
```
تأكد من تحديث التوثيق والتقارير ذات الصلة وعدم ادعاء نجاح أي اختبار لم يُنفذ فعلياً.
لمعايير الكود التفصيلية راجع [`docs/development/CODING_STANDARDS.md`](./docs/development/CODING_STANDARDS.md).
