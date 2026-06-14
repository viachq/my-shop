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
    prev_img_page = None
    for p in doc.Paragraphs:
        t = p.Range.Text.strip()
        rng = p.Range
        pg = rng.Information(3)  # page number
        has_pic = rng.InlineShapes.Count > 0 or rng.ShapeRange.Count > 0
        if has_pic:
            prev_img_page = pg
            print(f"[IMG]      page {pg}")
        if t.startswith("Рис."):
            same = "OK same page" if prev_img_page == pg else f"!! SPLIT (img p{prev_img_page})"
            print(f"[Рис cap]  page {pg}  {t[:35]}  -> {same}")
        if t.startswith("Таблиця"):
            print(f"[Тбл cap]  page {pg}  {t[:35]}")
    # table object pages
    for ti, tb in enumerate(doc.Tables, 1):
        p1 = tb.Range.Information(3)
        last = tb.Rows(tb.Rows.Count).Range.Information(3)
        print(f"[TABLE {ti}] starts page {p1}, ends page {last}")
    doc.Close(False)
finally:
    word.Quit()
