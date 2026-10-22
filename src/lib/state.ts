import { useCallback, useEffect, useState } from 'react';
import { isStrings, readLocal } from './utils';
export function useMarks(key:string) {
  const [values,setValues]=useState<string[]>(()=>readLocal(key,[],isStrings));
  const [error,setError]=useState(false);
  const toggle=useCallback((id:string)=>setValues(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]),[]);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(values));setError(false);}catch{setError(true);}},[key,values]);
  return {values,toggle,error};
}
export type Marks=ReturnType<typeof useMarks>;
export function useRoute() {
  const get=()=>location.hash.slice(1) || '/';
  const [route,setRoute]=useState(get);
  useEffect(()=>{const change=()=>{setRoute(get());window.scrollTo(0,0);};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  const [path,query='']=route.split('?');
  return {path,query:new URLSearchParams(query)};
}
