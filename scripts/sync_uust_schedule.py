#!/usr/bin/env python3
"""
Скрипт автоматической синхронизации расписания группы ПОНБ-УП-304С
с официальным API расписания УУНиТ / ИСУ (dev.uust-time.ru / schedule.uust.ru).

ID группы ПОНБ-УП-304С: 13799
ID семестра: 241 (Осенний семестр 2026/2027)
Часовой пояс: Уфа (UTC+5 / Asia/Yekaterinburg)
"""

import sys
import json
import ssl
import urllib.request
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

def calculate_current_week():
    now_ufa = datetime.now(UFA_TZ)
    monday_start = SEMESTER_START.replace(tzinfo=UFA_TZ) - timedelta(days=SEMESTER_START.weekday())
    
    # Если воскресенье после 12:00, готовим расписание на следующую неделю
    if now_ufa.weekday() == 6 and now_ufa.hour >= 12:
        target_date = now_ufa + timedelta(days=1)
    else:
        target_date = now_ufa
        
    current_monday = target_date - timedelta(days=target_date.weekday())
    current_monday = current_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    diff_days = (current_monday - monday_start).days
    return max(1, diff_days // 7 + 1)

def fetch_schedule_from_isu(group_id=GROUP_ID, semester_id=SEMESTER_ID):
    url = f"https://dev.uust-time.ru/api/v/852972/schedule/0/{group_id}/semester/{semester_id}?site=schedule"
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CabinetSync/1.0)"})
    with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} while fetching schedule")
        return json.loads(r.read().decode('utf-8'))

def sync_schedule(target_week=None, force=False):
    if target_week is None:
        target_week = calculate_current_week()
    
    now_ufa = datetime.now(UFA_TZ)
    print(f"[{now_ufa.strftime('%Y-%m-%d %H:%M:%S')} UTC+5] Проверка расписания УУНиТ для недели {target_week}...")
    
    api_entries = fetch_schedule_from_isu()
    week_str = str(target_week)
    filtered = [e for e in api_entries if week_str in e.get('schedule_weeks', [])]
    print(f"Найдено занятий в базе ИСУ для недели {target_week}: {len(filtered)}")
    
    monday_start = SEMESTER_START.replace(tzinfo=UFA_TZ) - timedelta(days=SEMESTER_START.weekday())
    week_monday = monday_start + timedelta(weeks=target_week - 1)
    
    days_data = []
    for day_id, day_name in WEEKDAYS:
        day_date = week_monday + timedelta(days=day_id - 1)
        day_entries = [e for e in filtered if e.get('schedule_weekday_id') == day_id]
        day_entries.sort(key=lambda x: x.get('schedule_time_num', 0))
        
        pairs = []
        for idx, entry in enumerate(day_entries, start=1):
            pair_num = entry.get('schedule_time_num', idx)
            time_parts = entry.get('schedule_time_title', '').split('-')
            time_start = time_parts[0] if len(time_parts) > 0 else '08:00'
            time_end = time_parts[1] if len(time_parts) > 1 else '09:20'
            
            subj_title = entry.get('schedule_subject_title', '')
            subj_id = SUBJECT_MAP.get(subj_title, 'other')
            
            building = entry.get('building_short_title', '')
            room = entry.get('room_title', '')
            if room and any(k in room for k in ['313', '103', '207', '315', '401', '405', '107']):
                room_str = f"каб. {room} (Достоевского 131)"
            elif room:
                room_str = f"{building}-{room}".strip('-')
            elif 'физическая' in subj_title.lower():
                room_str = "Спорткомплекс УУНиТ (Уточняется)"
            else:
                room_str = "Институт права"
            
            teacher = entry.get('teacher_fullname', entry.get('teacher', 'Преподаватель кафедры')).strip()
            if 'Нурмухаметов' in teacher:
                teacher = f"{teacher} (Куратор)"
            
            pairs.append({
                "id": f"sch-{day_id}-{idx}",
                "pairNumber": pair_num,
                "timeStart": time_start,
                "timeEnd": time_end,
                "subjectId": subj_id,
                "subjectName": subj_title,
                "type": entry.get('type', 'Практика (семинар)'),
                "teacher": teacher,
                "room": room_str,
                "notes": entry.get('comment') or f"Занятие по расписанию ({entry.get('type', '')})"
            })
        
        days_data.append({
            "dayOfWeek": day_id,
            "dayName": day_name,
            "date": day_date.strftime("%Y-%m-%d"),
            "pairs": pairs
        })
    
    out_path = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'schedule.json'
    
    # Сравниваем с текущим файлом
    has_changes = True
    if out_path.exists() and not force:
        try:
            with open(out_path, 'r', encoding='utf-8') as f:
                old_data = json.load(f)
            if old_data.get('currentWeekNumber') == target_week and old_data.get('days') == days_data:
                has_changes = False
                print("Изменений в расписании не обнаружено. Данные актуальны.")
        except Exception as e:
            print("Ошибка при чтении текущего файла расписания:", e)
    
    if has_changes or force:
        schedule_doc = {
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
            json.dump(schedule_doc, f, ensure_ascii=False, indent=2)
        print(f"Расписание обновлено и сохранено в {out_path}!")
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
