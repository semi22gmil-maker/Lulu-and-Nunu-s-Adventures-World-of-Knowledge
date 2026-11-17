# قالب تقرير ضمان الجودة — QA REPORT TEMPLATE

**المشروع:** مغامرات لولو ونونو – عالم المعرفة  
**المرحلة:** `Phase XX`  
**تاريخ التحقق:** `YYYY-MM-DD`  
**الحكم النهائي:** `APPROVED` / `CONDITIONALLY APPROVED` / `REJECTED` / `INCOMPLETE EVIDENCE`

## 1. بيئة الاختبار الفعلية
- نظام التشغيل والمتصفح: ...
- بناء الاختبار (`npm run build` ← `vite preview` أو Dev): ...
- الأجهزة الحقيقية: `TESTED` / `NOT TESTED`

## 2. جدول النتائج القياسي (`qa-results.json`)
| # | الفحص | الحالة | الدليل الفعلي |
|---|---|---|---|
| 1 | `npm run lint` | `PASS/FAIL` | ... |
| 2 | `npm run build` | `PASS/FAIL` | ... |
| 3 | تدفق E2E الأساسي | `PASS/FAIL` | ... |
| 4 | الجوال RTL واللمس | `PASS/FAIL` | ... |
| 5 | Offline / Service Worker | `PASS/FAIL` | ... |

## 3. فحص الذاكرة والأخطاء (`Runtime & Memory`)
- `consoleErrors`: `[]`
- `pageErrors`: `[]`
- `failedRequests`: `[]`
- `WebGL Leaks`: ...

## 4. فهرس لقطات الشاشة الفعلية (`reports/phaseXX/screenshots/`)
1. `01-...png` — ...

## 5. القيود وشروط الانتقال للمرحلة التالية
- ...
