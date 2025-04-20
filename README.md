🔍 LinkedIn Keyword Scraper

Scrape automatiquement les publications publiques de LinkedIn contenant des mots-clés spécifiques.  
Ce projet a été pensé pour alimenter un workflow n8n et générer des idées de posts classés par thématique.

---

⚙️ Fonctionnalités

- Se connecte automatiquement à LinkedIn (via Playwright).
- Recherche des publications par mot-clé.
- Extrait le texte des posts publics visibles sans compte premium.
- Retourne les résultats au format JSON, prêt à être envoyé vers Notion, Airtable ou Postgres dans n8n.
- Compatible avec les plateformes Railway & n8n Cloud.

---

🧱 Stack utilisée

- [Node.js](https://nodejs.org/)
- [Playwright](https://playwright.dev/)
- [Express](https://expressjs.com/)
- [Railway](https://railway.app/)
- [n8n](https://n8n.io/)

---

 🔧 Variables d’environnement

Ajoute un fichier `.env` (ou configure tes variables dans Railway) :

```env
LINKEDIN_EMAIL=ton.email@exemple.com
LINKEDIN_PASSWORD=tonMotDePasseUltraSecret
LINKEDIN_KEYWORDS=marketing digital, scale up, no code, IA
HEADLESS=true
