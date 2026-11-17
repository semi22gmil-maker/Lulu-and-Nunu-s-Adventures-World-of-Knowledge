# سير عمل Git والفروع — GIT WORKFLOW

## 1. استراتيجية الفروع والدمج
- **`main`:** الفرع المستقر الذي يعكس آخر مرحلة معتمدة أو قيد المراجعة الرسمية فقط.
- **فروع العمل المرحلية:** يُنشأ فرع لكل مرحلة أو إصلاح من نمط:
  - `phase/02-core-screens`
  - `phase/03-world-arabic`
  - `fix/ki-001-canvas-render`
  - `docs/project-handover-structure`

## 2. صيغة رسائل الالتزام (`Conventional Commits`)
```text
<type>(<scope>): <short description>
```
أمثلة معتمدة:
- `docs(handover): add master project documentation, roadmap (0-16), and AI handover`
- `test(phase2): complete full e2e verification and add PHASE2_QA_REPORT`
- `feat(phase3): implement Arabic Letters World stages ar-1 to ar-6`

## 3. تنبيه مهم حول بيئة السحابة (AI Studio Container)
في بيئة AI Studio السحابية الحالية قد لا يتوفر مجلد `.git` محلياً (`fatal: not a git repository`). لذلك عند الانتهاء من أي جلسة سحابية، يجب تصدير/سحب التعديلات إلى النسخة المحلية المرتبطة بالمستودع الرسمي على GitHub ومراجعتها بـ `git status && git diff` ثم دفعها بأمر `git push origin <branch>`.
