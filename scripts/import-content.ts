import { readFile, writeFile, readdir, mkdir, lstat, realpath, copyFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import * as schemas from '../src/lib/schema.ts';
import type { Catalog } from '../src/lib/schema.ts';

const project = fileURLToPath(new URL('../',import.meta.url));
const allowed=new Set(['md','txt','pdf','docx','pptx','xlsx','doc','ppt','xls','odt','ods','odp','png','jpg','jpeg','webp','gif']);
const decode = (buffer: Buffer) => new TextDecoder('utf-8',{fatal:true}).decode(buffer).replace(/^\uFEFF/,'');
const hash=(v:string)=>createHash('sha256').update(v).digest('hex').slice(0,20);
const inside=(root:string,target:string)=>target===root || target.startsWith(root+path.sep);
const metaMaterial=schemas.materialSchema.omit({path:true,format:true,content:true,subjectId:true,topicId:true});
const topicMeta=z.object({id:z.string(),title:z.string(),subjectId:z.string(),description:z.string().optional(),order:z.number().optional(),materials:z.array(z.object({file:z.string(),material:metaMaterial}).strict()).default([])}).strict();
export function parseCSV(text:string) {
  const rows:string[][]=[]; let row:string[]=[], cell='',quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') { if(quoted && text[i+1]==='"') {cell+='"';i++;} else quoted=!quoted; }
    else if(c===',' && !quoted) { row.push(cell);cell=''; }
    else if(c==='\n' && !quoted) {row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted) throw new Error('CSV: незакрытая кавычка');
  if(cell || row.length) {row.push(cell.replace(/\r$/,''));rows.push(row);}
  const headers=rows.shift() || [];
  if(!headers.includes('id') || !headers.includes('name')) throw new Error('CSV: необходимы столбцы id и name');
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,h==='order'? Number(r[i] || 0):r[i] || undefined])));
}
export async function importContent(input:string, output=path.join(project,'public/generated'), rosterPath?:string) {
  const report={added:0,updated:0,removed:0,skipped:0,warnings:[] as string[],errors:[] as string[]};
  let stage='';
  try {
    const requested=path.resolve(input);
    if(!(await lstat(requested)).isDirectory()) throw new Error('CONTENT_PATH: ожидается папка');
    const root=await realpath(requested);
    async function secure(relative:string) {
      if(path.isAbsolute(relative) || relative.split(/[\\/]/).some(p=>p==='..' || p.startsWith('.') || p==='private-data')) throw new Error(`Недопустимый относительный путь: ${path.basename(relative)}`);
      const resolved=path.resolve(root,relative);
      if(!inside(root,resolved) || !inside(root,await realpath(resolved))) throw new Error(`Путь выходит за разрешённую папку: ${path.basename(relative)}`);
      if((await lstat(resolved)).isSymbolicLink()) throw new Error(`Символические ссылки запрещены: ${path.basename(relative)}`);
      return resolved;
    }
    async function json<T>(name:string,schema:z.ZodType<T>,fallback:T):Promise<T> {
      try { const f=await secure(name); return schema.parse(JSON.parse(decode(await readFile(f)))); }
      catch(e) { if((e as NodeJS.ErrnoException).code==='ENOENT') return fallback; throw new Error(`${name}: ${e instanceof Error?e.message:'ошибка формата'}`); }
    }
    const group=await json('group.config.json',schemas.groupSchema,schemas.groupSchema.parse({}));
    const catalog:Catalog={group,
      subjects:await json('subjects.json',z.array(schemas.subjectSchema),[]), topics:[],materials:[],
      schedule:await json('schedule.json',schemas.scheduleSchema,{lessons:[],exceptions:[]}),
      assignments:await json('assignments.json',z.array(schemas.assignmentSchema),[]),
      announcements:await json('announcements.json',z.array(schemas.announcementSchema),[]),
      examQuestions:await json('exam-questions.json',z.array(schemas.examSchema),[]),roster:[]};
    const mapping=await json('mapping.json',schemas.mappingSchema,[]);
    const files:string[]=[];
    async function walk(dir:string,relative='') {
      for(const entry of await readdir(dir,{withFileTypes:true})) {
        const rel=path.posix.join(relative,entry.name);
        if(entry.name.startsWith('.') || entry.name.startsWith('~') || entry.name==='private-data' || /^(roster|список[ _-]?группы)/i.test(entry.name)) {report.skipped++;continue;}
        if(entry.isSymbolicLink()) {report.skipped++;report.warnings.push(`Пропущена символическая ссылка: ${rel}`);continue;}
        if(entry.isDirectory()) await walk(path.join(dir,entry.name),rel);
        else if(entry.isFile()) files.push(rel);
      }
    }
    await walk(root);
    const metas=new Map<string,z.infer<typeof topicMeta>>();
    for(const rel of files.filter(f=>path.basename(f)==='topic.meta.json')) {
      const meta=topicMeta.parse(JSON.parse(decode(await readFile(await secure(rel)))));
      const {materials: _materials,...topic}=meta;
      catalog.topics.push(schemas.topicSchema.parse(topic));
      metas.set(path.posix.dirname(rel),meta);
      for(const item of meta.materials) {
        const file=path.posix.join(path.posix.dirname(rel),item.file);
        await secure(file);
        if(mapping.some(m=>m.file===file)) throw new Error(`Повторное сопоставление файла: ${file}`);
        mapping.push({file,subjectId:meta.subjectId,topicId:meta.id,topicTitle:meta.title,material:item.material});
      }
    }
    for(const item of mapping) {
      await secure(item.file);
      if(!allowed.has(path.extname(item.file).slice(1).toLowerCase())) throw new Error(`mapping.json: недопустимый формат ${item.file}`);
      if(!catalog.topics.some(t=>t.id===item.topicId)) catalog.topics.push(schemas.topicSchema.parse({id:item.topicId,title:item.topicTitle || item.topicId,subjectId:item.subjectId}));
    }
    if(new Set(mapping.map(m=>m.file)).size!==mapping.length) throw new Error('mapping.json: повторное сопоставление файла');
    stage=path.join(path.dirname(output),'.generated-'+Date.now());
    await mkdir(path.join(stage,'files'),{recursive:true});
    for(const rel of files) {
      const format=path.extname(rel).slice(1).toLowerCase();
      if(!allowed.has(format)) {report.skipped++;continue;}
      const mapped=mapping.find(m=>m.file===rel);
      const dir=path.posix.dirname(rel);
      const meta=[...metas.entries()].filter(([p])=>dir===p || dir.startsWith(p+'/')).sort((a,b)=>b[0].length-a[0].length)[0]?.[1];
      let subjectId=mapped?.subjectId || meta?.subjectId;
      let topicId=mapped?.topicId || meta?.id;
      if(!subjectId || !topicId || !catalog.subjects.some(s=>s.id===subjectId)) {
        if(mapped || meta) throw new Error(`${rel}: subjectId не найден в subjects.json`);
        subjectId='unassigned';topicId='unassigned';
        if(!catalog.subjects.some(s=>s.id===subjectId)) catalog.subjects.push(schemas.subjectSchema.parse({id:subjectId,title:'Не распределено'}));
        if(!catalog.topics.some(t=>t.id===topicId)) catalog.topics.push(schemas.topicSchema.parse({id:topicId,title:'Не распределено',subjectId}));
        report.warnings.push(`Не распределено: ${rel}`);
      }
      const original=await secure(rel);
      const id=mapped?.material.id || 'material-'+hash(rel);
      const dest=`files/${hash(id)}.${format}`;
      const content=(format==='md' || format==='txt')?decode(await readFile(original)):undefined;
      catalog.materials.push(schemas.materialSchema.parse({id,title:path.basename(rel,path.extname(rel)),...mapped?.material,subjectId,topicId,format,path:dest,content}));
      await copyFile(original,path.join(stage,dest));
    }
    // No roster is read unless publication has been explicitly enabled.
    if(group.publishRoster) {
      if(!rosterPath) throw new Error('publishRoster=true требует отдельный ROSTER_PATH');
      const text=decode(await readFile(rosterPath));
      catalog.roster=z.array(schemas.rosterSchema).parse(path.extname(rosterPath).toLowerCase()==='.csv'?parseCSV(text):JSON.parse(text));
      report.warnings.push('ВНИМАНИЕ: включена публичная публикация списка группы');
    }
    for(const [key,entries] of Object.entries(catalog)) {
      if(!Array.isArray(entries)) continue;
      const ids=new Set<string>();
      for(const entry of entries) {if(ids.has(entry.id)) throw new Error(`${key}: повторный id ${entry.id}`);ids.add(entry.id);}
    }
    const requireSubject=(v:{subjectId:string})=>{if(!catalog.subjects.some(s=>s.id===v.subjectId)) throw new Error(`Неизвестный subjectId: ${v.subjectId}`);};
    [...catalog.topics,...catalog.materials,...catalog.assignments,...catalog.examQuestions,...catalog.schedule.lessons,...catalog.schedule.exceptions.flatMap(e=>e.lessons)].forEach(requireSubject);
    for(const m of catalog.materials) {
      if(!catalog.topics.some(t=>t.id===m.topicId && t.subjectId===m.subjectId)) throw new Error(`${m.id}: тема не найдена или относится к другому предмету`);
      for(const related of m.relatedIds) if(!catalog.materials.some(x=>x.id===related)) throw new Error(`${m.id}: relatedIds ссылается на отсутствующий материал`);
    }
    for(const v of [...catalog.assignments,...catalog.examQuestions]) for(const ref of v.materialIds) if(!catalog.materials.some(m=>m.id===ref)) throw new Error(`${v.id}: не найден материал ${ref}`);
    if(new Set(catalog.schedule.exceptions.map(e=>e.date)).size!==catalog.schedule.exceptions.length) throw new Error('schedule.exceptions: повторные даты');
    if(group.semesterStart && group.semesterEnd && group.semesterStart>group.semesterEnd) throw new Error('semesterEnd должен быть позже semesterStart');
    if(catalog.schedule.lessons.some(l=>l.weekday) && (!group.semesterStart || !group.semesterEnd)) report.warnings.push('Повторяющееся расписание не отображается без semesterStart/semesterEnd');
    if(catalog.schedule.lessons.some(l=>l.parity!=='all') && !group.referenceWeek) report.warnings.push('Для чередования недель не задана referenceWeek');
    schemas.catalogSchema.parse(catalog);
    let previous:Catalog|undefined;
    try {previous=JSON.parse(await readFile(path.join(output,'catalog.json'),'utf8'));}catch{/* First import */}
    for(const m of catalog.materials) {
      const old=previous?.materials.find(p=>p.id===m.id);
      if(!old) report.added++; else if(JSON.stringify(old)!==JSON.stringify(m)) report.updated++;
    }
    report.removed=previous?.materials.filter(p=>!catalog.materials.some(m=>m.id===p.id)).length || 0;
    await writeFile(path.join(stage,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
    // Search text is prepared at build/import time, never fetched from a third party.
    const index=catalog.materials.map(m=>({id:m.id,title:m.title,subjectId:m.subjectId,type:m.type,text:[m.description,...m.tags,m.content].filter(Boolean).join(' ')}));
    await writeFile(path.join(stage,'search-index.json'),JSON.stringify(index));
    const backup=path.join(path.dirname(output),'.backup-'+Date.now());
    let backed=false;
    try {await rename(output,backup);backed=true;}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    try {await rename(stage,output);stage='';} catch(e){if(backed)await rename(backup,output);throw e;}
    if(backed)await rm(backup,{recursive:true,force:true});
    return report;
  } catch(e) {
    report.errors.push(e instanceof z.ZodError?z.prettifyError(e):(e as NodeJS.ErrnoException).code==='ENOENT'?'Папка или указанный файл не найден':e instanceof Error?e.message:'Ошибка импорта');
    throw Object.assign(new Error(report.errors.join('\n')),{report});
  } finally { if(stage)await rm(stage,{recursive:true,force:true}); }
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const input=process.env.CONTENT_PATH || process.argv[2] || path.join(project,'content');
  await mkdir(path.join(project,'reports'),{recursive:true});
  try {
    const report=await importContent(input,undefined,process.env.ROSTER_PATH);
    await writeFile(path.join(project,'reports/content-import.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } catch(e) {
    const report=(e as {report?:unknown}).report || {errors:[String(e)]};
    await writeFile(path.join(project,'reports/content-import.json'),JSON.stringify(report,null,2));
    console.error('Импорт отменён. Предыдущий каталог сохранён.');
    console.error(JSON.stringify(report,null,2));process.exitCode=1;
  }
}
