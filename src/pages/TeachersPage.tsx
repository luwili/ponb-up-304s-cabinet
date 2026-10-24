import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Building2, 
  GraduationCap, 
  Award, 
  ExternalLink, 
  Star, 
  BookOpen,
  Filter,
  Phone,
  Mail,
  MapPin,
  X,
  Calendar,
  ChevronRight,
  Clock,
  Sparkles,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import teachersData from '../data/teachers.json';
import departmentsData from '../data/departments.json';
import { Teacher } from '../types';

interface TeachersPageProps {
  initialSearch?: string;
  onNavigateSubject?: (subjectId: string) => void;
}

interface FullscreenPhotoState {
  url: string;
  fallbackUrl?: string;
  name: string;
  department?: string;
  position?: string;
}

const resolvePhotoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleaned = url.startsWith('/') ? url.slice(1) : url;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${cleaned}` : `${base}/${cleaned}`;
};

export const TeachersPage: React.FC<TeachersPageProps> = ({
  initialSearch = '',
  onNavigateSubject
}) => {
  const [tab, setTab] = useState<'group' | 'all'>('group');
  const [search, setSearch] = useState(initialSearch);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDegree, setSelectedDegree] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<FullscreenPhotoState | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenPhoto) {
          setFullscreenPhoto(null);
        } else if (selectedTeacher) {
          setSelectedTeacher(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenPhoto, selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher || fullscreenPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedTeacher, fullscreenPhoto]);

  const groupTeachersCount = teachersData.filter((t) => t.isGroupTeacher).length;

  const filteredTeachers = useMemo(() => {
    return (teachersData as Teacher[]).filter((t) => {
      if (tab === 'group' && !t.isGroupTeacher) return false;
      if (selectedDept !== 'all' && t.department !== selectedDept) return false;

      if (selectedDegree === 'doctor' && !t.degree.toLowerCase().includes('доктор')) return false;
      if (selectedDegree === 'kandidat' && !t.degree.toLowerCase().includes('кандидат')) return false;

      if (search) {
        const qNorm = (search || '').toLowerCase().replace(/ё/g, 'е').replace(/зз/g, 'з').trim();
        const searchWords = qNorm.split(/[\s/(),]+/).filter((w) => w.length > 2);
        const tNameNorm = t.name.toLowerCase().replace(/ё/g, 'е').replace(/зз/g, 'з');
        const tDeptNorm = t.department.toLowerCase().replace(/ё/g, 'е');
        const tPosNorm = t.position.toLowerCase().replace(/ё/g, 'е');
        const tIntNorm = (t.interests || '').toLowerCase().replace(/ё/g, 'е');
        const tRoleNorm = (t.groupRole || '').toLowerCase().replace(/ё/g, 'е');
        const tSubjNorm = (t.groupSubjects || []).join(' ').toLowerCase().replace(/ё/g, 'е');

        const matchesFull = (
          tNameNorm.includes(qNorm) ||
          tDeptNorm.includes(qNorm) ||
          tPosNorm.includes(qNorm) ||
          tIntNorm.includes(qNorm) ||
          tRoleNorm.includes(qNorm) ||
          tSubjNorm.includes(qNorm)
        );

        const matchesWords = searchWords.length > 0 && searchWords.some((w) => tNameNorm.includes(w) || tSubjNorm.includes(w));

        return matchesFull || matchesWords;
      }
      return true;
    });
  }, [tab, selectedDept, selectedDegree, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
              Профессорско-преподавательский состав
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Справочник преподавателей
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Официальные подтвержденные данные сайта Института права УУНиТ (law-bsu.ru).
            </p>
          </div>

          {/* Group vs All Tab Switch */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTab('group')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                tab === 'group'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Наша группа ({groupTeachersCount})</span>
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Весь институт ({teachersData.length})
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО, интересам..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 truncate"
            >
              <option value="all">Все кафедры института</option>
              {departmentsData.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Все ученые степени</option>
              <option value="doctor">Доктора юридических наук</option>
              <option value="kandidat">Кандидаты юридических наук</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Преподаватели по указанным критериям не найдены.
          </div>
        ) : (
          filteredTeachers.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTeacher(t)}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 group ${
                t.isGroupTeacher
                  ? 'border-brand-300 dark:border-brand-800 ring-1 ring-brand-400/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Photo Thumbnail, Badges & Group connection */}
                <div className="flex items-start space-x-3.5 mb-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shadow-sm">
                    {t.photoUrl ? (
                      <img
                        src={resolvePhotoUrl(t.photoUrl)}
                        alt={t.name}
                        className="w-full h-full object-cover object-top block"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (t.fallbackPhotoUrl && target.src !== t.fallbackPhotoUrl) {
                            target.src = t.fallbackPhotoUrl;
                          } else {
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.photo-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`photo-fallback w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm ${
                        t.photoUrl ? 'hidden' : ''
                      }`}
                    >
                      {t.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {t.position}
                      </span>

                      {t.isGroupTeacher && (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          <span>{t.groupRole || 'Преподаватель нашей группы'}</span>
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {t.name}
                    </h3>

                    <div className="text-xs text-brand-700 dark:text-brand-400 font-semibold truncate mt-0.5">
                      {t.department}
                    </div>
                  </div>
                </div>

                {/* Subjects for group */}
                {t.isGroupTeacher && t.groupSubjects.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/60 text-xs">
                    <span className="font-bold text-brand-900 dark:text-brand-300">Ведет у группы: </span>
                    <span className="text-slate-700 dark:text-slate-300">{t.groupSubjects.join(', ')}</span>
                  </div>
                )}

                {/* Degrees & titles */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {t.degree && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-medium">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{t.degree}</span>
                    </span>
                  )}
                  {t.academicTitle && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-medium">
                      {t.academicTitle}
                    </span>
                  )}
                </div>

                {/* Interests */}
                {t.interests && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Научные интересы: </span>
                    <span>{t.interests}</span>
                  </div>
                )}

                {/* Awards */}
                {t.awards && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-1.5 line-clamp-1">
                    <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{t.awards}</span>
                  </div>
                )}

                {/* Contacts & ISU details */}
                {(t.phone || t.email || t.room || t.isuPersonId) && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {t.isuPersonId && (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                        ИСУ ID: {t.isuPersonId}
                      </span>
                    )}
                    {t.room && (
                      <span className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{t.room}</span>
                      </span>
                    )}
                    {t.phone && (
                      <span className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{t.phone}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with dossier trigger */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-brand-600 dark:text-brand-400 font-semibold inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Открыть досье</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px]">{t.retrievedAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Teacher Detail Modal (Досье преподавателя) */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative my-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Закрыть (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header with Photo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl aspect-square overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-2 border-brand-200 dark:border-brand-800 shadow-md ring-4 ring-brand-50 dark:ring-brand-950/60 relative ${
                    selectedTeacher.photoUrl || selectedTeacher.fallbackPhotoUrl
                      ? 'cursor-zoom-in group/modalphoto'
                      : ''
                  }`}
                  onClick={() => {
                    const photo = selectedTeacher.photoUrl || selectedTeacher.fallbackPhotoUrl;
                    if (photo) {
                      setFullscreenPhoto({
                        url: resolvePhotoUrl(selectedTeacher.photoUrl || selectedTeacher.fallbackPhotoUrl || ''),
                        fallbackUrl: selectedTeacher.fallbackPhotoUrl,
                        name: selectedTeacher.name,
                        department: selectedTeacher.department,
                        position: selectedTeacher.position
                      });
                    }
                  }}
                  title={
                    selectedTeacher.photoUrl || selectedTeacher.fallbackPhotoUrl
                      ? 'Нажмите, чтобы открыть фото на полный экран'
                      : undefined
                  }
                >
                  {selectedTeacher.photoUrl ? (
                    <img
                      src={resolvePhotoUrl(selectedTeacher.photoUrl)}
                      alt={selectedTeacher.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/modalphoto:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (selectedTeacher.fallbackPhotoUrl && target.src !== selectedTeacher.fallbackPhotoUrl) {
                          target.src = selectedTeacher.fallbackPhotoUrl;
                        } else {
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.modal-photo-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className={`modal-photo-fallback w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-brand-900 flex items-center justify-center text-brand-800 dark:text-brand-300 font-extrabold text-2xl ${
                      selectedTeacher.photoUrl ? 'hidden' : ''
                    }`}
                  >
                    {selectedTeacher.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </div>

                  {/* Hover overlay and zoom badge */}
                  {(selectedTeacher.photoUrl || selectedTeacher.fallbackPhotoUrl) && (
                    <>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/modalphoto:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center pointer-events-none">
                        <Maximize2 className="w-6 h-6 mb-1 drop-shadow" />
                        <span className="text-[10px] font-bold tracking-tight drop-shadow">Во весь экран</span>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white shadow-sm pointer-events-none sm:hidden">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>
                    </>
                  )}
                </div>

                {selectedTeacher.isGroupTeacher && (
                  <span
                    className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-xl shadow-sm border-2 border-white dark:border-slate-900 z-10"
                    title="Преподаватель нашей группы"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {selectedTeacher.position}
                  </span>
                  {selectedTeacher.isuPersonId && (
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      ИСУ #{selectedTeacher.isuPersonId}
                    </span>
                  )}
                  {selectedTeacher.groupRole && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      {selectedTeacher.groupRole}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedTeacher.name}
                </h2>

                <div className="text-xs sm:text-sm text-brand-700 dark:text-brand-400 font-semibold mt-1">
                  {selectedTeacher.department}
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-5 text-sm">
              {/* Bio & Curator / Exam role */}
              {selectedTeacher.bio && (
                <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 space-y-1">
                  <div className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>О преподавателе и кураторе</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}

              {/* Group Subjects */}
              {selectedTeacher.groupSubjects && selectedTeacher.groupSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Дисциплины в нашей группе</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.groupSubjects.map((subj, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule with our group */}
              {selectedTeacher.scheduleInfo && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Расписание занятий с группой ПОНБ-УП-304С</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTeacher.scheduleInfo}
                  </p>
                </div>
              )}

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {selectedTeacher.room && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 text-xs">
                    <span className="text-slate-400 block mb-0.5">Кабинет / Корпус:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{selectedTeacher.room}</span>
                    </div>
                  </div>
                )}

                {selectedTeacher.phone && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 text-xs">
                    <span className="text-slate-400 block mb-0.5">Телефон кафедры / ИСУ:</span>
                    <a
                      href={`tel:${selectedTeacher.phone}`}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{selectedTeacher.phone}</span>
                    </a>
                  </div>
                )}

                {selectedTeacher.email && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 text-xs sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Корпоративный E-mail:</span>
                    <a
                      href={`mailto:${selectedTeacher.email}`}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{selectedTeacher.email}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Degree & Academic Title */}
              {(selectedTeacher.degree || selectedTeacher.academicTitle) && (
                <div className="space-y-1 pt-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ученая степень и звание</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedTeacher.degree && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/50">
                        {selectedTeacher.degree}
                      </span>
                    )}
                    {selectedTeacher.academicTitle && (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/50">
                        {selectedTeacher.academicTitle}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Interests */}
              {selectedTeacher.interests && (
                <div className="space-y-1 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Научные интересы
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTeacher.interests}
                  </p>
                </div>
              )}

              {/* Awards */}
              {selectedTeacher.awards && (
                <div className="space-y-1 pt-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Награды и достижения</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTeacher.awards}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Данные ИСУ и сайта кафедры ({selectedTeacher.retrievedAt})</span>
              <a
                href={selectedTeacher.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-bold hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
              >
                <span>Официальный профиль кафедры</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setFullscreenPhoto(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between gap-4 py-2 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <h3 className="text-white font-extrabold text-base sm:text-lg truncate">
                {fullscreenPhoto.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 truncate">
                {fullscreenPhoto.position && `${fullscreenPhoto.position} • `}{fullscreenPhoto.department}
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setFullscreenPhoto(null)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-2 transition-colors border border-white/10 cursor-pointer"
                title="Закрыть (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Закрыть (Esc)</span>
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div
            className="relative flex-1 flex items-center justify-center w-full max-w-4xl my-auto p-2"
            onClick={() => setFullscreenPhoto(null)}
          >
            <div
              className="relative max-w-full max-h-[75vh] sm:max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenPhoto.url}
                alt={fullscreenPhoto.name}
                className="max-w-[92vw] max-h-[75vh] sm:max-w-2xl sm:max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/15 ring-1 ring-white/10 select-none transition-all"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (fullscreenPhoto.fallbackUrl && target.src !== fullscreenPhoto.fallbackUrl) {
                    target.src = fullscreenPhoto.fallbackUrl;
                  }
                }}
              />
            </div>
          </div>

          {/* Bottom Prompt */}
          <div
            className="w-full max-w-4xl pt-2 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-400"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Нажмите в любом месте или клавишу Esc для закрытия</span>
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="text-white hover:underline cursor-pointer"
            >
              Вернуться к досье
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
