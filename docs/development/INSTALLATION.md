# دليل التثبيت — INSTALLATION

## 1. استنساخ المستودع وتثبيت الحزم
```bash
git clone https://github.com/semi22gmil-maker/Lulu-and-Nunu-s-Adventures-World-of-Knowledge.git
cd Lulu-and-Nunu-s-Adventures-World-of-Knowledge
npm ci
```
*(في حال التطوير المحلي السريع يمكن استخدام `npm install`)*.

## 2. تثبيت متصفح Playwright (عند الحاجة لتشغيل E2E)
```bash
npx playwright install chromium
```
> على Linux/CI قد يتطلب تثبيت تبعيات النظام عبر: `npx playwright install-deps chromium`.
