import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const scrapeLinkedIn = async (keyword = 'marketing digital') => {
  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
    args: ['--no-sandbox'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login LinkedIn
    await page.goto('https://www.linkedin.com/login');
    await page.fill('input[name="session_key"]', process.env.LINKEDIN_EMAIL);
    await page.fill('input[name="session_password"]', process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // attendre la redirection

    // Recherche
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`;
    await page.goto(searchUrl);
    await page.waitForTimeout(5000); // temps de chargement

    const posts = await page.$$eval('.update-components-text', nodes =>
      nodes.map(node => ({
        title: node.innerText.trim(),
        url: window.location.href,
        date: new Date().toISOString(),
      }))
    );

    console.log(`✅ ${posts.length} posts récupérés pour le mot-clé : ${keyword}`);
    await browser.close();
    return posts;
  } catch (err) {
    console.error('❌ Erreur lors du scraping :', err.message);
    await browser.close();
    throw new Error('Scraping LinkedIn échoué : ' + err.message);
  }
};

export default scrapeLinkedIn;
