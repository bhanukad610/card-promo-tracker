# React Ecosystem — Interview Notes (from card-promo-tracker)

A quick note: this project uses **Hooks**, **Context API**, and **component-driven architecture** directly, but it still does **not** use Redux Toolkit or Redux-Saga. For those two I've explained them simply and shown what the *equivalent* code would look like if this app used them, so you can speak to both "what I built" and "what I know."

---

## 1. Hooks

**Simple words:** A hook is a function that gives a plain component "superpowers" — memory (state), the ability to react to changes (effects), and the ability to remember calculations (memo) — without turning it into a class. Any function starting with `use` is a hook.

**Where it's used:** `src/hooks/usePromoData.ts` is the heart of this app. It's a **custom hook** that bundles together several built-in hooks.

```ts
// useState — the component's "memory box"
const [selectedBankId, setSelectedBankId] = useState<BankId>(DEFAULT_BANK_ID)

// useMemo — "only recalculate this if the ingredients changed"
const selectedBank = useMemo(
  () => BANKS.find((bank) => bank.id === selectedBankId) ?? BANKS[0],
  [selectedBankId],
)

// useEffect — "when selectedBankId changes, go fetch fresh data,
// and clean up (cancel) the old request if a new one starts"
useEffect(() => {
  const controller = new AbortController()
  const loadCategories = async () => {
    const categoryJson = await fetchCategories(selectedBankId, controller.signal)
    setCategories(categoryJson.data)
  }
  loadCategories()
  return () => controller.abort() // cleanup
}, [selectedBankId])

// useCallback — "keep this function's identity stable across re-renders"
const selectBank = useCallback((bankId: BankId) => {
  clearSearchFilters()
  setSelectedBankId(bankId)
}, [clearSearchFilters])
```

Then `usePromoData()` itself is called like a normal hook inside `HomePage.tsx`:

```ts
const { promos, loadingPromos, selectBank, ... } = usePromoData()
```

**Diagram — hook lifecycle:**

```
Component mounts
      │
      ▼
useState sets initial memory  ──►  Component renders on screen
      │                                     ▲
      ▼                                     │
useEffect runs AFTER render                 │
 (fetch data, subscribe, etc.)              │
      │                                     │
      ▼                                     │
setState is called ─────────────────────────┘
(re-render happens, effect cleanup runs
 first if dependencies changed)
```

**Interview soundbite:** "I built a custom hook, `usePromoData`, that owns all the fetching and filtering state for the app — banks, categories, promos, search, pagination — and exposes a clean API to the component. It uses `useState` for memory, `useEffect` with `AbortController` for cancellable fetches, `useMemo`/`useCallback` to avoid unnecessary re-renders, and I split off a second custom hook, `useSavedPromos`, for localStorage persistence — so concerns stay separated."

---

## 2. Context API

**Simple words:** Imagine every component is a person in a big family tree. Normally, if grandma has a message for a great-grandchild, she has to pass it to her kid, who passes it to their kid, and so on — that's "prop drilling." Context is like a group chat: anyone in the family can join the chat and read the message directly, without anyone in between having to pass it along.

**Now used in this project for dark mode.** The theme (`isDarkMode` + `toggleDarkMode`) used to live as local state inside `HomePage.tsx`. It's been pulled out into a `ThemeContext` so any component can read or toggle it without `HomePage` having to pass props down. The context is split across three files, which is the standard React pattern for keeping the context value, the provider, and the consumer hook separate:

```ts
// src/context/theme-context.ts — just the context object + its type
export interface ThemeContextValue {
  isDarkMode: boolean
  toggleDarkMode: () => void
}
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
```

```tsx
// src/context/ThemeContext.tsx — the Provider: owns the state, reads/writes localStorage
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev)

  return <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}
```

```ts
// src/hooks/useTheme.ts — the consumer hook, with a guardrail if used outside the provider
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

The provider wraps the whole app in `App.tsx`, and `HomePage.tsx` just calls the hook — no more local `isDarkMode` state or prop plumbing for it:

```tsx
// src/App.tsx
function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  )
}

