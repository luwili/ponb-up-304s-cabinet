import raw from '../data/institute.json';
import {z} from 'zod';
import {departmentSchema,teacherSchema,instituteSchema,linkSchema} from './schema';
export const directory=z.object({departments:z.array(departmentSchema),teachers:z.array(teacherSchema),institute:instituteSchema,links:z.array(linkSchema),warnings:z.array(z.string())}).parse(raw);
