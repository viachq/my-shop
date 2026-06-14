import sys, os
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

SRC = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"

# title-text (run[0]) -> correct printed page
PAGES = {
    "ВСТУП": 5,
    "1. ХАРАКТЕРИСТИКА ПРЕДМЕТНОЇ ОБЛАСТІ": 7,
    "1.1 Опис бази практики": 7,
    "1.2 Опис частини діяльності для автоматизації": 7,
    "1.3 Огляд та аналіз предметної області": 8,
    "2. ОГЛЯД СУЧАСНИХ ПІДХОДІВ ТА ЗАСОБІВ ДО ПРОЕКТУВАННЯ ТА РОЗРОБЛЕННЯ ВЕБ-ДОДАТКІВ": 10,
    "2.1 Огляд сучасних підходів до проектування систем": 10,
    "2.2 Огляд сучасних засобів розробки веб-додатків": 10,
    "2.3 Огляд та аналіз аналогічних систем": 10,
    "3. ПОСТАНОВКА ЗАВДАННЯ НА ПРАКТИКУ": 12,
    "4. РЕАЛІЗАЦІЯ ПОСТАВЛЕНИХ ЗАВДАНЬ": 14,
    "4.1 Специфікація вимог до системи": 14,
    "4.2 Розроблений інтерфейс веб-системи": 16,
    "ВИСНОВКИ": 18,
    "СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ": 19,
}

doc = Document(SRC)
toc_done = set()
for i, p in enumerate(doc.paragraphs):
    if i > 145:           # TOC region only (before body)
        break
    if len(p.runs) < 2:
        continue
    title = p.runs[0].text.strip()
    if title in PAGES and title not in toc_done:
        last = p.runs[-1]
        old = last.text
        if "\t" in old:
            new = "\t" + str(PAGES[title])
            last.text = new
            # blank any extra runs after the tab-number run if present
            for r in p.runs[1:-1]:
                r.text = ""
            print(f"#{i}: {title[:45]:<45} {old!r} -> {new!r}")
            toc_done.add(title)

missing = set(PAGES) - toc_done
if missing:
    print("NOT FOUND:", missing)

try:
    doc.save(SRC)
    print(f"\nSaved (in place): {SRC}")
except PermissionError:
    alt = SRC.replace(".docx", "_fixed.docx")
    doc.save(alt)
    print(f"\nFile locked. Saved as: {alt}")
