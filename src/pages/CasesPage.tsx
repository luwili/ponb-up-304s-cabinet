import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  HelpCircle, 
  BookOpen, 
  Eye, 
  EyeOff, 
  FileCheck, 
  Search, 
  Bookmark, 
  ChevronDown
} from 'lucide-react';
import casesData from '../data/cases.json';
import subjectsData from '../data/subjects.json';
import { CaseProblem } from '../types';

interface CasesPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  selectedSubjectId?: string;
}

export const CasesPage: React.FC<CasesPageProps> = ({
  favorites,
  onToggleFavorite,
  selectedSubjectId
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(selectedSubjectId || 'all');
  const [search, setSearch] = useState('');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredCases = useMemo(() => {
    return casesData.filter((c) => {
      if (selectedSubject !== 'all' && c.subjectId !== selectedSubject) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.fabula.toLowerCase().includes(q) ||
          c.shortSolution.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedSubject, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              Практикум и судебная практика
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Задачи по уголовному и судебному праву
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Реальные судебные казусы, квалификация деяний, процессуальные решения и нормативная база.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>Кейсов: {casesData.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по фабуле задачи, ключевым словам или статьям УК/УПК..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Все дисциплины</option>
            <option value="ugolov-proc">Уголовно-процессуальное право</option>
            <option value="ugolov-pravo-osob">Уголовное право (Особенная часть)</option>
            <option value="admin-proc">Административный судебный процесс</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Задачи по выбранному фильтру не найдены.
          </div>
        ) : (
          filteredCases.map((c) => {
            const isRevealed = revealedSolutions[c.id];
            const isFavorited = favorites.includes(c.id);
            const sub = subjectsData.find((s) => s.id === c.subjectId);

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Case Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">
                      <span>{sub?.title || 'Практикум'}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(c.id)}
                    className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
                      isFavorited
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                    }`}
                    title={isFavorited ? 'В избранном' : 'Добавить в избранное'}
                  >
                    <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* 1. Фабула дела */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    1. Условие / Фабула дела
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-line">
                    {c.fabula}
                  </div>
                </div>

                {/* 2. Вопросы к задаче */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                    <span>2. Вопросы к задаче</span>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/60 space-y-1.5">
                    {c.questions.map((q, idx) => (
                      <div key={idx} className="font-semibold text-slate-900 dark:text-white text-sm">
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Нормативные акты */}
                {c.legalSources && c.legalSources.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-500" />
                      <span>3. Нормативные источники</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {c.legalSources.map((ls, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {ls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Краткий ответ для семинара */}
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block text-[11px] mb-1">
                    4. Краткий ответ для ответа на семинаре:
                  </span>
                  {c.shortSolution}
                </div>

                {/* 5. Подробное обоснованное решение (со спойлером) */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleSolution(c.id)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 text-white font-semibold text-xs shadow-sm hover:bg-brand-800 transition-colors"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Скрыть подробное обоснование</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Показать подробное правовое решение</span>
                      </>
                    )}
                  </button>

                  {isRevealed && (
                    <div className="mt-4 p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line animate-fadeIn">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Подробное процессуальное обоснование решения:</span>
                      </div>
                      {c.fullSolution}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
