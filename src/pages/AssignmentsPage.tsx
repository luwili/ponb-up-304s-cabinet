import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  AlertCircle, 
  Paperclip, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import assignmentsData from '../data/assignments.json';
import subjectsData from '../data/subjects.json';
import { Assignment } from '../types';

interface AssignmentsPageProps {
  completedTasks: string[];
  onToggleTask: (id: string) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  completedTasks,
  onToggleTask
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredAssignments = useMemo(() => {
    return assignmentsData.filter((a) => {
      const isCompleted = completedTasks.includes(a.id);
      if (filterMode === 'pending' && isCompleted) return false;
      if (filterMode === 'completed' && !isCompleted) return false;
      if (selectedSubject !== 'all' && a.subjectId !== selectedSubject) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.subjectName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [completedTasks, filterMode, selectedSubject, search]);

  const completedCount = assignmentsData.filter((a) => completedTasks.includes(a.id)).length;
  const pendingCount = assignmentsData.length - completedCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
              Учебные задания и дедлайны
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Задания группы ПОНБ-УП-304С
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Контрольные работы, проекты процессуальных актов, практикумы и семинарские доклады.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
              В работе: {pendingCount}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Сдано: {completedCount}
            </div>
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
              placeholder="Поиск по заданиям и описанию..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Все ({assignmentsData.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterMode === 'pending'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              В работе ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                filterMode === 'completed'
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Выполненные ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Задания не найдены.
          </div>
        ) : (
          filteredAssignments.map((a) => {
            const isDone = completedTasks.includes(a.id);
            return (
              <div
                key={a.id}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm ${
                  isDone
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1">
                  <button
                    onClick={() => onToggleTask(a.id)}
                    className="mt-1 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={isDone ? 'Снять отметку' : 'Отметить выполненным'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                        {a.subjectName}
                      </span>
                      {a.priority === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                          Высокий приоритет
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-base ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {a.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {a.description}
                    </p>

                    {/* Attachments */}
                    {a.attachments && a.attachments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {a.attachments.map((att, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span>{att.title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Deadline pill */}
                {a.deadline && (
                  <div className="flex items-center sm:flex-col items-end justify-between sm:justify-start gap-1 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] uppercase font-bold text-slate-400">Срок сдачи:</span>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{a.deadline}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
        Отметки о выполнении сохраняются локально в вашем браузере.
      </div>
    </div>
  );
};
