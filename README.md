# Moodboard: Instagram Sentiment Analyzer

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
An intentionally simple MongoDB-backed web app for understanding the mood of an Instagram caption. It uses a small, visible word list rather than a black-box model, so every result explains which words influenced the score.

Currently, two official plugins are available:

## Run it

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your local or Atlas MongoDB connection string.
3. Start the API with `npm run server`.
4. In a second terminal, start the UI with `npm run dev` and open `http://localhost:5173`.
MongoDB is required. The API will not start until it can connect using `MONGODB_URI`. Each analysis is saved in the `analyses` collection and history is read from MongoDB.
## How the score works

The server finds known positive and negative words in the caption. Positive matches add 1, negative matches subtract 1, and the result is labeled `positive`, `negative`, or `neutral`. The result also returns the exact matched words and a plain-language explanation.
## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
