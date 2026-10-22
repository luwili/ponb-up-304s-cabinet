#!/usr/bin/env python3
"""
Скрипт прямой высокоскоростной синхронизации расписания группы ПОНБ-УП-304С
и объявлений института/куратора с личным кабинетом ИСУ УУНиТ (https://isu.uust.ru).

Параллельно запрашивает:
1. Расписание группы (модуль schedule_2024_script.php)
2. Официальную ленту объявлений института и ректората (/viewnews/)
3. Объединяет с кураторскими и закрепленными объявлениями
"""

import sys
import os
import json
import ssl
import re
import html
import urllib.request
import urllib.parse
import http.cookiejar
from datetime import datetime, timezone, timedelta
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

GROUP_ID = 13799
SEMESTER_ID = 241
SEMESTER_START = datetime(2026, 9, 1)
UFA_TZ = timezone(timedelta(hours=5))

SUBJECT_MAP = {
    'Основы финансовой грамотности': 'fin-gramotnost',
    'Специальная профессиональная подготовка': 'spec-podgotovka',
    'Финансовое право': 'fin-pravo',
    'Гражданское право (часть 2)': 'grazhd-pravo-2',
    'Уголовно-процессуальное право (уголовный процесс)': 'ugolov-proc',
    'Административный судебный процесс': 'admin-sud-proc',
    'Общая физическая подготовка': 'fizra',
    'Экологическое право': 'eco-pravo',
    'Уголовное право (особенная часть)': 'ugolov-pravo-osob',
    'Гражданское процессуальное право (гражданский процесс)': 'grazhd-proc',
}

WEEKDAYS = [
    (1, 'Понедельник'),
    (2, 'Вторник'),
    (3, 'Среда'),
    (4, 'Четверг'),
    (5, 'Пятница'),
    (6, 'Суббота'),
]

BELL_SCHEDULE = [
    {"pair": 1, "timeStart": "08:00", "timeEnd": "09:20", "break": "15 минут"},
    {"pair": 2, "timeStart": "09:35", "timeEnd": "10:55", "break": "40 минут (большая перемена)"},
    {"pair": 3, "timeStart": "11:35", "timeEnd": "12:55", "break": "15 минут"},
    {"pair": 4, "timeStart": "13:10", "timeEnd": "14:30", "break": "15 минут"},
    {"pair": 5, "timeStart": "14:45", "timeEnd": "16:05", "break": ""},
]

PAIR_TIMES = {
    1: ("08:00", "09:20"),
    2: ("09:35", "10:55"),
    3: ("11:35", "12:55"),
    4: ("13:10", "14:30"),
    5: ("14:45", "16:05")
}

def get_credentials():
    login = os.environ.get('ISU_LOGIN')
    password = os.environ.get('ISU_PASSWORD')
    if login and password:
        return login.strip(), password.strip()
    
    cred_file = Path(__file__).resolve().parent.parent / 'private-data' / 'isu_credentials.json'
    if cred_file.exists():
        try:
            with open(cred_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('login', '').strip(), data.get('password', '').strip()
        except Exception:
            pass
    return None, None

def calculate_current_week():
    now_ufa = datetime.now(UFA_TZ)
    monday_start = SEMESTER_START.replace(tzinfo=UFA_TZ) - timedelta(days=SEMESTER_START.weekday())
    
    if now_ufa.weekday() == 6 and now_ufa.hour >= 12:
        target_date = now_ufa + timedelta(days=1)
    else:
        target_date = now_ufa
        
    current_monday = target_date - timedelta(days=target_date.weekday())
    current_monday = current_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    diff_days = (current_monday - monday_start).days
    return max(1, diff_days // 7 + 1)

def create_opener():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cj),
        urllib.request.HTTPSHandler(context=ctx)
    )

