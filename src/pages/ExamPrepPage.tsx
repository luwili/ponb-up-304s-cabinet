import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  RotateCw, 
  Check, 
  X, 
  Shuffle, 
  ListFilter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Scale,
  Calendar,
  Layers,
  FileCheck2,
  Clock,
  ArrowRight
} from 'lucide-react';
import examQuestionsData from '../data/exam-questions.json';
import sessionData from '../data/session.json';
import { ExamCard } from '../types';

interface ExamPrepPageProps {
  knownCards: string[];
  repeatCards: string[];
  onMarkKnown: (id: string) => void;
  onMarkRepeat: (id: string) => void;
  onResetProgress: () => void;
  onNavigateSubject?: (subjectId: string) => void;
  onNavigateTopic?: (topicId: string) => void;
}

export const ExamPrepPage: React.FC<ExamPrepPageProps> = ({
  knownCards,
  repeatCards,
  onMarkKnown,
  onMarkRepeat,
  onResetProgress,
  onNavigateSubject,
  onNavigateTopic
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'cards' | 'list'>('session');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffledCards, setShuffledCards] = useState<ExamCard[]>(examQuestionsData as ExamCard[]);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    if (selectedSubject === 'all') return shuffledCards;
    return shuffledCards.filter((c) => c.subjectId === selectedSubject);
  }, [shuffledCards, selectedSubject]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleShuffle = () => {
    const arr = [...filteredCards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledCards(arr);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleStartExamStudy = (subjectKey: string) => {
    const mapToSubjectId: Record<string, string> = {
      'финансовое': 'fin-pravo',
      'экологическое': 'eco-pravo',
      'гражданское право (часть 2)': 'grazhd-pravo-2',
      'уголовное право': 'ugolov-pravo-osob',
      'административный': 'admin-proc',
      'уголовный процесс': 'ugolov-proc',
      'гражданский процесс': 'grazhd-proc'
    };

    let targetId = 'all';
    for (const [k, v] of Object.entries(mapToSubjectId)) {
      if (subjectKey.toLowerCase().includes(k)) {
        targetId = v;
        break;
      }
    }
    setSelectedSubject(targetId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setActiveTab('cards');
  };

  const knownCount = examQuestionsData.filter((q) => knownCards.includes(q.id)).length;
  const progressPercent = Math.round((knownCount / examQuestionsData.length) * 100);

  const session = sessionData.currentSession;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Зимняя сессия 2026/2027 · Официальный учебный план</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Экзамены, зачёты и подготовка
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Учебный план группы {sessionData.group}, формы итогового контроля и банк билетов для самопроверки.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start lg:self-auto gap-1">
            <button
              onClick={() => setActiveTab('session')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'session'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Сессия и план ({session.examsCount + session.creditsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-brand-500" />
              <span>Карточки вопросов</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-500" />
              <span>Все билеты ({examQuestionsData.length})</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">Курс и семестр</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {sessionData.course} курс · {sessionData.currentSemester} семестр
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">Экзамены сессии</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {session.examsCount} экзамена
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">Зачёты сессии</span>
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
              {session.creditsCount} зачётов
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5">Всего дисциплин</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
              <Layers className="w-4 h-4" />
              <span>{session.totalDisciplines} предметов</span>
            </span>
          </div>
        </div>

        {/* Progress Bar (Cards progress) */}
        {activeTab !== 'session' && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Прогресс усвоения билетов: {knownCount} из {examQuestionsData.length} вопросов ({progressPercent}%)
              </span>
              <button
                onClick={onResetProgress}
                className="text-slate-400 hover:text-slate-600 text-[11px] underline"
              >
                Сбросить отметки
              </button>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: OFFICIAL SESSION & CURRICULUM */}
      {activeTab === 'session' && (
        <div className="space-y-8">
          {/* Section: Exams */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Итоговая аттестация · {session.examsCount} дисциплины
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Экзамены зимней сессии (5 семестр)
                </h2>
              </div>
              <span className="hidden sm:inline text-xs text-slate-400 font-mono">
                Группа {sessionData.group}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-900/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                        Экзамен
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                        {exam.credits} з.е. ({exam.hours.total}ч)
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {exam.subject}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-start space-x-1.5">
                        <span className="text-slate-400 flex-shrink-0">Преподаватель:</span>
                        <span className="font-medium">{exam.teacher}</span>
                      </div>
                      <div className="flex items-start space-x-1.5">
                        <span className="text-slate-400 flex-shrink-0">Кафедра:</span>
                        <span className="text-slate-500 dark:text-slate-400">{exam.department}</span>
                      </div>
                    </div>

                    {/* Hours breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Лекции: <strong className="text-slate-700 dark:text-slate-200">{exam.hours.lectures}ч</strong></span>
                      <span>Практика: <strong className="text-slate-700 dark:text-slate-200">{exam.hours.practice}ч</strong></span>
                      <span>СРС: <strong className="text-slate-700 dark:text-slate-200">{exam.hours.self}ч</strong></span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Итоговый экзамен 5 семестра
                    </span>

                    <button
                      onClick={() => handleStartExamStudy(exam.subject)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors flex items-center space-x-1"
                    >
                      <span>Учить билеты</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Credits (Зачёты) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Промежуточная аттестация · {session.creditsCount} дисциплин
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Зачёты зимней сессии (5 семестр)
                </h2>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {session.credits.map((cr, idx) => (
                  <div
                    key={cr.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            {cr.subject}
                          </h4>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {cr.credits} з.е.
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Преподаватель: {cr.teacher}</span>
                          <span>•</span>
                          <span>Кафедра: {cr.department}</span>
                          <span>•</span>
                          <span>Лек: {cr.hours.lectures}ч, Прак: {cr.hours.practice}ч, СРС: {cr.hours.self}ч</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-center pl-9 sm:pl-0">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                        {cr.controlType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Full Curriculum History (Semesters 1-10) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                  Учебный план специальности
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Дисциплины и формы контроля (Семестры 1–10)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Группа {sessionData.group} · {sessionData.specialty}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((sNum) => {
                const isCurrent = sNum === '5';
                const isSelected = expandedSemester === sNum;
                const courseNum = Math.ceil(parseInt(sNum) / 2);
                return (
                  <button
                    key={sNum}
                    onClick={() => setExpandedSemester(isSelected ? null : sNum)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-white ring-2 ring-brand-500/20'
                        : isCurrent
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {isCurrent ? 'Текущий семестр' : `${courseNum} курс`}
                    </div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {sNum} семестр
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded Semester Details */}
            {expandedSemester && sessionData.allSemesters[expandedSemester as keyof typeof sessionData.allSemesters] && (
              <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Дисциплины {expandedSemester} семестра:</span>
                  <button
                    onClick={() => setExpandedSemester(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Свернуть
                  </button>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60 text-xs">
                  {sessionData.allSemesters[expandedSemester as keyof typeof sessionData.allSemesters].map((disc, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {disc.title}
                        <span className="text-slate-400 ml-2 font-mono">({disc.credits} з.е.)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {disc.controls.map((ctrlType, cIdx) => (
                          <span
                            key={cIdx}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              ctrlType.includes('Экзамен')
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                                : ctrlType.includes('Курсов')
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                                : 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40'
                            }`}
                          >
                            {ctrlType}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE FLASHCARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          {/* Subject Filter Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
            {[
              { id: 'all', label: 'Все предметы' },
              { id: 'fin-pravo', label: 'Финансовое право' },
              { id: 'eco-pravo', label: 'Экологическое право' },
              { id: 'ugolov-pravo-osob', label: 'Уголовное право' },
              { id: 'grazhd-proc', label: 'Гражданский процесс' },
              { id: 'ugolov-proc', label: 'Уголовный процесс' },
              { id: 'admin-proc', label: 'Административный процесс' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedSubject(f.id);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedSubject === f.id
                    ? 'bg-brand-900 text-white dark:bg-brand-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {currentCard ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Card Meta & Navigation */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">
                  Вопрос {currentIndex + 1} из {filteredCards.length}
                </span>
                <button
                  onClick={handleShuffle}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Перемешать</span>
                </button>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[320px] rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 hover:border-brand-500"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                      {currentCard.subjectName}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      {isFlipped ? 'ОТВЕТ' : 'ВОПРОС (нажмите для ответа)'}
                    </span>
                  </div>

                  {!isFlipped ? (
                    <div className="pt-6">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                        {currentCard.question}
                      </h2>
                      <p className="text-xs text-slate-400 mt-6 italic">
                        Нажмите на карточку, чтобы перевернуть и увидеть правильный ответ и закон.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-4 animate-fadeIn">
                      <div className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed text-justify">
                        {currentCard.answer}
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 font-semibold flex items-center space-x-2">
                        <Scale className="w-4 h-4 flex-shrink-0" />
                        <span>Нормативная основа: {currentCard.legalBasis}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Кликните для переворота</span>
                  </span>

                  {knownCards.includes(currentCard.id) && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Усвоено</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Answer grading & Navigation buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === filteredCards.length - 1}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Далее</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onMarkRepeat(currentCard.id);
                      handleNext();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs hover:bg-amber-200 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Повторить позже</span>
                  </button>
                  <button
                    onClick={() => {
                      onMarkKnown(currentCard.id);
                      handleNext();
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Знаю вопрос</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              По выбранному фильтру вопросов не найдено.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIST OF ALL QUESTIONS */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {filteredCards.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase">
                      {q.subjectName}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {q.question}
                    </h3>
                  </div>
                </div>

                {knownCards.includes(q.id) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400">
                    Усвоено
                  </span>
                )}
              </div>

              <div className="pl-10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {q.answer}
              </div>

              <div className="pl-10 pt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Норма: {q.legalBasis}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
