# فهرس التوثيق الشامل — مغامرات لولو ونونو: عالم المعرفة

مرحباً بك في المركز المرجعي لتوثيق مشروع **مغامرات لولو ونونو – عالم المعرفة** (`Lulu and Nunu – World of Knowledge`).  
تم تنظيم هذا الدليل ليكون نقطة البداية المعتمدة لأي مطور بشري أو وكيل ذكاء اصطناعي أو مهندس جودة (QA) لاستئناف العمل دون فقدان السياق أو مخالفة معايير المشروع.

---

## حالة المراحل والتنقل السريع للـ AI والمطورين

- إذا كنت تبدأ جلسة عمل جديدة الآن: اقرأ أولاً [`handover/AI_HANDOVER.md`](./handover/AI_HANDOVER.md) ثم [`handover/QUICK_RESUME.md`](./handover/QUICK_RESUME.md) ثم [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md).
- إذا كنت تبحث عن الخطة المرحلية الكاملة (Phases 0–16): راجع [`roadmap/MASTER_ROADMAP.md`](./roadmap/MASTER_ROADMAP.md) ومجلد [`phases/`](./phases/).
- لا تخلط أبداً بين **الشاشات المنجزة برمجياً** وبين **المراحل المعتمدة كلياً باختبارات مكتملة**؛ راجع معايير الاعتماد في [`quality/ACCEPTANCE_CRITERIA.md`](./quality/ACCEPTANCE_CRITERIA.md).

---

## خريطة أقسام التوثيق (`docs/`)

### 1. ملفات المشروع والرؤية (`docs/project/`)
| الملف | الوصف |
|---|---|
| [`PROJECT_OVERVIEW.md`](./project/PROJECT_OVERVIEW.md) | نظرة شاملة على اللعبة، القصة، الشخصيات، والعوالم السبعة |
| [`PROJECT_VISION.md`](./project/PROJECT_VISION.md) | الرؤية التربوية والتقنية وتجربة الطفل من 4 إلى 10 سنوات |
| [`PROJECT_SCOPE.md`](./project/PROJECT_SCOPE.md) | حدود النطاق المعتمد وما هو خارج النطاق صراحةً |
| [`PROJECT_REQUIREMENTS.md`](./project/PROJECT_REQUIREMENTS.md) | المتطلبات الوظيفية وغير الوظيفية (أداء، أوفلاين، RTL، أمان) |
| [`FEATURES_CATALOG.md`](./project/FEATURES_CATALOG.md) | كتالوج الميزات الكامل مصنفاً بالحالة الفعلية (منفذ / قيد التنفيذ / مخطط) |
| [`USER_PERSONAS.md`](./project/USER_PERSONAS.md) | شخصيات المستخدمين (الطفل المبكر، الطفل المتقدم، ولي الأمر) |
| [`SUCCESS_CRITERIA.md`](./project/SUCCESS_CRITERIA.md) | مؤشرات نجاح المشروع تقنياً وتربوياً وجودياً |

### 2. المعمارية التقنية (`docs/architecture/`)
> **ملاحظة:** يحتفظ المشروع بالملف التاريخي الأولي [`TECHNICAL_ARCHITECTURE.md`](./TECHNICAL_ARCHITECTURE.md) المولّد في المرحلة صفر كمرجع أرشيفي، بينما تمثل الملفات التالية المرجع المعماري التفصيلي المحدّث:

