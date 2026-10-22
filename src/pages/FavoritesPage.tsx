import React from 'react';
import { Bookmark, FileText, Scale, Trash2, ArrowRight } from 'lucide-react';
import topicsData from '../data/topics.json';
import casesData from '../data/cases.json';
import subjectsData from '../data/subjects.json';

interface FavoritesPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigateTopic: (id: string) => void;
  onNavigateCase: (subjectId: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  onToggleFavorite,
  onNavigateTopic,
  onNavigateCase
}) => {
  const favoriteTopics = topicsData.filter((t) => favorites.includes(t.id));
  const favoriteCases = casesData.filter((c) => favorites.includes(c.id));

  const totalCount = favoriteTopics.length + favoriteCases.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            Персональные закладки
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Избранные материалы
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Сохраненные конспекты и практические задачи для быстрого доступа.
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
            Нажимайте на значок закладки (★) в разделах «Темы и конспекты» или «Задачи», чтобы сохранить нужные материалы для повторения перед парой.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favorite Topics */}
          {favoriteTopics.length > 0 && (
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
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-300">
                          {sub?.shortTitle || 'Предмет'}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {t.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => onNavigateTopic(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-900 dark:bg-brand-600 text-white font-semibold text-xs flex items-center space-x-1"
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

          {/* Favorite Cases */}
          {favoriteCases.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Задачи и практикум ({favoriteCases.length})</span>
              </h2>

              <div className="space-y-2">
                {favoriteCases.map((c) => {
                  const sub = subjectsData.find((s) => s.id === c.subjectId);
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {sub?.shortTitle || 'Практикум'}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {c.fabula}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => onNavigateCase(c.subjectId)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1"
                        >
                          <span>К задаче</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(c.id)}
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
      )}
    </div>
  );
};
