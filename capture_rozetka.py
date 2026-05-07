import asyncio
from patchright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1400, "height": 900}, locale="uk-UA")
        page = await ctx.new_page()

        await page.goto("https://rozetka.com.ua/", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)

        await page.screenshot(path="ref_rozetka_pr_home.png")
        await page.screenshot(path="ref_rozetka_pr_full.png", full_page=True)

        # scroll to see product cards
        await page.evaluate("window.scrollBy(0, 900)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="ref_rozetka_pr_mid.png")

        # catalog page
        await page.goto("https://rozetka.com.ua/notebooks/c80004/", wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        await page.screenshot(path="ref_rozetka_pr_catalog.png")
        await page.screenshot(path="ref_rozetka_pr_catalog_full.png", full_page=True)

        await browser.close()
        print("Done! Screenshots saved.")

asyncio.run(main())
