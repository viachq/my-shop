import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

p = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
d = Document(p)
ts = [pp.text for pp in d.paragraphs]
start = next(i for i, t in enumerate(ts) if t.strip() == 'ЗМІСТ')
for i in range(start, len(ts)):
    t = ts[i]
    if t.strip():
        print(f"#{i}: {t!r}")
