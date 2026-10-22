import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  FileSpreadsheet, 
  Upload, 
  Search, 
  Eye, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StudentRosterItem } from '../types';

export const RosterPage: React.FC = () => {
  const [localStudents, setLocalStudents] = useState<StudentRosterItem[]>([]);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.students && Array.isArray(parsed.students)) {
          setLocalStudents(parsed.students);
          setErrorMessage('');
        } else if (Array.isArray(parsed)) {
          setLocalStudents(parsed);
          setErrorMessage('');
        } else {
          setErrorMessage('Файл должен содержать массив студентов или объект с полем "students".');
        }
      } catch (err) {
        setErrorMessage('Ошибка чтения JSON. Убедитесь, что выбран корректный файл private-data/roster.json');
      }
    };
    reader.readAsText(file);
  };

  const filtered = localStudents.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || (s.recordBook && s.recordBook.includes(q)) || (s.isuId && s.isuId.includes(q));
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
              Учебная группа института
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Группа ПОНБ-УП-304С
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Специальность «Правовое обеспечение национальной безопасности» · 3 курс (5 семестр).
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-900 dark:text-brand-300">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Очная форма обучения</span>
          </div>
        </div>
      </div>

      {/* Curator Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-brand-850 to-slate-900 text-white shadow-md border border-brand-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10 font-bold text-lg">
            РН
          </div>
          <div>
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              Куратор группы
            </div>
            <div className="text-lg font-bold text-white">
              Нурмухаметов Руслан Наилевич
            </div>
            <div className="text-xs text-slate-300">
              Старший преподаватель кафедры уголовного права и процесса
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 sm:text-right">
          <div>Аудитория 107</div>
          <div className="text-slate-400">ул. Достоевского, 131</div>
        </div>
      </div>

      {/* Privacy Notice (Requirements 4, 10 & 11) */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Защита персональных данных студентов (Политика конфиденциальности)
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              В соответствии с требованиями безопасности и политикой хостинга GitHub Pages, по умолчанию <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-xs">publishRoster: false</code>. Персональные данные студентов (ФИО, ISU ID, номера зачеток) хранятся исключительно в локальной защищенной папке <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-xs">private-data/</code>, исключены из репозитория Git (.gitignore) и не включаются в публичный бандл сайта.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Для локального просмотра списка вы можете выбрать файл <span className="font-mono font-bold">private-data/roster.json</span> в браузере (чтение происходит на вашем компьютере без отправки в сеть):
          </div>

          <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer hover:bg-amber-100/50 shadow-xs flex-shrink-0">
            <Upload className="w-4 h-4" />
            <span>Выбрать private-data/roster.json</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Local Client-side Roster Viewer (if file loaded) */}
      {localStudents.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Локальный список группы ({localStudents.length} студентов)
              </h3>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по студентам..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">№</th>
                  <th className="py-2.5 px-3">ФИО студента</th>
                  <th className="py-2.5 px-3">Номер зачетной книжки</th>
                  <th className="py-2.5 px-3">ISU ID</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.num || s.fullName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{s.num}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{s.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.recordBook || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.isuId || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                        {s.budgetStatus || 'Обучающийся'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Info className="w-8 h-8 mx-auto text-slate-400 mb-1" />
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            Список группы защищен и не отображается в открытом доступе
          </div>
          <div className="text-xs text-slate-500 max-w-md mx-auto">
            Для просмотра локально выберите файл <span className="font-mono">private-data/roster.json</span> в блоке выше.
          </div>
        </div>
      )}
    </div>
  );
};
