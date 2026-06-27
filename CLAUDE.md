# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (requires internet — app calls live external APIs)
npm run build      # TypeScript check + production build
npm run lint       # ESLint
npm run format     # Prettier
npm run preview    # Serve the production build locally
```

There are no automated tests in this project.

## Architecture

Single-page React 19 + TypeScript + Vite app. No router — `App.tsx` renders `HomePage` directly.

### Data flow

```
HomePage
  ├── usePromoData (all fetching/state)
  │     └── promos.service.ts (raw fetch calls + normalization)
  └── useSavedPromos (localStorage persistence)
```

**`usePromoData`** manages two parallel fetch lifecycles — categories and promotions — each using `AbortController` to cancel in-flight requests on dependency change. It exposes a dual-mode system: _category mode_ (browsing by category) and _search mode_ (text/date/card-type filters). Search mode activates only when `canSearchPromos` is true and active filters are non-empty. Switching banks, categories, or clearing filters always resets to category mode.

**`promos.service.ts`** is the only file that knows about bank-specific API shapes. Each bank's raw response types are defined locally and normalized into the shared `Promo` / `PromoDetail` types before returning. Promo IDs are composite strings (`bankId:rawId`, e.g. `"hnb:42"`) to avoid collisions across banks.

### Adding a bank

1. Add a `Bank` entry to `src/constants/banks.ts` with `supportsSearch: true/false`.
2. Add a `BankId` union member to `src/types/promo.ts`.
3. Handle the new `bankId` in `fetchCategories`, `fetchPromosByCategory`, `fetchPromoDetail`, and `searchPromos` in `promos.service.ts`.

### Key design details

- **HNB** fetches promo detail on demand (`fetchPromoDetail` → `GET /get_web_card_promo?id=`). Sampath embeds full detail in the listing response, so `fetchPromoDetail` throws for `bankId === 'sampath'`.
- **Search** is HNB-only (`supportsSearch: false` on Sampath). `SearchFilters` disables its inputs when `searchDisabled` is true.
- **Saved promos** persist to `localStorage` under the key `saved-promos-v1` as serialized `Promo[]`. `useSavedPromos` validates shape on read and migrates legacy numeric IDs to composite string IDs.
- **Expiry detection** (`src/utils/promoStatus.ts`) parses several date formats (ISO, `DD Mon YYYY`, `DD/MM/YYYY`) from the `to` field and is used to flag expired saved promos.
- **CSS Modules** are used per-component (`.module.css` files co-located with each component). Global styles live in `src/styles/globals.css`.
- Dark mode preference is persisted to `localStorage` under the key `theme`.
