// Скрипт делает 6 новых скриншотов для README v1.1.1
// Использование: node screenshots.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 dimensions
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const htmlPath = 'file://' + path.resolve(__dirname, '..', 'www', 'index.html');
  console.log('Loading:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  // Ждём пока splash исчезнет
  await page.waitForTimeout(1500);

  const shotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots', 'new');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  // Helper: tap a tab by data-view
  async function tapTab(view) {
    // Call switchView directly — most reliable, bypasses any click/timing issues
    await page.evaluate((v) => {
      if (typeof switchView === 'function') switchView(v);
      else {
        // Fallback: find and click the button
        const btn = document.querySelector(`nav.tabs button[data-view="${v}"]`);
        if (btn) btn.click();
      }
    }, view);
    await page.waitForTimeout(1200); // wait for view render + canvas animation
  }

  // Helper: hide scrollbar for cleaner screenshots
  await page.addStyleTag({ content: '::-webkit-scrollbar { display: none; } body { scrollbar-width: none; }' });

  // === 1. BLIND setup screen (Дегустация — стартовая) ===
  console.log('1. Blind setup...');
  await tapTab('blind');
  await page.screenshot({ path: path.join(shotsDir, '01-blind-setup.png') });

  // === 2. Build Profile setup (Построй) ===
  console.log('2. Build Profile setup...');
  await tapTab('build-profile');
  // Reset to setup screen
  await page.evaluate(() => {
    if (typeof state !== 'undefined') state.bp_game = null;
    if (typeof renderBuildProfile === 'function') renderBuildProfile();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(shotsDir, '02-build-profile-setup.png') });

  // === 3. Tree (Дерево с tab-indicator) ===
  console.log('3. Tree...');
  await tapTab('tree');
  await page.screenshot({ path: path.join(shotsDir, '03-tree.png') });

  // === 4. Browse (База — list items) ===
  console.log('4. Browse...');
  await tapTab('browse');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, '04-browse.png') });

  // === 5. Compare (Сравнить) ===
  console.log('5. Compare...');
  await tapTab('compare');
  await page.waitForTimeout(800); // ждём отрисовки радаров
  await page.screenshot({ path: path.join(shotsDir, '05-compare.png') });

  // === 6. Pairing (К еде) ===
  console.log('6. Pairing...');
  await tapTab('pairing');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, '06-pairing.png') });

  // === 7. BONUS: Build Profile reveal (dual radar) ===
  console.log('7. Build Profile reveal...');
  await tapTab('build-profile');
  await page.waitForTimeout(500);
  // Start game (resets to play phase)
  await page.evaluate(() => {
    if (typeof startBpGame === 'function') startBpGame();
  });
  await page.waitForTimeout(800);
  // Set some slider values to make radar interesting, then check
  await page.evaluate(() => {
    if (state.bp_profile) {
      state.bp_profile.s.acid = 4;
      state.bp_profile.s.tannin = 5;
      state.bp_profile.s.body = 4;
      state.bp_profile.a.fruit = 5;
      state.bp_profile.a.wood_smoke = 3;
    }
    if (typeof checkBpProfile === 'function') checkBpProfile();
  });
  await page.waitForTimeout(2000); // ждём анимации радара и render
  await page.screenshot({ path: path.join(shotsDir, '07-build-profile-reveal.png') });

  // === 8. BONUS: Drink card modal ===
  console.log('8. Drink card modal...');
  await tapTab('browse');
  await page.waitForTimeout(500);
  // Click first drink via evaluate
  await page.evaluate(() => {
    const d = document.querySelector('.list-item');
    if (d) d.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(shotsDir, '08-drink-card.png') });

  await browser.close();
  console.log('Done! Screenshots saved to docs/screenshots/new/');
})();
