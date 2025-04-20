import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeLinkedIn } from './linkedin-search.js';

dotenv.config();

const app = express();
app.use(cors());

app.get('/', (_req, res) => {
  res.send('Service LinkedIn Scraper OK');
});

app.get('/scrape', async (_req, res) => {
  try {
    const posts = await scrapeLinkedIn();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
