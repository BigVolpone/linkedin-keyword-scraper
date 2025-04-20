import dotenv from 'dotenv';
import { Client } from 'pg';
import playwright from 'playwright';

dotenv.config();

// Récupère la clef et l’URL Postgres depuis les variables Railway
const keyword = process.env.LINKEDIN_KEYWORD || 'remote work';
const dbUrl   = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('🚨 La variable DATABASE_URL est manquante.');
}

(async () => {
  // 1) Connexion à la base
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // 2) Lancement de Playwright
  const browser = await playwright.chromium.launch({ headless: true });
  const page    = await browser.newPage();
  const url     = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('.search-results__list-item');

  // 3) Récupère les posts
  const posts = await page.$$eval('.search-results__list-item', cards =>
    cards.map(c => ({
      date: c.querySelector('time')?.getAttribute('datetime'),
      text: c.querySelector('.feed-shared-text')?.innerText.trim(),
      link: c.querySelector('a.app-aware-link')?.href,
    }))
  );
  await browser.close();

  // 4) Insertion en base
  for (const p of posts) {
    await client.query(
      `INSERT INTO linkedin_posts(title, url, date)
       VALUES($1, $2, $3)
       ON CONFLICT (url) DO NOTHING`,
      [p.text, p.link, p.date]
    );
  }

  console.log(`✅ ${posts.length} posts insérés en base`);
  await client.end();
})();
