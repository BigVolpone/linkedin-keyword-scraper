import express from 'express';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: 'Merci de fournir un mot-clé avec ?keyword=...' });
  }

  const command = `node linkedin-search.js "${keyword}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur : ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`Stderr : ${stderr}`);
    }

    console.log(`Résultat : ${stdout}`);
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (e) {
      res.send(stdout); // Fallback si pas de JSON
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${port}`);
});
