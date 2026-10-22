import React, { useMemo } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  Users, 
  Building2, 
  Pin, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  FileText,
  Bookmark
} from 'lucide-react';
import scheduleData from '../data/schedule.json';
import announcementsData from '../data/announcements.json';
import topicsData from '../data/topics.json';
import subjectsData from '../data/subjects.json';
import { getUfaTimeInfo } from '../utils/time';

interface HomePageProps {
  onNavigate: (tab: string, itemId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const timeInfo = getUfaTimeInfo();

  // Find schedule for today (or Monday if Sunday)
  const todayDayOfWeek = timeInfo.dayOfWeek > 6 ? 1 : timeInfo.dayOfWeek;
  const todaySchedule = useMemo(() => {
    return scheduleData.days.find((d) => d.dayOfWeek === todayDayOfWeek) || scheduleData.days[0];
  }, [todayDayOfWeek]);

  // Featured study notes
  const featuredTopics = useMemo(() => {
    return topicsData.slice(0, 4);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-brand-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-800/60 border border-brand-700/50 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Институт права УУНиТ · Уфа</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Кабинет группы ПОНБ-УП-304С
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
            Специальность «Правовое обеспечение национальной безопасности», специализация: уголовно-правовая. 5&nbsp;семестр (3&nbsp;курс), очная форма обучения.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('schedule')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              <span>Расписание пар</span>
            </button>

            <button
              onClick={() => onNavigate('topics')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm border border-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Конспекты лекций ({topicsData.length})</span>
            </button>

            <button
              onClick={() => onNavigate('subjects')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm border border-white/10 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Предметы семестра</span>
            </button>
          </div>
        </div>

        {/* Decorative background insignia */}
        <div className="absolute -right-8 -bottom-12 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Grid: Today's Schedule & Study Notes Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Расписание: {todaySchedule.dayName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Неделя 8 · {timeInfo.dateString}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>Вся неделя</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of pairs */}
            <div className="space-y-3">
              {todaySchedule.pairs.map((p) => {
                const isCurrentPair = timeInfo.currentPair === p.pairNumber && timeInfo.dayOfWeek === todaySchedule.dayOfWeek;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentPair
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-400/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Пара</span>
                          <span className="text-sm font-extrabold text-brand-900 dark:text-brand-300 leading-none">
                            {p.pairNumber}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {p.subjectName}
                            </span>
                            {isCurrentPair && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                                СЕЙЧАС
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                            {p.teacher}
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-semibold text-brand-700 dark:text-brand-400">{p.type}</span>
                            <span>·</span>
                            <span>{p.room}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {p.timeStart} – {p.timeEnd}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Звонки: 08:00, 09:35, 11:35, 13:10, 14:45</span>
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-400">ул. Достоевского, 131</span>
          </div>
        </div>

        {/* Right col: Study Notes Quick Access */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Конспекты лекций
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {topicsData.length} лекций из архива Study
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('topics')}
                className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>Все</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {featuredTopics.map((topic) => {
                const sub = subjectsData.find((s) => s.id === topic.subjectId);
                const readTime = Math.max(5, Math.ceil(topic.fullContent.length / 800));
                return (
                  <div
                    key={topic.id}
                    onClick={() => onNavigate('topics', topic.id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-400 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-brand-700 dark:text-brand-400 mb-1">
                      <span className="truncate">{sub?.shortTitle || sub?.title || 'Конспект'}</span>
                      <span className="text-slate-400 font-mono flex-shrink-0">{readTime} мин</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">
                      {topic.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {topic.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Гражданское, Уголовное, Процесс, СМЭ
            </span>
            <button
              onClick={() => onNavigate('topics')}
              className="text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline"
            >
              Открыть каталог →
            </button>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            <Pin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Объявления института и куратора
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Актуальные новости для группы ПОНБ-УП-304С
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcementsData.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                ann.isPinned
                  ? 'bg-brand-50/60 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                    {ann.tag}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {ann.date}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {ann.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Быстрый переход по разделам
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'subjects', title: 'Предметы', desc: '10 дисциплин семестра', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
            { id: 'topics', title: 'Конспекты лекций', desc: '28 лекций из архива Study', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
            { id: 'schedule', title: 'Расписание', desc: 'Звонки и пары на неделю', icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
            { id: 'exam', title: 'Флеш-карты', desc: 'Подготовка к экзаменам', icon: Sparkles, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
            { id: 'teachers', title: 'Преподаватели', desc: 'Справочник института (186)', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
            { id: 'departments', title: 'Кафедры', desc: '8 кафедр Института права', icon: Building2, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60' },
            { id: 'institute', title: 'Институт УУНиТ', desc: 'Контакты, справки, ссылки', icon: ArrowRight, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
            { id: 'favorites', title: 'Избранное', desc: 'Сохраненные лекции', icon: Bookmark, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
