import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Emu

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
p = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
d = Document(p)
ps = d.paragraphs

def has_pagebreak(par):
    for br in par._p.iter(W + 'br'):
        if br.get(W + 'type') == 'page':
            return True
    return False

def has_image(par):
    return par._p.find('.//' + W + 'drawing') is not None or \
           par._p.find('.//{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}inline') is not None

def cm(v):
    if v is None: return "·"
    try: return f"{Emu(v).cm:.2f}"
    except Exception: return str(v)

def pt(v):
    if v is None: return "·"
    try: return f"{v.pt:.0f}"
    except Exception: return str(v)

def numid(par):
    ppr = par._p.find(W + 'pPr')
    if ppr is None: return "·"
    npr = ppr.find(W + 'numPr')
    if npr is None: return "·"
    nid = npr.find(W + 'numId')
    return nid.get(W + 'val') if nid is not None else "?"

start = next(i for i, t in enumerate(ps) if t.text.strip() == 'ЗМІСТ')
for i in range(start, len(ps)):
    par = ps[i]
    t = par.text.strip()
    pf = par.paragraph_format
    if not t:
        kind = "PAGEBREAK" if has_pagebreak(par) else ("IMG" if has_image(par) else "EMPTY")
        print(f"{i:>4} <{kind}>")
        continue
    al = str(par.alignment).split('.')[-1].split()[0] if par.alignment is not None else "None"
    tag = ""
    if t.startswith("Рис.") or t.startswith("Таблиця"):
        tag = "  <<CAPTION>>"
    print(f"{i:>4} num={numid(par):>2} {al[:6]:<6} FL={cm(pf.first_line_indent):>5} "
          f"L={cm(pf.left_indent):>4} sB={pt(pf.space_before):>2} sA={pt(pf.space_after):>2} "
          f"| {t[:58]}{tag}")
