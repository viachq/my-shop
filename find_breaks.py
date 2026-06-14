import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from lxml import etree

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
doc = Document(r"C:\Users\viach\Desktop\word_data\data\практика\ШАБЛОН_Звіту_з_практики_+_зразок_змісту.docx")
body = doc.element.body

p_idx = 0
for child in body:
    tag = etree.QName(child.tag).localname
    if tag == 'p':
        for br in child.findall('.//w:br', NS):
            btype = br.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type')
            if btype == 'page':
                print(f"P{p_idx}: PAGE BREAK in run")
        ppr = child.find('w:pPr', NS)
        if ppr is not None:
            pbb = ppr.find('w:pageBreakBefore', NS)
            if pbb is not None:
                print(f"P{p_idx}: pageBreakBefore")
        p_idx += 1
    elif tag == 'tbl':
        print(f"TABLE after P{p_idx - 1}")

# Also check section properties for page size/margins
sec = doc.sections[0]
print(f"\nPage: w={sec.page_width} h={sec.page_height}")
print(f"Margins: top={sec.top_margin} bot={sec.bottom_margin} left={sec.left_margin} right={sec.right_margin}")
