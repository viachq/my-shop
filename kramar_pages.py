import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32

src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_Kramar.docx"
word = win32.Dispatch("Word.Application")
try:
    word.Visible = False
except Exception:
    pass
try:
    doc = word.Documents.Open(src, False, True)
    print("TOTAL PAGES:", doc.ComputeStatistics(2))
    targets = [
        ("ВСТУП", "ВСТУП"),
        ("1. ХАРАКТЕРИСТИКА ПРЕДМЕТНОЇ ОБЛАСТІ", "1.  ХАРАКТЕРИСТИКА"),
        ("1.1 Опис бази практики", "1.1 Опис бази практики"),
        ("1.2 Опис частини діяльності для автоматизації", "1.2 Опис частини"),
        ("1.3 Огляд та аналіз предметної області", "1.3 Огляд та аналіз"),
        ("2. ОГЛЯД СУЧАСНИХ ПІДХОДІВ ТА ЗАСОБІВ ДО ПРОЕКТУВАННЯ ТА РОЗРОБЛЕННЯ ВЕБ-ДОДАТКІВ", "2.  ОГЛЯД СУЧАСНИХ"),
        ("2.1 Огляд сучасних підходів до проектування систем", "2.1 Огляд сучасних підходів"),
        ("2.2 Огляд сучасних засобів розробки веб-додатків", "2.2 Огляд сучасних засобів"),
        ("2.3 Огляд та аналіз аналогічних систем", "2.3 Огляд та аналіз аналог"),
        ("3. ПОСТАНОВКА ЗАВДАННЯ НА ПРАКТИКУ", "3.  ПОСТАНОВКА"),
        ("4. РЕАЛІЗАЦІЯ ПОСТАВЛЕНИХ ЗАВДАНЬ", "4.  РЕАЛІЗАЦІЯ"),
        ("4.1 Специфікація вимог до системи", "4.1 Специфікація вимог"),
        ("4.2 Розроблений інтерфейс веб-системи", "4.2 Розроблений інтерфейс"),
        ("ВИСНОВКИ", "ВИСНОВКИ"),
        ("СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ", "СПИСОК ВИКОРИСТАНИХ"),
    ]
    done = {}
    for p in doc.Paragraphs:
        t = p.Range.Text.strip()
        for toc_key, head_prefix in targets:
            if toc_key in done:
                continue
            if t.startswith(head_prefix):
                phys = p.Range.Information(3)
                if phys and phys >= 5:
                    done[toc_key] = int(phys)
                break
    for toc_key, _ in targets:
        print(f"{done.get(toc_key,'?')}\t{toc_key}")
    doc.Close(False)
finally:
    word.Quit()
