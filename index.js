// index.js
import express from 'express';
import cors from 'cors';
import linkedinSearch from './linkedin-search.js';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get('/', (_req, res) => res.send('OK'));

app.get('/scrape', async (req, res) => {
  try {
    const q = req.query.q || 'railway';
    const posts = await linkedinSearch(q);
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Server listening on port ${PORT}`);
});
