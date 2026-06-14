import sys, os, copy
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from lxml import etree

TITLE = r"C:\Users\viach\Desktop\word_data\data\практика\ДР Практика_Титулка (1) (2).docx"
ZAVD  = r"C:\Users\viach\Desktop\word_data\data\практика\ШАБЛОН_Звіту_з_практики_+_зразок_змісту.docx"
OUT   = r"C:\Users\viach\Desktop\word_data\data\практика\Титулка_та_завдання.docx"

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def before_sectpr(body, el):
    s = body.find('w:sectPr', NS)
    if s is not None:
        s.addprevious(el)
    else:
        body.append(el)

doc = Document(TITLE)
body = doc.element.body

# Section break after title (copy title's sectPr as paragraph-level break)
sectpr = body.find('w:sectPr', NS)
sp_copy = copy.deepcopy(sectpr)
bp = etree.SubElement(body, f'{{{NS["w"]}}}p')
ppr = etree.SubElement(bp, f'{{{NS["w"]}}}pPr')
ppr.append(sp_copy)
etree.SubElement(sp_copy, f'{{{NS["w"]}}}type').set(f'{{{NS["w"]}}}val', 'nextPage')
body.remove(bp)
before_sectpr(body, bp)

# Copy zavdannya P0-P82
doc_z = Document(ZAVD)
p_count = 0
for child in list(doc_z.element.body):
    tag = etree.QName(child.tag).localname
    if tag == 'sectPr':
        continue
    before_sectpr(body, copy.deepcopy(child))
    if tag == 'p':
        p_count += 1
        if p_count > 82:
            break

# Replace body sectPr with zavdannya's (page layout)
zsp = doc_z.element.body.find('w:sectPr', NS)
if zsp is not None:
    new_sp = copy.deepcopy(zsp)
    for ref in new_sp.findall('w:headerReference', NS) + new_sp.findall('w:footerReference', NS):
        new_sp.remove(ref)
    old_sp = body.find('w:sectPr', NS)
    if old_sp is not None:
        body.replace(old_sp, new_sp)

doc.save(OUT)
print(f"Saved: {OUT}")
print(f"Size: {os.path.getsize(OUT)/1024:.1f} KB")
