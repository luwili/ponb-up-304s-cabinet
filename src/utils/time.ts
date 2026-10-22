/**
 * Time utility functions for Ufa timezone (Asia/Yekaterinburg, UTC+5)
 */

export const UFA_TIMEZONE = 'Asia/Yekaterinburg';

export interface UfaTimeInfo {
  date: Date;
  timeString: string;
  dateString: string;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  dayName: string;
  currentPair: number | null;
  currentPairStatus: 'ongoing' | 'break' | 'before' | 'after';
  pairDetails?: {
    pair: number;
    start: string;
    end: string;
    description: string;
  };
}

const BELL_SCHEDULE = [
  { pair: 1, start: '08:00', end: '09:20', startMins: 8 * 60, endMins: 9 * 60 + 20 },
  { pair: 2, start: '09:35', end: '10:55', startMins: 9 * 60 + 35, endMins: 10 * 60 + 55 },
  { pair: 3, start: '11:35', end: '12:55', startMins: 11 * 60 + 35, endMins: 12 * 60 + 55 },
  { pair: 4, start: '13:10', end: '14:30', startMins: 13 * 60 + 10, endMins: 14 * 60 + 30 },
  { pair: 5, start: '14:45', end: '16:05', startMins: 14 * 60 + 45, endMins: 16 * 60 + 5 },
];

export function getUfaTimeInfo(customDate?: Date): UfaTimeInfo {
  const now = customDate || new Date();
  
  // Format in Asia/Yekaterinburg timezone
  const formatterTime = new Intl.DateTimeFormat('ru-RU', {
    timeZone: UFA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const formatterDate = new Intl.DateTimeFormat('ru-RU', {
    timeZone: UFA_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const parts = formatterTime.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);
  const currentTotalMins = hour * 60 + minute;

  // Day of week in Ufa
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: UFA_TIMEZONE,
    weekday: 'narrow'
  });
  // ru-RU weekday index:
  const dayNameRu = formatterDate.format(now).split(',')[0];
  const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const dayIdx = dayNames.findIndex(d => dayNameRu.toLowerCase().includes(d));
  // 1 = Mon, 6 = Sat, 7 = Sun
  const dayOfWeek = dayIdx === 0 ? 7 : dayIdx;

  // Determine pair
  let currentPair: number | null = null;
  let status: 'ongoing' | 'break' | 'before' | 'after' = 'after';
  let pairDetails = undefined;

  if (currentTotalMins < BELL_SCHEDULE[0].startMins) {
    status = 'before';
    pairDetails = {
      pair: 1,
      start: BELL_SCHEDULE[0].start,
      end: BELL_SCHEDULE[0].end,
      description: 'До начала занятий'
    };
  } else if (currentTotalMins > BELL_SCHEDULE[BELL_SCHEDULE.length - 1].endMins) {
    status = 'after';
  } else {
    for (let i = 0; i < BELL_SCHEDULE.length; i++) {
      const p = BELL_SCHEDULE[i];
      if (currentTotalMins >= p.startMins && currentTotalMins <= p.endMins) {
        currentPair = p.pair;
        status = 'ongoing';
        pairDetails = {
          pair: p.pair,
          start: p.start,
          end: p.end,
          description: `Идет ${p.pair}-я пара`
        };
        break;
      } else if (i < BELL_SCHEDULE.length - 1) {
        const nextP = BELL_SCHEDULE[i + 1];
        if (currentTotalMins > p.endMins && currentTotalMins < nextP.startMins) {
          status = 'break';
          pairDetails = {
            pair: nextP.pair,
            start: nextP.start,
            end: nextP.end,
            description: `Перемена перед ${nextP.pair}-й парой`
          };
          break;
        }
      }
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeString = `${pad(hour)}:${pad(minute)}:${pad(second)}`;

  return {
    date: now,
    timeString,
    dateString: formatterDate.format(now),
    dayOfWeek,
    dayName: dayNameRu.charAt(0).toUpperCase() + dayNameRu.slice(1),
    currentPair,
    currentPairStatus: status,
    pairDetails
  };
}
