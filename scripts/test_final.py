"""Final test: splash, mobile viewport, all features."""
import asyncio
from playwright.async_api import async_playwright
import os

HTML_PATH = '/home/z/my-project/sommelier-app/www/index.html'
SHOTS_DIR = '/home/z/my-project/sommelier-app/scripts/_shots'
os.makedirs(SHOTS_DIR, exist_ok=True)

async def main():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport with safe-area simulation
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},  # iPhone 14 Pro
            device_scale_factor=3,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page = await context.new_page()
        page.on('console', lambda msg: errors.append(f'{msg.type}: {msg.text}') if msg.type in ('error', 'warning') else None)
        page.on('pageerror', lambda exc: errors.append(f'PAGEERROR: {exc}'))

        await page.goto(f'file://{HTML_PATH}', wait_until='networkidle')

        # Check splash is visible initially
        splash_visible = await page.locator('#splash').is_visible()
        print(f'  ✓ splash visible on load: {splash_visible}')

        # Wait for splash to fade
        await page.wait_for_timeout(1500)
        splash_gone = await page.locator('#splash').is_visible()
        print(f'  ✓ splash faded after 1.5s: {not splash_gone}')

        await page.screenshot(path=f'{SHOTS_DIR}/01-tree.png')
        print('  ✓ tree view loaded')

        # Test all views
        views = ['tree', 'quiz', 'blind', 'browse', 'notes-search', 'pairing', 'compare', 'glossary', 'notes']
        for v in views:
            await page.locator(f'nav.tabs button[data-view="{v}"]').click()
            await page.wait_for_timeout(400)
            # Verify view is visible
            visible = await page.locator(f'#view-{v}').is_visible()
            assert visible, f'view {v} not visible'
        print(f'  ✓ all {len(views)} views work')

        # Take final screenshots of key views
        await page.locator('nav.tabs button[data-view="tree"]').click()
        await page.wait_for_timeout(300)
        # Expand first receptor
        await page.locator('#tree-container .receptor-head').first.click()
        await page.wait_for_timeout(300)
        await page.screenshot(path=f'{SHOTS_DIR}/02-tree-expanded.png')

        # Blind tasting
        await page.locator('nav.tabs button[data-view="blind"]').click()
        await page.wait_for_timeout(300)
        await page.screenshot(path=f'{SHOTS_DIR}/03-blind-setup.png')

        # Start blind round (All mode, Classic)
        await page.locator('button', has_text='Начать дегустацию').click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=f'{SHOTS_DIR}/04-blind-step1.png')

        # Quiz
        await page.locator('nav.tabs button[data-view="quiz"]').click()
        await page.wait_for_timeout(300)
        await page.screenshot(path=f'{SHOTS_DIR}/05-quiz.png')

        # Notes search (tag cloud)
        await page.locator('nav.tabs button[data-view="notes-search"]').click()
        await page.wait_for_timeout(400)
        await page.screenshot(path=f'{SHOTS_DIR}/06-notes-search.png')

        # Compare
        await page.locator('nav.tabs button[data-view="compare"]').click()
        await page.wait_for_timeout(400)
        await page.screenshot(path=f'{SHOTS_DIR}/07-compare.png')

        # Open a drink modal
        await page.locator('nav.tabs button[data-view="browse"]').click()
        await page.wait_for_timeout(300)
        await page.locator('#browse-container .drink').first.click()
        await page.wait_for_timeout(500)
        await page.screenshot(path=f'{SHOTS_DIR}/08-drink-modal.png')

        await browser.close()

    print()
    print('=== Console errors/warnings ===')
    if errors:
        for e in errors[:10]:
            print(' ', e)
    else:
        print('  none')

asyncio.run(main())
