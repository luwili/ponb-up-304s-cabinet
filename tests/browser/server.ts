import {createServer} from 'node:http';
import {mkdtemp,cp,mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {importContent} from '../../scripts/import-content.ts';
await mkdir('/tmp/opencode',{recursive:true});
const root=await mkdtemp('/tmp/opencode/cabinet-browser-');
await cp('dist',path.join(root,'cabinet'),{recursive:true});
await cp('dist',path.join(root,'empty'),{recursive:true});
const input=path.join(root,'fixtures');await cp('tests/fixtures/materials',input,{recursive:true});
await writeFile(path.join(input,'subjects/test-law/topic/Приложение.pdf'),'%PDF-1.4\n% test download fixture\n%%EOF');
await writeFile(path.join(input,'subjects/test-law/topic/Изображение.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jYvQAAAAASUVORK5CYII=','base64'));
await importContent(input,path.join(root,'cabinet/generated'));
const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.md':'text/markdown'};
createServer(async(req,res)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent((req.url||'/').split('?')[0]));
    if(!file.startsWith(root+'/'))throw new Error('Invalid path');
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.statusCode=404;res.end('Not found');}
}).listen(4174,'127.0.0.1');
