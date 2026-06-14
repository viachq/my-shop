import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from lxml import etree

p = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
d = Document(p)
ps = d.paragraphs
for idx in (147, 162, 166, 213, 223, 237, 241, 287):
    par = ps[idx]
    print(f"\n===== #{idx}: {par.text[:60]!r}")
    print(etree.tostring(par._p, pretty_print=True).decode()[:1400])
