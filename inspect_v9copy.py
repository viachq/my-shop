import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32

src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"

word = win32.Dispatch("Word.Application")
try:
    word.Visible = False
except Exception:
    pass
try:
    doc = word.Documents.Open(src, False, True)
    total = doc.ComputeStatistics(2)
    print(f"TOTAL PAGES: {total}")
    print("=" * 70)

    # Headings to locate (text -> find its real page)
    targets = [
        "ВСТУП",
        "ХАРАКТЕРИСТИКА ПРЕДМЕТНОЇ ОБЛАСТІ",
        "Опис бази практики",
        "Опис частини діяльності для автоматизації",
        "Огляд та аналіз предметної області",
        "ОГЛЯД СУЧАСНИХ ПІДХОДІВ",
        "Огляд сучасних підходів до проектування систем",
        "Огляд сучасних засобів розробки веб-додатків",
        "Огляд та аналіз аналогічних систем",
        "ПОСТАНОВКА ЗАВДАННЯ НА ПРАКТИКУ",
        "РЕАЛІЗАЦІЯ ПОСТАВЛЕНИХ ЗАВДАНЬ",
        "Специфікація вимог до системи",
        "Розроблений інтерфейс веб-системи",
        "ВИСНОВКИ",
        "СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ",
    ]

    # Walk paragraphs, record page number of first occurrence of each target
    found = {}
    seen_toc = False
    for p in doc.Paragraphs:
        txt = p.Range.Text.strip()
        if not txt:
            continue
        # skip the TOC region itself: detect lines that contain dotted leaders / page nums
        for t in targets:
            if t in found:
                continue
            if txt.startswith(t) or txt == t or (t in txt and len(txt) < len(t) + 60 and ".." not in txt):
                # page number of this range
                pg = p.Range.Information(3)  # wdActiveEndPageNumber
                # heuristic: real heading occurrences appear AFTER the TOC (page > 3)
                if pg and pg >= 4:
                    found[t] = pg
                break

    print("REAL PAGE OF EACH SECTION (heading occurrences after TOC):")
    for t in targets:
        print(f"  p.{found.get(t,'?'):>3}  {t}" if t in found else f"  p.  ?  {t}")

    doc.Close(False)
finally:
    word.Quit()
