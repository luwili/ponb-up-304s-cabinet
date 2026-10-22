import React, { useEffect, useState } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  Bookmark, 
  Clock, 
  Menu, 
  Shield, 
  Building
} from 'lucide-react';
import { getUfaTimeInfo, UfaTimeInfo } from '../utils/time';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  favoritesCount: number;
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  onOpenSearch,
  onOpenMobileMenu,
  favoritesCount,
  onSelectTab
}) => {
  const [timeInfo, setTimeInfo] = useState<UfaTimeInfo>(getUfaTimeInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getUfaTimeInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: mobile hamburger + brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Открыть меню"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onSelectTab('home')}
              className="flex items-center space-x-2 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm ring-1 ring-brand-800/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                    ПОНБ-УП-304С
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 leading-none">
                    УУНиТ
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:inline-block">
                  Институт права · Уфа
                </span>
              </div>
            </button>
          </div>

          {/* Center section: Live Ufa clock & Pair status */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>{timeInfo.timeString}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">(Уфа, UTC+5)</span>
            </div>

            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

            {timeInfo.currentPairStatus === 'ongoing' ? (
              <span className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Идет {timeInfo.currentPair}-я пара</span>
              </span>
            ) : timeInfo.currentPairStatus === 'break' ? (
              <span className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{timeInfo.pairDetails?.description}</span>
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Занятия завершены
              </span>
            )}
          </div>

          {/* Right section: Search, Favorites, Theme */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title="Поиск по сайту (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поиск...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => onSelectTab('favorites')}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Избранное"
              aria-label="Избранное"
            >
              <Bookmark className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-amber-500" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={darkMode ? "Включить светлую тему" : "Включить тёмную тему"}
              aria-label="Переключить тему"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-brand-900" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
