import { z } from 'zod';

const id = z.string().regex(/^[\p{L}\p{N}_-]+$/u, 'Допустимы буквы, цифры, _ и -');
const text = z.string().min(1);
const date = z.iso.date();
const url = z.url().refine(v => /^https?:\/\//.test(v), 'Требуется http(s) URL');
const source = { sourceUrl: url, retrievedAt: date };
const base = { id, title: text };
export const groupSchema = z.object({
  name: z.literal('ПОНБ-УП-304С').default('ПОНБ-УП-304С'),
  specialty: text.default('Правовое обеспечение национальной безопасности'),
  timezone: z.literal('Asia/Yekaterinburg').default('Asia/Yekaterinburg'),
  course: text.optional(), semester: text.optional(), studyForm: text.optional(),
  semesterStart: date.optional(), semesterEnd: date.optional(), referenceWeek: date.optional(),
  publishRoster: z.boolean().default(false), groupTeacherIds: z.array(id).default([])
}).strict();
export const subjectSchema = z.object({ ...base, description: z.string().optional(), teacherIds: z.array(id).default([]), order: z.number().default(0) }).strict();
export const topicSchema = z.object({ ...base, subjectId: id, description: z.string().optional(), order: z.number().default(0) }).strict();
export const materialTypes = ['Конспект', 'Задача', 'Презентация', 'Учебный материал', 'Вопросы к экзамену', 'Судебная практика', 'Другое'] as const;
export const taskSchema = z.object({ condition: text, questions: z.array(text).default([]), solution: z.string().optional(), shortSolution: z.string().optional(), sources: z.array(text).default([]) }).strict();
export const materialSchema = z.object({
  ...base, subjectId: id, topicId: id, type: z.enum(materialTypes).default('Учебный материал'),
  format: text, description: z.string().optional(), tags: z.array(text).default([]),
  path: text, content: z.string().optional(), variant: z.enum(['full', 'short']).optional(),
  addedAt: date.optional(), updatedAt: date.optional(), order: z.number().default(0),
  relatedIds: z.array(id).default([]), sourceUrl: url.optional(), verifiedAt: date.optional(),
  verificationNote: z.string().optional(), alt: z.string().optional(), task: taskSchema.optional()
}).strict();
export const lessonSchema = z.object({
  id, subjectId: id, date: date.optional(), weekday: z.number().int().min(1).max(7).optional(),
  parity: z.enum(['all','odd','even']).default('all'),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  kind: z.string().optional(), room: z.string().optional(), url: url.optional(), teacherId: id.optional(), note: z.string().optional()
}).strict().refine(v => Boolean(v.date) !== Boolean(v.weekday), 'Укажите либо date, либо weekday').refine(v => v.end > v.start, 'end должен быть позже start');
export const scheduleSchema = z.object({ lessons: z.array(lessonSchema).default([]), exceptions: z.array(z.object({ date, lessons: z.array(lessonSchema) }).strict()).default([]) }).strict();
export const assignmentSchema = z.object({ ...base, subjectId: id, description: z.string(), dueDate: date.optional(), dueTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(), materialIds: z.array(id).default([]) }).strict().refine(v => !v.dueTime || v.dueDate, 'dueTime требует dueDate');
export const announcementSchema = z.object({ ...base, body: text, publishedAt: date, expiresAt: date.optional(), pinned: z.boolean().default(false) }).strict();
export const examSchema = z.object({ ...base, subjectId: id, answer: z.string().optional(), materialIds: z.array(id).default([]) }).strict();
export const teacherSchema = z.object({ id, name: text, departmentId: id, position: z.string().optional(), degree: z.string().optional(), academicTitle: z.string().optional(), interests: z.string().optional(), ...source }).strict();
export const departmentSchema = z.object({ ...base, description: z.string().optional(), room: z.string().optional(), phone: z.string().optional(), email: z.email().optional(), ...source }).strict();
export const instituteSchema = z.object({ name: text, city: text, address: z.string().optional(), phone: z.string().optional(), email: z.email().optional(), ...source }).strict();
export const linkSchema = z.object({ ...base, url, description: z.string().optional(), ...source }).strict();
export const rosterSchema = z.object({ id, name: text, role: z.string().optional(), order: z.number().default(0) }).strict();
export const mappingSchema = z.array(z.object({ file: text, subjectId: id, topicId: id, topicTitle: text.optional(), material: materialSchema.omit({ path: true, format: true, content: true, subjectId: true, topicId: true }) }).strict());
export const catalogSchema = z.object({
  group: groupSchema, subjects: z.array(subjectSchema), topics: z.array(topicSchema), materials: z.array(materialSchema),
  schedule: scheduleSchema, assignments: z.array(assignmentSchema), announcements: z.array(announcementSchema),
  examQuestions: z.array(examSchema), roster: z.array(rosterSchema)
});
export type Catalog = z.infer<typeof catalogSchema>;
export type Material = z.infer<typeof materialSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Teacher = z.infer<typeof teacherSchema>;
export type Department = z.infer<typeof departmentSchema>;
