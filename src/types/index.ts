export interface Subject {
  id: string;
  title: string;
  shortTitle: string;
  departmentId: string;
  departmentName: string;
  teacherName: string;
  studyForm: string;
  semester: string;
  examType: 'Экзамен' | 'Зачёт' | 'Диф. зачёт';
  description: string;
  color: string;
  topicsCount?: number;
  materialsCount?: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  description: string;
  fullContent: string;
  shortContent: string;
  tableOfContents?: { id: string; text: string; level: number }[];
  legalBasis?: string[];
  updatedAt?: string;
  verifiedStatus?: string;
  sourceNote?: string;
}

export interface CaseProblem {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  fabula: string;
  questions: string[];
  fullSolution: string;
  shortSolution: string;
  legalSources: string[];
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 1 = Monday ... 6 = Saturday
  date?: string; // YYYY-MM-DD
  pairNumber: number; // 1..5
  timeStart: string;
  timeEnd: string;
  subjectId: string;
  subjectName: string;
  type: 'Практика (семинар)' | 'Лекция' | 'Консультация' | 'Зачёт/Экзамен';
  teacher: string;
  room: string;
  building?: string;
  note?: string;
  weekType?: 'even' | 'odd' | 'all';
}

export interface Assignment {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  deadline?: string; // YYYY-MM-DD or ISO
  priority: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  attachments?: { title: string; url: string; format: string }[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  author: string;
  tag: string;
}

export interface ExamCard {
  id: string;
  subjectId: string;
  subjectName: string;
  questionNumber?: number;
  question: string;
  answer: string;
  legalBasis: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Teacher {
  id: string;
  name: string;
  department: string;
  position: string;
  degree: string;
  academicTitle: string;
  interests: string;
  awards: string;
  isGroupTeacher: boolean;
  groupSubjects: string[];
  groupRole?: string;
  sourceUrl: string;
  retrievedAt: string;
}

export interface Department {
  id: string;
  name: string;
  url: string;
  room: string;
  email: string;
  phone: string;
  description: string;
  facultyCount: number;
  retrievedAt: string;
}

export interface InstituteInfo {
  fullName: string;
  shortName: string;
  city: string;
  region: string;
  timezone: string;
  website: string;
  address: string;
  secondCampus: string;
  phone: string;
  email: string;
  officialSchedules: string;
  officialDepartments: string;
  officialContacts: string;
  officialCertificates: string;
  officialPractice: string;
  officialClubs: string;
  group: {
    code: string;
    specialty: string;
    specialization: string;
    curator: string;
    semester: string;
    studyForm: string;
  };
  updatedAt: string;
}

export interface StudentRosterItem {
  id: string;
  num: number;
  isuId?: string;
  recordBook?: string;
  budgetStatus?: string;
  fullName: string;
  role?: string;
}
