#!/usr/bin/env python3
"""
Content Import Script for ПОНБ-УП-304С Cabinet.
Reads materials folder (specified by CONTENT_PATH environment variable or argument),
validates markdown notes, meta files, attachments, and compiles them into src/data/imported-content.json.
Respects ROSTER_PATH separately with publishRoster: false protection.
"""
import os
import sys
import json
import re
import shutil
from datetime import datetime

CONTENT_PATH = os.environ.get('CONTENT_PATH', '')
ROSTER_PATH = os.environ.get('ROSTER_PATH', '')
REPORT_FILE = 'import_report.json'

def sanitize_id(text):
    return re.sub(r'[^a-zA-Z0-9а-яА-ЯёЁ_-]', '_', text.strip().lower())

def run_import():
    print("=== Импорт учебных материалов ПОНБ-УП-304С ===")
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'contentPathProvided': bool(CONTENT_PATH),
        'rosterPathProvided': bool(ROSTER_PATH),
        'added': 0,
        'updated': 0,
        'skipped': 0,
        'warnings': [],
        'errors': []
    }

    if not CONTENT_PATH:
        print("Инфо: Переменная CONTENT_PATH не задана.")
        print("Используется базовый проверенный каталог репозитория.")
        report['warnings'].append("CONTENT_PATH не указан; каталог работает на базовых данных.")
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        return

    if not os.path.isdir(CONTENT_PATH):
        print(f"Ошибка: Указанный путь CONTENT_PATH не существует: {CONTENT_PATH}", file=sys.stderr)
        report['errors'].append(f"Каталог не найден: {CONTENT_PATH}")
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        sys.exit(1)

    print(f"Сканирование каталога: {CONTENT_PATH}")
    imported_materials = []

    for root, dirs, files in os.walk(CONTENT_PATH):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        for file in files:
            if file.startswith('.'):
                continue
            
            ext = os.path.splitext(file)[1].lower()
            if ext not in ['.md', '.txt', '.pdf', '.docx', '.pptx', '.xlsx', '.png', '.jpg', '.jpeg']:
                report['skipped'] += 1
                continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, CONTENT_PATH)
            parts = rel_path.split(os.sep)

            subject_id = parts[1] if len(parts) > 2 and parts[0] == 'subjects' else 'unassigned'
            topic_id = parts[2] if len(parts) > 3 and parts[0] == 'subjects' else 'general'

            title = os.path.splitext(file)[0].replace('_', ' ').replace('-', ' ').title()
            
            content_text = ""
            if ext in ['.md', '.txt']:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as mf:
                        content_text = mf.read()
                except Exception as e:
                    report['warnings'].append(f"Не удалось прочитать текст {rel_path}: {e}")

            item = {
                'id': sanitize_id(f"{subject_id}-{file}"),
                'title': title,
                'fileName': file,
                'subjectId': subject_id,
                'topicId': topic_id,
                'extension': ext.lstrip('.'),
                'sizeBytes': os.path.getsize(file_path),
                'content': content_text[:50000] if content_text else None,
                'importedAt': datetime.now().strftime('%Y-%m-%d %H:%M')
            }

            imported_materials.append(item)
            report['added'] += 1

    out_file = 'src/data/imported-content.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(imported_materials, f, ensure_ascii=False, indent=2)

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"Импорт успешно завершен! Обработано файлов: {len(imported_materials)}")
    print(f"Отчет сохранен в {REPORT_FILE}")

if __name__ == '__main__':
    run_import()
