import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.oxml.ns import qn

src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
doc = Document(src)
print(f"Sections: {len(doc.sections)}")
for i, s in enumerate(doc.sections):
    print(f"  sec{i}: start={s.start_type} top={s.top_margin} bot={s.bottom_margin} "
          f"L={s.left_margin} R={s.right_margin} w={s.page_width} h={s.page_height}")

body = doc.element.body
# walk top-level children, show tag + (paragraph text snippet or sectPr)
children = list(body)
print(f"\nTotal top-level body children: {len(children)}")
zmist_pos = None
para_i = 0
for ci, ch in enumerate(children):
    tag = ch.tag.split('}')[-1]
    if tag == 'p':
        txt = ''.join(n.text or '' for n in ch.iter(qn('w:t')))
        has_sectpr = ch.find(qn('w:pPr') + '/' + qn('w:sectPr')) is not None
        mark = ' [P-SECTPR]' if has_sectpr else ''
        if txt.strip() == 'ЗМІСТ' and zmist_pos is None:
            zmist_pos = ci
            print(f">>> child#{ci} para#{para_i} 'ЗМІСТ'{mark} <<< BODY STARTS HERE")
        elif 118 <= para_i <= 132 or has_sectpr:
            print(f"child#{ci} para#{para_i} [{tag}]{mark} {txt[:50]!r}")
        para_i += 1
    elif tag == 'tbl':
        print(f"child#{ci} [TABLE]")
    elif tag == 'sectPr':
        print(f"child#{ci} [BODY-FINAL-SECTPR]")

print(f"\nZMIST child index = {zmist_pos}")
print(f"Last child tag = {children[-1].tag.split('}')[-1]}")
