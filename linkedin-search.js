import { chromium } from 'playwright';

export default async function scrapeLinkedIn(keyword) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.linkedin.com/login');
  await page.fill('input[name="session_key"]', process.env.LINKEDIN_USERNAME);
  await page.fill('input[name="session_password"]', process.env.LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');

  await page.goto(`https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`);
  await page.waitForTimeout(3000); // attendre le chargement

  const posts = await page.$$eval('div.feed-shared-update-v2', nodes =>
    nodes.slice(0, 5).map(node => ({
      title: node.innerText.slice(0, 100),
      url: window.location.href,
      date: new Date().toISOString()
    }))
  );

  await browser.close();
  return posts;
}