// src/pages/HomePage/HomePage.tsx
const { isDarkMode, toggleDarkMode } = useTheme()
```

**Diagram — prop drilling vs. Context (as actually applied here):**

```
Before (local state in HomePage):
HomePage keeps isDarkMode itself, only HomePage's own JSX can use it

After (Context, current implementation):
        ThemeProvider (wraps <HomePage /> in App.tsx)
                    │
                    ▼
              HomePage.tsx
        useTheme() → { isDarkMode, toggleDarkMode }
   (any component under the provider could call useTheme()
    directly too, without HomePage passing it down as props)
```

**Interview soundbite:** "Dark mode used to be local state in `HomePage`. I moved it into a `ThemeContext` — split into a context definition, a `ThemeProvider` that owns the state and syncs it to localStorage, and a `useTheme` hook that throws if it's used outside the provider, which catches wiring mistakes early. `App.tsx` wraps the whole tree in `ThemeProvider`, so any component can opt into the theme with one line — no prop drilling — which is exactly the kind of cross-cutting, app-wide concern Context is meant for."

---

## 3. Redux Toolkit

**Simple words:** Instead of every component keeping its own private notebook, Redux is **one big shared notebook** for the whole app. Components can read any page of it, but they can only *change* it by sending a clearly-labelled request ("action") — never by scribbling directly. Redux Toolkit (RTK) is just the modern, less-boilerplate way of writing Redux.

**Not used in this project** — instead, `usePromoData.ts` plays a similar role to a Redux "slice": it centralizes all the promo/search/pagination state and hands out named functions to change it (`selectBank`, `selectCategory`, `loadMorePromos`). The difference is scope — it's local to `HomePage`, not global to the whole app, and there's no separate "store."

**What the same state would look like as an RTK slice:**

```ts
// promoSlice.ts
const promoSlice = createSlice({
  name: 'promo',
  initialState: {
    selectedBankId: 'hnb',
    categories: [],
    promos: [],
    loadingPromos: false,
    error: null,
  },
  reducers: {
    bankSelected(state, action) {
      state.selectedBankId = action.payload   // RTK lets you "mutate" safely (uses Immer under the hood)
    },
    promosLoaded(state, action) {
      state.promos = action.payload
      state.loadingPromos = false
    },
  },
})
```

A component would then use `useSelector` to read and `useDispatch` to send actions, instead of destructuring values straight out of `usePromoData()`.

**Diagram — data flow:**

```
Component            Store (single source of truth)
   │  dispatch(bankSelected('sampath'))
   ├──────────────────────►  Reducer updates state
   │                              │
   │  useSelector(state => state.promo.promos)
   ◄──────────────────────────────┘
   (component re-renders with new data)
```

**Interview soundbite:** "I haven't used Redux Toolkit in this project because the state is scoped to one page, so a custom hook was simpler — but I understand the pattern: centralize state in a store, update it only through reducers/actions, and read it via selectors. If this app grew multiple pages that needed the same promo/saved-offers data, I'd migrate `usePromoData`'s state into an RTK slice."

---

## 4. Redux-Saga

**Simple words:** If Redux is the shared notebook, a saga is a **background assistant** that watches for certain requests ("I need data!") and goes and does the messy real-world work — calling an API, waiting, retrying, or cancelling an old request if a new one comes in — then writes the result back into the notebook.

**Not used in this project** — but this app already solves the exact problem sagas exist for: cancelling stale requests. In `usePromoData.ts`, every fetch uses `AbortController`, and the `useEffect` cleanup function cancels the previous request when `selectedBankId` changes:

```ts
useEffect(() => {
  const controller = new AbortController()
  const loadPromos = async () => {
    const promoJson = await fetchPromosByCategory(selectedBankId, ..., controller.signal)
    setPromos(promoJson.data)
  }
  loadPromos()
  return () => controller.abort()   // cancels the in-flight request if bank/category changes again
}, [selectedBankId, selectedCategoryId, ...])
```

**What the equivalent saga would look like** (using `takeLatest`, which automatically cancels the previous call when a new action comes in — the saga version of the `AbortController` cleanup above):

```ts
function* loadPromosSaga(action) {
  try {
    const data = yield call(fetchPromosByCategory, action.payload.bankId, ...)
    yield put(promosLoaded(data))
  } catch (err) {
    yield put(promosLoadFailed(err.message))
  }
}

