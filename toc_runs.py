import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
doc = Document(src)

for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if not t:
        continue
    if t == "ЗМІСТ" or (any(t.startswith(x) for x in
        ["ВСТУП", "1.", "1.1", "1.2", "1.3", "2.", "2.1", "2.2", "2.3",
         "3.", "4.", "4.1", "4.2", "ВИСНОВКИ", "СПИСОК"]) and i < 160):
        runs = [repr(r.text) for r in p.runs]
        print(f"#{i} FULL={p.text!r}")
        print(f"     runs={runs}")
