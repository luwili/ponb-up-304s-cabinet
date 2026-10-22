import React from 'react';
import { Bookmark, FileText, Trash2, ArrowRight } from 'lucide-react';
import topicsData from '../data/topics.json';
import subjectsData from '../data/subjects.json';

interface FavoritesPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigateTopic: (id: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  onToggleFavorite,
  onNavigateTopic
}) => {
  const favoriteTopics = topicsData.filter((t) => favorites.includes(t.id));
  const totalCount = favoriteTopics.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            Персональные закладки
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Избранные конспекты
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Сохраненные лекции и конспекты для быстрого повторения перед занятиями.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
          Сохранено: {totalCount}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Bookmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <div className="font-bold text-base text-slate-700 dark:text-slate-300">
            В избранном пока ничего нет
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Нажимайте на значок закладки в разделе «Темы и конспекты», чтобы сохранить нужные материалы для повторения перед парой.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>Конспекты лекций ({favoriteTopics.length})</span>
          </h2>

          <div className="space-y-2">
            {favoriteTopics.map((t) => {
              const sub = subjectsData.find((s) => s.id === t.subjectId);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm hover:border-brand-400 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-300">
                      {sub?.shortTitle || sub?.title || 'Конспект'}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1 truncate">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onNavigateTopic(t.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-900 dark:bg-brand-600 text-white font-semibold text-xs flex items-center space-x-1 hover:bg-brand-800 transition-colors"
                    >
                      <span>Читать</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleFavorite(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Удалить из избранного"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
