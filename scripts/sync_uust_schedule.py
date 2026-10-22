#!/usr/bin/env python3
"""
Скрипт прямой синхронизации расписания группы ПОНБ-УП-304С
с личным кабинетом ИСУ УУНиТ (https://isu.uust.ru).

Аутентифицируется через https://isu.uust.ru/login/ с учетными данными
и получает актуальное расписание из модуля schedule_2024_script.php.
"""

import sys
import os
import json
import ssl
import re
import urllib.request
import urllib.parse
import http.cookiejar
from datetime import datetime, timezone, timedelta
from pathlib import Path

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
    
    # Локальный файл в .gitignore
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

def fetch_from_isu_direct(login, password, target_week):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), urllib.request.HTTPSHandler(context=ctx))

    print(f"Авторизация в ИСУ УУНиТ (https://isu.uust.ru) под аккаунтом {login[:4]}***...")
    req1 = urllib.request.Request("https://isu.uust.ru/login/", headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    html1 = opener.open(req1).read().decode('utf-8')
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
        headers={"User-Agent": "Mozilla/5.0", "Referer": "https://isu.uust.ru/login/", "Content-Type": "application/x-www-form-urlencoded"}
    ))

    print(f"Запрос расписания группы ПОНБ-УП-304С (ID {GROUP_ID}) на неделю {target_week}...")
    post_data = urllib.parse.urlencode({
        "group_id": GROUP_ID,
        "week": target_week,
        "funct": "group",
        "show_temp": 0
    }).encode('utf-8')

    r = opener.open(urllib.request.Request(
        "https://isu.uust.ru/module/schedule/schedule_2024_script.php",
        data=post_data,
        headers={"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded"}
    ))
    resp_html = r.read().decode('utf-8')

    pattern = r"\$\('#(\d+)_(\d+)_group'\)\.append\('<div><br>(.*?)<br><button[^>]*>([^<]+)</button><br><button[^>]*>([^<]+)</button><br></div>'\)"
    matches = re.findall(pattern, resp_html)
    print(f"Успешно получено занятий из личного кабинета ИСУ: {len(matches)}")

    parsed_entries = []
    for pair_str, day_str, subj_raw, teacher, room in matches:
        pair_num = int(pair_str)
        day_num = int(day_str)
        
        # Разделяем название предмета и тип занятия: Название (Тип)
        m_type = re.search(r'^(.*?)\s*\((Практика [^)]*|Лекция|Семинар|Лабораторная [^)]*|Зачёт|Экзамен)\)$', subj_raw.strip())
        if m_type:
            subj_title = m_type.group(1).strip()
            lesson_type = m_type.group(2).strip()
        else:
            subj_title = subj_raw.strip()
            lesson_type = "Практика (семинар)"

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

def sync_schedule(target_week=None, force=False):
    if target_week is None:
        target_week = calculate_current_week()

    now_ufa = datetime.now(UFA_TZ)
    print(f"[{now_ufa.strftime('%Y-%m-%d %H:%M:%S')} UTC+5] Синхронизация расписания ПОНБ-УП-304С для недели {target_week}...")

    login, password = get_credentials()
    entries = []
    if login and password:
        try:
            entries = fetch_from_isu_direct(login, password, target_week)
        except Exception as e:
            print("Ошибка при запросе к личному кабинету ИСУ:", e)
            print("Переключение на резервный официальный API УУНиТ...")

    if not entries:
        # Резервный источник - официальный открытый API УУНиТ
        url = f"https://dev.uust-time.ru/api/v/852972/schedule/0/{GROUP_ID}/semester/{SEMESTER_ID}?site=schedule"
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            data = json.loads(r.read().decode('utf-8'))
        
        week_str = str(target_week)
        for e in [x for x in data if week_str in x.get('schedule_weeks', [])]:
            p_num = e.get('schedule_time_num', 1)
            t_start, t_end = PAIR_TIMES.get(p_num, ("08:00", "09:20"))
            bld = e.get('building_short_title', '')
            rm = e.get('room_title', '')
            entries.append({
                'day': e.get('schedule_weekday_id'),
                'pair': p_num,
                'timeStart': t_start,
                'timeEnd': t_end,
                'subject': e.get('schedule_subject_title', ''),
                'type': e.get('type', 'Практика (семинар)'),
                'teacher': e.get('teacher_fullname', '').strip(),
                'room': f"{bld} - {rm}".strip('- ') if rm else 'Уточняется'
            })

    monday_start = SEMESTER_START.replace(tzinfo=UFA_TZ) - timedelta(days=SEMESTER_START.weekday())
    week_monday = monday_start + timedelta(weeks=target_week - 1)

    days_data = []
    for day_id, day_name in WEEKDAYS:
        day_date = week_monday + timedelta(days=day_id - 1)
        day_entries = [e for e in entries if e['day'] == day_id]
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

    out_path = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'schedule.json'

    # Проверка изменений
    has_changes = True
    if out_path.exists() and not force:
        try:
            with open(out_path, 'r', encoding='utf-8') as f:
                old = json.load(f)
            if old.get('currentWeekNumber') == target_week and old.get('days') == days_data:
                has_changes = False
                print("Изменений в расписании ИСУ нет. Данные уже актуальны.")
        except Exception:
            pass

    if has_changes or force:
        doc = {
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
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        print(f"Расписание успешно обновлено из ИСУ УУНиТ и сохранено в {out_path}!")
        for d in days_data:
            print(f"  {d['dayName']} ({d['date']}): {len(d['pairs'])} пар")
        return True

    return False

if __name__ == '__main__':
    target = None
    force = False
    for arg in sys.argv[1:]:
        if arg in ('--force', '-f'):
            force = True
        elif arg.isdigit():
            target = int(arg)
    sync_schedule(target, force=force)
