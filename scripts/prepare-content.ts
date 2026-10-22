import {access,readFile} from 'node:fs/promises';
import {catalogSchema} from '../src/lib/schema.ts';
import {importContent} from './import-content.ts';
import path from 'node:path';
let sourceMode=false;
try{await access('content/import-on-deploy');sourceMode=true;}catch{/* Prebuilt public catalog mode */}
if(sourceMode) console.log(await importContent(path.resolve('content')));
else {
  const catalog=catalogSchema.parse(JSON.parse(await readFile('public/generated/catalog.json','utf8')));
  if(!catalog.group.publishRoster && catalog.roster.length)throw new Error('Запрещён публичный список при publishRoster=false');
  for(const material of catalog.materials) {
    if(!/^files\/[a-f0-9]+\.[a-z0-9]+$/.test(material.path))throw new Error('Недопустимый путь публичного файла');
    await access(path.join('public/generated',material.path));
  }
  console.log('Проверен подготовленный публичный каталог. Локальная папка не требуется.');
}
