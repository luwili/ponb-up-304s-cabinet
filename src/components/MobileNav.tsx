import React from 'react';
import { Home, Calendar, BookOpen, CheckSquare, Menu } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  tasksCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu,
  tasksCount = 0
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'home'
              ? 'text-brand-900 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Главная</span>
        </button>

        <button
          onClick={() => onSelectTab('schedule')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'schedule'
              ? 'text-brand-900 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Расписание</span>
        </button>

        <button
          onClick={() => onSelectTab('subjects')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'subjects'
              ? 'text-brand-900 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Предметы</span>
        </button>

        <button
          onClick={() => onSelectTab('assignments')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'assignments'
              ? 'text-brand-900 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span>Задания</span>
          {tasksCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {tasksCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Все разделы</span>
        </button>
      </div>
    </nav>
  );
};
