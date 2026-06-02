# Card Promo Tracker

Card Promo Tracker is a lightweight React app for browsing card promotions by bank and category. It currently supports HNB and Sampath Bank, lets users switch between banks and promotion categories, and shows the current set of offers in a simple card-based interface.

## What the app does

- Fetches promotion categories from HNB and Sampath Bank APIs
- Lets users switch between supported banks
- Sorts categories by the API-provided display order
- Auto-selects the first available category on load
- Fetches promotions for the selected category
- Shows merchant, promotion title, card type, and validity date
- Displays loading states while data is being retrieved

## Current behavior

- HNB promotions can be filtered by all, credit, or debit card types
- Sampath promotions are fetched from Sampath category pages and normalized into the shared promotion shape
- The app requests page `1` from the selected bank promotions endpoint
- Category and promotion data are loaded live from the selected bank API at runtime
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

### HNB

- Categories: `GET /get_all_card_promotion_categories`
- Promotions by category: `GET /get_all_web_card_promos?cat={id}&page=1&cardType={cardType}`
- Promotion detail: `GET /get_web_card_promo?id={id}`

Base URL: `https://venus.hnb.lk/api`

### Sampath Bank

- Categories: `GET /offer-catergories`
- Promotions by category: `GET /card-promotions?category={value}&page_number={page}&size=8`

Base URL: `https://www.sampath.lk/api`

## Notes

- No environment variables are required for the current setup
- Because the app depends on a live external API, local development requires internet access
- The UI is read-only; it does not store user data or modify promotions
