import express from 'express';
import dotenv from 'dotenv';
import scrapeLinkedIn from './linkedin-search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const results = await scrapeLinkedIn('marketing digital'); // ou passe un mot-clé dynamiquement
    res.json(results);
  } catch (error) {
    console.error('Erreur scraping :', error);
    res.status(500).json({ error: 'Erreur scraping LinkedIn' });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
