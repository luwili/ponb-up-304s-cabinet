#!/usr/bin/env python3
"""
Скрипт синхронизации расписания группы ПОНБ-УП-304С
с официальным API расписания УУНиТ / ИСУ (dev.uust-time.ru / schedule.uust.ru).

ID группы ПОНБ-УП-304С: 13799
ID семестра: 241 (Осенний семестр 2026/2027)
"""

import sys
import json
import ssl
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

GROUP_ID = 13799
SEMESTER_ID = 241
SEMESTER_START = datetime(2026, 9, 1)

# Сопоставление названий предметов с subjectId
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
    monday_start = SEMESTER_START - timedelta(days=SEMESTER_START.weekday())
    now = datetime.now()
    diff_days = (now - monday_start).days
    return max(1, diff_days // 7 + 1)

def fetch_schedule_from_isu(group_id=GROUP_ID, semester_id=SEMESTER_ID):
    url = f"https://dev.uust-time.ru/api/v/852972/schedule/0/{group_id}/semester/{semester_id}?site=schedule"
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CabinetSync/1.0)"})
    with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} while fetching schedule")
        return json.loads(r.read().decode('utf-8'))

def sync_schedule(target_week=None):
    if target_week is None:
        target_week = calculate_current_week()
    
    print(f"Синхронизация расписания УУНиТ для недели {target_week}...")
    api_entries = fetch_schedule_from_isu()
    
    # Фильтрация по неделе
    week_str = str(target_week)
    filtered = [e for e in api_entries if week_str in e.get('schedule_weeks', [])]
    print(f"Найдено занятий в API для недели {target_week}: {len(filtered)}")
    
    # Вычисление дат недели
    monday_start = SEMESTER_START - timedelta(days=SEMESTER_START.weekday())
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
            room_str = f"каб. {room} (Достоевского 131)" if room and '313' in room or '103' in room or '207' in room or '315' in room or '401' in room or '405' in room or '107' in room else (f"{building}-{room}".strip('-') if room else "Уточняется")
            if 'Уточняется' in room_str or not room:
                room_str = "Спорткомплекс УУНиТ (Уточняется)" if 'физическая' in subj_title.lower() else "Институт права"
            
            teacher = entry.get('teacher_fullname', entry.get('teacher', 'Преподаватель кафедры'))
            if 'Нурмухаметов' in teacher:
                teacher = f"{teacher.strip()} (Куратор)"
            
            pairs.append({
                "id": f"sch-{day_id}-{idx}",
                "pairNumber": pair_num,
                "timeStart": time_start,
                "timeEnd": time_end,
                "subjectId": subj_id,
                "subjectName": subj_title,
                "type": entry.get('type', 'Практика (семинар)'),
                "teacher": teacher.strip(),
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
    schedule_doc = {
        "group": "ПОНБ-УП-304С",
        "semester": "Осенний семестр 2026/2027",
        "timezone": "Asia/Yekaterinburg",
        "currentWeekNumber": target_week,
        "weekType": "even" if target_week % 2 == 0 else "odd",
        "building": "Институт права (ул. Достоевского, 131)",
        "bellSchedule": BELL_SCHEDULE,
        "days": days_data
    }
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(schedule_doc, f, ensure_ascii=False, indent=2)
    
    print(f"Расписание успешно синхронизировано и сохранено в {out_path}!")
    for d in days_data:
        print(f"  {d['dayName']} ({d['date']}): {len(d['pairs'])} пар")

if __name__ == '__main__':
    target = int(sys.argv[1]) if len(sys.argv) > 1 else None
    sync_schedule(target)
