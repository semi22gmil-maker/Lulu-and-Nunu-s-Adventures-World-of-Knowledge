# معمارية العمل دون إنترنت — OFFLINE ARCHITECTURE (PWA & Service Worker)

## 1. المبادئ الأساسية
صُمِّم التطبيق ليعمل بنسبة 100% دون اتصال بالإنترنت بعد الزيارة الأولى (أو مباشرة داخل حزمة Android WebView مستقبلاً):
- جميع شاشات اللعبة ومنطق التقدم والرسوم ثلاثية الأبعاد (`Three.js` الإجرائية) والمؤثرات الصوتية (`Web Audio API`) تُولَّد وتُنفَّذ محلياً دون الحاجة لأي API خارجي.
- البيانات الدائمة محفوظة في `IndexedDB` و`localStorage`.

---

## 2. آلية عمل `public/sw.js` (`lulu-nono-offline-v1`)
1. **التثبيت (`install`):** تخزين قائمة الهيكل الأساسي `APP_SHELL_URLS` (`/`، `/index.html`، `/manifest.webmanifest`، `/icon.svg`) واستدعاء `self.skipWaiting()`.
2. **التنشيط (`activate`):** تنظيف الكاشات القديمة غير المطابقة لـ `CACHE_NAME` واستدعاء `self.clients.claim()`.
3. **الاعتراض (`fetch`):**
   - يتعامل مع طلبات `GET` لنفس النطاق (`isSameOrigin`) وخطوط Google (`fonts.googleapis.com` و`fonts.gstatic.com`).
   - يطبق استراتيجية **Cache-First with Network Fallback & Populate**: إذا وُجد الرد في الكاش يعيده فوراً؛ وإلا يجلبه من الشبكة ويخزنه.
   - إذا فشل الاتصال أثناء طلب تنقل (`request.mode === 'navigate'`), يعيد `/index.html` من الكاش لضمان عدم ظهور صفحة خطأ المتصفح.
4. **رسائل التسخين (`CACHE_ASSETS`):** يتيح التطبيق إرسال قائمة أصول عبر `postMessage` لتخزينها استباقياً.

---

## 3. نقاط المراقبة للمراحل اللاحقة
- عند إضافة ملفات الصوت `.ogg` في المرحلة 13 أو أصول صور/خطوط محلية، يجب إضافتها إلى قائمة التسخين (`CACHE_ASSETS` أو قائمة `vite` assets) وتحديث إصدار `CACHE_NAME`.
- الاعتماد المستمر على `fonts.googleapis.com` يعني أن الزيارة الأولى أوفلاين دون كاش مسبق ستسقط للخط الاحتياطي للنظام؛ يُنصح في المرحلة 14 بتضمين نسخ `woff2` محلية لخطي `Cairo` و`Tajawal` داخل `public/fonts/` لضمان مطابقة بصرية 100% داخل Capacitor Android.
