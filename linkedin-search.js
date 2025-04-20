import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const scrapeLinkedIn = async () => {
  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Connexion
  await page.goto('https://www.linkedin.com/login');
  await page.fill('input[name="session_key"]', process.env.LINKEDIN_EMAIL);
  await page.fill('input[name="session_password"]', process.env.LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const keywords = process.env.LINKEDIN_KEYWORDS.split(',');
  const results = [];

  for (const keyword of keywords) {
    const encoded = encodeURIComponent(keyword.trim());
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encoded}`;
    await page.goto(searchUrl);
    await page.waitForTimeout(3000);

    const posts = await page.$$eval('div.update-components-text', nodes =>
      nodes.map(node => ({
        title: node.innerText,
        url: window.location.href,
        date: new Date().toISOString()
      }))
    );

    results.push(...posts);
  }

  await browser.close();

  console.log(`🔍 Scraping terminé : ${results.length} posts`);
  return results;
};

export default scrapeLinkedIn;
