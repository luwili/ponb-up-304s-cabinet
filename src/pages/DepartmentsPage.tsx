import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import departmentsData from '../data/departments.json';
import { Department } from '../types';

interface DepartmentsPageProps {
  onSelectDepartment: (deptName: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  onSelectDepartment
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
          Структура Института права УУНиТ
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Кафедры Института права
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          8 специализированных кафедр института, обеспечивающих фундаментальную теоретическую и практическую подготовку специалистов в области права.
        </p>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(departmentsData as Department[]).map((dept) => (
          <div
            key={dept.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400">
                  <Building2 className="w-5 h-5" />
                </div>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span>{dept.facultyCount} преподавателей</span>
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-2">
                {dept.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {dept.description}
              </p>

              {/* Office & Contacts */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{dept.room} (ул. Достоевского, 131)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{dept.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{dept.email}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectDepartment(dept.name)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-900"
              >
                <span>Преподаватели кафедры</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={dept.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span>Официальная страница</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
