import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Bookmark, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  BookOpen,
  Scale,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import topicsData from '../data/topics.json';
import subjectsData from '../data/subjects.json';
import { Topic } from '../types';

interface TopicsPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  selectedTopicId?: string;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  favorites,
  onToggleFavorite,
  selectedTopicId
}) => {
  const [activeTopicId, setActiveTopicId] = useState<string>(() => {
    return selectedTopicId || topicsData[0]?.id || '';
  });

  const [viewMode, setViewMode] = useState<'full' | 'short'>('full');
  const [fontScale, setFontScale] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTopic = useMemo(() => {
    return topicsData.find((t) => t.id === activeTopicId) || topicsData[0];
  }, [activeTopicId]);

  const activeSubject = useMemo(() => {
    if (!activeTopic) return null;
    return subjectsData.find((s) => s.id === activeTopic.subjectId);
  }, [activeTopic]);

  const isFavorited = favorites.includes(activeTopic.id);

  const handleCopy = () => {
    const text = viewMode === 'full' ? activeTopic.fullContent : activeTopic.shortContent;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = viewMode === 'full' ? activeTopic.fullContent : activeTopic.shortContent;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTopic.id}-${viewMode}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Selector & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Topic dropdown */}
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Выберите тему для изучения:
          </label>
          <div className="relative">
            <select
              value={activeTopicId}
              onChange={(e) => setActiveTopicId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {topicsData.map((t) => {
                const sub = subjectsData.find((s) => s.id === t.subjectId);
                return (
                  <option key={t.id} value={t.id}>
                    [{sub?.shortTitle || 'Предмет'}] {t.title}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* View Mode Toggle & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Full / Short Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'full'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Полный конспект
            </button>
            <button
              onClick={() => setViewMode('short')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'short'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Краткий для записи
            </button>
          </div>

          {/* Font size zoom */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFontScale((s) => Math.max(0.85, s - 0.1))}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Уменьшить шрифт"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFontScale(1)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
              title="Сброс масштаба"
            >
              {Math.round(fontScale * 100)}%
            </button>
            <button
              onClick={() => setFontScale((s) => Math.min(1.3, s + 0.1))}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Увеличить шрифт"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => onToggleFavorite(activeTopic.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isFavorited
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={isFavorited ? 'В избранном' : 'Добавить в избранное'}
          >
            <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Копировать текст конспекта"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Скачать .md файл"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Распечатать конспект"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of contents (Left sidebar on lg) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Оглавление конспекта
            </h3>
            <div className="space-y-1.5 text-xs">
              {activeTopic.tableOfContents?.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 dark:hover:text-brand-300 transition-colors truncate"
                >
                  {item.text}
                </a>
              ))}
            </div>

            {/* Legal basis box */}
            {activeTopic.legalBasis && activeTopic.legalBasis.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span>Нормативная база</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {activeTopic.legalBasis.map((lb, i) => (
                    <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      {lb}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reader Document Area (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Header Meta */}
          <div className="pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                {activeSubject?.title || 'Юриспруденция'}
              </span>
              {activeTopic.verifiedStatus && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  ✓ {activeTopic.verifiedStatus}
                </span>
              )}
              {activeTopic.updatedAt && (
                <span className="text-[11px] text-slate-400 ml-auto font-mono">
                  Обновлено: {activeTopic.updatedAt}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {activeTopic.title}
            </h1>

            {activeTopic.sourceNote && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                {activeTopic.sourceNote}
              </div>
            )}
          </div>

          {/* Render content */}
          <div
            className="print-readable prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed"
            style={{ fontSize: `${fontScale}rem` }}
          >
            {viewMode === 'full' ? (
              <div className="space-y-6">
                {activeTopic.fullContent.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('## ')) {
                    const title = paragraph.replace('## ', '');
                    const anchor = activeTopic.tableOfContents?.find((t) => t.text.includes(title.split('.')[0]))?.id;
                    return (
                      <h2
                        key={idx}
                        id={anchor}
                        className="text-xl font-bold text-slate-900 dark:text-white pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 scroll-mt-24"
                      >
                        {title}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('> ')) {
                    return (
                      <blockquote
                        key={idx}
                        className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-sm text-slate-700 dark:text-slate-300 italic"
                      >
                        {paragraph.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={idx} className="text-justify leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="font-bold text-amber-700 dark:text-amber-400 text-sm uppercase tracking-wider mb-2">
                  Краткий конспект для быстрой записи и повторения
                </div>
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {activeTopic.shortContent}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
