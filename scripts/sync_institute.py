#!/usr/bin/env python3
"""
Institute of Law UUST (УУНиТ) Synchronization Script.
Crawls official public pages of law-bsu.ru, extracts structured departments & faculty members,
and saves validated data to src/data/departments.json and src/data/teachers.json.
"""
import urllib.request
import re
import json
import os
import sys
from datetime import datetime

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
TODAY_STR = datetime.now().strftime('%Y-%m-%d')

GROUP_TEACHERS = {
    'Нурмухаметов Руслан Наилевич': {
        'subjects': ['Уголовно-процессуальное право (уголовный процесс)'],
        'role': 'Куратор группы ПОНБ-УП-304С'
    },
    'Фаткуллина Элина Раисовна': {
        'subjects': ['Основы финансовой грамотности']
    },
    'Вяткин Андрей Николаевич': {
        'subjects': ['Специальная профессиональная подготовка']
    },
    'Крылов Олег Михайлович': {
        'subjects': ['Финансовое право (Лекции)']
    },
    'Муратова Альмира Раисовна': {
        'subjects': ['Гражданское право (часть 2)']
    },
    'Нагаев Тимур Ирекович': {
        'subjects': ['Административный судебный процесс']
    },
    'Карамов Ильгиз Флоритович': {
        'subjects': ['Финансовое право (Практика)']
    },
    'Малкова Камилла Эдуардовна': {
        'subjects': ['Экологическое право']
    },
    'Матвеев Станислав Станиславович': {
        'subjects': ['Общая физическая подготовка']
    },
    'Метелёва Снежана Владимировна': {
        'subjects': ['Гражданское процессуальное право (гражданский процесс)']
    },
    'Мусабиров Эмиль Ильдарович': {
        'subjects': ['Уголовное право (особенная часть)']
    }
}

DEPARTMENTS_CONFIG = [
    {
        'id': 'ugolovnoe',
        'name': 'Кафедра уголовного права и процесса',
        'url': 'https://law-bsu.ru/ugolovnoe',
        'room': 'каб. 107 / 207',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Готовит высококвалифицированные кадры для работы в правоохранительных органах, органах следствия, дознания, прокуратуры, судебной системы и адвокатуры.'
    },
    {
        'id': 'civilpravo',
        'name': 'Кафедра гражданского права',
        'url': 'https://law-bsu.ru/civilpravo',
        'room': 'каб. 315',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Обеспечивает учебный процесс по гражданско-правовому профилю, корпоративному праву и предпринимательской деятельности.'
    },
    {
        'id': 'civilprocess',
        'name': 'Кафедра гражданского процесса',
        'url': 'https://law-bsu.ru/civilprocess',
        'room': 'каб. 103',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Готовит кадры для работы в судебной системе, нотариате, третейском разбирательстве и исполнительном производстве.'
    },
    {
        'id': 'gospravo',
        'name': 'Кафедра финансового и административного права',
        'url': 'https://law-bsu.ru/gospravo',
        'room': 'каб. 401 / 405',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Осуществляет подготовку специалистов в сфере публичных финансов, налогообложения, банковского права и административной юстиции.'
    },
    {
        'id': 'ecology',
        'name': 'Кафедра экологического и трудового права',
        'url': 'https://law-bsu.ru/ecology',
        'room': 'каб. 323',
        'email': 'ecopravo@uust.ru',
        'phone': '+7 (347) 252-55-14',
        'description': 'Осуществляет подготовку юридических кадров в области экологического, земельного, природоресурсного и трудового права.'
    },
    {
        'id': 'criminal',
        'name': 'Кафедра криминалистики',
        'url': 'https://law-bsu.ru/criminal',
        'room': 'каб. 103 / криминалистический полигон',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Готовит специалистов в области криминалистической техники, тактики следственных действий, судебных экспертиз и специальной подготовки.'
    },
    {
        'id': 'international',
        'name': 'Кафедра международного и интеграционного права',
        'url': 'https://law-bsu.ru/international',
        'room': 'каб. 313',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Осуществляет подготовку в сфере международного публичного и частного права, права интеграционных объединений (ЕАЭС, БРИКС, ШОС).'
    },
    {
        'id': 'theorygospravo',
        'name': 'Кафедра теории государства и права',
        'url': 'https://law-bsu.ru/theorygospravo',
        'room': 'каб. 210',
        'email': 'institutprava@uust.ru',
        'phone': '8-987-103-80-00',
        'description': 'Фундаментальная кафедра института права. Обеспечивает общетеоретическую и историко-правовую подготовку юристов.'
    }
]

