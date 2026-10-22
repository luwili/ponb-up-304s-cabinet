import { mkdir,writeFile } from 'node:fs/promises';
import {z} from 'zod';
import * as schemas from '../src/lib/schema.ts';
await mkdir('schemas',{recursive:true});
for(const [name,schema] of Object.entries(schemas)) if(schema instanceof z.ZodType) {
  await writeFile(`schemas/${name}.json`,JSON.stringify(z.toJSONSchema(schema,{unrepresentable:'any'}),null,2)+'\n');
}
