import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ufaDate,ufaTime,shiftDate,monday,normalize,lessonsOn,readLocal} from '../src/lib/utils.ts';
import {groupSchema,scheduleSchema} from '../src/lib/schema.ts';
test('Уфа: граница суток и недели не зависит от часового пояса устройства',()=>{
  assert.equal(ufaDate(new Date('2026-10-25T19:01:00Z')),'2026-10-26');
  assert.equal(ufaTime(new Date('2026-10-25T19:01:00Z')),'00:01');
  assert.equal(monday(ufaDate(new Date('2026-10-25T19:01:00Z'))),'2026-10-26');
  assert.equal(shiftDate('2026-12-31',1),'2027-01-01');
  assert.equal(normalize('УЧЁБА'),'учеба');
});
test('Учебная чётность, семестр, точная дата и переопределение всего дня',()=>{
  const group=groupSchema.parse({semesterStart:'2026-09-01',semesterEnd:'2026-12-31',referenceWeek:'2026-09-07'});
  const schedule=scheduleSchema.parse({lessons:[
    {id:'odd',subjectId:'test',weekday:1,parity:'odd',start:'09:00',end:'10:30'},
    {id:'even',subjectId:'test',weekday:1,parity:'even',start:'10:40',end:'12:10'},
    {id:'exact',subjectId:'test',date:'2026-09-08',start:'09:00',end:'10:30'}
  ],exceptions:[{date:'2026-09-21',lessons:[]}]});
  assert.equal(lessonsOn('2026-09-07',schedule,group)[0].id,'odd');
  assert.equal(lessonsOn('2026-09-14',schedule,group)[0].id,'even');
  assert.equal(lessonsOn('2026-09-08',schedule,group)[0].id,'exact');
  assert.equal(lessonsOn('2026-09-21',schedule,group).length,0);
  assert.equal(lessonsOn('2027-01-04',schedule,group).length,0);
  assert.equal(lessonsOn('2026-09-07',schedule,groupSchema.parse({})).length,0);
});
test('Недоступное localStorage не вызывает падения',()=>assert.deepEqual(readLocal('missing',[],(v):v is string[]=>Array.isArray(v)),[]));
test('Расписание отклоняет конфликтующие id и несовпадающую дату исключения',()=>{
  const lesson={id:'same',subjectId:'test',date:'2026-11-02',start:'09:00',end:'10:30'};
  assert.equal(scheduleSchema.safeParse({lessons:[lesson,lesson]}).success,false);
  assert.equal(scheduleSchema.safeParse({exceptions:[{date:'2026-11-03',lessons:[lesson]}]}).success,false);
});
