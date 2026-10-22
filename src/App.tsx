import { useEffect, useState, type FormEvent } from 'react';
import { Home, BookOpen, CalendarDays, ClipboardList, GraduationCap, UsersRound, Landmark, Building2, Bookmark, Search, Sun, Moon, Menu, X, ArrowUpRight, ChevronRight, CircleHelp, MapPin, Clock3, type LucideIcon } from 'lucide-react';
import { catalogSchema, type Catalog } from './lib/schema';
import { readLocal, ufaDate, ufaTime, formatDate } from './lib/utils';
import { useMarks, useRoute } from './lib/state';
import { Empty, External } from './components/UI';
import { HomePage, SubjectsPage, MaterialPage, TopicPage, MaterialsList, SearchPage, FavoritesPage } from './pages/Study';
import { TeachersPage, TeacherPage, DepartmentsPage, GroupPage, InstitutePage, HelpPage } from './pages/Community';
import { SchedulePage, AssignmentsPage, ExamsPage } from './pages/Planner';

export const navigation: {path:string;title:string;icon:LucideIcon;group:number}[]=[
  {path:'/',title:'Главная',icon:Home,group:0},
  {path:'/subjects',title:'Предметы',icon:BookOpen,group:0},
  {path:'/schedule',title:'Расписание',icon:CalendarDays,group:0},
  {path:'/assignments',title:'Задания',icon:ClipboardList,group:0},
  {path:'/exams',title:'Подготовка к экзаменам',icon:GraduationCap,group:0},
  {path:'/favorites',title:'Избранное',icon:Bookmark,group:0},
  {path:'/teachers',title:'Преподаватели',icon:UsersRound,group:1},
  {path:'/departments',title:'Кафедры',icon:Landmark,group:1},
  {path:'/group',title:'Наша группа',icon:UsersRound,group:1},
  {path:'/institute',title:'Институт и ссылки',icon:Building2,group:1}
];
export function App() {
  const {path,query}=useRoute();
  const [catalog,setCatalog]=useState<Catalog|null>(null),[loadError,setLoadError]=useState('');
  const [menu,setMenu]=useState(false),[search,setSearch]=useState('');
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width:800px)').matches);
  const [theme,setTheme]=useState(()=>readLocal<'light'|'dark'>('cabinet-theme','light',(v):v is 'light'|'dark'=>v==='light'||v==='dark'));
  const [themeError,setThemeError]=useState(false);
  const [now,setNow]=useState(new Date());
  const favorites=useMarks('cabinet-favorites'),done=useMarks('cabinet-done'),known=useMarks('cabinet-known'),repeat=useMarks('cabinet-repeat');
  useEffect(()=>{const controller=new AbortController();fetch(`${import.meta.env.BASE_URL}generated/catalog.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Каталог недоступен');return r.json();}).then(v=>setCatalog(catalogSchema.parse(v))).catch(e=>{if(e.name!=='AbortError')setLoadError('Не удалось загрузить каталог. Проверьте подключение и обновите страницу.');});return()=>controller.abort();},[]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('cabinet-theme',JSON.stringify(theme));setThemeError(false);}catch{setThemeError(true);}},[theme]);
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{setMenu(false);setSearch(query.get('q') || '');document.title=`${navigation.find(n=>n.path===path)?.title || 'Учебный кабинет'} · ПОНБ-УП-304С`;requestAnimationFrame(()=>document.querySelector<HTMLElement>('h1')?.focus({preventScroll:true}));},[path,query.toString()]);
  useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[]);
  useEffect(()=>{const media=window.matchMedia('(max-width:800px)');const update=()=>setMobile(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{
    if(!menu||!mobile)return;
    const sidebar=document.getElementById('sidebar');
    sidebar?.querySelector<HTMLElement>('a')?.focus();document.body.style.overflow='hidden';
    const trap=(e:KeyboardEvent)=>{
      if(e.key!=='Tab')return;
      const elements=sidebar?.querySelectorAll<HTMLElement>('a,button');if(!elements?.length)return;
      const first=elements[0],last=elements[elements.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    window.addEventListener('keydown',trap);
    return()=>{document.body.style.overflow='';window.removeEventListener('keydown',trap);document.querySelector<HTMLElement>('.menu-button')?.focus();};
  },[menu,mobile]);
  function submit(e:FormEvent) {e.preventDefault();location.hash='/search?q='+encodeURIComponent(search);}
  const active=navigation.find(n=>n.path==='/'?path==='/':path.startsWith(n.path));
  function content() {
    if(loadError)return <Empty title="Не удалось открыть кабинет">{loadError} <button onClick={()=>location.reload()}>Повторить</button></Empty>;
    if(!catalog)return <div className="loading" role="status">Открываем учебный кабинет…</div>;
    const props={catalog,favorites};
    if(path==='/')return <HomePage {...props} now={now}/>;
    if(path==='/subjects' || path.startsWith('/subjects/'))return <SubjectsPage {...props} subjectId={path.split('/')[2]}/>;
    if(path.startsWith('/topics/'))return <TopicPage {...props} topicId={path.split('/')[2]}/>;
    if(path.startsWith('/materials/'))return <MaterialPage {...props} materialId={path.split('/')[2]}/>;
    if(path==='/materials' || path==='/tasks')return <MaterialsList {...props} tasksOnly={path==='/tasks'}/>;
    if(path==='/search')return <SearchPage {...props} query={query.get('q') || ''}/>;
    if(path==='/favorites')return <FavoritesPage {...props}/>;
    if(path==='/schedule')return <SchedulePage catalog={catalog} now={now}/>;
    if(path==='/assignments')return <AssignmentsPage catalog={catalog} done={done} now={now}/>;
    if(path==='/exams')return <ExamsPage catalog={catalog} known={known} repeat={repeat}/>;
    if(path==='/teachers')return <TeachersPage catalog={catalog}/>;
    if(path.startsWith('/teachers/'))return <TeacherPage teacherId={path.split('/')[2]}/>;
    if(path==='/departments' || path.startsWith('/departments/'))return <DepartmentsPage departmentId={path.split('/')[2]}/>;
    if(path==='/group')return <GroupPage catalog={catalog}/>;
    if(path==='/institute')return <InstitutePage/>;
    if(path==='/help')return <HelpPage/>;
    return <Empty title="Такой страницы нет">Возможно, ссылка устарела. <a href="#/">Перейти на главную →</a></Empty>;
  }
  return <div className="app-shell">
    <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Перейти к содержимому</a>
    {menu && <button className="menu-backdrop" aria-label="Закрыть меню" onClick={()=>setMenu(false)}/>}
    <aside id="sidebar" className={`sidebar ${menu?'is-open':''}`} aria-label="Боковая панель" inert={mobile&&!menu?true:undefined}>
      <a className="brand" href="#/"><span className="brand-icon"><BookOpen size={25}/></span><span>кабинет<span className="brand-dot">.</span><small>ПОНБ-УП-304С</small></span></a>
      <button className="mobile-close icon-button" aria-label="Закрыть меню" onClick={()=>setMenu(false)}><X/></button>
      <nav aria-label="Основная навигация">{[0,1].map(group=><div className="nav-group" key={group}><div className="nav-label">{group===0?'УЧЕБНОЕ ПРОСТРАНСТВО':'ИНСТИТУТ И ГРУППА'}</div>{navigation.filter(n=>n.group===group).map(({path:href,title,icon:Icon})=><a key={href} href={'#'+href} className={`nav-item ${active?.path===href?'active':''}`} aria-current={active?.path===href?'page':undefined}><Icon size={19}/><span>{title}</span>{href==='/favorites' && !!favorites.values.length && <span className="nav-count">{favorites.values.length}</span>}</a>)}</div>)}</nav>
      <div className="sidebar-bottom"><a href="#/help" className="help-link"><CircleHelp size={18}/>Как устроен кабинет<ArrowUpRight size={15}/></a><div className="institute-note"><span className="tiny-building"><Building2 size={21}/></span><div>Институт права УУНиТ<small>Уфа, Республика Башкортостан</small></div></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="menu-button icon-button" onClick={()=>setMenu(v=>!v)} aria-label="Открыть меню" aria-expanded={menu}><Menu/></button><div className="breadcrumb">Учебный кабинет <ChevronRight size={14}/><span>{active?.title || (path==='/search'?'Поиск':'Материалы')}</span></div><form className="global-search" onSubmit={submit}><Search size={18}/><input aria-label="Поиск по кабинету" placeholder="Найти в кабинете…" value={search} onChange={e=>setSearch(e.target.value)}/><button type="submit" aria-label="Найти"><span aria-hidden="true">↵</span></button></form><button className="icon-button theme-button" onClick={()=>setTheme(t=>t==='light'?'dark':'light')} aria-label={theme==='light'?'Включить тёмную тему':'Включить светлую тему'}>{theme==='light'?<Moon size={19}/>:<Sun size={19}/>}</button><span className="group-avatar" title="ПОНБ-УП-304С">304<span>С</span></span></header>
      <main id="main" tabIndex={-1}>
        {(themeError || favorites.error || done.error || known.error || repeat.error) && <div role="status" className="notice">Хранилище браузера недоступно: личные настройки могут не сохраниться после закрытия страницы.</div>}
        {content()}
      </main>
      <footer><div>Неофициальный учебный кабинет группы ПОНБ-УП-304С<small>Создан для учёбы. Не является официальным сайтом института.</small></div><External href="https://law-bsu.ru/">Сайт института</External><span className="footer-time"><MapPin size={13}/>Уфа <Clock3 size={13}/>{ufaTime(now)} · UTC+5</span></footer>
    </div>
  </div>;
}