def fetch_html(url, retries=2, timeout=12):
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == retries:
                print(f"Warning: Failed to fetch {url}: {e}", file=sys.stderr)
                return None

def parse_teachers_from_html(html, dept_name, dept_url):
    if not html:
        return []
    blocks = re.findall(r'(<div[^>]*class=[\"\'][^\"\']*t531__title[^\"\']*[\"\'].*?)(?=<div[^>]*class=[\"\'][^\"\']*t531__title|$)', html, re.DOTALL)
    teachers = []
    seen = set()

    for b in blocks:
        title_m = re.search(r'class=[\"\'][^\"\']*t531__title[^\"\']*[\"\'][^>]*>(.*?)</div>', b, re.DOTALL)
        descr_m = re.search(r'class=[\"\'][^\"\']*t531__persdescr[^\"\']*[\"\'][^>]*>(.*?)</div>', b, re.DOTALL)
        text_m = re.search(r'class=[\"\'][^\"\']*t531__text[^\"\']*[\"\'][^>]*>(.*?)</div>', b, re.DOTALL)
        
        fio = re.sub(r'<[^>]+>', ' ', title_m.group(1)).strip() if title_m else ''
        fio = re.sub(r'\s+', ' ', fio)
        if not fio or len(fio.split()) < 2:
            continue

        if fio in seen:
            continue
        seen.add(fio)

        pos = re.sub(r'<[^>]+>', ' ', descr_m.group(1)).strip() if descr_m else ''
        pos = re.sub(r'\s+', ' ', pos)

        txt = re.sub(r'<[^>]+>', ' ', text_m.group(1)).strip() if text_m else ''
        txt = re.sub(r'\s+', ' ', txt)

        # Parse degree & title
        degree = ""
        academic_title = ""
        interests = ""
        awards = ""

        if "доктор юридических наук" in txt.lower():
            degree = "доктор юридических наук"
        elif "доктор философских наук" in txt.lower():
            degree = "доктор философских наук"
        elif "доктор исторических наук" in txt.lower():
            degree = "доктор исторических наук"
        elif "кандидат юридических наук" in txt.lower():
            degree = "кандидат юридических наук"
        elif "кандидат исторических наук" in txt.lower():
            degree = "кандидат исторических наук"
        elif "кандидат экономических наук" in txt.lower():
            degree = "кандидат экономических наук"

        if ", профессор" in txt.lower() or "звание: профессор" in txt.lower() or "профессор" in txt.lower() and "доктор" in txt.lower():
            academic_title = "профессор"
        elif ", доцент" in txt.lower() or "звание: доцент" in txt.lower():
            academic_title = "доцент"

        # Scientific interests
        if "область научных интересов:" in txt.lower():
            m_int = re.search(r'область научных интересов:\s*(.*?)(?:государственные|$)', txt, re.IGNORECASE)
            if m_int:
                interests = m_int.group(1).strip().rstrip('.,;')
        
        # Awards
        if "награды:" in txt.lower():
            m_aw = re.search(r'(?:государственные и ведомственные\s*)?награды:\s*(.*?)(?:область научных интересов|$)', txt, re.IGNORECASE)
            if m_aw:
                awards = m_aw.group(1).strip().rstrip('.,;')

        # Check if teaches our group
        is_group_teacher = fio in GROUP_TEACHERS
        group_meta = GROUP_TEACHERS.get(fio, {})

        tid = re.sub(r'[^a-zA-Z0-9а-яА-ЯёЁ]', '-', fio.lower()).strip('-')

        teachers.append({
            'id': tid,
            'name': fio,
            'department': dept_name,
            'position': pos if pos else 'Преподаватель',
            'degree': degree,
            'academicTitle': academic_title,
            'interests': interests,
            'awards': awards,
            'isGroupTeacher': is_group_teacher,
            'groupSubjects': group_meta.get('subjects', []),
            'groupRole': group_meta.get('role', ''),
            'sourceUrl': dept_url,
            'retrievedAt': TODAY_STR
        })

    return teachers

