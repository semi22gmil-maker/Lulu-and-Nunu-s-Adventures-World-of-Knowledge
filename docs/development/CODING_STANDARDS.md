# معايير كتابة الكود — CODING STANDARDS

1. **TypeScript صارم:** استخدام الأنواع والتعدادات الموحدة في `src/types/game.ts`، وتجنب `any` إلا للضرورة الموثقة، والتحقق دائماً عبر `tsc --noEmit`.
2. **React حديث معياري:** مكونات دالية (`Functional Components`)، فصل المنطق والحالة عن العرض، وتجنب تضخيم ملفات الشاشات ببيانات ثابتة كبيرة (توضع في `src/worlds/<world>/` أو `src/data/`).
3. **تنسيق Tailwind CSS v4 ودعم RTL:**
   - الواجهة عربية `dir="rtl"`؛ يُفضل استخدام خصائص منطقية (`ps-`, `pe-`, `ms-`, `me-`, `start`, `end`) بدلاً من `left`/`right` قدر الإمكان.
   - النصوص أو الأرقام الإنجليزية (مثل العالم 8 أو القيم الرقمية) تُعزل في عناصر بـ `dir="ltr"`.
4. **انضباط Three.js والذاكرة:** كل `BufferGeometry`, `Material`, و`Texture` يُنشأ برمجياً يجب تسجيله وتصفيته في `dispose()` عند تفكيك المشهد.
5. **سلامة المتصفح والـ WebView:** يُمنع استخدام `window.alert`, `window.confirm`, `window.prompt`, أو `window.open`، كما يُمنع استخدام `window.speechSynthesis` المباشر كبديل لـ `voiceManifest.ts`.
6. **توافق الأطفال:** مقاس أزرار اللمس التفاعلية لا يقل عن `44×44 px`.
