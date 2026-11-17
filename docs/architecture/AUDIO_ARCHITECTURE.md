# معمارية الصوت ومزامنة الشفاه — AUDIO ARCHITECTURE

## 1. فصل المؤثرات الصوتية عن الكلام البشري
يعتمد `src/audio/audioManager.ts` و`src/audio/voiceManifest.ts` على مبدأ معماري مهم لحل مشاكل النطق العربي على متصفحات وWebView أجهزة Android:
1. **المؤثرات الصوتية غير الكلامية (`SFX`):** تُولَّد برمجياً في لحظتها عبر **`Web Audio API`** دون الحاجة لتحميل أي ملفات خارجية، وتشمل:
   - `tap` (نقر ناعم)
   - `jump` (صوت قفزة متصاعد)
   - `clap` (تصفيق إيقاعي)
   - `success` (نغمة فوز مشجعة)
   - `gentle_try` (تنبيه لطيف للخطأ دون صوت محبط)
   - `coin` (رنين عملة ذهبية)
   - `star` (نغمة احتفالية متعددة الطبقات لاستعادة النجمة)
2. **الكلام والنطق (`Voice Clips`):** لا يعتمد على `window.speechSynthesis` المتقلب في دعم اللغة العربية دون إنترنت، بل يمر عبر **`VOICE_CLIP_MANIFEST`** لدعم ملفات `.ogg` مدمجة محلياً.

---

## 2. آلية مزامنة الشفاه (`Lip-Sync Pipeline`)
- يتيح `audioManager.subscribeLipSync(listener)` ربط نطق الشخصية (`lulu` أو `nono`) مع فم النموذج ثلاثي الأبعاد عبر `CharacterCanvas.tsx`.
- عندما يبدأ تشغيل مقطع صوتي عبر `playVoiceClip(clipId)`:
  - يتم استدعاء مستمعي `LipSyncListener` بمقدار فتحة الفم (`amplitude` من `0` إلى `1`) والمدة، وعرض النص المصاحب كـ Subtitle واضح في الواجهة.
  - عند وجود `localAssetPath` (المرحلة 13)، يُشغَّل ملف الصوت الفعلي عبر `HTMLAudioElement` / `AudioContext` مع فك موجة الصوت (`AnalyserNode`) لتزامن واقعي مع الشفاه.

---

## 3. الحالة الحالية مقابل المرحلة 13
- **المنفذ حالياً:** توليد جميع المؤثرات الـ 7 عبر `Web Audio API`، إدارة مستويات الصوت وكتم الصوت (`soundEnabled`, `voiceEnabled`, `musicEnabled`, `sfxVolume`, `voiceVolume`, `musicVolume`)، وسجل `VOICE_CLIP_MANIFEST` بـ 7 مقاطع مبدئية (`localAssetPath: null`) ومزامنة حركة الفم التوقيتية.
- **المخطط في المرحلة 13:** تسجيل وإدراج ملفات `.ogg` بشرية باللغة العربية والإنجليزية داخل `public/audio/voices/`، وإضافة مشغل الموسيقى الخلفية المربوط بـ `musicEnabled` و`musicVolume`.
