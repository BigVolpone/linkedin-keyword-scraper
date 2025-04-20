import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const scrapeLinkedIn = async (keyword) => {
  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Connexion LinkedIn
  await page.goto('https://www.linkedin.com/login');
  await page.fill('input[name="session_key"]', process.env.LINKEDIN_EMAIL);
  await page.fill('input[name="session_password"]', process.env.LINKEDIN_PASSWORD);
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  // Recherche
  const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=GLOBAL_SEARCH_HEADER`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(4000); // attends un peu pour que les posts chargent

  const posts = await page.evaluate(() => {
    const nodes = document.querySelectorAll('[data-urn]');
    return Array.from(nodes).map(node => ({
      title: node.innerText.slice(0, 100), // version simple
      url: window.location.href,
      date: new Date().toISOString()
    }));
  });

  await browser.close();
  return posts.length > 0 ? posts : [{ message: 'Aucun résultat trouvé.' }];
};

export default scrapeLinkedIn;
