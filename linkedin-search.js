import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scrapeLinkedIn from './linkedin-search.js';

dotenv.config();

const app = express();
app.use(cors());

app.get('/', (_, res) => res.send('OK'));

app.get('/scrape', async (_, res) => {
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
  console.log(`Listening on port ${PORT}`);
});
