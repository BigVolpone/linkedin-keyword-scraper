import express from 'express';
import dotenv from 'dotenv';
import scrapeLinkedIn from './linkedin-search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'marketing digital';
    const results = await scrapeLinkedIn(keyword);

    if (!results || results.length === 0) {
      return res.status(200).json({ message: 'Aucun résultat trouvé.' });
    }

    res.json(results);
  } catch (error) {
    console.error('Erreur scraping LinkedIn :', error);
    res.status(500).json({ error: error.message || 'Erreur scraping LinkedIn' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