def authenticate_isu(opener, login, password):
    """Выполняет вход в личный кабинет ИСУ УУНиТ."""
    req1 = urllib.request.Request(
        "https://isu.uust.ru/login/",
        headers={"User-Agent": "Mozilla/5.0"}
    )
    html1 = opener.open(req1, timeout=6).read().decode('utf-8')
    form_num_match = re.search(r"name=[\"']form_num[\"']\s+value=[\"']([^\"']+)[\"']", html1)
    if not form_num_match:
        raise RuntimeError("Не удалось получить form_num на странице логина ИСУ")
    form_num = form_num_match.group(1)

    login_data = urllib.parse.urlencode({
        "form_num": form_num,
        "login": login,
        "password": password
    }).encode('utf-8')

    opener.open(urllib.request.Request(
        "https://isu.uust.ru/login/",
        data=login_data,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://isu.uust.ru/login/",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    ), timeout=6)

def fetch_schedule_isu(opener, target_week):
    """Запрашивает расписание занятий группы ПОНБ-УП-304С из ИСУ."""
    post_data = urllib.parse.urlencode({
        "group_id": GROUP_ID,
        "week": target_week,
        "funct": "group",
        "show_temp": 0
    }).encode('utf-8')

    r = opener.open(urllib.request.Request(
        "https://isu.uust.ru/module/schedule/schedule_2024_script.php",
        data=post_data,
        headers={
            "User-Agent": "Mozilla/5.0",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    ), timeout=6)
    resp_html = r.read().decode('utf-8')

    pattern = r"\$\('#(\d+)_(\d+)_group'\)\.append\('<div><br>(.*?)<br><button[^>]*>([^<]+)</button><br><button[^>]*>([^<]+)</button><br></div>'\)"
    matches = re.findall(pattern, resp_html)

    parsed_entries = []
    for pair_str, day_str, subj_raw, teacher, room in matches:
        pair_num = int(pair_str)
        day_num = int(day_str)
        
        type_m = re.search(r'\(((?:Практика|Лекция|Семинар|Лабораторная|Зачёт|Экзамен)[^()]*(\([^()]*\))?)\)$', subj_raw.strip())
        lesson_type = type_m.group(1).strip() if type_m else "Практика (семинар)"
        subj_title = re.sub(r'\s*\(' + re.escape(lesson_type) + r'\)$', '', subj_raw.strip())

        time_start, time_end = PAIR_TIMES.get(pair_num, ("08:00", "09:20"))
        parsed_entries.append({
            'day': day_num,
            'pair': pair_num,
            'timeStart': time_start,
            'timeEnd': time_end,
            'subject': subj_title,
            'type': lesson_type,
            'teacher': teacher.strip(),
            'room': room.strip()
        })

    return parsed_entries

def fetch_announcements_isu(opener):
    """Синхронизирует официальные объявления института и университета из ИСУ УУНиТ."""
    try:
        home_html = opener.open("https://isu.uust.ru/", timeout=6).read().decode('utf-8', errors='ignore')
    except Exception as e:
        print("Не удалось загрузить главную страницу объявлений ИСУ:", e)
        return []

    idx = home_html.find("Новостная лента студентов")
    if idx == -1:
        return []

    news_block = home_html[idx:idx+9000]
    items = re.findall(r"<li[^>]*>(.*?)</li>", news_block, re.DOTALL)
    
    def parse_item(it):
        link_m = re.search(r"href=[\"'](/viewnews/([a-f0-9]+)/?)[\"']>([^<]+)</a>", it)
        if not link_m:
            return None
        rel_url = link_m.group(1)
        art_hash = link_m.group(2)
        raw_title = html.unescape(link_m.group(3).strip())
        
        date_m = re.search(r"\((\d{2}\.\d{2}\.\d{4})\)", raw_title)
        if date_m:
            pub_date = date_m.group(1)
            title = raw_title.replace(f"({pub_date})", "").strip()
            d, m, y = pub_date.split(".")
            iso_date = f"{y}-{m}-{d}"
        else:
            title = raw_title
            iso_date = datetime.now(UFA_TZ).strftime("%Y-%m-%d")

        img_m = re.search(r"src=[\"'](https://[^\s\"']+)[\"']", it)
        img_url = img_m.group(1) if img_m else ""

        full_url = f"https://isu.uust.ru{rel_url}"
        summary = title
        try:
            art_html = opener.open(full_url, timeout=3).read().decode('utf-8', errors='ignore')
            quote_m = re.search(r"<blockquote>\s*<p>(.*?)</p>\s*</blockquote>", art_html, re.DOTALL)
            if quote_m:
                summary = re.sub(r"<[^>]+>", " ", quote_m.group(1))
            else:
                p_idx = art_html.find("panel-body")
                if p_idx != -1:
                    raw_p = art_html[p_idx+10:p_idx+3500]
                    raw_p = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw_p, flags=re.DOTALL)
                    summary = re.sub(r"<[^>]+>", " ", raw_p)
            summary = html.unescape(summary)
            summary = re.sub(r"\s+", " ", summary).strip()
            summary = re.sub(r"^style=[^\s>]+>\s*", "", summary)
            summary = re.sub(r"^\d{2}\.\d{2}\.\d{4}\s*", "", summary)
            if len(summary) > 280:
                summary = summary[:280].rstrip() + "..."
        except Exception:
            pass

        item_dict = {
            "id": f"ann-isu-{art_hash[:8]}",
            "title": title,
            "content": summary or title,
            "date": iso_date,
            "isPinned": False,
            "author": "Институт / Ректорат УУНиТ",
            "tag": "Институт",
            "url": full_url
        }
        if img_url:
            item_dict["imageUrl"] = img_url

        return item_dict

    with ThreadPoolExecutor(max_workers=5) as pool:
        parsed_items = [res for res in pool.map(parse_item, items[:6]) if res]

    return parsed_items

def fetch_session_data_isu(opener):
    """Синхронизирует экзамены, зачеты и учебный план из личного кабинета ИСУ УУНиТ."""
    try:
        home_html = opener.open("https://isu.uust.ru/", timeout=8).read().decode('utf-8', errors='ignore')
        pv_m = re.search(r'href=[\"\x27](/student_points_view/(\d+)/([a-f0-9]+)/?)[\"\x27]', home_html)
        if not pv_m:
            print("Ссылка на успеваемость не найдена в главном меню ИСУ.")
            return None

        points_rel_url = pv_m.group(1)
        student_id = int(pv_m.group(2))
        student_hex = pv_m.group(3)

        url_handler = 'https://isu.uust.ru/module/contingent/student_points_view_handler.php'
        r_books = opener.open(urllib.request.Request(
            url_handler,
            data=json.dumps({'function': 'get_study_books_new', 'student_isu_person_id': student_id, 'hex': student_hex}).encode('utf-8'),
            headers={'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'}
        ), timeout=8)
        books = json.loads(r_books.read().decode('utf-8'))
        active_book = list(books.values())[0] if isinstance(books, dict) else books[0]

        r_plan = opener.open(urllib.request.Request(
            url_handler,
            data=json.dumps({
                'function': 'get_points_try',
                'study_book': active_book['study_book'],
                'ind_plan': False,
                'student_isu_person_id': student_id,
                'group_id': active_book['group_id'],
                'hex': student_hex
            }).encode('utf-8'),
            headers={'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'}
        ), timeout=8)
        res = json.loads(r_plan.read().decode('utf-8'))

        root_dir = Path(__file__).resolve().parent.parent
        subj_path = root_dir / 'src' / 'data' / 'subjects.json'
        sess_path = root_dir / 'src' / 'data' / 'session.json'

        subjects = []
        if subj_path.exists():
            with open(subj_path, 'r', encoding='utf-8') as f:
                subjects = json.load(f)

        TYPE_NAMES = {
            '3': 'Экзамен',
            '2': 'Зачёт',
            '10': 'РГР',
            '6': 'Диф. зачёт',
            '1': 'Диф. зачёт',
            '4': 'Курсовая работа',
            '5': 'Курсовой проект',
            '7': 'Контрольная работа',
            '17': 'Контрольная работа',
            '15': 'Эссе',
            '9': 'Реферат',
            '16': 'ГИА'
        }

        sem5_items = res.get('plan', {}).get('5', {})
        items = sem5_items.values() if isinstance(sem5_items, dict) else sem5_items

        exams = []
        credits_list = []

        for disc in items:
            if not isinstance(disc, dict):
                continue
            title = (disc.get('subject_study_book') or disc.get('subject') or '').strip()
            if not title:
                continue
            credits_val = disc.get('credits', 0)
            lec = disc.get('lec', 0)
            prc = disc.get('prc', 0)
            slf = disc.get('slf', 0)
            total_hours = disc.get('summaryHoursStudied', lec + prc + slf)

            matched_subj = None
            for s in subjects:
                s_t = s['title'].strip().lower()
                if s_t in title.lower() or title.lower() in s_t:
                    matched_subj = s
                    break

            teacher = matched_subj['teacherName'] if matched_subj else 'Преподаватель кафедры'
            department = matched_subj['departmentName'] if matched_subj else 'Институт права УУНиТ'

            points = disc.get('points', {})
            if isinstance(points, dict):
                for k, v in points.items():
                    if isinstance(v, dict) and v.get('plan'):
                        ctrl_type = TYPE_NAMES.get(str(k), 'Аттестация')
                        best_mark = v.get('best_mark')
                        mark_str = best_mark.get('point_title') if best_mark else None
                        is_passed = bool(mark_str and 'не' not in mark_str.lower())
                        status = f'Сдано ({mark_str})' if mark_str else 'Предстоит сдача'

                        entry = {
                            'id': f'sem5-{disc.get("discipline_id", len(exams)+len(credits_list)+1)}-{k}',
                            'disciplineId': disc.get('discipline_id'),
                            'subject': title,
                            'shortSubject': matched_subj['shortTitle'] if matched_subj else title,
                            'subjectId': matched_subj['id'] if matched_subj else None,
                            'controlType': ctrl_type,
                            'credits': credits_val,
                            'hours': {
                                'lectures': lec,
                                'practice': prc,
                                'self': slf,
                                'total': total_hours
                            },
                            'teacher': teacher,
                            'department': department,
                            'status': status,
                            'passed': is_passed,
                            'mark': mark_str
                        }
                        if ctrl_type == 'Экзамен':
                            exams.append(entry)
                        else:
                            credits_list.append(entry)

        # All semesters overview
        all_sems = {}
        for s_num in sorted([k for k in res.get('plan', {}).keys() if str(k).isdigit()], key=int):
            s_data = res['plan'][s_num]
            s_items = s_data.values() if isinstance(s_data, dict) else s_data
            disc_list = []
            for d in s_items:
                if not isinstance(d, dict):
                    continue
                d_title = (d.get('subject_study_book') or d.get('subject') or '').strip()
                if not d_title:
                    continue
                pts = d.get('points', {})
                ctrl_list = []
                if isinstance(pts, dict):
                    for pk, pv in pts.items():
                        if isinstance(pv, dict) and pv.get('plan'):
                            c_name = TYPE_NAMES.get(str(pk), f'Тип {pk}')
                            bm = pv.get('best_mark')
                            bm_title = bm.get('point_title') if bm else None
                            ctrl_list.append({
                                'type': c_name,
                                'mark': bm_title,
                                'passed': bool(bm_title and 'не' not in bm_title.lower())
                            })
                disc_list.append({
                    'title': d_title,
                    'credits': d.get('credits', 0),
                    'controls': ctrl_list
                })
            all_sems[str(s_num)] = disc_list

        session_data = {
            'group': 'ПОНБ-УП-304С',
            'specialty': '40.05.01 Правовое обеспечение национальной безопасности',
            'specialization': 'Уголовно-правовая',
            'studyBook': active_book.get('study_book', '25120615'),
            'currentSemester': 5,
            'course': 3,
            'academicYear': '2026/2027',
            'averageGrade': res.get('average_point', 4.09),
            'lastSyncedAt': datetime.now(UFA_TZ).strftime('%Y-%m-%d %H:%M:%S UTC+5'),
            'currentSession': {
                'title': 'Зимняя экзаменационная сессия 2026/2027 (5 семестр, 3 курс)',
                'examsCount': len(exams),
                'creditsCount': len(credits_list),
                'totalDisciplines': len(exams) + len(credits_list),
                'exams': exams,
                'credits': credits_list
            },
            'allSemesters': all_sems
        }

        with open(sess_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)

        # Update subjects.json examType
        updated_any = False
        for s in subjects:
            s_t = s['title'].strip().lower()
            for ex in exams:
                if ex['subject'].strip().lower() in s_t or s_t in ex['subject'].strip().lower():
                    if s.get('examType') != 'Экзамен':
                        s['examType'] = 'Экзамен'
                        updated_any = True
            for cr in credits_list:
                if cr['subject'].strip().lower() in s_t or s_t in cr['subject'].strip().lower():
                    # If it was marked as Exam, but is Credit in semester 5
                    if s.get('examType') != 'Зачёт' and not any(ex['subject'].strip().lower() in s_t for ex in exams):
                        s['examType'] = 'Зачёт'
                        updated_any = True

        if updated_any and subjects:
            with open(subj_path, 'w', encoding='utf-8') as f:
                json.dump(subjects, f, ensure_ascii=False, indent=2)

        print(f"Данные сессии успешно синхронизированы: {len(exams)} экзаменов, {len(credits_list)} зачётов. Сохранено в {sess_path}.")
        return session_data
    except Exception as e:
        print("Ошибка синхронизации сессии из ИСУ УУНиТ:", e)
        return None

def sync_all(target_week=None, force=False):
    if target_week is None:
        target_week = calculate_current_week()

    now_ufa = datetime.now(UFA_TZ)
    print(f"[{now_ufa.strftime('%Y-%m-%d %H:%M:%S')} UTC+5] Синхронизация расписания и объявлений для недели {target_week}...")

    login, password = get_credentials()
    opener = create_opener()

    sched_entries = []
    ann_entries = []

    if login and password:
        try:
            print(f"Авторизация в ИСУ УУНиТ под аккаунтом {login[:4]}***...")
            authenticate_isu(opener, login, password)

            # Параллельный сбор расписания, объявлений и сессии
            with ThreadPoolExecutor(max_workers=3) as ex:
                f_sched = ex.submit(fetch_schedule_isu, opener, target_week)
                f_ann = ex.submit(fetch_announcements_isu, opener)
                f_sess = ex.submit(fetch_session_data_isu, opener)
                sched_entries = f_sched.result()
                ann_entries = f_ann.result()
                f_sess.result()

            print(f"Из ИСУ УУНиТ получено: {len(sched_entries)} пар, {len(ann_entries)} объявлений.")
        except Exception as e:
            print("Ошибка при параллельном запросе к ИСУ УУНиТ:", e)

    # Резервный источник расписания при сбое авторизации
    if not sched_entries:
        try:
            print("Запрос расписания через резервный открытый API dev.uust-time.ru...")
            url = f"https://dev.uust-time.ru/api/v/852972/schedule/0/{GROUP_ID}/semester/{SEMESTER_ID}?site=schedule"
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
                data = json.loads(r.read().decode('utf-8'))
            
            week_str = str(target_week)
            for e in [x for x in data if week_str in x.get('schedule_weeks', [])]:
                p_num = e.get('schedule_time_num', 1)
                t_start, t_end = PAIR_TIMES.get(p_num, ("08:00", "09:20"))
                bld = e.get('building_short_title', '')
                rm = e.get('room_title', '')
                sched_entries.append({
                    'day': e.get('schedule_weekday_id'),
                    'pair': p_num,
                    'timeStart': t_start,
                    'timeEnd': t_end,
                    'subject': e.get('schedule_subject_title', ''),
                    'type': e.get('type', 'Практика (семинар)'),
                    'teacher': e.get('teacher_fullname', '').strip(),
                    'room': f"{bld} - {rm}".strip('- ') if rm else 'Институт права'
                })
        except Exception as e2:
            print("Ошибка резервного API расписания:", e2)

    # 1. Формирование расписания
    monday_start = SEMESTER_START.replace(tzinfo=UFA_TZ) - timedelta(days=SEMESTER_START.weekday())
    week_monday = monday_start + timedelta(weeks=target_week - 1)

    days_data = []
    for day_id, day_name in WEEKDAYS:
        day_date = week_monday + timedelta(days=day_id - 1)
        day_entries = [e for e in sched_entries if e['day'] == day_id]
        day_entries.sort(key=lambda x: x['pair'])

        pairs = []
        for idx, entry in enumerate(day_entries, start=1):
            subj_title = entry['subject']
            subj_id = SUBJECT_MAP.get(subj_title, 'other')
            
            raw_room = entry['room']
            if any(k in raw_room for k in ['313', '103', '207', '315', '401', '405', '107']):
                room_num = re.search(r'\b(313|103|207|315|401|405|107)\b', raw_room)
                room_str = f"каб. {room_num.group(1)} (Достоевского 131)" if room_num else raw_room
            elif 'физическая' in subj_title.lower():
                room_str = "Спорткомплекс УУНиТ (Уточняется)"
            else:
                room_str = raw_room or "Институт права"

            teacher = entry['teacher']
            if 'Нурмухаметов' in teacher:
                teacher = f"{teacher} (Куратор)"

            pairs.append({
                "id": f"sch-{day_id}-{idx}",
                "pairNumber": entry['pair'],
                "timeStart": entry['timeStart'],
                "timeEnd": entry['timeEnd'],
                "subjectId": subj_id,
                "subjectName": subj_title,
                "type": entry['type'],
                "teacher": teacher,
                "room": room_str,
                "notes": f"Занятие по расписанию ИСУ УУНиТ ({entry['type']})"
            })

        days_data.append({
            "dayOfWeek": day_id,
            "dayName": day_name,
            "date": day_date.strftime("%Y-%m-%d"),
            "pairs": pairs
        })

    root_dir = Path(__file__).resolve().parent.parent
    sched_path = root_dir / 'src' / 'data' / 'schedule.json'
    ann_path = root_dir / 'src' / 'data' / 'announcements.json'

    # Сохранение расписания
    if sched_entries or force:
        doc_sched = {
            "group": "ПОНБ-УП-304С",
            "semester": "Осенний семестр 2026/2027",
            "timezone": "Asia/Yekaterinburg",
            "currentWeekNumber": target_week,
            "weekType": "even" if target_week % 2 == 0 else "odd",
            "building": "Институт права (ул. Достоевского, 131)",
            "lastSyncedAt": now_ufa.strftime('%Y-%m-%d %H:%M:%S UTC+5'),
            "bellSchedule": BELL_SCHEDULE,
            "days": days_data
        }
        with open(sched_path, 'w', encoding='utf-8') as f:
            json.dump(doc_sched, f, ensure_ascii=False, indent=2)
        print(f"Расписание сохранено в {sched_path}.")

    # 2. Формирование и слияние объявлений
    base_defaults = [
        {
            "id": "ann-1",
            "title": "Организационное собрание группы ПОНБ-УП-304С с куратором",
            "content": "Уважаемые студенты группы ПОНБ-УП-304С! В среду после 4 пары (в 14:40) в аудитории 107 (ул. Достоевского, 131) состоится кураторский час. Повестка: промежуточная аттестация, посещаемость занятий, подготовка к зачетной сессии и участие в научно-практической конференции Института права.",
            "date": "2026-10-21",
            "isPinned": True,
            "author": "Нурмухаметов Р.Н., куратор группы",
            "tag": "Куратор"
        },
        {
            "id": "ann-2",
            "title": "Расписание на осенний семестр 2026: актуальный график",
            "content": "Утверждено и опубликовано расписание учебных занятий группы ПОНБ-УП-304С на 8-ю неделю. Просьба обратить внимание на пары по административному процессу в четверг (ауд. 313) и финансовому праву (ауд. 405). Официальный первоисточник: https://law-bsu.ru/schedules.",
            "date": "2026-10-19",
            "isPinned": True,
            "author": "Учебная часть Института права",
            "tag": "Расписание"
        },
        {
            "id": "ann-3",
            "title": "Всероссийская студенческая научно-практическая конференция Института права УУНиТ",
            "content": "Кафедра уголовного права и процесса приглашает студентов специальности «Правовое обеспечение национальной безопасности» принять участие в секции уголовно-правовых и криминалистических исследований. Тезисы принимаются до 15 ноября.",
            "date": "2026-10-17",
            "isPinned": False,
            "author": "СНО Института права",
            "tag": "Наука"
        }
    ]

    curator_and_pinned = []
    if ann_path.exists():
        try:
            with open(ann_path, 'r', encoding='utf-8') as f:
                old_ann = json.load(f)
            for item in old_ann:
                if item.get('isPinned') or item.get('tag') in ('Куратор', 'Группа', 'Расписание', 'Наука') or not item.get('id', '').startswith('ann-isu-'):
                    curator_and_pinned.append(item)
        except Exception as e:
            print("Ошибка чтения существующих объявлений:", e)

    for b in base_defaults:
        if not any(x['id'] == b['id'] for x in curator_and_pinned):
            curator_and_pinned.append(b)

    # Исключаем дубликаты
    seen_ids = set()
    combined_ann = []

    for it in curator_and_pinned:
        if it['id'] not in seen_ids:
            seen_ids.add(it['id'])
            combined_ann.append(it)

    for it in ann_entries:
        if it['id'] not in seen_ids:
            seen_ids.add(it['id'])
            combined_ann.append(it)

    with open(ann_path, 'w', encoding='utf-8') as f:
        json.dump(combined_ann, f, ensure_ascii=False, indent=2)
    print(f"Объявления ({len(combined_ann)} шт.) успешно сохранены в {ann_path}.")

    return True

if __name__ == '__main__':
    target = None
    force = False
    for arg in sys.argv[1:]:
        if arg in ('--force', '-f'):
            force = True
        elif arg.isdigit():
            target = int(arg)
    sync_all(target, force=force)
