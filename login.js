import { chromium } from 'playwright';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const browser = await chromium.launch({ headless: false }); // pour voir le navigateur
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login');

  await page.fill('input[name="session_key"]', process.env.LINKEDIN_EMAIL);
  await page.fill('input[name="session_password"]', process.env.LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');

  // On attend la page d’accueil (ou un élément de l’accueil)
  await page.waitForSelector('input[placeholder="Recherche"]');

  const storage = await context.storageState();
  fs.writeFileSync('auth/storage.json', JSON.stringify(storage));

  console.log('✅ Login réussi et cookies sauvegardés dans auth/storage.json');

  await browser.close();
})();