| الملف | الوصف |
|---|---|
| [`SYSTEM_ARCHITECTURE.md`](./architecture/SYSTEM_ARCHITECTURE.md) | المعمارية الطبقية الكاملة وتدفق البيانات والأحداث |
| [`TECHNOLOGY_STACK.md`](./architecture/TECHNOLOGY_STACK.md) | التقنيات والمكتبات الفعلية وإصداراتها والغرض من كل مكتبة |
| [`FOLDER_STRUCTURE.md`](./architecture/FOLDER_STRUCTURE.md) | خريطة المجلدات والملفات الفعلية والمخططة مستقبلاً |
| [`DATA_ARCHITECTURE.md`](./architecture/DATA_ARCHITECTURE.md) | نماذج البيانات، `IndexedDB`، `localStorage`، وخطة النسخ/التطور |
| [`NAVIGATION_ARCHITECTURE.md`](./architecture/NAVIGATION_ARCHITECTURE.md) | نظام الشاشات الـ 14، مكدس التنقل، وحراس الوصول وبوابة الوالدين |
| [`OFFLINE_ARCHITECTURE.md`](./architecture/OFFLINE_ARCHITECTURE.md) | استراتيجية العمل دون إنترنت، `Service Worker`، و`PWA` |
| [`SECURITY_ARCHITECTURE.md`](./architecture/SECURITY_ARCHITECTURE.md) | العزل المحلي للبيانات، حماية خصوصية الطفل، وبوابة الوالدين |
| [`AUDIO_ARCHITECTURE.md`](./architecture/AUDIO_ARCHITECTURE.md) | محرك الصوت (`Web Audio API`) وسجل المقاطع الكلامية ومزامنة الشفاه |
| [`THREE_JS_ARCHITECTURE.md`](./architecture/THREE_JS_ARCHITECTURE.md) | معمارية المشهد ثلاثي الأبعاد، لولو ونونو، وإدارة ذاكرة WebGL |

### 3. خارطة الطريق والمراحل (`docs/roadmap/` و `docs/phases/`)
| الملف / المجلد | الوصف |
|---|---|
| [`MASTER_ROADMAP.md`](./roadmap/MASTER_ROADMAP.md) | خارطة الطريق الكاملة للمراحل 0–16 |
| [`PHASES_OVERVIEW.md`](./roadmap/PHASES_OVERVIEW.md) | ملخص جدولي لجميع المراحل وحالتها الموثقة |
| [`PHASE_DEPENDENCIES.md`](./roadmap/PHASE_DEPENDENCIES.md) | مصفوفة الاعتماديات بين المراحل |
| [`MILESTONES.md`](./roadmap/MILESTONES.md) | المعالم الرئيسية (Milestones) ومعايير الإنجاز |
| [`RELEASE_PLAN.md`](./roadmap/RELEASE_PLAN.md) | خطة الإصدارات للويب والـ PWA وAndroid (`Google Play`) |
| `docs/phases/PHASE_00` .. `PHASE_16` | **17 وثيقة مرحلية تفصيلية** تحتوي كل منها على 20 قسماً إلزامياً |

### 4. الجودة والاختبار (`docs/quality/`)
| الملف | الوصف |
|---|---|
| [`QA_STRATEGY.md`](./quality/QA_STRATEGY.md) | استراتيجية ضمان الجودة عبر الويب والمحاكي والأجهزة الفعلية |
| [`TESTING_STANDARDS.md`](./quality/TESTING_STANDARDS.md) | معايير الاختبارات (TypeScript، Unit، Integration، E2E، Visual) |
| [`AUTOMATED_TESTING.md`](./quality/AUTOMATED_TESTING.md) | دليل حزم Playwright الحالية (`tests/phase1` و`tests/phase2`) وCI |
| [`BUG_TRACKING.md`](./quality/BUG_TRACKING.md) | آلية تسجيل الأخطاء وتصنيف الخطورة (P0–P3) |
| [`ACCEPTANCE_CRITERIA.md`](./quality/ACCEPTANCE_CRITERIA.md) | دورة اعتماد المراحل ذات الـ 17 خطوة وشروط الانتقال |

### 5. الأمان وحماية الطفل (`docs/security/`)
| الملف | الوصف |
|---|---|
| [`PRIVACY_POLICY.md`](./security/PRIVACY_POLICY.md) | مسودة سياسة الخصوصية المحلية الصارمة (Offline-First / Zero PII Telemetry) |
| [`CHILD_SAFETY.md`](./security/CHILD_SAFETY.md) | ضوابط سلامة الطفل الرقمية (لا إعلانات، لا دردشة، لا تتبع موقع) |
| [`DATA_PROTECTION.md`](./security/DATA_PROTECTION.md) | حماية التخزين المحلي وإجراءات إعادة التعيين وحذف الملفات |
| [`SECURITY_CHECKLIST.md`](./security/SECURITY_CHECKLIST.md) | قائمة التحقق الأمني الدورية قبل أي إصدار |

