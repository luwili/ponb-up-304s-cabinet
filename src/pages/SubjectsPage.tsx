import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  GraduationCap, 
  User, 
  Building2, 
  FileText, 
  Scale, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import subjectsData from '../data/subjects.json';
import topicsData from '../data/topics.json';
import casesData from '../data/cases.json';
import { Subject } from '../types';

interface SubjectsPageProps {
  onNavigateTopic: (topicId: string) => void;
  onNavigateTeacher: (teacherName: string) => void;
  onNavigateCases: (subjectId: string) => void;
  selectedSubjectId?: string;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  onNavigateTopic,
  onNavigateTeacher,
  onNavigateCases,
  selectedSubjectId
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(() => {
    if (selectedSubjectId) {
      return (subjectsData.find((s) => s.id === selectedSubjectId) as Subject) || null;
    }
    return null;
  });

  const filteredSubjects = useMemo(() => {
    return subjectsData.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
        s.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        s.departmentName.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterType === 'all') return true;
      if (filterType === 'exam') return s.examType === 'Экзамен';
      if (filterType === 'credit') return s.examType.includes('Зачёт');
      return true;
    });
  }, [search, filterType]);

  const subjectTopics = useMemo(() => {
    if (!activeSubject) return [];
    return topicsData.filter((t) => t.subjectId === activeSubject.id);
  }, [activeSubject]);

  const subjectCases = useMemo(() => {
    if (!activeSubject) return [];
    return casesData.filter((c) => c.subjectId === activeSubject.id);
  }, [activeSubject]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
              Учебный план · 5 семестр
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Учебные дисциплины ПОНБ-УП-304С
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Каталог предметов, темы лекций, практические задачи, конспекты и преподаватели.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Всего дисциплин: {subjectsData.length}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию предмета, преподавателю или кафедре..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Все (10)
            </button>
            <button
              onClick={() => setFilterType('exam')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterType === 'exam'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Экзамены (5)
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterType === 'credit'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Зачёты (5)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((sub) => {
          const isSelected = activeSubject?.id === sub.id;
          return (
            <div
              key={sub.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm transition-all flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              onClick={() => setActiveSubject(isSelected ? null : sub as Subject)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                      sub.examType === 'Экзамен'
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {sub.examType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {sub.semester}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors leading-snug mb-2">
                  {sub.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {sub.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-medium">{sub.teacherName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sub.departmentName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-400">
                <span>{isSelected ? 'Свернуть детали' : 'Подробнее о предмете'}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Subject Drawer / Detail View */}
      {activeSubject && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-brand-500 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
                <span>Детальный план дисциплины</span>
                <span>•</span>
                <span>{activeSubject.examType}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeSubject.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {activeSubject.description}
              </p>
            </div>

            <button
              onClick={() => setActiveSubject(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              Закрыть
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Topics / Lectures */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Темы и лекционные конспекты ({subjectTopics.length})</span>
              </h3>

              {subjectTopics.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500">
                  Конспекты по этой дисциплине будут загружены при следующем обновлении материалов.
                </div>
              ) : (
                <div className="space-y-2">
                  {subjectTopics.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-600 transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {t.description}
                        </p>
                        {t.verifiedStatus && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            ✓ {t.verifiedStatus}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onNavigateTopic(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-900 text-white dark:bg-brand-600 text-xs font-semibold hover:bg-brand-800 flex-shrink-0 flex items-center space-x-1"
                      >
                        <span>Читать</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Cases & Teacher details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>Практические задачи и судебная практика ({subjectCases.length})</span>
              </h3>

              {subjectCases.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500">
                  Задачи семинарского типа по предмету готовятся кафедрой.
                </div>
              ) : (
                <div className="space-y-2">
                  {subjectCases.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {c.fabula}
                        </p>
                      </div>

                      <button
                        onClick={() => onNavigateCases(activeSubject.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 flex-shrink-0 flex items-center space-x-1"
                      >
                        <span>Решать</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Faculty lead card */}
              <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 text-xs space-y-2">
                <div className="font-bold text-brand-950 dark:text-brand-300">
                  Преподаватель дисциплины:
                </div>
                <button
                  onClick={() => onNavigateTeacher(activeSubject.teacherName)}
                  className="font-semibold text-slate-900 dark:text-white hover:underline text-sm block"
                >
                  {activeSubject.teacherName}
                </button>
                <div className="text-slate-600 dark:text-slate-300">
                  Кафедра: {activeSubject.departmentName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
