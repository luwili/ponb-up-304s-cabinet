import React from 'react';
import { HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';
import patronsData from '../data/patrons.json';

export const GratitudePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3 text-brand-700 dark:text-brand-400 mb-3">
          <HeartHandshake className="w-6 h-6" />
          <span className="text-xs uppercase font-bold tracking-wider">
            ПОНБ-УП-304С · Институт права УУНиТ
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Искренняя благодарность
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
          Создание и поддержание учебного кабинета группы ПОНБ-УП-304С состоялось благодаря 
          финансовой помощи и неравнодушному участию. Выражаем искреннюю признательность 
          людям, благодаря которым этот ресурс существует и работает для всех студентов.
        </p>
      </div>

      {/* Benefactors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patronsData.map((patron) => (
          <div
            key={patron.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Финансирование проекта
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {patron.date}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {patron.name}
              </h2>
              <div className="text-xs text-brand-700 dark:text-brand-400 font-medium mb-4">
                {patron.role}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif">
                  {patron.citation}
                </p>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Направление поддержки:
                </div>
                <p className="leading-relaxed">
                  {patron.contribution}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Благодарность от группы ПОНБ-УП-304С</span>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Impact */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Что реализовано благодаря поддержке:</span>
        </h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-brand-600 dark:text-brand-400 font-bold">•</span>
            <span>Автоматическая синхронизация расписания занятий и объявлений с серверами ИСУ УУНиТ.</span>
          </li>
          <li className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-brand-600 dark:text-brand-400 font-bold">•</span>
            <span>Оцифровка и структурирование конспектов лекций по 10 дисциплинам семестра.</span>
          </li>
          <li className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-brand-600 dark:text-brand-400 font-bold">•</span>
            <span>Интерактивные карточки для подготовки к зачётам и экзаменам с правовыми статьями.</span>
          </li>
          <li className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-brand-600 dark:text-brand-400 font-bold">•</span>
            <span>Бесплатный и быстрый доступ к учебным материалам для всех студентов группы 24/7.</span>
          </li>
        </ul>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 italic font-serif">
          «От имени всего коллектива студентов группы ПОНБ-УП-304С — искреннее человеческое спасибо!»
        </div>
      </div>
    </div>
  );
};
