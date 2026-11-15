import fs from 'node:fs';
import path from 'node:path';
import { expect, Page, test } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve('reports/phase2/screenshots');
const QA_RESULTS_PATH = path.resolve('reports/phase2/qa-results.json');

interface Phase2QaResults {
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

const results: Phase2QaResults = {
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
      results.runtimeErrors.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    results.runtimeErrors.pageErrors.push(err.message);
  });
  page.on('requestfailed', (req) => {
    results.runtimeErrors.failedRequests.push(
      `${req.method()} ${req.url()} -> ${req.failure()?.errorText ?? 'failed'}`
    );
  });
}

async function capture(page: Page, filename: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const target = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: target, fullPage: false });
  const rel = `reports/phase2/screenshots/${filename}`;
  if (!results.screenshots.includes(rel)) {
    results.screenshots.push(rel);
  }
}

async function waitFor3DFrameIfPresent(page: Page, waitMs = 650) {
  const canvasCount = await page.locator('canvas').count();
  if (canvasCount > 0) {
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(waitMs);
  }
}

async function sampleFirstCanvasNonBlank(page: Page): Promise<number> {
  return page.evaluate(() => {
    const src = document.querySelector('canvas');
    if (!src) return 0;
    const w = 120;
    const h = 90;
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const ctx = tmp.getContext('2d');
    if (!ctx) return 0;
    ctx.drawImage(src, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let nonWhitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
        nonWhitePixels += 1;
      }
    }
    return nonWhitePixels;
  });
}

