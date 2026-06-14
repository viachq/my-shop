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
    print(f"TOTAL PAGES: {doc.ComputeStatistics(2)}")
    print("=" * 80)
    i = 0
    for p in doc.Paragraphs:
        txt = p.Range.Text.strip()
        if not txt:
            i += 1
            continue
        style = p.Style.NameLocal
        pg = p.Range.Information(3)  # wdActiveEndPageNumber
        outline = p.OutlineLevel  # 1-9 = heading levels, 10 = body text
        flag = ""
        if outline <= 9:
            flag = f" <<H{outline}>>"
        print(f"[p{pg:>2}] #{i:>3} [{style[:22]:<22}] o{outline}{flag}  {txt[:80]}")
        i += 1
    doc.Close(False)
finally:
    word.Quit()
