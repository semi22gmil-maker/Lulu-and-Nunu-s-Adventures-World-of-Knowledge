# معمارية البيانات والتخزين — DATA ARCHITECTURE

يعتمد التطبيق على حفظ البيانات **محلياً بالكامل** على جهاز المستخدم دون أي قاعدة بيانات سحابية أو مصادقة خارجية.

---

## 1. طبقة الإعدادات السريعة (`localStorage`)
يديرها `src/storage/localStorageService.ts` بالبادئة `lulu_nono_v1_`:
- `lulu_nono_v1_settings`: تخزين كائن `ParentSettings` (`soundEnabled`, `musicEnabled`, `voiceEnabled`, `sfxVolume`, `musicVolume`, `voiceVolume`, `qualityTier`, `dailyLimitMinutes`, `parentPinHash`, `reducedMotion`).
- `lulu_nono_v1_active_profile`: معرف ملف الطفل النشط حالياً (`string | null`).
- `lulu_nono_v1_story_seen`: مؤشر إتمام شاشة القصة الترحيبية الأولى (`'1'` | `'0'`).

---

## 2. طبقة قاعدة البيانات المحلية (`IndexedDB`)
يديرها `src/storage/indexedDbService.ts` باسم قاعدة البيانات `lulu_nono_knowledge_db` (الإصدار `DB_VERSION = 1`):

| المخزن (`ObjectStore`) | المفتاح (`keyPath`) | الفهارس (`Indexes`) | الغرض |
|---|---|---|---|
| `profiles` | `id` (`autoIncrement: false`) | — | ملفات الأطفال (`ChildProfile`: الاسم، العمر، المرافق، XP، العملات، المستوى، الأوسمة، الأزياء، وتقدم العوالم الـ 7) |
| `activity_logs` | `id` (`autoIncrement: true`) | `by_profile` (`profileId`), `by_world` (`worldId`) | سجل كل محاولة لعب (`ActivityAttempt`: المهارة، النجاح، التلميحات، المدة، الصعوبة، الطابع الزمني) |
| `drawings` | `id` (`autoIncrement: false`) | `by_profile` (`profileId`) | لوحات الطفل المحفوظة في عالم الفن بصيغة `DataURL` |
| `asset_cache` | `key` (`autoIncrement: false`) | — | مخزن مساعد للبيانات الثابتة دون إنترنت |

---

## 3. نموذج تقدم الطفل والعوالم (`ChildProfile` & `WorldProgress`)
- يتميز كل `ChildProfile` بسجل `worldProgress: Record<WorldId, WorldProgress>`.
- عند إنشاء الملف: يُفتح `WorldId.ArabicLetters` فقط (`unlocked: true`), بينما تبقى العوالم 2–7 مقفلة (`unlocked: false`) حتى إتمام العالم السابق واستعادة نجمته عبر `StarRestoreScreen`.
- يحتوي `WorldProgress` على: `unlocked`, `starRestored`, `completedStageIds`, `currentDifficulty`, `consecutiveSuccesses`, `consecutiveMistakes`, `masteryScore` (0–100).

---

## 4. ملاحظة حول أمان `parentPinHash` والتطوير المستقبلي
- حالياً في `ParentDashboardScreen.tsx` / `gameStore.tsx`، يُخزن `parentPinHash` كقيمة نصية لرمز PIN من 4 أرقام محلياً في `localStorage` لغرض الحماية من عبث الطفل. يُوصى في المرحلة 14 (تشديد الأمان) بتطبيق تجزئة (Hashing) خفيفة عبر `Web Crypto API` بدلاً من حفظ القيمة النصية الخام.
