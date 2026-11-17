# المرحلة 16: بناء وتغليف وإطلاق تطبيق Android (`PHASE_16_ANDROID_RELEASE`)

**الحالة الحالية:** `PLANNED — Not implemented` *(يتوفر `capacitor.config.ts` فقط كتهيئة مبدئية؛ يتطلب بيئة محلية تحتوي Android Studio / SDK / Gradle)*

## 1. اسم المرحلة
تغليف، اختبار على الأجهزة الفعلية، وإطلاق تطبيق Android عبر Capacitor (`Android Packaging & Release`)

## 2. رقم المرحلة
المرحلة 16 (`Phase 16`)

## 3. الهدف الرئيسي
تحويل حزمة الويب المعتمدة نهائياً في المرحلة 15 إلى تطبيق Android أصلي قابل للتثبيت (`APK` للاختبار و`AAB` للنشر على `Google Play`) مع التحقق الميداني من أداء معالج الرسوميات الفعلي (`Hardware GPU FPS`).

## 4. وصف المرحلة
تثبيت `@capacitor/android` في بيئة تطوير محلية مزودة بـ Java JDK وAndroid SDK وGradle، وتوليد مشروع `/android`، وضبط الأذونات والـ Splash والرموز (Adaptive Icons)، واختبار التطبيق على هواتف Android حقيقية من فئات مختلفة (اقتصادية ومتوسطة)، ثم إعداد متطلبات Google Play Families Policy.

## 5. المتطلبات السابقة
- اعتماد المرحلة 15 كلياً (`PHASE15_FINAL_QA_REPORT.md`).
- توفر جهاز تطوير محلي يضم Android Studio + Android SDK + JDK 17/21 + جهاز Android فعلي للاختبار (غير متاح في حاوية السحابة الحالية).

## 6. المهام التفصيلية
1. تثبيت `@capacitor/cli` و`@capacitor/android` وتوليد مجلد `android/` عبر `npx cap add android`.
2. بناء الويب `npm run build` ومزامنته `npx cap sync android`.
3. ضبط `AndroidManifest.xml` (إلغاء أي أذونات حساسة غير لازمة مثل الموقع أو الكاميرا أو الشبكة غير المبررة، وضبط الأيقونات التكيفية).
4. **الاختبار الميداني على جهاز Android فعلي (`Hardware GPU`):** قياس FPS الفعلي (هدف `30–60 FPS`)، استجابة اللمس، الصوت `.ogg`، والعودة بزر النظام الخلفي (`Android Back Button`).
5. إنشاء مفتاح التوقيع (`Release Keystore`) بأمان وتخزينه خارج المستودع.
6. بناء حزمة `app-release.aab` ورفعها إلى مسار اختبار داخلي (`Internal Testing`) في Google Play Console وإعداد نموذج **Google Play Families Policy** وسياسة الخصوصية.

## 7. الملفات والمكونات المتوقع إنشاؤها أو تعديلها
- `package.json` (`@capacitor/android`, `@capacitor/cli`)
- `capacitor.config.ts` (مراجعة نهائية للإنتاج)
- `android/` (مشروع Android Studio / Gradle — خارج بيئة السحابة الحالية)
- `reports/phase16/ANDROID_DEVICE_QA_REPORT.md`

## 8. التقنيات المستخدمة
Capacitor 8 (`@capacitor/core`, `@capacitor/android`), Android WebView, Android Studio, Gradle, Google Play Console.

## 9. الوظائف المطلوبة
- عمل كامل الشاشات والعوالم والشخصيات ثلاثية الأبعاد دون إنترنت في WebView؛ عمل زر الرجوع في Android بسلاسة مع `navStack`.

## 10. المتطلبات الأمنية
- عدم حفظ ملفات `.keystore` أو كلمات المرور داخل المستودع؛ التحقق من `webContentsDebuggingEnabled: false` و`allowMixedContent: false`؛ الامتثال التام لـ **Google Play Families Policy** وCOPPA/GDPR-K.

## 11. اختبارات الوحدة
- التحقق من استقرار ربط أحداث Android Back Button مع مكدس التنقل `navStack`.

## 12. اختبارات التكامل
- التحقق من حفظ `IndexedDB` و`localStorage` بعد إغلاق التطبيق من ذاكرة النظام وإعادة فتحه على Android.

## 13. اختبارات الواجهة
- التحقق البصري واللمسي على شاشات Android فعلية بأحجام ونسب عرض متعددة ودعم الحواف الآمنة (`Safe Area Insets`).

## 14. اختبارات Offline عند الحاجة
- وضع الطيران (`Airplane Mode`) الكامل على هاتف Android من لحظة الفتح حتى استعادة النجوم.

## 15. معايير قبول المرحلة
- `>= 30 FPS` على جهاز Android متوسط/اقتصادي، `0` انهيارات (`ANR/Crash`)، اجتياز فحوص Pre-launch في Play Console.

## 16. الأدلة المطلوبة
- تقرير اختبار الجهاز الفعلي (`ANDROID_DEVICE_QA_REPORT.md`) + قياسات FPS الفعلية + لقطات شاشة من جهاز Android حقيقي.

## 17. المخاطر المحتملة
- اختلاف أداء WebView في إصدارات Android القديمة أو مسح `localStorage` -> التحقق على Android 10+ وتثبيت نسخ WebView الموصى بها.

## 18. الاعتماديات على المراحل السابقة
- جميع المراحل 0–15.

## 19. تعريف واضح لما هو خارج نطاق المرحلة
- النشر على Apple App Store (iOS) أو إضافة إعلانات بعد الإطلاق.

## 20. شروط اعتماد المرحلة والانتقال لما بعدها
- اعتماد `ANDROID_DEVICE_QA_REPORT.md` والموافقة النهائية على الطرح العام في Google Play.
