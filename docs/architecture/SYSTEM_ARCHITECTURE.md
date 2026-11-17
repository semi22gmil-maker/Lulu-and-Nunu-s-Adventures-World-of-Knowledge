# معمارية النظام الشاملة — SYSTEM ARCHITECTURE

> **ملاحظة:** تفصل هذه الوثيقة بوضوح بين **المعمارية المنفذة فعلياً** في الكود، و**المعمارية المخططة** للمراحل 3–15، و**المعمارية المستقبلية** (Android / أصول خارجية في المرحلة 16).

---

## 1. المعمارية المنفذة فعلياً (`Implemented Architecture`)

يتبع التطبيق نمط **تطبيق الصفحة الواحدة المحلي أولاً (`Local-First SPA`)** مبني على React 19 وThree.js:

1. **طبقة العرض والواجهات (`Presentation Layer`):**
   - `src/App.tsx`: يلف التطبيق داخل `GameStateProvider` ويدير أوضاع التحقق الخاصة (`?mode=character-lab` و`?mode=phase0`) والشاشات الـ 14 عبر `switch (currentScreen)`.
   - `src/screens/*`: 15 مكون شاشة (14 شاشة لعب أساسية + `Phase0DiagnosticsScreen.tsx`).
   - `src/components/layout/GameHeader.tsx` و`src/components/ui/CelebrationBurst.tsx`.

2. **طبقة إدارة الحالة المركزية (`State Management Layer`):**
   - `src/state/gameStore.tsx`: يدير `GameState` باستخدام `useReducer` + React Context، ويتصل مباشرة بـ `indexedDbService` و`localStorageService` و`audioManager` و`worldRegistry`.

3. **طبقة التوجيه وحراس الوصول (`Navigation & Guards Layer`):**
   - `src/navigation/screenRouter.ts`: يدير مكدس التنقل (`navStack`) ويفرض التحقق عبر `resolveGuardedNavigation` (حراسة الملف الشخصي، فتح العوالم، فتح المراحل بالتسلسل، وبوابة الوالدين).

4. **طبقة المحرك ثلاثي الأبعاد (`3D Character Engine`):**
   - `src/components/characters/CharacterCanvas.tsx` (جسر React ↔ Three.js).
   - `src/characters/core/*` (`CharacterController`, `CharacterAnimationManager`, `CharacterExpressionManager`, `CharacterInteractionManager`).
   - `src/characters/lulu/*`, `src/characters/nono/*`, `src/characters/shared/*`.

5. **طبقة الصوت والتخزين والأداء (`Platform & Services Layer`):**
   - `src/audio/audioManager.ts` و`src/audio/voiceManifest.ts`.
   - `src/storage/indexedDbService.ts` و`src/storage/localStorageService.ts` و`src/storage/serviceWorkerRegister.ts`.
   - `src/utils/performanceProfile.ts` (`detectWebGLCapabilities` لتحديد مستويات الجودة).

---

## 2. المعمارية المخططة للمراحل 3–15 (`Planned Architecture`)
- **وحدات العوالم التعليمية المستقلة (`src/worlds/*`):** توصيل كل عالم تعليمي بسجل `worldRegistry.ts` وتغيير `implemented: false` إلى `true` تدريجياً، بحيث تستدعي `GameplayScreen.tsx` النشاط الفعلي للعالم بدلاً من الأنشطة الهيكلية المؤقتة في `src/data/phase2Activities.ts`.
- **أصول الصوت البشري `.ogg`:** وضع الملفات الصوتية في `public/audio/voices/` وتحديث `localAssetPath` في `src/audio/voiceManifest.ts`.
- **تحسين الحزم (`Code Splitting`):** استخدام `React.lazy` و`manualChunks` في `vite.config.ts` لفصل حزمة Three.js والوحدات التعليمية حسب العالم.

---

## 3. المعمارية المستقبلية (`Future Architecture`)
- **نماذج GLB/GLTF:** تفعيل `glb-gltf` عبر `src/assets/assetManifest.ts` (`glbPath: '/models/lulu.glb'`) مع الحفاظ على نفس `CharacterController` API.
- **التغليف الأصلي (`Capacitor Android`):** توليد مجلد `/android` عبر `@capacitor/android` استناداً إلى `capacitor.config.ts` وإنتاج حزم `APK`/`AAB`.
