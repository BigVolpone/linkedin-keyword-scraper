// linkedin-search.js
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

(async () => {
  const keyword = process.env.LINKEDIN_KEYWORD || 'remote work';
  const webhook = process.env.N8N_WEBHOOK_URL;
  if (!webhook) throw new Error('N8N_WEBHOOK_URL manquant');

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  const url     = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.search-results__list-item');

  const posts = await page.$$eval('.search-results__list-item', cards =>
    cards.map(c => ({
      date: c.querySelector('time')?.getAttribute('datetime'),
      text: c.querySelector('.feed-shared-text')?.innerText.trim(),
      link: c.querySelector('a.app-aware-link')?.href,
    }))
  );
  await browser.close();

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword, posts }),
  });
  console.log(`Envoyé ${posts.length} posts à n8n`);
})();
