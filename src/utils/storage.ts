/**
 * Safe localStorage wrapper with memory fallback
 */

const memoryStore: Record<string, string> = {};

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return JSON.parse(val) as T;
  } catch {
    const mem = memoryStore[key];
    if (mem === undefined) return defaultValue;
    try {
      return JSON.parse(mem) as T;
    } catch {
      return defaultValue;
    }
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    const str = JSON.stringify(value);
    localStorage.setItem(key, str);
    memoryStore[key] = str;
  } catch {
    memoryStore[key] = JSON.stringify(value);
  }
}

export const STORAGE_KEYS = {
  THEME: 'ponb_theme',
  FAVORITES: 'ponb_favorites',
  COMPLETED_ASSIGNMENTS: 'ponb_completed_assignments',
  EXAM_KNOWN: 'ponb_exam_known',
  EXAM_REPEAT: 'ponb_exam_repeat',
  FONT_SCALE: 'ponb_font_scale',
  SCHEDULE_VIEW: 'ponb_schedule_view',
  LAST_TAB: 'ponb_last_tab'
};
