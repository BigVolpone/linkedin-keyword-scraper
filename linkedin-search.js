import { chromium } from 'playwright';
import fs from 'fs';

const keyword = process.argv[2] || 'marketing digital';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: 'auth/storage.json', // ✅ ici on utilise ta session
  });

  const page = await context.newPage();

  console.log(`🔍 Recherche du mot-clé : ${keyword}`);

  await page.goto(`https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`);
  await page.waitForSelector('div.feed-shared-update-v2');

  const posts = await page.evaluate(() => {
    const elements = document.querySelectorAll('div.feed-shared-update-v2');
    const results = [];

    elements.forEach(el => {
      const textElement = el.querySelector('.update-components-text');
      const text = textElement?.innerText || '';
      if (text.trim().length > 0) {
        results.push({ text });
      }
    });

    return results;
  });

  console.log(`✅ ${posts.length} posts récupérés :`);
  console.log(posts);

  await browser.close();
})();