# معمارية التنقل والشاشات — NAVIGATION ARCHITECTURE

## 1. نظام الشاشات الـ 14 + شاشة التشخيص (`ScreenId`)
معرّف في `src/types/game.ts` ومسجّل في `SCREEN_DIRECTORY` داخل `src/navigation/screenRouter.ts`:

1. `Splash` (`شاشة البداية`)
2. `WelcomeStory` (`الترحيب والقصة`)
3. `CreateProfile` (`إنشاء ملف الطفل`)
4. `Home` (`الشاشة الرئيسية`)
5. `WorldMap` (`خريطة العوالم السبعة`)
6. `WorldDetails` (`تفاصيل العالم`)
7. `StageSelect` (`اختيار المرحلة`)
8. `Gameplay` (`شاشة اللعب`)
9. `Victory` (`النجاح والفوز`)
10. `StarRestore` (`استعادة النجمة`)
11. `Rewards` (`المكافآت والأوسمة`)
12. `Profile` (`الملف الشخصي`)
13. `ParentGate` (`بوابة تحدي الوالدين`)
14. `ParentDashboard` (`لوحة الوالدين والإعدادات`)
- *(شاشة تشخيص تقنية خارج الـ 14: `Phase0Diagnostics` عبر `?mode=phase0`، ومختبر الشخصيات عبر `?mode=character-lab`)*

---

## 2. مكدس التنقل (`navStack`)
يدار داخل `gameStore.tsx` بأربعة إجراءات:
- `NAVIGATE`: يدفع شاشة جديدة على المكدس (أو يحلّ محل شاشة البداية `Splash`) بعد تمريرها عبر `resolveGuardedNavigation`.
- `REPLACE_SCREEN`: يستبدل أعلى المكدس (مفيد بعد إتمام `Victory` أو إنشاء الملف).
- `GO_BACK`: يرجع خطوة للخلف في المكدس (`navStack.slice(0, -1)`).
- `RESET_TO_HOME`: يعيد ضبط المكدس إلى `[{ screen: ScreenId.Home }]`.

---

## 3. حراس الوصول (`Navigation Guards`)
تمر كل عملية تنقل عبر `resolveGuardedNavigation()` التي تفرض القواعد التالية:
1. **حارس بوابة الوالدين (`requiresParentGate`):** إذا طلب المستخدم `ParentDashboard` وانتهت مهلة `parentGateUnlockedUntil` (تُمنح لمدة 10 دقائق بعد اجتياز التحدي في `ParentGate`)، يُحوَّل تلقائياً إلى `ParentGate` مع حفظ `redirectAfterGate`.
2. **حارس وجود ملف طفل (`requiresProfile`):** أي شاشة لعب دون وجود `activeProfile` تُحوَّل إلى `CreateProfile` (إذا شُوهدت القصة) أو `WelcomeStory`.
3. **حارس قفل العوالم:** شاشات `WorldDetails`, `StageSelect`, و`StarRestore` لعالم مقفل تُعيد التوجيه إلى `WorldMap`.
4. **حارس تسلسل المراحل (`isStageUnlockedForProfile`):** المرحلة الأولى (`idx === 0`) في أي عالم مفتوح متاحة، ولا تُفتح المرحلة التالية إلا بعد إكمال المرحلة السابقة (`completedStageIds`), وإلا يُعاد التوجيه إلى `StageSelect`.
