# Ryport Frontend

Marketing site and authenticated dashboard for [Ryport](https://ryport.com.ng) — AI-powered financial operating system for Nigeria.

## Setup

```bash
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to your Ryport Django API.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy to Vercel. Set environment variables from `.env.example`.

## Routes

- `/` — Marketing site
- `/login`, `/register` — Auth
- `/app/dashboard` — Authenticated app
