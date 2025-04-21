import { chromium } from 'playwright';
<<<<<<< HEAD
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Pour pouvoir utiliser __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier où seront stockés les cookies/session LinkedIn
const USER_DATA_DIR = path.join(__dirname, 'auth', 'linkedin-session');

export default async function scrapeLinkedIn(keyword = 'marketing digital') {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: process.env.HEADLESS !== 'false',
  });

  const page = await browser.newPage();
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });

  try {
    // Vérifie si la session est encore active
    if (await page.$('input[name="session_key"]')) {
      throw new Error("Non connecté à LinkedIn. Lance 'login.js' en local.");
    }

    // Recherche
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=GLOBAL_SEARCH_HEADER`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000); // ⏳ Laisse les résultats se charger

    const posts = await page.$$eval('.update-components-text', nodes =>
      nodes.map(el => ({
        title: el.innerText.trim(),
      }))
    );

    console.log(`✅ ${posts.length} posts récupérés pour le mot-clé : ${keyword}`);
    return posts;

  } catch (err) {
    console.error('Erreur scraping LinkedIn :', err.message);
    return [];
  } finally {
    await browser.close();
  }
}
=======
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const keyword = process.argv[2] || 'marketing digital';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: 'auth/storage.json', // ✅ ici on utilise ta session
  });

  const page = await context.newPage();

  console.log(`🔍 Recherche du mot-clé : ${keyword}`);

  await page.goto(`https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`);

  // On attend les résultats
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
>>>>>>> 9c57860 (Sauvegarde avant pull)
