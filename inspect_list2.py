import sys, re
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from lxml import etree

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
p = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
d = Document(p)
ps = d.paragraphs

def info(par):
    el = par._p
    ppr = el.find(W + 'pPr')
    numpr = ppr.find(W + 'numPr') if ppr is not None else None
    pstyle = ppr.find(W + 'pStyle') if ppr is not None else None
    ind = ppr.find(W + 'ind') if ppr is not None else None
    runs = par.runs
    rfont = None
    if runs:
        rf = runs[0].font
        rfont = (rf.name, rf.size.pt if rf.size else None, rf.bold)
    numinfo = None
    if numpr is not None:
        ilvl = numpr.find(W + 'ilvl')
        numid = numpr.find(W + 'numId')
        numinfo = (ilvl.get(W + 'val') if ilvl is not None else None,
                   numid.get(W + 'val') if numid is not None else None)
    indinfo = None
    if ind is not None:
        indinfo = {k.split('}')[-1]: v for k, v in ind.attrib.items()}
    return (f"style={pstyle.get(W+'val') if pstyle is not None else None} "
            f"numPr={numinfo} ind={indinfo} runs={len(runs)} font={rfont}")

for idx in (147, 162, 166, 213, 222, 223, 236, 237, 240, 241, 246, 256, 287, 296, 301, 303, 307):
    print(f"#{idx} [{ps[idx].text[:45]!r}]")
    print("   ", info(ps[idx]))
