# قائمة التحقق الأمني — SECURITY CHECKLIST

يجب فحص ومراجعة جميع البنود التالية قبل اعتماد أي إصدار رئيسي وقبل الإطلاق على Android:

- [x] عدم وجود أي إعلانات أو حزم تتبع سلوكية أو `Analytics` خارجية في `package.json` أو `src/`.
- [x] عدم وجود `window.alert` أو `window.open` داخل التطبيق (`تم التحقق via grep في src/`).
- [x] حماية `ParentDashboardScreen` عبر `resolveNavigationTarget` و`ParentGateScreen`.
- [x] ضبط `allowMixedContent: false` و`webContentsDebuggingEnabled: false` في `capacitor.config.ts`.
- [x] عدم تخزين أي مفاتيح API أو أسرار في `.env.example` أو الكود المصدري.
- [ ] *(مؤجل للمرحلة 14)* ترقية `parentPinHash` من المقارنة النصية الحالية إلى تجزئة `SHA-256` عبر `Web Crypto API`.
- [ ] *(مؤجل للمرحلة 14)* استبدال طلبات `fonts.googleapis.com` في `index.html` بخطوط `woff2` محلية مدمجة في `public/fonts/`.
- [ ] *(مؤجل للمرحلة 14)* مراجعة وإزالة الاعتماديات غير المستخدمة من القالب الأساسي (`@google/genai`, `express`) إذا لم تعد مطلوبة للخادم/المعاينة، وتشغيل `npm audit`.
- [ ] *(مؤجل للمرحلة 16)* مراجعة `AndroidManifest.xml` والتأكد من خلوه من أذونات الموقع/الكاميرا/الميكروفون وتخزين ملف `.keystore` خارج المستودع.
