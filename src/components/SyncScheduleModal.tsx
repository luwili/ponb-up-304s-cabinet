import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Server,
  Lock,
  Sparkles
} from 'lucide-react';
import { 
  getSavedGithubToken, 
  saveGithubToken, 
  requestScheduleUpdate,
  REPO_OWNER,
  REPO_NAME,
  WORKFLOW_ID 
} from '../utils/scheduleSync';

interface SyncScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncScheduleModal: React.FC<SyncScheduleModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocal(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      setToken(getSavedGithubToken());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    setProgressMessage('Подключение к ИСУ УУНиТ...');

    try {
      await requestScheduleUpdate(token, (msg) => {
        setProgressMessage(msg);
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Произошла ошибка при запуске синхронизации.');
      setLoading(false);
    }
  };

  const githubActionsUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-brand-950 via-brand-900 to-indigo-950 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <RefreshCw className={`w-6 h-6 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-200 text-[11px] font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Личный кабинет ИСУ УУНиТ</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Обновление расписания
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Privacy badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <span className="font-bold">Безопасность данных:</span> Ваш логин и пароль от ИСУ УУНиТ зашифрованы в <span className="font-semibold">GitHub Actions Secrets</span>. Никто из посетителей сайта или репозитория не имеет к ним доступа. Скрипт выполняется в защищённой облачной среде.
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Скрипт авторизуется в ИСУ УУНиТ (<span className="font-mono text-xs text-brand-600 dark:text-brand-400">isu.uust.ru</span>), считывает все пары недели для группы ПОНБ-УП-304С, обновляет аудитории и преподавателей, после чего страница автоматически обновляется.
          </p>

          {/* Status/Progress Box */}
          {loading && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/80 flex items-center space-x-3.5 animate-pulse">
              <RefreshCw className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-spin flex-shrink-0" />
              <div className="text-xs sm:text-sm font-semibold text-brand-900 dark:text-brand-200">
                {progressMessage}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Main Action based on environment */}
          {isLocal ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                <Server className="w-4 h-4 text-brand-600" />
                <span>Локальный сервер активен. Скрипт будет запущен на вашем компьютере.</span>
              </div>

              <button
                onClick={handleRunSync}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Синхронизация...' : 'Запустить синхронизацию'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* One-click Action button via GitHub interface */}
              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 space-y-3">
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Для запуска обновления нажмите кнопку ниже — откроется страница GitHub Actions, где нужно нажать <span className="font-bold text-brand-700 dark:text-brand-300">«Run workflow»</span>:
                </div>

                <a
                  href={githubActionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95"
                >
                  <span>Запустить обновление в GitHub Actions (1 клик)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Optional background sync via token */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>{showTokenInput ? 'Скрыть расширенные настройки' : 'Фоновое обновление без перехода на GitHub (опционально)'}</span>
                </button>

                {showTokenInput && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="GitHub PAT (ghp_...)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={handleRunSync}
                      disabled={loading || !token.trim()}
                      className="w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-700 text-xs font-bold disabled:opacity-50"
                    >
                      {loading ? 'Синхронизация...' : 'Запустить в фоне'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer close button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
