import express from 'express';
import dotenv from 'dotenv';
import scrapeLinkedIn from './linkedin-search.js';
import { chromium } from 'playwright'; // 👈 Ajoute ceci !

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const path = await chromium.executablePath(); // 🧪 Log chemin binaire Playwright
    console.log('🧪 Chromium Path:', path);        // 🔍 Tu verras ça dans Railway

    const results = await scrapeLinkedIn('marketing digital');
    res.json(results);
  } catch (error) {
    console.error('Erreur scraping LinkedIn :', error);
    res.status(500).json({ error: error.message || 'Erreur scraping LinkedIn' });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
