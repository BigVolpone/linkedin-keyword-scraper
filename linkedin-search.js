import { chromium } from 'playwright';

const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;
const HEADLESS = process.env.HEADLESS === 'true';
const KEYWORDS = process.env.LINKEDIN_KEYWORDS?.split(',') || ['marketing digital'];
const SESSION_FILE = 'linkedin-session.json';

const scrapeLinkedIn = async (keyword = 'marketing digital') => {
  let browser;
  let context;

  try {
    // Lancement navigateur
    browser = await chromium.launch({ headless: HEADLESS });

    // Charger session si elle existe
    const fs = await import('fs/promises');
    let sessionExists = false;
    try {
      await fs.access(SESSION_FILE);
      sessionExists = true;
    } catch (e) {
      sessionExists = false;
    }

    context = sessionExists
      ? await browser.newContext({ storageState: SESSION_FILE })
      : await browser.newContext();

    const page = await context.newPage();

    if (!sessionExists) {
      // Aller à la page de login
      await page.goto('https://www.linkedin.com/login');
      await page.fill('input#username', LINKEDIN_EMAIL);
      await page.fill('input#password', LINKEDIN_PASSWORD);
      await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
      ]);
      // Sauvegarder la session
      await context.storageState({ path: SESSION_FILE });
    }

    // Requête de recherche
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Attente et scraping
    await page.waitForTimeout(5000);
    const posts = await page.$$eval('div.feed-shared-update-v2', elements =>
      elements.map(el => {
        const text = el.innerText;
        const linkEl = el.querySelector('a.app-aware-link');
        const url = linkEl ? linkEl.href : null;
        return { title: text.split('\n')[0], url };
      })
    );

    console.log(`✅ ${posts.length} posts récupérés pour le mot-clé : ${keyword}`);
    return posts;
  } catch (err) {
    console.error('❌ Erreur scraping LinkedIn:', err);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

export default scrapeLinkedIn;
