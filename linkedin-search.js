// linkedin-search.js
import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer';
import createCsvWriter from 'csv-writer';

(async () => {
  // 1. Lecture du mot‑clé (ou du premier mot‑clé si vous en passez plusieurs séparés par des virgules)
  const keywordEnv = process.env.LINKEDIN_KEYWORD || process.env.LINKEDIN_KEYWORDS || 'remote work';
  const keyword = keywordEnv.split(',')[0].trim();

  // 2. Lancement de Puppeteer et navigation sur LinkedIn
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  const url     = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.search-results__list-item');

  // 3. Extraction des posts
  const posts = await page.$$eval(
    '.search-results__list-item',
    cards => cards.map(c => ({
      date: c.querySelector('time')?.getAttribute('datetime') || '',
      text: c.querySelector('.feed-shared-text')?.innerText.trim() || '',
      link: c.querySelector('a.app-aware-link')?.href || '',
    }))
  );

  await browser.close();

  // 4. Écriture du CSV dans /mnt/data (persisté par Railway)
  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: '/mnt/data/linkedin_posts.csv',
    header: [
      { id: 'keyword', title: 'Keyword' },
      { id: 'date',    title: 'Date'    },
      { id: 'text',    title: 'Text'    },
      { id: 'link',    title: 'Link'    },
    ],
  });

  // On ajoute le mot‑clé à chaque enregistrement
  const records = posts.map(post => ({ keyword, ...post }));
  await csvWriter.writeRecords(records);

  console.log(`✅ CSV généré : ${records.length} lignes dans /mnt/data/linkedin_posts.csv`);
})();
