# سجل المشاكل والثغرات المعروفة — KNOWN ISSUES

جميع النقاط التالية موثقة من فحص الكود الفعلي والتشغيل:

| المعرف | الخطورة | الوصف الدقيق | الموقع في الكود | خطة الحل / المرحلة |
|---|---|---|---|---|
| **`KI-001`** | `P1` *(إجرائي)* | حزمة اختبارات المرحلة 2 (`tests/phase2/game-flow.spec.ts`) لم تُكمل تشغيلاً مجمعاً كاملاً منذ آخر تعديل على `CharacterCanvas`، ولا يوجد `PHASE2_QA_REPORT.md` بعد؛ و`reports/phase2/qa-results.json` يحتوي نتيجة `offlineServiceWorker` فقط. | `reports/phase2/`, `tests/phase2/` | إعادة تشغيل `tests/phase2` كاملاً وإصدار `PHASE2_QA_REPORT.md` قبل المرحلة 3. |
| **`KI-002`** | `P2` | وجود تعريفين غير متطابقين لـ `OUTFIT_CATALOG`: الأول في `assetManifest.ts` (`scientist-coat`, `space-helmet`, `artist-beret`) والثاني المستخدم فعلياً في الواجهة `rewardsCatalog.ts` (`star-scarf`, `adventure-backpack`, `knowledge-crown`). | `src/assets/assetManifest.ts`, `src/data/rewardsCatalog.ts` | توحيد المصدر وربطه بأزياء 3D في المرحلة 10. |
| **`KI-003`** | `P2` | لقطة `reports/phase2/screenshots/03-create-profile.png` التُقطت قبل تعديل التصيير الفوري في `CharacterCanvas.tsx` وقبل زيادة مهلة الانتظار إلى `800ms`. | `reports/phase2/screenshots/03-create-profile.png` | تُحدَّث تلقائياً عند إعادة تشغيل `tests/phase2`. |
| **`KI-004`** | `P2` | حجم حزمة الإنتاج الأولية يتجاوز 500 kB (`dist/assets/index-*.js` يبلغ `1,315.86 kB` / `344.16 kB gzip`) مما يُصدر تحذير Vite أثناء البناء. | `vite.config.ts`, `src/App.tsx` | تطبيق `React.lazy` و`manualChunks` في المرحلة 14. |
| **`KI-005`** | `P2` | حقل `parentPinHash` يُحفظ ويُقارن حالياً كنص خام للرمز من 4 أرقام في `localStorage` رغم اسمه. | `src/screens/ParentGateScreen.tsx`, `ParentDashboardScreen.tsx` | ترقيته لتجزئة `SHA-256` عبر `Web Crypto API` في المرحلة 14. |
| **`KI-006`** | `P2` | إعدادات `musicEnabled` / `musicVolume` و`dailyLimitMinutes` تُحفظ في الواجهة دون مشغل موسيقى خلفية فعلي ودون منع لعب صارم عند انتهاء الوقت اليومي، والملفات `.ogg` في `voiceManifest.ts` قيمتها `null`. | `src/audio/`, `src/state/gameStore.tsx` | استكمالها في المرحلتين 12 و13 كما هو مجدول. |
| **`KI-007`** | `P3` | `package.json` يتضمن `@google/genai` و`express` من قالب البدء رغم عدم استدعائهما في `src/`. | `package.json` | المراجعة والتنظيف في المرحلة 14. |
| **`KI-008`** | `P3` | `docs/TECHNICAL_ARCHITECTURE.md` يذكر مسودة قديمة (Phases 0–12) بينما المعتمد حالياً هو (Phases 0–16). | `docs/TECHNICAL_ARCHITECTURE.md` | تم التوضيح في `docs/README.md` و`MASTER_ROADMAP.md` مع الإبقاء على الملف أرشيفياً. |
| **`KI-009`** | `P2` *(بيئة)* | عدم اختبار FPS واللمس على جهاز Android فعلي بمعالج GPU حقيقي (`SwiftShader` يعطي `1–3 FPS` فقط)، وعدم وجود `.git` في حاوية AI Studio السحابية. | البيئة / السحابة | اختبار Android فعلي في المرحلة 16، ومزامنة GitHub محلياً. |
