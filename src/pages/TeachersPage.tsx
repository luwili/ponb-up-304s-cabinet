import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Building2, 
  GraduationCap, 
  Award, 
  ExternalLink, 
  Star, 
  BookOpen,
  Filter
} from 'lucide-react';
import teachersData from '../data/teachers.json';
import departmentsData from '../data/departments.json';
import { Teacher } from '../types';

interface TeachersPageProps {
  initialSearch?: string;
  onNavigateSubject?: (subjectId: string) => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({
  initialSearch = '',
  onNavigateSubject
}) => {
  const [tab, setTab] = useState<'group' | 'all'>('group');
  const [search, setSearch] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDegree, setSelectedDegree] = useState<string>('all');

  const groupTeachersCount = teachersData.filter((t) => t.isGroupTeacher).length;

  const filteredTeachers = useMemo(() => {
    return (teachersData as Teacher[]).filter((t) => {
      if (tab === 'group' && !t.isGroupTeacher) return false;
      if (selectedDept !== 'all' && t.department !== selectedDept) return false;

      if (selectedDegree === 'doctor' && !t.degree.toLowerCase().includes('доктор')) return false;
      if (selectedDegree === 'kandidat' && !t.degree.toLowerCase().includes('кандидат')) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.position.toLowerCase().includes(q) ||
          t.interests.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tab, selectedDept, selectedDegree, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
              Профессорско-преподавательский состав
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Справочник преподавателей
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Официальные подтвержденные данные сайта Института права УУНиТ (law-bsu.ru).
            </p>
          </div>

          {/* Group vs All Tab Switch */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTab('group')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                tab === 'group'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Наша группа ({groupTeachersCount})</span>
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Весь институт ({teachersData.length})
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО, интересам..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 truncate"
            >
              <option value="all">Все кафедры института</option>
              {departmentsData.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Все ученые степени</option>
              <option value="doctor">Доктора юридических наук</option>
              <option value="kandidat">Кандидаты юридических наук</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Преподаватели по указанным критериям не найдены.
          </div>
        ) : (
          filteredTeachers.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-sm ${
                t.isGroupTeacher
                  ? 'border-brand-300 dark:border-brand-800 ring-1 ring-brand-400/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Badges & Group connection */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t.position}
                  </span>

                  {t.isGroupTeacher && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Star className="w-3 h-3 fill-current text-amber-500" />
                      <span>{t.groupRole || 'Преподаватель нашей группы'}</span>
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug">
                  {t.name}
                </h3>

                <div className="text-xs text-brand-700 dark:text-brand-400 font-semibold mt-1">
                  {t.department}
                </div>

                {/* Subjects for group */}
                {t.isGroupTeacher && t.groupSubjects.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/60 text-xs">
                    <span className="font-bold text-brand-900 dark:text-brand-300">Ведет у группы: </span>
                    <span className="text-slate-700 dark:text-slate-300">{t.groupSubjects.join(', ')}</span>
                  </div>
                )}

                {/* Degrees & titles */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {t.degree && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-medium">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{t.degree}</span>
                    </span>
                  )}
                  {t.academicTitle && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-medium">
                      {t.academicTitle}
                    </span>
                  )}
                </div>

                {/* Interests */}
                {t.interests && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Научные интересы: </span>
                    <span>{t.interests}</span>
                  </div>
                )}

                {/* Awards */}
                {t.awards && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{t.awards}</span>
                  </div>
                )}
              </div>

              {/* Footer with law-bsu link */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">Данные: {t.retrievedAt}</span>
                <a
                  href={t.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-brand-700 dark:text-brand-400 font-semibold hover:underline"
                >
                  <span>Профиль на сайте кафедры</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
