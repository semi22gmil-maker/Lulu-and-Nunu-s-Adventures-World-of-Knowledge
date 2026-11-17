# وثيقة التسليم الشاملة للذكاء الاصطناعي والمطورين — AI HANDOVER

> **تعليمات إلزامية لأي نموذج ذكاء اصطناعي أو مطور يستلم المشروع:**
> 1. **اقرأ هذه الوثيقة بالكامل** ثم [`QUICK_RESUME.md`](./QUICK_RESUME.md) ثم [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) ثم [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) قبل لمس أي ملف برمجي.
> 2. **لا تعِد بناء المشروع من الصفر** ولا تَمسَح ملفات المراحل السابقة أو تعيد تصميم شخصيتي لولو ونونو.
> 3. **التزم الصدق المطلق:** لا تدّعِ نجاح اختبار لم تُشغّله بنفسك في بيئتك، ولا تعتبر المرحلة الثانية معتمدة قبل تشغيل حزمة `tests/phase2` كاملةً وتوليد `reports/phase2/PHASE2_QA_REPORT.md`.
> 4. **لا تبدأ المرحلة 3** قبل إغلاق المرحلة 2 رسمياً والحصول على موافقة صريحة من المالك.
> 5. **التزم بهوية المشروع:** واجهة عربية `RTL`، أطفال 4–10 سنوات، لا إعلانات، لا تتبع، لا دردشة، ولا `window.alert`/`window.open`.

---

## أ. وصف المشروع وسياقه (`Project Context`)
- **الاسم:** مغامرات لولو ونونو – عالم المعرفة (`Lulu and Nunu – World of Knowledge`)
- **المستودع الرسمي:** `https://github.com/semi22gmil-maker/Lulu-and-Nunu-s-Adventures-World-of-Knowledge`
- **الهدف:** لعبة تعليمية ثلاثية الأبعاد تعمل محلياً دون إنترنت (PWA + مهيأة لـ Capacitor Android مستقبلاً) تقود فيها الأرنبة **لولو** والدب **نونو** الطفل لاستعادة **النجوم السبع للمعرفة** عبر 7 عوالم تعليمية.

## ب. البنية المعمارية الحالية (`Current Architecture`)
- **الواجهة والحالة:** React 19 + TypeScript + Tailwind CSS v4 (`dir="rtl"`) + Motion + `useReducer` في `src/state/gameStore.tsx`.
- **الرسوم ثلاثية الأبعاد:** Three.js (`^0.187.0`) عبر `CharacterCanvas.tsx` ومجلد `src/characters/` (`core`, `lulu`, `nono`, `shared`) مع تحرير صريح لجميع الـ `BufferGeometry` و`Materials` و`Textures`.
- **التخزين والعمل أوفلاين:** `IndexedDB` (`lulu_nono_knowledge_db`: مخازن `profiles`, `activity_logs`, `drawings`, `asset_cache`) + `localStorage` (`lulu_nono_v1_*`) + Service Worker (`public/sw.js`).
- **الصوت:** `Web Audio API` في `src/audio/audioManager.ts` مع `src/audio/voiceManifest.ts` ومزامنة شفاه (`LipSyncListener`).

## ج. حالة المراحل الحالية (`Current Phase Status`)
- **المرحلة 0 (`Phase 00`):** `COMPLETED — Verified`
- **المرحلة 1 (`Phase 01`):** `CONDITIONALLY APPROVED` (`7/7` اختبارات Playwright على SwiftShader + 13 لقطة شاشة؛ مؤجل: اختبار Hardware GPU Android وملفات `.ogg`).
- **المرحلة 2 (`Phase 02`):** `IN PROGRESS` / `IN REVIEW` (جميع الشاشات الـ 14 وحراس التنقل والحفظ المحلي و14 لقطة شاشة مبنية، لكن تشغيل Playwright المجمع الكامل لم يُغلق بعد و`reports/phase2/PHASE2_QA_REPORT.md` غير موجود بعد).
- **المراحل 3–9 (العوالم السبعة):** `PLANNED — Not implemented` (`worldRegistry.ts`: `implemented: false`).
- **المراحل 10–13:** أنوية أولية جزئية (`rewardsCatalog`, `recordAttemptAndAdapt`, `ParentGate/Dashboard`, `Web Audio SFX`)، ومكملة كمراحل مستقلة لاحقاً.
- **المراحل 14–16:** `PLANNED — Not implemented`.

## د. ما تم إنجازه فعلياً مع الدليل
- بناء النواة في `src/state/`, `src/storage/`, `src/navigation/`, `src/registry/`, `src/audio/`, `src/utils/`.
- بناء لولو ونونو بـ 13 حركة، 8 تعبيرات، 9 تفاعلات ثنائية، ومختبر الشخصيات (`?mode=character-lab`) وتوثيقها في `reports/phase1/PHASE1_QA_REPORT.md` و13 صورة.
- بناء وتوصيل الـ 14 شاشة في `src/screens/*` و`src/App.tsx`، وإصلاح `GameHeader` و`data-locked` و`CharacterCanvas` instant render، والتقاط 14 صورة في `reports/phase2/screenshots/`.
- كتابة نظام التوثيق والحوكمة الشامل في `docs/` و`.github/` وجذر المستودع.

