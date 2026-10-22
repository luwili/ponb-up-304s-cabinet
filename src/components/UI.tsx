import type { ReactNode } from 'react';
import { ArrowUpRight, BookOpen, FolderOpen, type LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Empty({title,children,icon:Icon=FolderOpen,compact=false}:{title:string;children?:ReactNode;icon?:LucideIcon;compact?:boolean}) {
  const Heading=compact?'h3':'h2';
  return <div className={`empty ${compact?'compact':''}`}><span className="empty-icon"><Icon size={25}/></span><Heading>{title}</Heading>{children && <p>{children}</p>}</div>;
}
export function External({href,children,className=''}:{href:string;children:ReactNode;className?:string}) {
  return <a className={`external ${className}`} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (внешняя ссылка, новая вкладка)</span></a>;
}
export function PageHead({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}) {
  return <div className="page-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1 tabIndex={-1}>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
export function Panel({title,icon:Icon=BookOpen,link,children}:{title:string;icon?:LucideIcon;link?:string;children:ReactNode}) {
  return <section className="panel"><div className="panel-head"><h2><Icon size={18}/>{title}</h2>{link && <a className="text-link" href={link}>Открыть <span aria-hidden="true">→</span></a>}</div>{children}</section>;
}
export function Markdown({text}:{text:string}) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a:({href,children})=>href && /^https?:\/\//i.test(href)?<External href={href}>{children}</External>:<span>{children}</span>,
    img:({alt})=><span className="muted">[Изображение: {alt || 'без описания'}. См. оригинал.]</span>,
    h2:({children})=><h2 id={String(children).replace(/\s+/g,'-')}>{children}</h2>,
    h3:({children})=><h3 id={String(children).replace(/\s+/g,'-')}>{children}</h3>
  }}>{text}</ReactMarkdown>;
}
export function StudyIllustration() {
  return <svg className="study-illustration" viewBox="0 0 360 260" fill="none" aria-hidden="true"><circle cx="193" cy="128" r="109" fill="#e5eaf0"/><circle cx="277" cy="53" r="7" fill="#c7d3df"/><circle cx="67" cy="130" r="4" fill="#bdcbd8"/><path d="M70 223h232" stroke="#b8c6d4" strokeWidth="2" strokeLinecap="round"/><rect x="93" y="195" width="191" height="25" rx="5" fill="#a9bdb7"/><path d="M112 207h150" stroke="#dce7e1" strokeWidth="2"/><rect x="80" y="165" width="191" height="27" rx="5" fill="#1d385b"/><path d="M100 178h149" stroke="#627c9a" strokeWidth="2"/><rect x="105" y="137" width="181" height="25" rx="5" fill="#d8b995"/><path d="M124 149h144" stroke="#f5e5d3" strokeWidth="2"/><path d="M185 136V60m-20 76h40m-11-80a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#344f70" strokeWidth="5" strokeLinecap="round"/><path d="M139 80h92m-87 0-21 39h42l-21-39Zm82 0-21 39h42l-21-39Z" stroke="#344f70" strokeWidth="3" strokeLinejoin="round"/><path d="M122 119c2 19 40 19 44 0m38 0c3 19 39 19 44 0" fill="#93aba8" stroke="#344f70" strokeWidth="2"/><path d="m285 188 11-42m-9 29c-21-4-24-22-24-22 21-2 27 10 24 22Zm5-15c-6-16 9-27 9-27 11 16 0 26-9 27Z" fill="#91a9a4"/><rect x="276" y="187" width="27" height="33" rx="5" fill="#e4d6c4"/><path d="m97 66 4-11 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="#d5b68f"/><path d="m250 35 3-7 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#839baf"/></svg>;
}
