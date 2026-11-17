# المعمارية ثلاثية الأبعاد — THREE.JS ARCHITECTURE

## 1. الهيكل المعياري لمحرك الشخصيات (`src/characters/`)

| الوحدة | الملفات | المسؤولية |
|---|---|---|
| **النواة (`core/`)** | `CharacterController.ts`, `CharacterAnimationManager.ts`, `CharacterExpressionManager.ts`, `CharacterInteractionManager.ts` | التحكم الموحد بالحركات الـ 13، مزج الانتقالات (`Blending`)، التعبيرات الـ 8، الرمش التلقائي، مزامنة الفم، والتفاعلات الثنائية الـ 9 |
| **لولو (`lulu/`)** | `LuluModel.ts`, `LuluCharacter.ts`, `luluAnimations.ts`, `luluExpressions.ts` | بناء المجسم الإجرائي للأرنبة لولو وتخصيص ملف حركتها وتعبيراتها |
| **نونو (`nono/`)** | `NonoModel.ts`, `NonoCharacter.ts`, `nonoAnimations.ts`, `nonoExpressions.ts` | بناء المجسم الإجرائي للدب نونو مع حقيبة الظهر وتخصيص حركته وتعبيراته |
| **المشتركات (`shared/`)** | `CharacterTypes.ts`, `CharacterFaceBuilder.ts`, `CharacterMaterials.ts`, `CharacterLighting.ts` | بناء الوجوه التعبيرية، المواد المادية، وإضاءة المشهد الثلاثية (`studio` / `morning` / `evening`) |
| **مكون العرض (`components/characters/`)** | `CharacterCanvas.tsx`, `CharacterControls.tsx` | دورة حياة `WebGLRenderer`, `OrbitControls`, الإيقاف/الاستئناف، التجاوب (`ResizeObserver`)، وفحص تسرب الذاكرة |

---

## 2. إدارة الأداء وذاكرة WebGL (`Memory & Performance Governance`)
1. **منع تسرب الذاكرة (`Zero WebGL Leaks`):**
   - يسجل كل مجسم و`CharacterFaceBuilder` كافة الكائنات الهندسية والمواد داخل مصفوفة `disposables`.
   - تحرر `CharacterLighting.ts` كل من `RoomEnvironment` المؤقت بعد توليد `PMREM` و`keyLight.shadow.map` عند التدمير (`dispose()`).
   - عند تفكيك `CharacterCanvas` يتم استدعاء `.dispose()` لجميع الموارد و`renderer.dispose()`.
   - التحقق الآلي في المرحلة 1 أثبت ثبات العدادات بعد 3 دورات تركيب وفك: `geometries: 74 === 74`، `textures: 8 === 8`.
2. **التكيف مع الأجهزة الضعيفة (`performanceProfile.ts`):**
   - تقييد `pixelRatio` ودرجة الظلال وفق `QualityTier` (`low`: `dpr <= 1.25`، `medium`: `dpr <= 1.5`، `high`: `dpr <= 2`).
   - حماية `tick()` و`handleResize()` عند حدث `webglcontextlost` وتنفيذ تصيير فوري عند تغيير الحجم أو `viewMode`.

---

## 3. جاهزية التوسع في المراحل القادمة
- تدعم طبقة `assetManifest.ts` الانتقال مستقبلاً من `procedural-threejs` إلى `glb-gltf` عبر نفس واجهة `CharacterController` دون تعديل الشاشات الـ 14.
- يجب في المرحلة 10 إضافة نقاط تثبيت (`Attachment Anchors`) للأزياء القابلة للفتح على الرأس والرقبة والظهر لربطها فعلياً بـ `equippedOutfits`.
