import { chromium } from 'playwright';
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
