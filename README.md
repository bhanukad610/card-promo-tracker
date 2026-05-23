# Card Promo Tracker

Card Promo Tracker is a lightweight React app for browsing HNB card promotions by category. It loads promotion categories from the HNB API, lets users switch between them, and shows the current set of credit card offers in a simple card-based interface.

## What the app does

- Fetches promotion categories from `https://venus.hnb.lk/api`
- Sorts categories by the API-provided display order
- Auto-selects the first available category on load
- Fetches promotions for the selected category
- Shows merchant, promotion title, card type, and validity date
- Displays loading states while data is being retrieved

## Current behavior

- Promotions are currently fetched for `Credit` cards only
- The app requests page `1` from the promotions endpoint
- Category and promotion data are loaded live from the HNB API at runtime
- If the API request fails, the app shows a user-facing error message

## Tech stack

- React 19
- TypeScript
- Vite
- ESLint

## Project structure

```text
src/
  api/           API request helpers
  components/    UI sections for categories and promotions
  constants/     API base URLs
  hooks/         Data loading and state management
  types/         API response types
  utils/         Small formatting helpers
```

## Getting started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available scripts

- `npm run dev` starts the Vite development server
- `npm run build` runs TypeScript compilation and creates a production build
- `npm run preview` serves the built app locally
- `npm run lint` runs ESLint

## API endpoints used

- Categories: `GET /get_all_card_promotion_categories`
- Promotions by category: `GET /get_all_web_card_promos?cat={id}&page=1&cardType=Credit`

Base URL: `https://venus.hnb.lk/api`

## Notes

- No environment variables are required for the current setup
- Because the app depends on a live external API, local development requires internet access
- The UI is read-only; it does not store user data or modify promotions
