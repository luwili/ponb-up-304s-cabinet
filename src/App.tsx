import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { SearchModal } from './components/SearchModal';
import { SyncScheduleModal } from './components/SyncScheduleModal';

import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TopicsPage } from './pages/TopicsPage';
import { ExamPrepPage } from './pages/ExamPrepPage';
import { TeachersPage } from './pages/TeachersPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { InstitutePage } from './pages/InstitutePage';
import { FavoritesPage } from './pages/FavoritesPage';

import { 
  getStoredItem, 
  setStoredItem, 
  STORAGE_KEYS 
} from './utils/storage';

export function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = getStoredItem<string | null>(STORAGE_KEYS.THEME, null);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Navigation tab state (synced with URL hash)
  const getTabFromHash = (): string => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const tabName = hash.split('?')[0];
    const validTabs = [
      'home', 'schedule', 'subjects', 'topics', 
      'exam', 'teachers', 'departments', 
      'institute', 'favorites'
    ];
    return validTabs.includes(tabName) ? tabName : 'home';
  };

  const [currentTab, setCurrentTab] = useState<string>(getTabFromHash);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // User Local State
  const [favorites, setFavorites] = useState<string[]>(() => {
    return getStoredItem<string[]>(STORAGE_KEYS.FAVORITES, ['gp-para-1', 'gpp-para-1', 'ugolov-t1']);
  });

  const [knownCards, setKnownCards] = useState<string[]>(() => {
    return getStoredItem<string[]>(STORAGE_KEYS.EXAM_KNOWN, ['eq-4']);
  });

  const [repeatCards, setRepeatCards] = useState<string[]>(() => {
    return getStoredItem<string[]>(STORAGE_KEYS.EXAM_REPEAT, []);
  });

  // Sync dark mode with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      setStoredItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      setStoredItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [darkMode]);

  // Sync hash changes (browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = `/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setStoredItem(STORAGE_KEYS.FAVORITES, next);
      return next;
    });
  };

  const handleMarkKnown = (id: string) => {
    setKnownCards((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setStoredItem(STORAGE_KEYS.EXAM_KNOWN, next);
      return next;
    });
    setRepeatCards((prev) => {
      const next = prev.filter((x) => x !== id);
      setStoredItem(STORAGE_KEYS.EXAM_REPEAT, next);
      return next;
    });
  };

  const handleMarkRepeat = (id: string) => {
    setRepeatCards((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setStoredItem(STORAGE_KEYS.EXAM_REPEAT, next);
      return next;
    });
    setKnownCards((prev) => {
      const next = prev.filter((x) => x !== id);
      setStoredItem(STORAGE_KEYS.EXAM_KNOWN, next);
      return next;
    });
  };

  const handleResetExamProgress = () => {
    setKnownCards([]);
    setRepeatCards([]);
    setStoredItem(STORAGE_KEYS.EXAM_KNOWN, []);
    setStoredItem(STORAGE_KEYS.EXAM_REPEAT, []);
  };

  // Cross-page navigation handlers
  const handleNavigateTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    handleSelectTab('topics');
  };

  const handleNavigateSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    handleSelectTab('subjects');
  };

  const handleNavigateTeacher = (teacherName: string) => {
    setTeacherSearchQuery(teacherName);
    handleSelectTab('teachers');
  };

  const handleSelectDepartment = (deptName: string) => {
    setTeacherSearchQuery(deptName);
    handleSelectTab('teachers');
  };

  const handleGlobalNavigate = (tab: string, itemId?: string) => {
    if (tab === 'topics' && itemId) setSelectedTopicId(itemId);
    if (tab === 'subjects' && itemId) setSelectedSubjectId(itemId);
    if (tab === 'teachers' && itemId) setTeacherSearchQuery('');
    handleSelectTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        favoritesCount={favorites.length}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          favoritesCount={favorites.length}
        />

        {/* Content Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full overflow-hidden">
          {currentTab === 'home' && (
            <HomePage 
              onNavigate={handleSelectTab} 
              onOpenSync={() => setSyncModalOpen(true)}
            />
          )}

          {currentTab === 'schedule' && (
            <SchedulePage
              onNavigateTeacher={handleNavigateTeacher}
              onNavigateSubject={handleNavigateSubject}
              onOpenSync={() => setSyncModalOpen(true)}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsPage
              onNavigateTopic={handleNavigateTopic}
              onNavigateTeacher={handleNavigateTeacher}
              selectedSubjectId={selectedSubjectId}
            />
          )}

          {currentTab === 'topics' && (
            <TopicsPage
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              selectedTopicId={selectedTopicId}
            />
          )}

          {currentTab === 'exam' && (
            <ExamPrepPage
              knownCards={knownCards}
              repeatCards={repeatCards}
              onMarkKnown={handleMarkKnown}
              onMarkRepeat={handleMarkRepeat}
              onResetProgress={handleResetExamProgress}
            />
          )}

          {currentTab === 'teachers' && (
            <TeachersPage
              initialSearch={teacherSearchQuery}
              onNavigateSubject={handleNavigateSubject}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsPage
              onSelectDepartment={handleSelectDepartment}
            />
          )}

          {currentTab === 'institute' && (
            <InstitutePage />
          )}

          {currentTab === 'favorites' && (
            <FavoritesPage
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigateTopic={handleNavigateTopic}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Неофициальный учебный кабинет группы ПОНБ-УП-304С
            </span>
            <span className="mx-2 hidden sm:inline">·</span>
            <span>Институт права УУНиТ (г. Уфа)</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://law-bsu.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 dark:text-brand-400 hover:underline"
            >
              Официальный сайт института (law-bsu.ru)
            </a>
            <span>·</span>
            <span className="text-slate-400">Часовой пояс: Asia/Yekaterinburg (UTC+5)</span>
          </div>
        </div>
      </footer>

      {/* Bottom bar for mobile smartphones */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleGlobalNavigate}
      />

      {/* Sync Schedule Modal */}
      <SyncScheduleModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />
    </div>
  );
}
