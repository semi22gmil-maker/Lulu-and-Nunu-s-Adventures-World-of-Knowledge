# كتالوج الميزات — FEATURES CATALOG

يوضح هذا الكتالوج حالة كل ميزة في المستودع استناداً إلى فحص الكود الفعلي، وليس على التوقعات:

> **دليل الحالات:** `COMPLETED — Verified` | `IN PROGRESS` | `PLANNED — Not implemented` | `UNKNOWN — Requires verification`

---

## أ. الميزات ثلاثية الأبعاد والشخصيات
| الميزة | الوصف | الحالة | المرجع في الكود |
|---|---|---|---|
| نموذج لولو ثلاثي الأبعاد | أرنبة سوداء بأذنين متمفصلتين، عيون تعبيرية، ذيل، ومفاصل كاملة | `COMPLETED — Verified` | `src/characters/lulu/LuluModel.ts` |
| نموذج نونو ثلاثي الأبعاد | دب بني بحقيبة ظهر، أنف، أذنين، ومفاصل كاملة | `COMPLETED — Verified` | `src/characters/nono/NonoModel.ts` |
| 13 حركة مستقلة لكل شخصية | `Idle, Walk, Run, Jump, Celebrate, Dance, Clap, Encourage, Point, Think, Surprise, Laugh, GentleSad` | `COMPLETED — Verified` | `src/characters/core/CharacterAnimationManager.ts` |
| 8 تعبيرات وجه + مزامنة فم | رمش تلقائي ويدوي وتغير شكل العيون والحاجبين والفم | `COMPLETED — Verified` | `src/characters/core/CharacterExpressionManager.ts` |
| 9 تفاعلات ثنائية بين الشخصيتين | تفاعلات منسقة بمؤقتات آمنة بين لولو ونونو | `COMPLETED — Verified` | `src/characters/core/CharacterInteractionManager.ts` |
| مختبر الشخصيات (`Character Lab`) | أداة التحقق الهندسي والبصري عبر `?mode=character-lab` | `COMPLETED — Verified` | `src/features/character-lab/CharacterLab.tsx` |
| عرض الأزياء ثلاثية الأبعاد على النموذج | ظهور القبعات/الأوشحة/الحقائب فعلياً على مجسم 3D عند ارتدائها | `PLANNED — Not implemented` | مهيأ في البيانات فقط (`equippedOutfits`) |

---

## ب. الشاشات وتجربة المستخدم (المرحلة 2)
| الميزة | الوصف | الحالة | المرجع في الكود |
|---|---|---|---|
| الشاشات الـ 14 الأساسية | من `SplashScreen` حتى `StarRestoreScreen` | `IN PROGRESS` *(مبنية بالكامل؛ ينتظر إكمال تقرير QA المرحلة 2)* | `src/screens/*` |
| مكدس التنقل وحراس الوصول | منع تخطي المراحل أو العوالم أو دخول لوحة الوالدين دون بوابة | `IN PROGRESS` | `src/navigation/screenRouter.ts` |
| أنشطة اختبار تدفق هيكلية مؤقتة | أسئلة تفاعلية مؤقتة لاختبار التدفق في المرحلة 2 ريثما تُبنى العوالم 3–9 | `IN PROGRESS` *(مؤقتة حتى المراحل 3–9)* | `src/data/phase2Activities.ts` |
| شاشة فحص البنية (`?mode=phase0`) | شاشة تشخيص تقنية للتحقق من التخزين والصوت وWebGL | `COMPLETED — Verified` | `src/screens/Phase0DiagnosticsScreen.tsx` |

---

## ج. الأنظمة الأساسية والتخزين والصوتيات
| الميزة | الوصف | الحالة | المرجع في الكود |
|---|---|---|---|
| التخزين ثنائي الطبقة (`IndexedDB` + `localStorage`) | حفظ ملفات الأطفال، السجلات، اللوحات، والإعدادات محلياً | `COMPLETED — Verified` *(أساسياً)* / `IN PROGRESS` *(اختبار المرحلة 2)* | `src/storage/*` |
| Service Worker + PWA Manifest | تسجيل تلقائي وتخزين الأصول والخطوط للعمل دون إنترنت | `IN PROGRESS` | `public/sw.js`, `public/manifest.webmanifest` |
| مؤثرات صوتية عبر `Web Audio API` | أصوات نقر، فوز، عملات، نجمة، وتشجيع دون ملفات خارجية | `COMPLETED — Verified` | `src/audio/audioManager.ts` |
| نطق عربي وإنجليزي بملفات `.ogg` | تشغيل التسجيلات الصوتية البشرية مع ترجمة نصية ومزامنة شفاه | `PLANNED — Not implemented` | `src/audio/voiceManifest.ts` (`localAssetPath: null`) |
| موسيقى خلفية متصلة (`Music Loop`) | تشغيل موسيقى هادئة عبر إعداد `musicEnabled`/`musicVolume` | `PLANNED — Not implemented` | الإعداد موجود في `ParentSettings` دون مشغل مسارات موسيقية |

---

## د. المناهج التعليمية، المكافآت، ولوحة الوالدين
| الميزة | الوصف | الحالة | المرجع في الكود |
|---|---|---|---|
| العوالم التعليمية السبعة (3–9) | الأنشطة المتخصصة في الحروف، الحساب، الحيوانات، العلوم، الذكاء، الإنجليزية، الفن | `PLANNED — Not implemented` | `src/registry/worldRegistry.ts` (`implemented: false`) |
| نظام XP والعملات والمستويات والأوسمة | 6 أوسمة ومتجر أزياء بعملات افتراضية وشاشة مكافآت | `IN PROGRESS` | `src/data/rewardsCatalog.ts`, `src/screens/RewardsScreen.tsx` |
| محرك التكيف التعليمي | رفع الصعوبة بعد 3 نجاحات بلا تلميحات، وخفضها بعد خطأين | `IN PROGRESS` | `src/state/gameStore.tsx` |
| بوابة الوالدين ولوحة الوالدين | مسألة حسابية / PIN + عرض سجلات `IndexedDB` + ضبط الجودة والصوت والحد اليومي | `IN PROGRESS` | `ParentGateScreen.tsx`, `ParentDashboardScreen.tsx` |
| التوقيت الصارم للحد اليومي أثناء اللعب | إيقاف جلسة اللعب أو تنبيه الطفل عند انتهاء `dailyLimitMinutes` | `PLANNED — Not implemented` | القيمة تُحفظ في الإعدادات ولم يُفعَّل الحظر الزمني الحي بعد |
| تطبيق Android فعلي (`APK` / `AAB`) | حزمة Capacitor Android جاهزة للمحاكي وGoogle Play | `PLANNED — Not implemented` | يوجد `capacitor.config.ts` فقط دون `/android` |
