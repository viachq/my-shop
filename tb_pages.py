import sys
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
    print("TOTAL PAGES:", doc.ComputeStatistics(2))
    targets = [
        ("ВСТУП", "ВСТУП"),
        ("1. ХАРАКТЕРИСТИКА ПРЕДМЕТНОЇ ОБЛАСТІ", "1.  ХАРАКТЕРИСТИКА"),
        ("1.1 Опис бази практики", "1.1 Опис бази практики"),
        ("1.2 Опис частини діяльності для автоматизації", "1.2 Опис частини"),
        ("1.3 Огляд та аналіз предметної області", "1.3 Огляд та аналіз"),
        ("2. ОГЛЯД...", "2.  ОГЛЯД СУЧАСНИХ"),
        ("2.1 ...", "2.1 Огляд сучасних підходів"),
        ("2.2 ...", "2.2 Огляд сучасних засобів"),
        ("2.3 ...", "2.3 Огляд та аналіз аналог"),
        ("3. ПОСТАНОВКА", "3.  ПОСТАНОВКА"),
        ("4. РЕАЛІЗАЦІЯ", "4.  РЕАЛІЗАЦІЯ"),
        ("4.1 Специфікація", "4.1 Специфікація вимог"),
        ("4.2 Розроблений інтерфейс", "4.2 Розроблений інтерфейс"),
        ("ВИСНОВКИ", "ВИСНОВКИ"),
        ("СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ", "СПИСОК ВИКОРИСТАНИХ"),
    ]
    done = {}
    for p in doc.Paragraphs:
        t = p.Range.Text.strip()
        for k, pref in targets:
            if k in done:
                continue
            if t.startswith(pref):
                ph = p.Range.Information(3)
                if ph and ph >= 5:
                    done[k] = int(ph)
                break
    for k, _ in targets:
        print(done.get(k, '?'), k)
    doc.Close(False)
finally:
    word.Quit()
