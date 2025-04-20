import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL = process.env.LINKEDIN_EMAIL;
const PASSWORD = process.env.LINKEDIN_PASSWORD;
const HEADLESS = process.env.HEADLESS === 'true';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default async function scrapeLinkedIn(keyword = 'marketing digital') {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 🔐 Connexion à LinkedIn
    await page.goto('https://www.linkedin.com/login', { timeout: 60000 });
    await page.fill('input[name="session_key"]', EMAIL);
    await page.fill('input[name="session_password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('🔓 Connecté à LinkedIn');

    // 🔎 Rechercher des publications avec le mot-clé
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`;
    await page.goto(searchUrl, { timeout: 60000 });
    await page.waitForTimeout(3000);

    // 🔄 Scroll pour charger les posts
    for (let i = 0; i < 2; i++) {
      await page.mouse.wheel(0, 1000);
      await delay(1500);
    }

    // 🧠 Extraire les données
    const posts = await page.$$eval('div.update-components-text', (nodes) =>
      nodes.map((el) => ({
        title: el.innerText.trim(),
      }))
    );

    if (!posts.length) {
      console.log(`⚠️ Aucun post récupéré pour le mot-clé : ${keyword}`);
      return [{ message: 'Aucun résultat trouvé.' }];
    }

    console.log(`✅ ${posts.length} posts récupérés pour le mot-clé : ${keyword}`);
    return posts;
  } catch (error) {
    console.error('❌ Erreur durant le scraping :', error);
    throw error;
  } finally {
    await browser.close();
  }
}