async function completeCurrentGameplayStage(page: Page, testWrongFirst = false) {
  await expect(page.getByTestId('screen-gameplay')).toBeVisible();

  if (testWrongFirst) {
    await page.getByTestId('gameplay-option-s1-skip-wrong').click();
    await expect(page.getByText('المحاولات المتبقية: 2')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('محاولة لطيفة');
  }

  await page.getByTestId('gameplay-option-s1-ready').click();
  await expect(page.getByText('الخطوة 2 من 3')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('gameplay-option-s2-explore').click();
  await expect(page.getByText('الخطوة 3 من 3')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('gameplay-option-s3-complete').click();
  await expect(page.getByTestId('screen-victory')).toBeVisible({ timeout: 10_000 });
}

test.describe.serial('Phase 2 — 14 Core Game Screens, Persistence & Guards Verification', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test.afterAll(() => {
    const entries = Object.values(results.checks);
    results.summary.totalChecks = entries.length;
    results.summary.passedChecks = entries.filter(
      (item) => (item as { status?: string }).status === 'PASS'
    ).length;
    results.summary.failedChecks =
      results.summary.totalChecks - results.summary.passedChecks;
    results.generatedAt = new Date().toISOString();
    results.screenshots.sort();
    fs.writeFileSync(QA_RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8');
  });

  test('1. Complete First-Run, Persistence, ParentGate Enforcement, Rewards, Profile, Gameplay & World 1 Star Restore', async ({
    browser,
  }) => {
    test.setTimeout(360_000);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
    });
    const page = await context.newPage();
    attachErrorListeners(page);

    // 1. Splash screen (01)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-splash')).toBeVisible();
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');
    await waitFor3DFrameIfPresent(page, 400);
    const splashNonBlank = await sampleFirstCanvasNonBlank(page);
    expect(splashNonBlank).toBeGreaterThan(100);
    await capture(page, '01-splash-screen.png');

    // Transition automatically or via CTA to WelcomeStory (02)
    await expect(page.getByTestId('screen-welcome-story')).toBeVisible({ timeout: 8_000 });
    await waitFor3DFrameIfPresent(page, 600);
    await capture(page, '02-welcome-story.png');

    await page.getByRole('button', { name: 'التالي' }).click();
    await expect(page.getByText('مهمة لولو ونونو')).toBeVisible();
    await page.getByRole('button', { name: 'التالي' }).click();
    await expect(page.getByText('أنت بطل هذه المغامرة')).toBeVisible();
    await page.getByRole('button', { name: 'ابدأ المغامرة' }).click();

    // 3. CreateProfile validation + creation (03)
    await expect(page.getByTestId('screen-create-profile')).toBeVisible();
    await waitFor3DFrameIfPresent(page, 600);

    // Invalid short name should block creation
    await page.locator('#child-nickname-input').fill('ن');
    await page.getByRole('button', { name: /حفظ الملف/ }).click();
    await expect(page.getByRole('alert')).toContainText('حرفين على الأقل');

    // Fill valid Arabic child profile
    await page.locator('#child-nickname-input').fill('نور');
    await page.getByRole('button', { name: /نونو الدب/ }).click();
    await page.getByRole('button', { name: '7', exact: true }).click();
    await page.waitForTimeout(800);
    await capture(page, '03-create-profile.png');

    await page.getByRole('button', { name: /حفظ الملف/ }).click();

    // 4. Home Dashboard (04) & real stats check
    await expect(page.getByTestId('screen-home')).toBeVisible();
    await expect(page.getByText('أهلاً يا نور!')).toBeVisible();
    await expect(page.getByTestId('stat-stars')).toHaveText('0 / 7');
    await expect(page.getByTestId('stat-xp')).toHaveText('0');
    await expect(page.getByTestId('stat-coins')).toHaveText('0');
    await waitFor3DFrameIfPresent(page, 650);
    const homeNonBlank = await sampleFirstCanvasNonBlank(page);
    expect(homeNonBlank).toBeGreaterThan(100);
    await capture(page, '04-home-dashboard.png');

    // Verify IndexedDB reload persistence right after profile creation
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-home')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('أهلاً يا نور!')).toBeVisible();

    results.checks.firstRunAndPersistence = {
      status: 'PASS',
      rtlDirection: htmlDir,
      splashCanvasNonBlankPixels: splashNonBlank,
      homeCanvasNonBlankPixels: homeNonBlank,
      profileValidationBlockedShortName: true,
      profileRestoredAfterReload: 'نور',
    };

    // 5. ParentGate block & enforcement (08 & 09)
    await page.getByRole('button', { name: /للوالدين/ }).click();
    await expect(page.getByTestId('screen-parent-gate')).toBeVisible();
    await capture(page, '08-parent-gate.png');

    // Wrong answer keeps user on ParentGate
    await page.locator('#parent-gate-input').fill('1');
    await page.getByTestId('parent-gate-submit').click();
    await expect(page.getByTestId('parent-gate-error')).toBeVisible();
    await expect(page.getByTestId('screen-parent-gate')).toBeVisible();

    // Solve real generated challenge "(a × b) + c = ?"
    const questionText = await page.getByTestId('parent-gate-question').innerText();
    const match = questionText.match(/\((\d+)\s*×\s*(\d+)\)\s*\+\s*(\d+)/);
    expect(match).not.toBeNull();
    const a = Number(match![1]);
    const b = Number(match![2]);
    const c = Number(match![3]);
    const answer = a * b + c;

    await page.locator('#parent-gate-input').fill(String(answer));
    await page.getByTestId('parent-gate-submit').click();

    await expect(page.getByTestId('screen-parent-dashboard')).toBeVisible();
    await expect(page.getByText('نور (7 سنوات)')).toBeVisible();

    // Toggle reducedMotion setting and verify persisted <html> class
    const reducedCheckbox = page.getByRole('checkbox', { name: /Reduced Motion/ });
    await reducedCheckbox.check();
    await expect(page.locator('html')).toHaveClass(/reduced-motion/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, '09-parent-dashboard.png');
    await reducedCheckbox.uncheck();

    // Reload from ParentDashboard -> guard must re-lock ParentDashboard and redirect to ParentGate
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-parent-gate')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /رجوع/ }).click();
    await expect(page.getByTestId('screen-home')).toBeVisible();

    results.checks.parentGateAndDashboard = {
      status: 'PASS',
      wrongAnswerBlocked: true,
      solvedChallenge: `${a}x${b}+${c}=${answer}`,
      reducedMotionClassSynced: true,
      relockedAfterReload: true,
    };

    // 6. Profile & Rewards Screens (07 & 06)
    await page.getByRole('button', { name: 'ملفي', exact: true }).click();
    await expect(page.getByTestId('screen-profile')).toBeVisible();
    await waitFor3DFrameIfPresent(page, 600);
    await capture(page, '07-profile.png');

    await page.getByRole('button', { name: 'المكافآت', exact: true }).click();
    await expect(page.getByTestId('screen-rewards')).toBeVisible();
    await expect(page.getByText('مكافآت نور')).toBeVisible();
    await capture(page, '06-rewards.png');

    // 7. WorldMap (05) lock enforcement -> WorldDetails (10) -> StageSelect (11) lock enforcement
    await page.getByRole('button', { name: 'العوالم', exact: true }).click();
    await expect(page.getByTestId('screen-world-map')).toBeVisible();

    // Click locked World 2 -> should stay on WorldMap and show lock notice
    await page.getByTestId('world-card-numbers-math').click();
    await expect(page.getByTestId('world-locked-notice')).toContainText('مقفل حالياً');
    await expect(page.getByTestId('screen-world-map')).toBeVisible();
    await capture(page, '05-world-map.png');

    // Enter unlocked World 1
    await page.getByTestId('world-card-arabic-letters').click();
    await expect(page.getByTestId('screen-world-details')).toBeVisible();
    await waitFor3DFrameIfPresent(page, 600);
    await capture(page, '10-world-details.png');

    await page.getByRole('button', { name: 'بدء المغامرة' }).click();
    await expect(page.getByTestId('screen-stage-select')).toBeVisible();

    // Click locked Stage 2 -> should show stage-locked-notice and remain on StageSelect
    await page.getByTestId('stage-card-ar-2').click();
    await expect(page.getByTestId('stage-locked-notice')).toContainText('مقفلة حالياً');
    await capture(page, '11-stage-select.png');

    results.checks.locksAndGating = {
      status: 'PASS',
      lockedWorldBlocked: true,
      lockedStageBlocked: true,
    };

    // 8. Gameplay (12) + Victory (13) on Stage 1 (with wrong-attempt feedback test)
    await page.getByTestId('stage-card-ar-1').click();
    await expect(page.getByTestId('screen-gameplay')).toBeVisible();
    await waitFor3DFrameIfPresent(page, 600);
    await capture(page, '12-gameplay.png');

    await completeCurrentGameplayStage(page, true);
    await waitFor3DFrameIfPresent(page, 600);
    await expect(page.getByText('أحسنت يا نور!')).toBeVisible();
    await capture(page, '13-victory.png');

    // Continue back to StageSelect and complete remaining 5 stages (ar-2 .. ar-6) to unlock StarRestore!
    await page.getByRole('button', { name: 'متابعة المغامرة' }).click();
    await expect(page.getByTestId('screen-stage-select')).toBeVisible();

    for (const stageId of ['ar-2', 'ar-3', 'ar-4', 'ar-5', 'ar-6']) {
      await page.getByTestId(`stage-card-${stageId}`).click();
      await completeCurrentGameplayStage(page, false);
      if (stageId !== 'ar-6') {
        await page.getByRole('button', { name: 'متابعة المغامرة' }).click();
        await expect(page.getByTestId('screen-stage-select')).toBeVisible();
      }
    }

    // 9. StarRestore (14) after ar-6 -> unlocks World 2 & persists after reload
    await page.getByRole('button', { name: /استعادة نجمة البيان/ }).click();
    await expect(page.getByTestId('screen-star-restore')).toBeVisible();
    await expect(page.getByText('تمت استعادة نجمة البيان!')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('عالم الأرقام والحساب!')).toBeVisible({ timeout: 10_000 });
    await waitFor3DFrameIfPresent(page, 650);
    await capture(page, '14-star-restore.png');

    await page.getByRole('button', { name: 'الانتقال لخريطة العوالم' }).click();
    await expect(page.getByTestId('screen-world-map')).toBeVisible();
    await expect(page.getByText('النجوم المستعادة: 1 من 7')).toBeVisible();
    // World 2 is now unlocked! Clicking it opens WorldDetails
    await page.getByTestId('world-card-numbers-math').click();
    await expect(page.getByTestId('screen-world-details')).toBeVisible();

    // Reload persistence after Star Restore
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-world-details')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'الرئيسية', exact: true }).click();
    await expect(page.getByTestId('stat-stars')).toHaveText('1 / 7');

    // Verify zero console/page/request errors across entire desktop journey
    expect(results.runtimeErrors.consoleErrors).toEqual([]);
    expect(results.runtimeErrors.pageErrors).toEqual([]);
    expect(results.runtimeErrors.failedRequests).toEqual([]);

    results.checks.gameplayVictoryStarRestore = {
      status: 'PASS',
      stagesCompleted: ['ar-1', 'ar-2', 'ar-3', 'ar-4', 'ar-5', 'ar-6'],
      starRestored: 'نجمة البيان',
      world2Unlocked: true,
      persistedStarCountAfterReload: '1 / 7',
      consoleErrors: results.runtimeErrors.consoleErrors.length,
      pageErrors: results.runtimeErrors.pageErrors.length,
      failedRequests: results.runtimeErrors.failedRequests.length,
    };

    await context.close();
  });

  test('2. Mobile Touch Navigation (390x844, hasTouch: true) & Zero Horizontal Overflow', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-splash')).toBeVisible();
    await expect(page.getByTestId('screen-welcome-story')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: 'تخطي القصة' }).tap();
    await expect(page.getByTestId('screen-create-profile')).toBeVisible();

    await page.locator('#child-nickname-input').fill('سلمى');
    await page.getByRole('button', { name: /حفظ الملف/ }).tap();
    await expect(page.getByTestId('screen-home')).toBeVisible();
    await waitFor3DFrameIfPresent(page, 500);

    const homeOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(homeOverflow.scrollWidth).toBeLessThanOrEqual(homeOverflow.innerWidth);

    // Navigate via mobile dashboard cards
    await page.getByRole('button', { name: /خريطة العوالم/ }).tap();
    await expect(page.getByTestId('screen-world-map')).toBeVisible();
    const mapOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(mapOverflow.scrollWidth).toBeLessThanOrEqual(mapOverflow.innerWidth);

    await context.close();

    results.checks.mobileResponsiveAndTouch = {
      status: 'PASS',
      viewport: '390x844',
      homeOverflow: `${homeOverflow.scrollWidth}/${homeOverflow.innerWidth}`,
      mapOverflow: `${mapOverflow.scrollWidth}/${mapOverflow.innerWidth}`,
      touchNavigationWorked: true,
    };
  });

  test('3. Offline Service Worker Reload & Local State Resilience', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 860 },
    });
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-welcome-story')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: 'تخطي القصة' }).click();
    await page.locator('#child-nickname-input').fill('كريم');
    await page.getByRole('button', { name: /حفظ الملف/ }).click();
    await expect(page.getByTestId('screen-home')).toBeVisible();

    // Wait until Service Worker registration completes and claims control
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    });
    await page.waitForTimeout(800);

    // Reload once online so SW is active controller for the window, then test offline reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-home')).toBeVisible({ timeout: 10_000 });

    const swControlled = await page.evaluate(() => Boolean(navigator.serviceWorker?.controller));
    expect(swControlled).toBe(true);

    // Switch browser context completely offline & reload
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('screen-home')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('أهلاً يا كريم!')).toBeVisible();

    await context.close();

    results.checks.offlineServiceWorker = {
      status: 'PASS',
      swControlled,
      offlineReloadSucceeded: true,
      offlineProfileIntact: 'كريم',
    };
  });
});
