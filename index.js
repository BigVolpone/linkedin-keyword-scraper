import express from 'express';
import dotenv from 'dotenv';
import scrapeLinkedIn from './linkedin-search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const results = await scrapeLinkedIn(); // mots-clés depuis .env
    res.json(results);
  } catch (error) {
    console.error('Erreur scraping LinkedIn :', error);
    res.status(500).json({ error: error.message || 'Erreur scraping LinkedIn' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server lancé sur http://localhost:${PORT}`);
});
