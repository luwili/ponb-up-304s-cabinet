import type { Catalog, Group, Lesson } from './schema';

export const normalize = (s: string) => s.toLocaleLowerCase('ru').replaceAll('ё','е');
export const ufaDate = (now = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Yekaterinburg', year:'numeric',month:'2-digit',day:'2-digit' }).format(now);
export const ufaTime = (now = new Date()) => new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Yekaterinburg',hour:'2-digit',minute:'2-digit'}).format(now);
export const shiftDate = (s: string, n: number) => new Date(Date.parse(s+'T12:00:00Z') + n * 86400000).toISOString().slice(0,10);
export const weekday = (s: string) => new Date(s+'T12:00:00Z').getUTCDay() || 7;
export const monday = (s: string) => shiftDate(s, 1-weekday(s));
export const formatDate = (s: string, options: Intl.DateTimeFormatOptions = {day:'numeric',month:'long'}) => new Intl.DateTimeFormat('ru-RU',{...options,timeZone:'Asia/Yekaterinburg'}).format(new Date(s+'T12:00:00Z'));
export function lessonsOn(date: string, schedule: Catalog['schedule'], group: Group): Lesson[] {
  const exception = schedule.exceptions.find(e => e.date === date);
  if (exception) return [...exception.lessons].sort((a,b)=>a.start.localeCompare(b.start));
  return schedule.lessons.filter(l => {
    if (l.date) return l.date === date;
    if (!group.semesterStart || !group.semesterEnd || date < group.semesterStart || date > group.semesterEnd || weekday(date) !== l.weekday) return false;
    if (l.parity === 'all') return true;
    if (!group.referenceWeek) return false;
    const week = Math.round((Date.parse(monday(date))-Date.parse(monday(group.referenceWeek)))/604800000);
    return ((week % 2 + 2) % 2 === 0 ? 'odd' : 'even') === l.parity;
  }).sort((a,b)=>a.start.localeCompare(b.start));
}
export function readLocal<T>(key: string, fallback: T, validate: (v: unknown)=>v is T): T {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) || 'null'); return validate(value) ? value : fallback; } catch { return fallback; }
}
export const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x=>typeof x==='string');
export const safeAsset = (path: string) => `${import.meta.env.BASE_URL}generated/${path.split('/').map(encodeURIComponent).join('/')}`;