def main():
    print("=== Синхронизация данных Института права УУНиТ ===")
    all_teachers = []
    departments_out = []

    for dept in DEPARTMENTS_CONFIG:
        print(f"Запрос: {dept['name']} ({dept['url']})...")
        html = fetch_html(dept['url'])
        teachers = parse_teachers_from_html(html, dept['name'], dept['url'])
        print(f" -> Найдено преподавателей: {len(teachers)}")
        all_teachers.extend(teachers)

        dept_record = dict(dept)
        dept_record['facultyCount'] = len(teachers)
        dept_record['retrievedAt'] = TODAY_STR
        departments_out.append(dept_record)

    # Ensure all group teachers from schedule are included even if department page was missing one
    existing_names = {t['name'] for t in all_teachers}
    for gname, gmeta in GROUP_TEACHERS.items():
        if gname not in existing_names:
            print(f"Добавляем преподавателя группы из расписания: {gname}")
            tid = re.sub(r'[^a-zA-Z0-9а-яА-ЯёЁ]', '-', gname.lower()).strip('-')
            all_teachers.append({
                'id': tid,
                'name': gname,
                'department': 'Институт права УУНиТ',
                'position': 'Преподаватель',
                'degree': '',
                'academicTitle': '',
                'interests': '',
                'awards': '',
                'isGroupTeacher': True,
                'groupSubjects': gmeta.get('subjects', []),
                'groupRole': gmeta.get('role', ''),
                'sourceUrl': 'https://law-bsu.ru/schedules',
                'retrievedAt': TODAY_STR
            })

    # Sort teachers alphabetically
    all_teachers.sort(key=lambda x: x['name'])

    os.makedirs('src/data', exist_ok=True)
    with open('src/data/teachers.json', 'w', encoding='utf-8') as f:
        json.dump(all_teachers, f, ensure_ascii=False, indent=2)

    with open('src/data/departments.json', 'w', encoding='utf-8') as f:
        json.dump(departments_out, f, ensure_ascii=False, indent=2)

    institute_info = {
        'fullName': 'Институт права Федерального государственного бюджетного образовательного учреждения высшего образования «Уфимский университет науки и технологий»',
        'shortName': 'Институт права УУНиТ',
        'city': 'Уфа',
        'region': 'Республика Башкортостан',
        'timezone': 'Asia/Yekaterinburg',
        'website': 'https://law-bsu.ru/',
        'address': '450005, Республика Башкортостан, г. Уфа, ул. Достоевского, д. 131',
        'secondCampus': '450076, г. Уфа, ул. Заки Валиди, д. 32 (Главный корпус УУНиТ)',
        'phone': '8-987-103-80-00',
        'email': 'institutprava@uust.ru',
        'officialSchedules': 'https://law-bsu.ru/schedules',
        'officialDepartments': 'https://law-bsu.ru/kafedry',
        'officialContacts': 'https://law-bsu.ru/contacts',
        'officialCertificates': 'https://law-bsu.ru/spravki',
        'officialPractice': 'https://law-bsu.ru/practice',
        'officialClubs': 'https://law-bsu.ru/clubs',
        'group': {
            'code': 'ПОНБ-УП-304С',
            'specialty': '40.05.01 Правовое обеспечение национальной безопасности',
            'specialization': 'Уголовно-правовая (УП)',
            'curator': 'Нурмухаметов Руслан Наилевич',
            'semester': '5 семестр (3 курс)',
            'studyForm': 'Очная'
        },
        'updatedAt': TODAY_STR
    }

    with open('src/data/institute.json', 'w', encoding='utf-8') as f:
        json.dump(institute_info, f, ensure_ascii=False, indent=2)

    print(f"\nСинхронизация завершена успешно!")
    print(f"Всего преподавателей сохранено: {len(all_teachers)}")
    print(f"Кафедр сохранено: {len(departments_out)}")
    print(f"Преподавателей группы ПОНБ-УП-304С: {len([t for t in all_teachers if t['isGroupTeacher']])}")

if __name__ == '__main__':
    main()
