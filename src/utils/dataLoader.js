import demoData from '../data/demo.json';
import { loadFromStorage, saveToStorage } from './storage';

const EMPTY_REAL = {
  settings: { currency: 'EUR', startingBalance: 0 },
  creditCategories: [
    { name: 'Salary', color: '#22c55e' },
    { name: 'Bonus', color: '#4ade80' },
    { name: 'Investment', color: '#86efac' },
    { name: 'Lump sum', color: '#bbf7d0' },
    { name: 'Miscellaneous', color: '#94a3b8' },
  ],
  debitCategories: [
    { name: 'Rent', color: '#ef4444' },
    { name: 'Wi-Fi', color: '#f87171' },
    { name: 'Electricity', color: '#fb923c' },
    { name: 'Gym membership', color: '#fbbf24' },
    { name: 'Health insurance', color: '#f59e0b' },
    { name: 'Groceries', color: '#84cc16' },
    { name: 'Transport', color: '#22d3ee' },
    { name: 'Entertainment', color: '#a78bfa' },
    { name: 'Subscription', color: '#c084fc' },
    { name: 'Clothing', color: '#ec4899' },
    { name: 'Eating out', color: '#f472b6' },
    { name: 'Miscellaneous', color: '#94a3b8' },
  ],
  transactions: [],
};

export function getDefaultSeed(mode) {
  if (mode === 'real') return null;
  return demoData;
}

export function loadInitialDataSync(mode) {
  const stored = loadFromStorage(mode);
  if (stored?.transactions && Array.isArray(stored.transactions)) {
    return {
      settings: stored.settings || (mode === 'demo' ? demoData.settings : EMPTY_REAL.settings),
      creditCategories: stored.creditCategories ?? (mode === 'demo' ? demoData.creditCategories : EMPTY_REAL.creditCategories),
      debitCategories: stored.debitCategories ?? (mode === 'demo' ? demoData.debitCategories : EMPTY_REAL.debitCategories),
      transactions: stored.transactions,
    };
  }
  if (mode === 'demo') {
    const data = { ...demoData };
    saveToStorage(data, 'demo');
    return data;
  }
  return null;
}

export async function fetchRealSeed() {
  try {
    const res = await fetch('/real-data.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.transactions)) {
        return {
          ...EMPTY_REAL,
          ...data,
          creditCategories: data.creditCategories ?? EMPTY_REAL.creditCategories,
          debitCategories: data.debitCategories ?? EMPTY_REAL.debitCategories,
        };
      }
    }
  } catch (e) {
    console.warn('Could not load real-data.json', e);
  }
  return EMPTY_REAL;
}