function* promoSaga() {
  yield takeLatest('promo/bankSelected', loadPromosSaga)
}
```

**Diagram — saga as a background listener:**

```
Component dispatches action: bankSelected('sampath')
              │
              ▼
      Saga is watching ('takeLatest')
              │
              ├── cancels any previous loadPromosSaga still running
              ▼
      calls the API (fetchPromosByCategory)
              │
              ▼
      dispatches promosLoaded(data) back to the store
              │
              ▼
      Component re-renders via useSelector
```

**Interview soundbite:** "This project handles cancellable async fetching with `AbortController` inside `useEffect` cleanup — which is conceptually the same problem `redux-saga`'s `takeLatest` solves: cancel the stale request when a newer one comes in. I chose the lighter hook-based approach here since there's no need for the extra generator-function complexity sagas add, but I'd use sagas (or RTK Query) if the app had many overlapping async flows to coordinate."

---

## 5. Component-driven architecture

**Simple words:** Instead of building one giant page as one big file, you build small Lego bricks first (a button, a card, a search bar), test that each one works on its own, then snap them together into bigger and bigger pieces until you have a full page.

**Where it's used:** Every screen in this app is assembled from small, focused, reusable components — each with its own folder and its own CSS module:

```
src/components/
  PromoCard/          — one promo tile: image, title, save button, "view more"
  CategorySection/     — bank picker + card-type filter + category grid
  PromoSection/        — search bar + promo grid + pagination
  PromoDetailModal/     — popup with full promo details
  SearchFilters/        — text/date inputs used inside PromoSection
```

`PromoCard.tsx` is a good example of a **presentational component** — it receives everything it needs through props and has no idea where that data came from:

```tsx
type PromoCardProps = {
  promo: Promo
  savedPromoIds: Set<string>
  isSavedView: boolean
  onToggleSavedPromo: (promo: Promo) => void
  onOpenPromoDetail: (promoId: string) => void
}

export const PromoCard = ({ promo, savedPromoIds, onToggleSavedPromo, onOpenPromoDetail }: PromoCardProps) => (
  <article>
    <button onClick={() => onToggleSavedPromo(promo)}>Save</button>
    <h3>{promo.title}</h3>
    <button onClick={() => onOpenPromoDetail(promo.id)}>View more</button>
  </article>
)
```

All the *thinking* (fetching, filtering, deciding what's saved) lives one level up, in `usePromoData` and `useSavedPromos`, and gets wired together in `HomePage.tsx`, which composes the smaller components:

```tsx
<CategorySection ... />
<PromoSection ... onOpenPromoDetail={setSelectedPromoId} ... />
{selectedPromoId && <PromoDetailModal ... />}
```

**Diagram — composition tree:**

```
                         HomePage
                (owns state, wires hooks to UI)
        ┌───────────────┬────────────────┬───────────────┐
        ▼                ▼                ▼
CategorySection     PromoSection      PromoDetailModal
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        SearchFilters              PromoCard (× N)
```

**Interview soundbite:** "I structured the UI as small, single-responsibility components — each one co-located with its own CSS module — and kept them 'dumb': they just receive data and callbacks as props. All the real logic (data fetching, filtering, localStorage) lives in custom hooks. That separation makes each component easy to test, reuse, and reason about on its own, and it's why adding a new bank only touches the service layer and constants, not the components."

---

## Quick summary table

| Concept | Used in this project? | One-line explanation |
|---|---|---|
| Hooks | Yes — `usePromoData`, `useSavedPromos` | Functions that give components memory, effects, and derived values |
| Context API | Yes — `ThemeContext` for dark mode | A "group chat" so components can read shared data without prop drilling |
| Redux Toolkit | No (`usePromoData` plays a similar role, locally) | One shared, rule-controlled notebook (store) for app-wide state |
| Redux-Saga | No (`AbortController` + `useEffect` cleanup does the same job) | A background assistant that manages async side effects and cancellation |
| Component-driven architecture | Yes — `components/` folder | Build small reusable Lego-brick components, then compose them into pages |