## هـ. ما تبقى من المرحلة النشطة (`Phase 2`)
1. تشغيل `npm run test:e2e -- tests/phase2` كاملاً من أول اختبار لآخره في جلسة نظيفة واحدة (والتحقق أيضاً من `npm run test:e2e -- tests/phase1` بعد نقل المختبر إلى `/?mode=character-lab`).
2. التحقق من تحديث `reports/phase2/qa-results.json` بجميع الفحوص الثلاثة (`fullJourney`, `mobileResponsiveAndTouch`, `offlineServiceWorker`) ولقطة `03-create-profile.png` بعد إصلاح `CharacterCanvas`.
3. كتابة `reports/phase2/PHASE2_QA_REPORT.md` وفق [`../templates/QA_REPORT_TEMPLATE.md`](../templates/QA_REPORT_TEMPLATE.md).

## و. ما هو قيد التنفيذ أو متوقف (`Blockers & Gaps`)
- **قيود البيئة السحابية:** لا يوجد مجلد `.git` في حاوية `/app/applet`؛ لذا لم يُرفع أي Commit من هذه الحاوية ولا تتوفر أرقام Commits تاريخية (`UNKNOWN — Requires verification in GitHub repo`).
- **فجوة توثيق المرحلة 2:** غياب `PHASE2_QA_REPORT.md` وكون `qa-results.json` يحتوي فحصاً منفرداً فقط.

## ز. القرارات المعمارية الحاكمة (`Key ADRs`)
انظر [`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md):
- النماذج الإجرائية في Three.js قابلة للاستبدال بـ `.glb` عبر `assetManifest.ts`.
- فصل النطق عن المؤثرات عبر `voiceManifest.ts` بدلاً من `SpeechSynthesis`.
- استخدام `IndexedDB` + `localStorage` بدون خادم سحابي لحماية خصوصية الطفل.
- استخدام `data-locked` بدلاً من `aria-disabled` على بطاقات العوالم والمراحل المقفلة لتظل تفاعلية برسالة إرشاد للأطفال.

## ح. الملفات الحرجة التي لا يجوز كسرها
- `src/characters/core/*`, `LuluModel.ts`, `NonoModel.ts` (حساسة لتسرب الذاكرة `disposables`).
- `src/components/characters/CharacterCanvas.tsx` (يحتوي إصلاحات `webglcontextlost`, `rawDt`, `skipInteractionClearRef`, والتصيير الفوري).
- `src/navigation/screenRouter.ts` (حارس بوابة الوالدين وتسلسل المراحل).
- `src/storage/indexedDbService.ts` و`public/sw.js`.

## ط. الأخطاء والمشاكل المعروفة (`Known Issues`)
انظر التفاصيل الكاملة في [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) — أبرزها:
- تعارض معرفات `OUTFIT_CATALOG` بين `src/assets/assetManifest.ts` و`src/data/rewardsCatalog.ts` (`KI-002`).
- كبر حجم حزمة `vite build` (`1,315.86 kB > 500 kB`) (`KI-004`).
- `parentPinHash` مخزن كنص خام مؤقتاً (`KI-005`).
- غياب مشغل الموسيقى الخلفية وملفات `.ogg` رغم وجود الإعدادات (`KI-006`).

## ي. الخطوة التالية الفورية (`Immediate Next Step`)
راجع [`NEXT_ACTIONS.md`](./NEXT_ACTIONS.md) — إغلاق اختبار Playwright الكامل للمرحلة 2 (`tests/phase2` و`tests/phase1`) وكتابة `reports/phase2/PHASE2_QA_REPORT.md` ثم مزامنة GitHub وطلب اعتماد المرحلة 2.

## ك. قواعد العمل الممنوع مخالفتها
- لا إعلانات، لا تتبع، لا `SpeechSynthesis`، لا `window.alert`/`window.open`، لا بيانات وهمية في تقارير الوالدين، لا تخلي عن `RTL`، لا قفز للمراحل دون إغلاق QA المرحلة السابقة.

## ل. تعليمات التشغيل والاختبار
```bash
npm ci
npm run lint
npm run build
npm run test:e2e -- tests/phase1
npm run test:e2e -- tests/phase2
```

## م. مراجع القراءة السريعة
1. [`QUICK_RESUME.md`](./QUICK_RESUME.md)
2. [`CURRENT_PROJECT_STATE.md`](./CURRENT_PROJECT_STATE.md)
3. [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md)
4. [`../roadmap/MASTER_ROADMAP.md`](../roadmap/MASTER_ROADMAP.md)

## ن. تنبيه للمصداقية
كل حالة في هذه الوثيقة مبنية على فحص الملفات الفعلي في `src/`, `tests/`, `reports/` حتى تاريخ `2026-11-17`. أي تحقق جديد يجب أن يحدّث هذه الملفات في نهاية الجلسة.
