# تشغيل المشروع وأنماط التحقق — RUNNING PROJECT

## الأوامر الأساسية (`package.json`)
| الأمر | الوصف |
|---|---|
| `npm run dev` | تشغيل خادم التطوير Vite على المنفذ `3000` (`0.0.0.0:3000`) |
| `npm run lint` | فحص TypeScript الكامل عبر `tsc --noEmit` |
| `npm run build` | بناء حزمة الإنتاج داخل `dist/` |
| `npm run preview` | معاينة بناء الإنتاج `dist/` محلياً |
| `npm run test:e2e` | تشغيل اختبارات Playwright في `tests/` ضد بناء الإنتاج على المنفذ `4173` |
| `npm run test:e2e -- tests/phase1` | تشغيل اختبارات المرحلة 1 (`Character Lab`) فقط |
| `npm run test:e2e -- tests/phase2` | تشغيل اختبارات المرحلة 2 (`14 Screens & Game Flow`) فقط |

## أوضاع التشغيل الخاصة عبر URL Query Parameters
- **`/`** : التطبيق الرئيسي الكامل (الشاشات الـ 14 من `SplashScreen`).
- **`/?mode=character-lab`** : مختبر الشخصيات ثلاثية الأبعاد (`CharacterLab.tsx`) لفحص الحركات والتعبيرات والتفاعلات وWebGL.
- **`/?mode=phase0`** : شاشة التشخيص التقني للمرحلة صفر (`Phase0DiagnosticsScreen.tsx`) لفحص التخزين وWebGL والصوت.
