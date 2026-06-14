import sys, zipfile, re
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Emu

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
SRC = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"

# 1) numId 29 -> abstractNum -> lvl0 ind (left / hanging)
z = zipfile.ZipFile(SRC)
num = z.read('word/numbering.xml').decode('utf-8')
m = re.search(r'<w:num w:numId="29"[^>]*>.*?<w:abstractNumId w:val="(\d+)"', num, re.S)
absid = m.group(1) if m else None
print("numId 29 -> abstractNumId", absid)
am = re.search(r'<w:abstractNum w:abstractNumId="%s".*?</w:abstractNum>' % absid, num, re.S)
block = am.group(0) if am else ""
lvl0 = re.search(r'<w:lvl w:ilvl="0".*?</w:lvl>', block, re.S)
seg = lvl0.group(0) if lvl0 else ""
fmt = re.search(r'<w:numFmt w:val="([^"]+)"', seg)
txt = re.search(r'<w:lvlText w:val="([^"]*)"', seg)
ind = re.search(r'<w:ind ([^/>]*)/?>', seg)
print("  numFmt =", fmt.group(1) if fmt else "?")
print("  lvlText=", repr(txt.group(1)) if txt else "?")
print("  ind    =", ind.group(1) if ind else "(none)")

# 2) current first-line indent of 4.1 lead-ins and a dash item
d = Document(SRC)
for p in d.paragraphs:
    t = p.text.strip()
    if t in ("Вимоги до інтерфейсу:", "Адміністративна панель:",
             "Інтерфейс користувача:", "Нефункціональні вимоги:",
             "Функціональні вимоги:"):
        pf = p.paragraph_format
        fl = Emu(pf.first_line_indent).cm if pf.first_line_indent else None
        li = Emu(pf.left_indent).cm if pf.left_indent else None
        print(f"LEAD-IN  FL={fl} L={li} | {t}")
    if t == "Інтерфейс має бути зрозумілим та зручним.":
        ppr = p._p.find(W + 'pPr')
        indel = ppr.find(W + 'ind') if ppr is not None else None
        print("DASH ITEM direct ind:", dict(indel.attrib) if indel is not None else "(inherits from list style/num)")
