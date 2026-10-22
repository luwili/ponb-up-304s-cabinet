import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  X, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Server
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
    setProgressMessage('Подготовка к синхронизации...');

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
        <div className="p-6 bg-gradient-to-r from-brand-900 to-indigo-900 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <RefreshCw className={`w-6 h-6 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-200 text-[11px] font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Официальный API ИСУ УУНиТ</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Синхронизация расписания
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
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Скрипт подключается к базе расписания УУНиТ (<span className="font-mono text-xs text-brand-600 dark:text-brand-400">dev.uust-time.ru</span>), считывает актуальные пары группы ПОНБ-УП-304С, обновляет аудитории и преподавателей, а затем автоматически перезагружает страницу.
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

          {/* Local Mode Notice */}
          {isLocal ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold">Локальный сервер активен.</span> Скрипт <span className="font-mono font-bold">python3 scripts/sync_uust_schedule.py</span> запустится на вашем компьютере и сразу обновит страницу.
              </div>
            </div>
          ) : (
            /* Cloud GitHub Actions configuration */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-brand-600" />
                  <span>GitHub Personal Access Token</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_... или github_pat_..."
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Токен сохраняется в локальном хранилище вашего браузера (требуются права <span className="font-mono">actions:write</span>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Нет токена? Запустите в 1 клик на GitHub:</span>
                <a
                  href={githubActionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-700 dark:text-brand-400 hover:underline flex items-center space-x-1"
                >
                  <span>Открыть Actions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Отмена
            </button>

            <button
              onClick={handleRunSync}
              disabled={loading || (!isLocal && !token.trim())}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                loading || (!isLocal && !token.trim())
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500 hover:scale-105'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Синхронизация...' : 'Запустить и обновить страницу'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
