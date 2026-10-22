import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,cp,writeFile,readFile,rm,readdir,symlink} from 'node:fs/promises';
import path from 'node:path';
import {importContent,parseCSV} from '../scripts/import-content.ts';
import {catalogSchema} from '../src/lib/schema.ts';

const fixture=path.resolve('tests/fixtures/materials');
async function setup() {
  await mkdir('/tmp/opencode',{recursive:true});
  const root=await mkdtemp('/tmp/opencode/Кабинет тест ');
  const input=path.join(root,'Материалы с пробелами'),output=path.join(root,'public/generated');
  await cp(fixture,input,{recursive:true});
  return {root,input,output,read:async()=>catalogSchema.parse(JSON.parse(await readFile(path.join(output,'catalog.json'),'utf8')))};
}
test('Первый запуск без материалов',async()=>{
  const f=await setup();try{const empty=path.join(f.root,'empty');await mkdir(empty);await importContent(empty,f.output);assert.equal((await f.read()).materials.length,0);}finally{await rm(f.root,{recursive:true});}
});
test('Кириллица, метаданные, повторный импорт, удаление устаревшего и неизменность исходников',async()=>{
  const f=await setup();try{
    const before=await readFile(path.join(f.input,'subjects/test-law/topic/Полный конспект.md'),'utf8');
    const first=await importContent(f.input,f.output);assert.equal(first.added,3);
    const a=await f.read();assert.equal(a.materials.length,3);assert.equal(a.materials.find(m=>m.id==='test-full')?.variant,'full');
    assert.equal(a.materials.find(m=>m.id==='test-task')?.task?.solution,'Тестовое решение.');
    assert.equal(a.materials.find(m=>m.id==='test-full')?.content,before);
    assert(!(await readFile(path.join(f.output,'catalog.json'),'utf8')).includes(f.root));
    const again=await importContent(f.input,f.output);assert.equal(again.added,0);assert.equal(again.updated,0);assert.deepEqual(await f.read(),a);
    assert.equal(await readFile(path.join(f.input,'subjects/test-law/topic/Полный конспект.md'),'utf8'),before);
    await writeFile(path.join(f.input,'произвольный файл.txt'),'Нераспределённый материал');
    await importContent(f.input,f.output);assert.equal((await f.read()).materials.length,4);
    await rm(path.join(f.input,'произвольный файл.txt'));const removed=await importContent(f.input,f.output);assert.equal(removed.removed,1);assert.equal((await readdir(path.join(f.output,'files'))).length,3);
  }finally{await rm(f.root,{recursive:true});}
});
test('Ошибочная конфигурация, недостающий файл и дубли не меняют готовый каталог',async()=>{
  const f=await setup();try{
    await importContent(f.input,f.output);const before=await readFile(path.join(f.output,'catalog.json'),'utf8');
    await writeFile(path.join(f.input,'subjects.json'),'{invalid');await assert.rejects(()=>importContent(f.input,f.output));assert.equal(await readFile(path.join(f.output,'catalog.json'),'utf8'),before);
    await cp(path.join(fixture,'subjects.json'),path.join(f.input,'subjects.json'));
    await writeFile(path.join(f.input,'mapping.json'),JSON.stringify([{file:'нет файла.md',subjectId:'test-law',topicId:'test-topic',material:{id:'missing',title:'Missing'}}]));
    await assert.rejects(()=>importContent(f.input,f.output));assert.equal(await readFile(path.join(f.output,'catalog.json'),'utf8'),before);
    await writeFile(path.join(f.input,'mapping.json'),'[]');
    await writeFile(path.join(f.input,'subjects.json'),'[{"id":"same","title":"A"},{"id":"same","title":"B"}]');await assert.rejects(()=>importContent(f.input,f.output));
  }finally{await rm(f.root,{recursive:true});}
});
test('Скрытые файлы, секреты, приватный список и symlink не публикуются',async()=>{
  const f=await setup();try{
    await writeFile(path.join(f.input,'.env'),'SECRET_SENTINEL');await writeFile(path.join(f.input,'.hidden.md'),'SECRET_SENTINEL');
    await mkdir(path.join(f.input,'private-data'));await writeFile(path.join(f.input,'private-data/roster.json'),'PRIVATE_STUDENT_SENTINEL');
    await writeFile(path.join(f.input,'roster.md'),'PRIVATE_STUDENT_SENTINEL');
    await writeFile(path.join(f.root,'outside.txt'),'OUTSIDE_SENTINEL');await symlink(path.join(f.root,'outside.txt'),path.join(f.input,'escape.txt'));
    await importContent(f.input,f.output,path.join(f.root,'nonexistent-private-roster.json'));
    const catalog=await readFile(path.join(f.output,'catalog.json'),'utf8'),index=await readFile(path.join(f.output,'search-index.json'),'utf8');
    for(const sentinel of ['SECRET_SENTINEL','PRIVATE_STUDENT_SENTINEL','OUTSIDE_SENTINEL']){assert(!catalog.includes(sentinel));assert(!index.includes(sentinel));}
    assert.deepEqual((await f.read()).roster,[]);
    await writeFile(path.join(f.input,'mapping.json'),JSON.stringify([{file:'../outside.txt',subjectId:'test-law',topicId:'test-topic',material:{id:'escape',title:'Escape'}}]));
    await assert.rejects(()=>importContent(f.input,f.output));
  }finally{await rm(f.root,{recursive:true});}
});
test('CSV UTF-8 и публикация списка только с явным разрешением',async()=>{
  assert.equal(parseCSV('id,name,role,order\nuser,"Фамилия, Имя",,2\n')[0].name,'Фамилия, Имя');
  const f=await setup();try{
    const roster=path.join(f.root,'roster.csv');await writeFile(roster,'id,name,role,order\nprivate,PRIVATE_STUDENT_SENTINEL,,1\n');
    await importContent(f.input,f.output,roster);assert.deepEqual((await f.read()).roster,[]);
    await writeFile(path.join(f.input,'group.config.json'),'{"publishRoster":true}');
    await assert.rejects(()=>importContent(f.input,f.output));await importContent(f.input,f.output,roster);assert.equal((await f.read()).roster[0].name,'PRIVATE_STUDENT_SENTINEL');
  }finally{await rm(f.root,{recursive:true});}
});
