# Finance Tracker

A minimal, offline-only personal finance tracker built with React (Vite) and JavaScript. No backend, no API, no auth—everything runs locally in your browser. Track where your money goes: salary in, debits by category, savings and net worth over time.

## Setup

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

**Note:** If `npm install` was run with `NODE_ENV=production`, dev dependencies (e.g. Vite) may be skipped. Run `npm install` with `NODE_ENV=development` or without setting `NODE_ENV` so that `npm run dev` and `npm run build` work.

## Demo vs real data

- **`npm run dev`** — **Demo mode.** Uses seed data from `src/data/demo.json` (2 500 EUR salary/month from Jan 2025 to Feb 2026, sample expenses). Data is stored in `localStorage` under a demo key so it does not mix with real data.
- **`npm run dev:real`** — **Real mode.** Uses data from `public/real-data.json` on first load (or empty if the file is missing). All changes are saved in `localStorage` under a real-data key. The file `public/real-data.json` is in `.gitignore` so your real numbers are never committed.

Build with the same mode:

- `npm run build` — builds using demo mode (for preview/demo).
- `npm run build:real` — builds using real mode (for your own deployment).

## Persistence

- **Demo mode:** First run loads `src/data/demo.json` into `localStorage` (key: `finance-tracker-demo`). Later runs use that stored data.
- **Real mode:** First run loads `public/real-data.json` (if present) into `localStorage` (key: `finance-tracker-real`). If the file is missing, you start with empty transactions and default categories. All add/edit/delete changes are saved in `localStorage` only; the app does not write back to `real-data.json`.

## Data files

- **`src/data/demo.json`** — Committed. Demo seed: 2 500 EUR salary per month, sample rent (500), groceries, Wi‑Fi, electricity, gym, health insurance, etc.
- **`public/real-data.json`** — Gitignored. Copy from the structure below or leave empty; the app will create default categories. Use this for your real numbers.

Data shape (for `real-data.json` or backup):

```json
{
  "settings": { "currency": "EUR", "startingBalance": 0 },
  "creditCategories": [
    { "name": "Salary", "color": "#22c55e" },
    { "name": "Bonus", "color": "#4ade80" },
    { "name": "Investment", "color": "#86efac" },
    { "name": "Lump sum", "color": "#bbf7d0" },
    { "name": "Miscellaneous", "color": "#94a3b8" }
  ],
  "debitCategories": [
    { "name": "Rent", "color": "#ef4444" },
    { "name": "Wi-Fi", "color": "#f87171" },
    { "name": "Electricity", "color": "#fb923c" },
    { "name": "Gym membership", "color": "#fbbf24" },
    { "name": "Health insurance", "color": "#f59e0b" },
    { "name": "Groceries", "color": "#84cc16" },
    { "name": "Transport", "color": "#22d3ee" },
    { "name": "Entertainment", "color": "#a78bfa" },
    { "name": "Subscription", "color": "#c084fc" },
    { "name": "Clothing", "color": "#ec4899" },
    { "name": "Eating out", "color": "#f472b6" },
    { "name": "Miscellaneous", "color": "#94a3b8" }
  ],
  "transactions": [
    {
      "id": "unique-id",
      "type": "credit",
      "date": "2026-02-15",
      "amount": 2500,
      "category": "Salary",
      "description": "Monthly salary"
    }
  ]
}
```

- **Credit categories:** Salary, Bonus, Investment, Lump sum, Miscellaneous.
- **Debit categories:** Rent, Wi‑Fi, Electricity, Gym membership, Health insurance, Groceries, Transport, Entertainment, Subscription, Clothing, Eating out, Miscellaneous.

## Features

- **Transactions:** Add credit (income) or debit (expense), edit, delete (with confirmation). Month selector with prev/next. Credits and debits listed by month.
- **Spending this month:** Horizontal bar chart below the transaction list showing spending by category for the selected month (rent, groceries, etc.).
- **Charts (right column):** Spending over time (bar), Savings over time (area), **Spending by category** (donut, debits only), Net worth over time (line). Toggles: Per Month, Per Year, All Time; year dropdown when Per Year is selected.
- **Net worth:** Shown in the header; `startingBalance + sum(credits) - sum(debits)`.
- **Dark UI:** Black/dark theme; credits in green, debits in red.

## Tech stack

- React 19 + Vite 5
- TailwindCSS 3
- Recharts
- date-fns
- localStorage only (no server)

## License

MIT
