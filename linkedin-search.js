import dotenv from 'dotenv';
import { chromium } from 'playwright';
import pkg from 'pg';

dotenv.config();
const { Client } = pkg;

export async function scrapeLinkedIn() {
  // 1) connection DB
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  // 2) browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 3) login LinkedIn
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
  await page.fill('input#username', process.env.LINKEDIN_USERNAME);
  await page.fill('input#password', process.env.LINKEDIN_PASSWORD);
  await Promise.all([
    page.click('button[type=submit]'),
    page.waitForNavigation({ waitUntil: 'networkidle' })
  ]);

  // 4) recherche
  await page.goto(process.env.LINKEDIN_SEARCH_URL, { waitUntil: 'networkidle' });

  // 5) extraction
  const posts = await page.$$eval('.occludable-update', nodes =>
    nodes.map(n => ({
      title: n.querySelector('.feed-shared-update-v2__description')?.innerText.trim() || '',
      url: n.querySelector('a.feed-shared-actor__container-link')?.href || '',
      date: n.querySelector('span.feed-shared-actor__sub-description')?.innerText.trim() || ''
    }))
  );

  // 6) insertion
  for (const p of posts) {
    await client.query(
      'INSERT INTO linkedin_posts(title, url, date) VALUES($1,$2,$3)',
      [p.title, p.url, p.date]
    );
  }

  // 7) cleanup
  await browser.close();
  await client.end();
  return posts;
}
