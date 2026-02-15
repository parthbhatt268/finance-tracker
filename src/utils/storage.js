const STORAGE_KEY_DEMO = 'finance-tracker-demo';
const STORAGE_KEY_REAL = 'finance-tracker-real';

export function getStorageKey(mode) {
  return mode === 'real' ? STORAGE_KEY_REAL : STORAGE_KEY_DEMO;
}

export function loadFromStorage(mode = 'demo') {
  const key = getStorageKey(mode);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
  }
  return null;
}

export function saveToStorage(data, mode = 'demo') {
  const key = getStorageKey(mode);
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
    return false;
  }
}

export function clearStorage(mode = 'demo') {
  const key = getStorageKey(mode);
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}
