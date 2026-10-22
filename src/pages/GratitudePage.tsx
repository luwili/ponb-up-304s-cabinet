import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Award, 
  Crown, 
  Sparkles, 
  Medal, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  Share2, 
  Calendar,
  BookOpen,
  Zap,
  GraduationCap
} from 'lucide-react';
import patronsData from '../data/patrons.json';
import { getStoredItem, setStoredItem } from '../utils/storage';

const STORAGE_HEARTS_KEY = 'ponb_patrons_hearts_v1';

export const GratitudePage: React.FC = () => {
  const [heartsMap, setHeartsMap] = useState<Record<string, number>>(() => {
    return getStoredItem<Record<string, number>>(STORAGE_HEARTS_KEY, {
      'patron-1': 48,
      'patron-2': 46
    });
  });

  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const handleSendHeart = (patronId: string) => {
    if (hasVoted[patronId]) return;
    
    setHeartsMap((prev) => {
      const updated = {
        ...prev,
        [patronId]: (prev[patronId] || 0) + 1
      };
      setStoredItem(STORAGE_HEARTS_KEY, updated);
      return updated;
    });

    setHasVoted((prev) => ({ ...prev, [patronId]: true }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-amber-500/30">
        {/* Decorative Golden Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm shadow-sm">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Зал почёта и признания</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Искренняя благодарность
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Создание и развитие независимого учебного кабинета группы{' '}
            <span className="font-semibold text-amber-300">ПОНБ-УП-304С</span>{' '}
            Института права УУНиТ стало возможным благодаря неоценимой финансовой 
            поддержке, доверию и неравнодушию наших главных благотворителей.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Ссылка скопирована!' : 'Поделиться страницей'}</span>
            </button>
            <div className="text-xs text-amber-200/80 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Навечно в истории нашей учебной группы</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Benefactors / Персональные карточки спонсоров */}
      <div>
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Medal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Главные меценаты и спонсоры проекта
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Выражаем глубочайшее уважение и признательность за финансовый вклад в образование
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patronsData.map((patron, idx) => {
            const isIvanova = patron.id === 'patron-1';
            const initials = isIvanova ? 'ИЯС' : 'НВВ';
            const hearts = heartsMap[patron.id] || (isIvanova ? 48 : 46);
            const voted = hasVoted[patron.id];

            return (
              <div
                key={patron.id}
                className="relative rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 dark:border-amber-500/30 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Top Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
                    isIvanova 
                      ? 'from-amber-400 via-rose-400 to-indigo-500' 
                      : 'from-blue-500 via-indigo-500 to-amber-400'
                  }`}
                />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-sm">
                      <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-current" />
                      <span>{patron.badge}</span>
                    </span>

                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{patron.tier}</span>
                    </span>
                  </div>

                  {/* Patron Name and Avatar */}
                  <div className="flex items-center space-x-4 mb-5">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg bg-gradient-to-br ring-4 ring-amber-300/40 dark:ring-amber-500/20 ${
                        isIvanova
                          ? 'from-amber-500 via-rose-500 to-indigo-600'
                          : 'from-blue-600 via-indigo-600 to-amber-500'
                      }`}
                    >
                      {initials}
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {patron.name}
                      </h3>
                      <div className="text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-400 mt-1">
                        {patron.role}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {patron.status}
                      </div>
                    </div>
                  </div>

                  {/* Official Citation of Honor */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 mb-5 relative">
                    <div className="text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Официальное признание заслуг</span>
                    </div>
                    <blockquote className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      «{patron.citation}»
                    </blockquote>
                  </div>

                  {/* Contribution breakdown */}
                  <div className="space-y-2 mb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Вклад в проект:</span>
                    </div>
                    <p className="pl-5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {patron.contribution}
                    </p>
                  </div>
                </div>

                {/* Footer with Heart Counter */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Дата внесения в реестр: {patron.date}
                  </div>

                  <button
                    onClick={() => handleSendHeart(patron.id)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      voted
                        ? 'bg-rose-500 text-white cursor-default'
                        : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:scale-105 active:scale-95'
                    }`}
                    title="Выразить личную благодарность от студента"
                  >
                    <Heart className={`w-3.5 h-3.5 ${voted ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                    <span>{voted ? 'Спасибо!' : 'Сказать спасибо'}</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                      {hearts}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate of Honor / Памятная Грамота */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 dark:from-slate-900 dark:via-slate-850 dark:to-brand-950/60 border-2 border-amber-300 dark:border-amber-700/60 p-6 sm:p-10 shadow-lg text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Почётная грамота признательности
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            С благодарностью от всех студентов ПОНБ-УП-304С
          </h3>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            Настоящим удостоверяется, что <strong>Иванова Яна Сергеевна</strong> и{' '}
            <strong>Николаев Владислав Викторович</strong> внесли определяющий вклад 
            в реализацию проекта, проявив бескорыстную заботу об удобстве, академической 
            успеваемости и сплочённости нашей учебной группы.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-amber-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Специальность:</span>{' '}
              40.05.01 Правовое обеспечение нацбезопасности
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Институт:</span>{' '}
              Институт права УУНиТ (г. Уфа)
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Год:</span> 2026
            </div>
          </div>
        </div>
      </div>

      {/* What was achieved thanks to funding / Результаты поддержки */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          Что стало возможным благодаря финансированию:
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Каждый рубль был вложен в пользу и удобство студентов группы
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Синхронизация с ИСУ
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Прямая автоматическая интеграция расписания и объявлений с серверами isu.uust.ru без задержек.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              28 конспектов лекций
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Оцифровка архива лекций по всем 10 профильным предметам специальности национальной безопасности.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Экзаменационные карты
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Интерактивный тренажёр для повторения вопросов к сессии со статьями УК, ГК, АПК и УПК РФ.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Сайт доступен всем
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Бесплатная, открытая по ссылке веб-площадка без сторонней рекламы, доступная с любого смартфона.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
