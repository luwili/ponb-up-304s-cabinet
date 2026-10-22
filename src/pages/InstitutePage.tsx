import React from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Users, 
  Scale, 
  BookOpen, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import instituteData from '../data/institute.json';

export const InstitutePage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
          Федеральное государственное бюджетное образовательное учреждение
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Институт права УУНиТ (г. Уфа)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          {instituteData.fullName}. Ведущий научно-образовательный центр правоведения Республики Башкортостан.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>г. Уфа, Республика Башкортостан</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <a href="https://law-bsu.ru/" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-700 dark:text-brand-400">
              law-bsu.ru
            </a>
          </div>
          <div className="flex items-center space-x-1.5">
            <Phone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>8-987-103-80-00</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>institutprava@uust.ru</span>
          </div>
        </div>
      </div>

      {/* Campuses & Buildings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 w-fit">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Главный корпус Института права
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Здесь проходят все семинарские и лекционные занятия группы ПОНБ-УП-304С, расположены кафедры, дирекция, криминалистический полигон и учебные залы судебных заседаний.
          </p>
          <div className="pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{instituteData.address}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Главный кампус УУНиТ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ректорат Уфимского университета науки и технологий, университетская научная библиотека, спорткомплекс и актовые залы.
          </p>
          <div className="pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{instituteData.secondCampus}</span>
          </div>
        </div>
      </div>

      {/* Official Verified Student Links */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Официальные разделы сайта law-bsu.ru
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Расписание занятий',
              desc: 'Официальные расписания всех курсов и сессий',
              url: 'https://law-bsu.ru/schedules',
              icon: Calendar
            },
            {
              title: 'Заказ справок онлайн',
              desc: 'Официальная форма заказа справок об обучении',
              url: 'https://law-bsu.ru/spravki',
              icon: FileText
            },
            {
              title: 'Кафедры института',
              desc: 'Официальные страницы всех 8 кафедр и преподавателей',
              url: 'https://law-bsu.ru/kafedry',
              icon: Building
            },
            {
              title: 'Учебная документация',
              desc: 'Учебные планы, фонды оценочных средств, практика',
              url: 'https://law-bsu.ru/practice',
              icon: BookOpen
            },
            {
              title: 'Студенческое самоуправление',
              desc: 'Студенческий совет, СНО, профбюро Института права',
              url: 'https://law-bsu.ru/clubs',
              icon: Users
            },
            {
              title: 'Специалитет ПОНБ',
              desc: 'Специальность Правовое обеспечение нацбезопасности',
              url: 'https://law-bsu.ru/specialitet',
              icon: ShieldCheck
            },
            {
              title: 'Научная деятельность',
              desc: 'Конференции, сборники научных статей, аспирантура',
              url: 'https://law-bsu.ru/nauka',
              icon: GraduationCap
            },
            {
              title: 'Контакты и приемная',
              desc: 'Часы приема дирекции, деканатов и отделов',
              url: 'https://law-bsu.ru/contacts',
              icon: Phone
            },
            {
              title: 'Дирекция института',
              desc: 'Руководство Института права УУНиТ',
              url: 'https://law-bsu.ru/directors',
              icon: Users
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-start justify-between group"
              >
                <div className="flex items-start space-x-3 truncate">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors flex-shrink-0 ml-2 mt-1" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Federal Legal Portals */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-500" />
          <span>Государственные правовые порталы и справочные правовые системы</span>
        </h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { name: 'Официальный интернет-портал правовой информации (pravo.gov.ru)', url: 'http://pravo.gov.ru/' },
            { name: 'СПС КонсультантПлюс', url: 'http://www.consultant.ru/' },
            { name: 'СПС Гарант', url: 'https://www.garant.ru/' },
            { name: 'Судебные и нормативные акты РФ (СудАкт)', url: 'https://sudact.ru/' },
            { name: 'Верховный Суд РФ', url: 'https://vsrf.ru/' },
            { name: 'ГАС «Правосудие»', url: 'https://sudrf.ru/' },
          ].map((portal, i) => (
            <a
              key={i}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:border-brand-500 hover:text-brand-600 transition-colors inline-flex items-center space-x-1"
            >
              <span>{portal.name}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
