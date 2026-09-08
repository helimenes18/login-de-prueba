const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  page.on('console', m => console.log('BROWSER_LOG', m.type(), m.text()));
  page.on('pageerror', e => console.log('PAGE_ERROR', e.message));
  page.on('requestfailed', r => console.log('REQUEST_FAILED', r.url(), r.failure()?.errorText));
  await page.goto('file:///C:/Users/helim/OneDrive/Desktop/login-de-prueba/reportes.html');
  await page.waitForTimeout(1500);
  await page.locator('#btnGenerarReporte').click();
  await page.waitForTimeout(2500);
  console.log('BTN_TEXT', await page.locator('#btnGenerarReporte').textContent());
  await browser.close();
})();
