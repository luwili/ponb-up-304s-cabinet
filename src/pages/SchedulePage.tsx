import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  ExternalLink, 
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import scheduleData from '../data/schedule.json';
import { getUfaTimeInfo } from '../utils/time';

interface SchedulePageProps {
  onNavigateTeacher?: (teacherName: string) => void;
  onNavigateSubject?: (subjectId: string) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  onNavigateTeacher,
  onNavigateSubject
}) => {
  const timeInfo = getUfaTimeInfo();
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // Default selected day: today (1..6), or 1 (Mon) on Sunday
  const initialDay = timeInfo.dayOfWeek >= 1 && timeInfo.dayOfWeek <= 6 ? timeInfo.dayOfWeek : 1;
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  const days = scheduleData.days;
  const currentDayData = days.find((d) => d.dayOfWeek === selectedDay) || days[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
            <span>Институт права УУНиТ · Уфа</span>
            <span>•</span>
            <span>Неделя {scheduleData.currentWeekNumber} ({scheduleData.weekType === 'even' ? 'Четная' : 'Нечетная'})</span>
            {(scheduleData as any).lastSyncedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 normal-case font-medium">
                  ИСУ УУНиТ: {(scheduleData as any).lastSyncedAt}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Расписание занятий ПОНБ-УП-304С
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Время Уфы (Asia/Yekaterinburg, UTC+5). Корпус: ул. Достоевского, 131.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'day'
                ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Режим: День
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Режим: Вся неделя
          </button>
        </div>
      </div>

      {/* Day Selector (for 'day' mode) */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {days.map((d) => {
            const isSelected = d.dayOfWeek === selectedDay;
            const isToday = d.dayOfWeek === timeInfo.dayOfWeek;
            return (
              <button
                key={d.dayOfWeek}
                onClick={() => setSelectedDay(d.dayOfWeek)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-brand-900 text-white border-brand-800 shadow-md dark:bg-brand-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-bold text-xs sm:text-sm">{d.dayName}</span>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" title="Сегодня" />
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-brand-200' : 'text-slate-400'}`}>
                  {d.date.slice(5).replace('-', '.')} · {d.pairs.length} пар
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Single Day View */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{currentDayData.dayName}, {currentDayData.date}</span>
                {currentDayData.dayOfWeek === timeInfo.dayOfWeek && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Сегодня
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Всего пар на день: {currentDayData.pairs.length}
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Неделя 8
            </div>
          </div>

          <div className="space-y-3">
            {currentDayData.pairs.map((p) => {
              const isCurrentPair = 
                currentDayData.dayOfWeek === timeInfo.dayOfWeek && 
                timeInfo.currentPair === p.pairNumber;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentPair
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-400/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center flex-shrink-0 text-center shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Пара</span>
                        <span className="text-base font-extrabold text-brand-900 dark:text-brand-300 leading-none">
                          {p.pairNumber}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onNavigateSubject?.(p.subjectId)}
                            className="font-bold text-slate-900 dark:text-white text-base hover:text-brand-700 dark:hover:text-brand-400 transition-colors text-left"
                          >
                            {p.subjectName}
                          </button>
                          {isCurrentPair && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                              ИДЕТ СЕЙЧАС
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                          <button
                            onClick={() => onNavigateTeacher?.(p.teacher)}
                            className="inline-flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium underline decoration-dotted">{p.teacher}</span>
                          </button>

                          <span className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.room}</span>
                          </span>
                        </div>

                        {p.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5">
                            Тема: {p.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {p.timeStart} – {p.timeEnd}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mt-1">
                        {p.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((d) => {
            const isToday = d.dayOfWeek === timeInfo.dayOfWeek;
            return (
              <div
                key={d.dayOfWeek}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                  isToday
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {d.dayName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {d.date}
                      </p>
                    </div>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        Сегодня
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {d.pairs.map((p) => {
                      const isCurrentPair = isToday && timeInfo.currentPair === p.pairNumber;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border text-xs ${
                            isCurrentPair
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-brand-900 dark:text-brand-300">
                              {p.pairNumber} пара · {p.timeStart}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">
                              {p.type === 'Лекция' ? 'Лекция' : 'Семинар'}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-2">
                            {p.subjectName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {p.teacher}
                          </div>
                          <div className="text-[10px] text-brand-700 dark:text-brand-400 mt-0.5 font-medium">
                            {p.room}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bell Schedule Reference */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Официальное расписание звонков Института права</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {scheduleData.bellSchedule.map((b) => (
            <div key={b.pair} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Пара {b.pair}</span>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {b.timeStart} – {b.timeEnd}
              </div>
              {b.break && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Перерыв: {b.break}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Официальный первоисточник расписания: law-bsu.ru/schedules</span>
          <a
            href="https://law-bsu.ru/schedules"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-brand-700 dark:text-brand-400 font-semibold hover:underline"
          >
            <span>Открыть расписание на сайте института</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
