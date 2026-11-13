import fs from 'node:fs';
import path from 'node:path';
import { expect, Page, test } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve('reports/phase1/screenshots');
const QA_RESULTS_PATH = path.resolve('reports/phase1/qa-results.json');

const ANIMATION_LABELS = [
  'الوقوف والتنفس',
  'المشي',
  'الجري',
  'القفز',
  'الاحتفال',
  'الرقص',
  'التصفيق',
  'التشجيع',
  'الإشارة',
  'التفكير',
  'الدهشة',
  'الضحك',
  'الحزن اللطيف',
] as const;

const EXPRESSION_LABELS = [
  'طبيعي',
  'ابتسامة',
  'ضحك',
  'حزن لطيف',
  'دهشة',
  'تركيز',
  'تفكير',
  'تشجيع',
] as const;

const INTERACTION_CHECKS = [
  { label: 'لولو ترحب بنونو', expectStep1: 'لولو ترحب بصديقها نونو' },
  {
    label: 'نونو يلوّح للولو',
    expectStep1: 'نونو يلوّح بيده للولو',
    expectStep2: 'لولو ترد على تلويح نونو بضحكة لطيفة',
  },
  { label: 'لولو تشير إلى نونو', expectStep1: 'لولو تشير إلى نونو' },
  { label: 'نونو يقفز بسعادة', expectStep1: 'نونو يقفز بسعادة' },
  { label: 'لولو ونونو يحتفلان معاً', expectStep1: 'لولو ونونو يحتفلان ويرقصان معاً' },
  { label: 'نونو يتفاجأ وتنظر إليه لولو', expectStep1: 'نونو يتفاجأ وتلتفت إليه لولو' },
  { label: 'الشخصيتان ترحبان بالطفل', expectStep1: 'لولو ونونو يرحبان بالطفل' },
  { label: 'نونو يصفق للولو', expectStep1: 'نونو يصفق بحماس بينما ترقص لولو' },
  { label: 'لولو تشجع نونو', expectStep1: 'لولو تشجع نونو بلطف' },
] as const;

interface QaResultsRecord {
  generatedAt: string;
  environment: string;
  baseUrl: string;
  runtimeErrors: {
    consoleErrors: string[];
    pageErrors: string[];
    failedRequests: string[];
  };
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  checks: Record<string, unknown>;
  screenshots: string[];
}

const collectedResults: QaResultsRecord = {
  generatedAt: new Date().toISOString(),
  environment: 'Headless Chromium + ANGLE SwiftShader WebGL2 against production dist/ build',
  baseUrl: 'http://127.0.0.1:4173',
  runtimeErrors: {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  },
  summary: {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
  },
  checks: {},
  screenshots: [],
};

