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
    targets = ["ВСТУП", "1.  ХАРАКТЕРИСТИКА", "1.3 Огляд та аналіз предметної",
               "2.  ОГЛЯД СУЧАСНИХ", "3.  ПОСТАНОВКА", "4.  РЕАЛІЗАЦІЯ",
               "4.2 Розроблений інтерфейс", "ВИСНОВКИ", "СПИСОК ВИКОРИСТАНИХ"]
    done = set()
    for p in doc.Paragraphs:
        t = p.Range.Text.strip()
        for tg in targets:
            if tg in done:
                continue
            if t.startswith(tg):
                phys = p.Range.Information(3)   # wdActiveEndPageNumber (physical)
                adj  = p.Range.Information(1)   # wdActiveEndAdjustedPageNumber (printed)
                if phys and phys >= 5:
                    print(f"phys={phys:>2}  printed={adj}  {tg}")
                    done.add(tg)
                break
    doc.Close(False)
finally:
    word.Quit()
