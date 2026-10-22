import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { teacherSchema, departmentSchema, instituteSchema, linkSchema } from '../src/lib/schema.ts';

const file = new URL('../src/data/institute.json', import.meta.url);
const snapshotSchema = z.object({ departments: z.array(departmentSchema), teachers: z.array(teacherSchema), institute: instituteSchema, links: z.array(linkSchema), warnings: z.array(z.string()) });
const previous = snapshotSchema.parse(JSON.parse(await readFile(file,'utf8')));
const data = structuredClone(previous);
data.warnings = [];
const retrievedAt = new Date().toISOString().slice(0,10);
const clean = (s: string) => s.replace(/[\s\u200b\u2060\ufeff]+/g,' ').trim();
async function page(path: string) {
  let error: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(new URL(path,'https://law-bsu.ru'), { signal: AbortSignal.timeout(25000), headers: { 'User-Agent':'StudyCabinetDirectory/1.0 (public educational directory)' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return cheerio.load(await response.text());
    } catch (e) { error = e; }
  }
  throw new Error(`${path}: ${String(error)}`);
}
try {
  const $ = await page('/kafedry');
  const departments: typeof data.departments = [];
  $('.t822__title a').each((_,el)=>{
    const a=$(el), title=clean(a.text()), href=a.attr('href');
    if (!title.startsWith('Кафедра ') || !href) return;
    const box=a.parent().parent().clone();
    box.find('.t822__title, a').filter((_,e)=>$(e).text()==='Подробно' || $(e).hasClass('t822__title')).remove();
    departments.push(departmentSchema.parse({ id:href.replace(/^\//,''), title, description:clean(box.text()).replace(/Подробно$/,''), sourceUrl:new URL(href,'https://law-bsu.ru').href,retrievedAt }));
  });
  if (departments.length < 8) throw new Error('Структура каталога изменилась: найдено менее 8 кафедр');
  data.departments=departments;
} catch(e) { data.warnings.push(`Каталог кафедр не обновлён: ${e}`); }

for (const department of data.departments) {
  try {
    const $ = await page(department.sourceUrl);
    const teachers: typeof data.teachers = [];
    $('[field^="li_persname__"]').each((_,el)=>{
      const name=clean($(el).text());
      if (!/^[А-ЯЁ][А-ЯЁа-яё-]+(?:\s+[А-ЯЁ][А-ЯЁа-яё-]+){1,4}$/.test(name)) {
        data.warnings.push(`${department.id}: не распознано ФИО «${name}»`); return;
      }
      const box=$(el).closest('.t531__box');
      const textBox=box.find('[field^="li_text__"]').clone();
      textBox.find('br').replaceWith('\n');
      const details=textBox.text();
      const degreeLine=details.match(/Уч[её]ная степень\s*\/\s*звание:\s*([^\n]*)/i)?.[1] || '';
      const degree=degreeLine.match(/(?:кандидат|доктор) [а-яё -]+? наук/i)?.[0];
      const academicTitle=degreeLine.match(/(?<![а-яё])(?:профессор|доцент)(?![а-яё])/i)?.[0];
      const interests=details.match(/Область научных интересов:\s*([^\n]*)/i)?.[1];
      teachers.push(teacherSchema.parse({
        id:'teacher-'+createHash('sha256').update(name+'|'+department.id).digest('hex').slice(0,16),
        name,departmentId:department.id,position:clean(box.find('[field^="li_persdescr__"]').text()) || undefined,
        degree,academicTitle, interests:interests ? clean(interests) : undefined, sourceUrl:department.sourceUrl,retrievedAt
      }));
    });
    if (!teachers.length) throw new Error('Не найдено карточек действующего преподавательского состава');
    data.teachers=[...data.teachers.filter(t=>t.departmentId!==department.id), ...teachers];
    console.log(`${department.title}: ${teachers.length}`);
  } catch(e) { data.warnings.push(`${department.title}: оставлена предыдущая версия. ${e}`); }
}

try {
  const $=await page('/contacts');
  const text=clean($('body').text());
  if (!text.includes('Института права Уфимского университета науки и технологий') || !text.includes('Достоевского') || !text.includes('institutprava@uust.ru')) throw new Error('Контактные сведения требуют ручной сверки');
  data.institute={name:'Институт права Уфимского университета науки и технологий',city:'Уфа, Республика Башкортостан',address:'ул. Достоевского, д. 131, г. Уфа, Республика Башкортостан, 450005',phone:'+7 (987) 103-80-00', email:'institutprava@uust.ru',sourceUrl:'https://law-bsu.ru/contacts',retrievedAt};
  const desired = [
    ['/schedules','Официальное расписание','Расписание института на официальном сайте'],
    ['/kafedry','Кафедры института','Официальные страницы восьми кафедр'],
    ['/contacts','Контакты','Дирекция, учебная часть и кафедры'],
    ['/practice','Учебная документация','Документы для учёбы и практики'],
    ['/spravki','Заказать справку','Переход в официальный сервис института'],
    ['/clubs','Студенческое самоуправление','Студенческие объединения и инициативы'],
    ['http://lawclinic-ufa.ru/','Юридическая клиника','Официальная ссылка из навигации института']
  ];
  const links: typeof data.links=[];
  for(const [href,title,description] of desired) {
    if (!$(`a[href="${href}"]`).length) { data.warnings.push(`Не найдена ссылка ${href}`); continue; }
    const target=new URL(href,'https://law-bsu.ru').href;
    try {
      const r=await fetch(target,{signal:AbortSignal.timeout(20000)});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.body?.cancel();
      links.push({id:'link-'+links.length,title,description,url:target,sourceUrl:'https://law-bsu.ru/contacts',retrievedAt});
    } catch(e) { data.warnings.push(`Ссылка ${target}: не удалось подтвердить доступность (${e})`); }
  }
  if (links.length) data.links=links;
} catch(e) { data.warnings.push(`Контакты и ссылки: оставлена предыдущая версия. ${e}`); }
data.teachers.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
snapshotSchema.parse(data);
if (!data.departments.length || !data.teachers.length) throw new Error('Не удалось получить начальный справочник; файл не изменён');
await writeFile(new URL('../src/data/institute.next.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
await rename(new URL('../src/data/institute.next.json',import.meta.url),file);
await mkdir('reports',{recursive:true});
await writeFile('reports/institute-sync.json',JSON.stringify({retrievedAt,departments:data.departments.length,teachers:data.teachers.length,warnings:data.warnings},null,2));
console.log(`Сохранено ${data.teachers.length} преподавателей. Предупреждения: ${data.warnings.length}`);
data.warnings.forEach(w=>console.warn(w));
