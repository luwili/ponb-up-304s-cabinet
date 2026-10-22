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
  Scale
} from 'lucide-react';
import examQuestionsData from '../data/exam-questions.json';
import { ExamCard } from '../types';

interface ExamPrepPageProps {
  knownCards: string[];
  repeatCards: string[];
  onMarkKnown: (id: string) => void;
  onMarkRepeat: (id: string) => void;
  onResetProgress: () => void;
}

export const ExamPrepPage: React.FC<ExamPrepPageProps> = ({
  knownCards,
  repeatCards,
  onMarkKnown,
  onMarkRepeat,
  onResetProgress
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'list'>('cards');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffledCards, setShuffledCards] = useState<ExamCard[]>(examQuestionsData as ExamCard[]);

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

  const knownCount = examQuestionsData.filter((q) => knownCards.includes(q.id)).length;
  const progressPercent = Math.round((knownCount / examQuestionsData.length) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              Экзаменационная сессия · Вопросы и карточки
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Подготовка к зачетам и экзаменам
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Интерактивные карточки «вопрос – ответ», билеты и нормативно-правовая база.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Интерактивные карточки
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Список всех вопросов
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Ваш прогресс изучения: {knownCount} из {examQuestionsData.length} вопросов ({progressPercent}%)
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
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all', label: 'Все предметы' },
          { id: 'ugolov-proc', label: 'Уголовный процесс' },
          { id: 'ugolov-pravo-osob', label: 'Уголовное право' },
          { id: 'fin-pravo', label: 'Финансовое право' },
          { id: 'admin-proc', label: 'Административный процесс' },
          { id: 'grazhd-proc', label: 'Гражданский процесс' },
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

      {/* Cards Mode */}
      {activeTab === 'cards' && currentCard && (
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
      )}

      {/* List Mode */}
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
