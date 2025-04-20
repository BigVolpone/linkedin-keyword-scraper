import { chromium } from 'playwright';

export default async function scrapeLinkedIn(keyword = 'marketing digital') {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
  await page.goto(searchUrl, { waitUntil: 'networkidle' });

  await page.waitForTimeout(5000); // Attente pour s'assurer que le contenu est chargé

  const results = await page.evaluate(() => {
    const posts = [];
    document.querySelectorAll('[data-urn^="urn:li:activity:"]').forEach(el => {
      const text = el.innerText;
      const link = el.querySelector('a')?.href;
      if (text && link) {
        posts.push({ title: text.trim(), url: link });
      }
    });
    return posts;
  });

  await browser.close();
  return results;
}