### 6. التطوير والمساهمة (`docs/development/`)
| الملف | الوصف |
|---|---|
| [`DEVELOPMENT_SETUP.md`](./development/DEVELOPMENT_SETUP.md) | متطلبات بيئة التطوير وإعداد الأدوات |
| [`INSTALLATION.md`](./development/INSTALLATION.md) | خطوات التثبيت وتشغيل Playwright |
| [`RUNNING_PROJECT.md`](./development/RUNNING_PROJECT.md) | أوامر التشغيل وأنماط التحقق (`?mode=character-lab`, `?mode=phase0`) |
| [`CODING_STANDARDS.md`](./development/CODING_STANDARDS.md) | معايير TypeScript، React، Tailwind RTL، وThree.js |
| [`GIT_WORKFLOW.md`](./development/GIT_WORKFLOW.md) | استراتيجية الفروع، صيغة الـ Commits، وملاحظة بيئة السحابة |
| [`CONTRIBUTING.md`](./development/CONTRIBUTING.md) | دليل المساهمة ورفع PRs |
| [`TROUBLESHOOTING.md`](./development/TROUBLESHOOTING.md) | حل المشاكل الشائعة (WebGL، SwiftShader، Service Worker، RTL) |

### 7. التسليم واستئناف العمل (`docs/handover/`)
| الملف | الوصف |
|---|---|
| [`AI_HANDOVER.md`](./handover/AI_HANDOVER.md) | الوثيقة المرجعية الشاملة لأي نموذج AI لاستئناف العمل فوراً |
| [`QUICK_RESUME.md`](./handover/QUICK_RESUME.md) | ملخص الاستئناف السريع في أقل من دقيقة |
| [`CURRENT_PROJECT_STATE.md`](./handover/CURRENT_PROJECT_STATE.md) | جرد دقيق لكل ما هو مبني ومختبر وما ينقصه دليل |
| [`NEXT_ACTIONS.md`](./handover/NEXT_ACTIONS.md) | الخطوات الفورية ذات الأولوية القصوى قبل بدء المرحلة الثالثة |
| [`TECHNICAL_DECISIONS.md`](./handover/TECHNICAL_DECISIONS.md) | سجل القرارات المعمارية (ADRs) وأسبابها |
| [`KNOWN_ISSUES.md`](./handover/KNOWN_ISSUES.md) | المشاكل والثغرات المكتشفة فعلياً في الكود أو التقارير |
| [`DEFERRED_FEATURES.md`](./handover/DEFERRED_FEATURES.md) | الميزات المؤجلة قصداً لمراحل لاحقة |
| [`SESSION_LOG.md`](./handover/SESSION_LOG.md) | سجل الجلسات والخط الزمني الموثق |

### 8. القوالب والمخططات (`docs/templates/` و `docs/diagrams/`)
- القوالب: [`PHASE_REPORT_TEMPLATE.md`](./templates/PHASE_REPORT_TEMPLATE.md)، [`QA_REPORT_TEMPLATE.md`](./templates/QA_REPORT_TEMPLATE.md)، [`SESSION_HANDOVER_TEMPLATE.md`](./templates/SESSION_HANDOVER_TEMPLATE.md)، [`DECISION_RECORD_TEMPLATE.md`](./templates/DECISION_RECORD_TEMPLATE.md).
- المخططات: [`SYSTEM_OVERVIEW.md`](./diagrams/SYSTEM_OVERVIEW.md)، [`USER_FLOW.md`](./diagrams/USER_FLOW.md)، [`DATA_FLOW.md`](./diagrams/DATA_FLOW.md)، [`PHASE_DEPENDENCIES.md`](./diagrams/PHASE_DEPENDENCIES.md).
