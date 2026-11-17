# معمارية الأمان والخصوصية — SECURITY ARCHITECTURE

## 1. نموذج الثقة والعزل (`Threat Model & Local Isolation`)
نظراً لأن الفئة المستهدفة هم أطفال بعمر 4–10 سنوات:
- **غياب كامل لسطح الهجوم الشبكي لبيانات المستخدم:** لا تُرسَل أسماء الأطفال أو أعمارهم أو سجلات أدائهم أو لوحاتهم الفنية إلى أي خادم خارجي.
- **غياب التتبع والإعلانات:** لا توجد مكتبات تحليل سلوكي (Analytics) أو شبكات إعلانية أو ملفات تعريف ارتباط تتبعية (`Third-party Tracking Cookies`).
- **غياب النوافذ الخارجية:** لا يستخدم التطبيق `window.open` أو `window.alert` التي قد تخرج الطفل من بيئة التطبيق المحمية أو تربك WebView.

---

## 2. طبقة بوابة الوالدين (`Parent Gate`)
تقع في `src/screens/ParentGateScreen.tsx` ومدعومة في `src/navigation/screenRouter.ts`:
- تحمي الوصول إلى `ParentDashboardScreen` (التي تضم تعديل الإعدادات، الحد اليومي، إعادة تعيين التقدم، وحذف ملفات الأطفال).
- **آلية التحقق:**
  - مسألة حسابية ديناميكية (مثال: ضرب أو جمع فوق مستوى الطفل المبكر) تتجدد تلقائياً.
  - أو إدخال رمز PIN المكون من 4 أرقام إذا فعّله ولي الأمر.
- **مدة الجلسة الآمنة:** يُفتح المسار عبر `parentGateUnlockedUntil` لمدة مؤقتة (`10` دقائق افتراضياً عبر إجراء `UNLOCK_PARENT_GATE`)، وبعد انتهائها يُعاد طلب التحقق تلقائياً.

---

## 3. تشديد الإعدادات لـ Capacitor Android (`capacitor.config.ts`)
- `allowMixedContent: false` لمنع تحميل أي محتوى HTTP غير مشفر.
- `androidScheme: 'https'` لتوافق WebView مع `Service Worker` و`Web Crypto` و`IndexedDB`.
- `webContentsDebuggingEnabled: false` لمنع تصحيح WebView عن بُعد في إصدارات الإنتاج.

---

## 4. التحسينات الأمنية المخططة (المرحلة 14)
1. تجزئة رمز `parentPinHash` بخوارزمية SHA-256 عبر `crypto.subtle.digest` مع salt محلي بدلاً من المقارنة النصية المباشرة.
2. فحص التبعيات عبر `npm audit` وإزالة الحزم غير المستخدمة إذا لزم الأمر وتطبيق Content Security Policy (CSP) مناسبة في `index.html`.