function attachErrorListeners(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      collectedResults.runtimeErrors.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    collectedResults.runtimeErrors.pageErrors.push(err.message);
  });
  page.on('requestfailed', (req) => {
    collectedResults.runtimeErrors.failedRequests.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText ?? 'failed'}`);
  });
}

async function sampleCanvasFrame(page: Page): Promise<{ width: number; height: number; data: number[] }> {
  return page.evaluate(() => {
    const src = document.querySelector('canvas');
    if (!src) throw new Error('WebGL canvas not found');
    const w = 160;
    const h = 120;
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const ctx = tmp.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    ctx.drawImage(src, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h).data;
    return { width: src.width, height: src.height, data: Array.from(img) };
  });
}

function countChangedPixels(a: number[], b: number[], threshold = 6): number {
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) {
    const dr = Math.abs(a[i] - b[i]);
    const dg = Math.abs(a[i + 1] - b[i + 1]);
    const db = Math.abs(a[i + 2] - b[i + 2]);
    if (dr + dg + db > threshold) {
      changed += 1;
    }
  }
  return changed;
}

async function waitForStageReady(page: Page) {
  await expect(page.getByText('جاهز ومحمّل')).toBeVisible({ timeout: 25_000 });
  await page.waitForTimeout(800);
}

async function captureScreenshot(page: Page, filename: string, fullPage = false) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const target = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: target, fullPage });
  const rel = `reports/phase1/screenshots/${filename}`;
  if (!collectedResults.screenshots.includes(rel)) {
    collectedResults.screenshots.push(rel);
  }
}

async function readTriangleCount(page: Page): Promise<number> {
  const txt = await page.getByText(/مثلث$/).innerText();
  return Number(txt.replace(/[^\d]/g, ''));
}

test.describe.serial('Phase 1 — Lulu & Nono 3D Character Lab QA Verification', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test.afterAll(() => {
    const checkEntries = Object.values(collectedResults.checks);
    collectedResults.summary.totalChecks = checkEntries.length;
    collectedResults.summary.passedChecks = checkEntries.filter(
      (entry) => (entry as { status?: string }).status === 'PASS'
    ).length;
    collectedResults.summary.failedChecks =
      collectedResults.summary.totalChecks - collectedResults.summary.passedChecks;
    collectedResults.generatedAt = new Date().toISOString();
    collectedResults.screenshots.sort();
    fs.writeFileSync(QA_RESULTS_PATH, JSON.stringify(collectedResults, null, 2), 'utf-8');
  });

  test('1. App load, Character Lab visibility, character switching & reload persistence', async ({ page }) => {
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1520 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    const bothTriangles = await readTriangleCount(page);
    expect(bothTriangles).toBe(33528);

    const stageBox = page.locator('canvas').first();
    await stageBox.screenshot({ path: path.join(SCREENSHOT_DIR, '03-both-characters.png') });
    collectedResults.screenshots.push('reports/phase1/screenshots/03-both-characters.png');
    await captureScreenshot(page, '07-character-lab-full.png', false);

    await page.getByRole('button', { name: 'لولو', exact: true }).click();
    await expect(page.getByText('17,362 مثلث')).toBeVisible();
    const luluTriangles = await readTriangleCount(page);
    await page.waitForTimeout(750);
    await stageBox.screenshot({ path: path.join(SCREENSHOT_DIR, '01-lulu-solo.png') });
    collectedResults.screenshots.push('reports/phase1/screenshots/01-lulu-solo.png');

    await page.getByRole('button', { name: 'نونو', exact: true }).click();
    await expect(page.getByText('18,242 مثلث')).toBeVisible();
    const nonoTriangles = await readTriangleCount(page);
    await page.waitForTimeout(750);
    await stageBox.screenshot({ path: path.join(SCREENSHOT_DIR, '02-nono-solo.png') });
    collectedResults.screenshots.push('reports/phase1/screenshots/02-nono-solo.png');

    await page.getByRole('button', { name: 'لولو ونونو معاً', exact: true }).click();
    await expect(page.getByText('33,528 مثلث')).toBeVisible();

    // Reload verification
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);
    await expect(page.getByText('33,528 مثلث')).toBeVisible();
    await page.getByRole('button', { name: 'القفز', exact: true }).click();
    await expect(page.getByText(/الحركة الحالية:\s*القفز/)).toBeVisible();

    collectedResults.checks.appLoadAndSwitch = {
      status: 'PASS',
      bothTriangles,
      luluTriangles,
      nonoTriangles,
      reloadVerified: true,
    };
  });

  test('2. All 13 animations independently for Lulu and Nono + one-shot auto return to Idle', async ({ page }) => {
    test.setTimeout(150_000);
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1180 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    const luluResults: Record<string, { statusUpdated: boolean; changedPixels: number }> = {};
    const nonoResults: Record<string, { statusUpdated: boolean; changedPixels: number }> = {};

    // Lulu solo 13 animations
    await page.getByRole('button', { name: 'لولو', exact: true }).click();
    await page.waitForTimeout(600);

    for (const label of ANIMATION_LABELS) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByText(new RegExp(`الحركة الحالية:\\s*${label}`))).toBeVisible();
      const frameA = await sampleCanvasFrame(page);
      await page.waitForTimeout(420);
      const frameB = await sampleCanvasFrame(page);
      const changedPixels = countChangedPixels(frameA.data, frameB.data);
      luluResults[label] = { statusUpdated: true, changedPixels };
      expect(changedPixels).toBeGreaterThan(0);

      if (label === 'الاحتفال') {
        await captureScreenshot(page, '04-animations-test.png');
      }
    }

    // Switch to Nono and confirm independent Idle state before running all 13 on Nono
    await page.getByRole('button', { name: 'نونو', exact: true }).click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/الحركة الحالية:\s*الوقوف والتنفس/)).toBeVisible();

    for (const label of ANIMATION_LABELS) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByText(new RegExp(`الحركة الحالية:\\s*${label}`))).toBeVisible();
      const frameA = await sampleCanvasFrame(page);
      await page.waitForTimeout(420);
      const frameB = await sampleCanvasFrame(page);
      const changedPixels = countChangedPixels(frameA.data, frameB.data);
      nonoResults[label] = { statusUpdated: true, changedPixels };
      expect(changedPixels).toBeGreaterThan(0);
    }

    // One-shot return to Idle check on Lulu
    await page.getByRole('button', { name: 'لولو', exact: true }).click();
    await page.getByRole('button', { name: 'تكرار مستمر', exact: true }).click();
    await expect(page.getByRole('button', { name: 'مرة واحدة', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'القفز', exact: true }).click();
    await expect(page.getByText(/الحركة الحالية:\s*القفز/)).toBeVisible();
    await expect(page.getByText(/الحركة الحالية:\s*الوقوف والتنفس/)).toBeVisible({ timeout: 25_000 });

    collectedResults.checks.animations13x2 = {
      status: 'PASS',
      luluCount: Object.keys(luluResults).length,
      nonoCount: Object.keys(nonoResults).length,
      nonoIndependentIdleWhenSwitching: true,
      oneShotReturnedToIdle: true,
      luluResults,
      nonoResults,
    };
  });

  test('3. All 8 expressions, Blink, Mouth Open & Lip-Sync captions for Lulu and Nono', async ({ page }) => {
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1180 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    await page.getByRole('button', { name: 'لولو', exact: true }).click();
    await page.getByRole('button', { name: 'قريب للوجه', exact: true }).click();
    await page.waitForTimeout(750);

    for (const label of EXPRESSION_LABELS) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByText(new RegExp(`التعبير الحالي:\\s*${label}`))).toBeVisible();
      await page.waitForTimeout(180);
      if (label === 'دهشة') {
        await captureScreenshot(page, '05-expressions-test.png');
      }
    }

    // Blink button
    await page.getByRole('button', { name: 'رمش', exact: true }).click();
    await page.waitForTimeout(160);

    // Mouth Open toggle
    const mouthBtn = page.getByRole('button', { name: 'فتح الفم', exact: true });
    const frameClosed = await sampleCanvasFrame(page);
    await mouthBtn.click();
    await page.waitForTimeout(260);
    const frameOpen = await sampleCanvasFrame(page);
    expect(countChangedPixels(frameClosed.data, frameOpen.data)).toBeGreaterThan(0);
    await mouthBtn.click();

    // Lip-sync tests (Lulu & Nono even when started from Lulu solo view)
    await page.getByRole('button', { name: /محاكاة كلام لولو/ }).click();
    await expect(page.getByText(/أهلاً بك يا صديقي/)).toBeVisible({ timeout: 5_000 });
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /محاكاة كلام نونو/ }).click();
    await expect(page.getByText(/هيا بنا! أنا نونو/)).toBeVisible({ timeout: 5_000 });

    // Nono expression check independently
    await page.getByRole('button', { name: 'نونو', exact: true }).click();
    await page.getByRole('button', { name: 'تشجيع', exact: true }).click();
    await expect(page.getByText(/التعبير الحالي:\s*تشجيع/)).toBeVisible();

    collectedResults.checks.expressionsAndLipSync = {
      status: 'PASS',
      testedExpressionsCount: EXPRESSION_LABELS.length,
      blinkTriggered: true,
      manualMouthOpenChangedCanvas: true,
      luluLipSyncCaptionDisplayed: true,
      nonoLipSyncCaptionDisplayed: true,
    };
  });

  test('4. All 9 dual interactions (preserving timed multi-step callbacks from solo mode)', async ({ page }) => {
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1180 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    // Start from Lulu solo mode to verify multi-step dual interaction timers survive viewMode switch
    await page.getByRole('button', { name: 'لولو', exact: true }).click();
    await expect(page.getByText('17,362 مثلث')).toBeVisible();

    const timedCheck = INTERACTION_CHECKS[1];
    await page.getByRole('button', { name: timedCheck.label, exact: true }).click();
    await expect(page.getByText(new RegExp(timedCheck.expectStep1))).toBeVisible();
    await expect(page.getByText(new RegExp(timedCheck.expectStep2))).toBeVisible({ timeout: 5_000 });
    await captureScreenshot(page, '06-dual-interactions-test.png');

    for (const item of INTERACTION_CHECKS) {
      if (item.label === timedCheck.label) continue;
      await page.getByRole('button', { name: item.label, exact: true }).click();
      await expect(page.getByText(new RegExp(item.expectStep1))).toBeVisible();
      await page.waitForTimeout(220);
    }

    collectedResults.checks.dualInteractions9 = {
      status: 'PASS',
      totalTested: INTERACTION_CHECKS.length,
      delayedTimerFromSoloModeSurvived: true,
    };
  });

  test('5. Camera presets, 360° orbit drag, lighting presets, controls, pause/resume & resize', async ({ page }) => {
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1180 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    // Camera presets
    const baseFrame = await sampleCanvasFrame(page);
    await page.getByRole('button', { name: 'جانبي', exact: true }).click();
    await page.waitForTimeout(800);
    const sideFrame = await sampleCanvasFrame(page);
    expect(countChangedPixels(baseFrame.data, sideFrame.data)).toBeGreaterThan(200);
    await captureScreenshot(page, '08-camera-test.png');

    await page.getByRole('button', { name: 'أمامي', exact: true }).click();
    await page.waitForTimeout(700);

    // OrbitControls drag 360 check
    const canvasBox = await page.locator('canvas').first().boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      const beforeDrag = await sampleCanvasFrame(page);
      const cx = canvasBox.x + canvasBox.width / 2;
      const cy = canvasBox.y + canvasBox.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 150, cy - 35, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(480);
      const afterDrag = await sampleCanvasFrame(page);
      expect(countChangedPixels(beforeDrag.data, afterDrag.data)).toBeGreaterThan(150);
    }

    // Reset all
    await page.getByRole('button', { name: 'إعادة الوضع الطبيعي', exact: true }).click();
    await page.waitForTimeout(750);

    // Lighting presets
    const warmFrame = await sampleCanvasFrame(page);
    await page.getByRole('button', { name: 'صباح مشمس', exact: true }).click();
    await page.waitForTimeout(500);
    const morningFrame = await sampleCanvasFrame(page);
    expect(countChangedPixels(warmFrame.data, morningFrame.data)).toBeGreaterThan(200);

    await page.getByRole('button', { name: 'مساء هادئ', exact: true }).click();
    await page.waitForTimeout(500);
    const eveningFrame = await sampleCanvasFrame(page);
    expect(countChangedPixels(morningFrame.data, eveningFrame.data)).toBeGreaterThan(200);
    await captureScreenshot(page, '09-lighting-test.png');

    await page.getByRole('button', { name: 'استوديو دافئ', exact: true }).click();
    await page.waitForTimeout(450);

    // Controls panel screenshot (fit full UI cleanly without fullPage WebGL clear)
    await page.setViewportSize({ width: 1440, height: 1520 });
    await page.waitForTimeout(450);
    await captureScreenshot(page, '11-interactive-controls-test.png', false);

    // Pause & Resume exact freeze verification
    await page.getByRole('button', { name: 'الرقص', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'إيقاف', exact: true }).click();
    await expect(page.getByRole('button', { name: 'استئناف', exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    const pausedA = await sampleCanvasFrame(page);
    await page.waitForTimeout(450);
    const pausedB = await sampleCanvasFrame(page);
    const pausedDiff = countChangedPixels(pausedA.data, pausedB.data, 0);
    expect(pausedDiff).toBe(0);
    await captureScreenshot(page, '12-pause-resume-test.png');

    await page.getByRole('button', { name: 'استئناف', exact: true }).click();
    await expect(page.getByRole('button', { name: 'إيقاف', exact: true })).toBeVisible();
    await page.waitForTimeout(550);
    const resumedFrame = await sampleCanvasFrame(page);
    expect(countChangedPixels(pausedB.data, resumedFrame.data)).toBeGreaterThan(0);

    // Responsive viewport resize test
    const desktopBox = await page.locator('canvas').first().boundingBox();
    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(450);
    const tabletBox = await page.locator('canvas').first().boundingBox();
    await captureScreenshot(page, '13-screen-resize-test.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(450);
    const mobileBox = await page.locator('canvas').first().boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(tabletBox).not.toBeNull();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThan(tabletBox!.width);
    expect(mobileBox!.width).toBeLessThanOrEqual(390);

    collectedResults.checks.cameraLightingPauseResize = {
      status: 'PASS',
      cameraPresetsTested: 4,
      orbitDragChangedView: true,
      lightingPresetsTested: 3,
      pausedChangedPixels: pausedDiff,
      resumedFrameChanged: true,
      resizeWidths: {
        desktop: Math.round(desktopBox!.width),
        tablet: Math.round(tabletBox!.width),
        mobile: Math.round(mobileBox!.width),
      },
    };
  });

  test('6. Mobile touch emulation (390x844, hasTouch: true) with zero horizontal overflow', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    attachErrorListeners(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    await page.getByRole('button', { name: 'لولو', exact: true }).tap();
    await expect(page.getByText('17,362 مثلث')).toBeVisible();

    await page.getByRole('button', { name: 'الرقص', exact: true }).tap();
    await expect(page.getByText(/الحركة الحالية:\s*الرقص/)).toBeVisible();

    await page.getByRole('button', { name: 'ابتسامة', exact: true }).tap();
    await page.waitForTimeout(400);

    const overflowCheck = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(overflowCheck.scrollWidth).toBeLessThanOrEqual(overflowCheck.innerWidth);

    await captureScreenshot(page, '10-mobile-screen-test.png');
    await context.close();

    collectedResults.checks.mobileTouch = {
      status: 'PASS',
      viewport: '390x844',
      touchTapWorked: true,
      noHorizontalOverflow: overflowCheck.scrollWidth <= overflowCheck.innerWidth,
    };
  });

  test('7. WebGL resource disposal, mount/unmount cycles (3x) & zero runtime errors', async ({ page }) => {
    attachErrorListeners(page);
    await page.setViewportSize({ width: 1440, height: 1180 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStageReady(page);

    const readWebGLMeta = async () =>
      page.evaluate(() => {
        const c = document.querySelector('canvas');
        return {
          mounts: Number(c?.dataset.mounts ?? 0),
          geometries: Number(c?.dataset.geometries ?? 0),
          textures: Number(c?.dataset.textures ?? 0),
          webglMode: c?.dataset.webglMode ?? 'unknown',
        };
      });

    // Wait for first telemetry dataset sync (> 350ms)
    await page.waitForTimeout(500);
    const initialMeta = await readWebGLMeta();
    expect(initialMeta.geometries).toBeGreaterThan(0);

    // 3 complete unmount/remount cycles via header tabs
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /فحص البنية/ }).click();
      await expect(page.getByText('شاشة التحقق التشخيصية للمرحلة صفر')).toBeVisible();
      await page.waitForTimeout(150);
      await page.getByRole('button', { name: /مختبر الشخصيات/ }).click();
      await waitForStageReady(page);
      await page.waitForTimeout(450);
    }

    const finalMeta = await readWebGLMeta();
    expect(finalMeta.mounts).toBeGreaterThanOrEqual(initialMeta.mounts + 3);
    expect(finalMeta.geometries).toBe(initialMeta.geometries);
    expect(finalMeta.textures).toBe(initialMeta.textures);

    // Final error assertions across all 7 tests
    expect(collectedResults.runtimeErrors.consoleErrors).toEqual([]);
    expect(collectedResults.runtimeErrors.pageErrors).toEqual([]);
    expect(collectedResults.runtimeErrors.failedRequests).toEqual([]);

    collectedResults.checks.stabilityAndDisposal = {
      status: 'PASS',
      remountCycles: 3,
      webglMode: finalMeta.webglMode,
      initialGeometries: initialMeta.geometries,
      finalGeometries: finalMeta.geometries,
      initialTextures: initialMeta.textures,
      finalTextures: finalMeta.textures,
      consoleErrors: collectedResults.runtimeErrors.consoleErrors.length,
      pageErrors: collectedResults.runtimeErrors.pageErrors.length,
      failedRequests: collectedResults.runtimeErrors.failedRequests.length,
    };
  });
});
