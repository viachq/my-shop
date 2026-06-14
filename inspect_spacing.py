import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Pt, Cm, Emu

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
p = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
d = Document(p)
ps = d.paragraphs

def cm(v):
    if v is None:
        return "·"
    try:
        return f"{Emu(v).cm:.2f}"
    except Exception:
        return str(v)

def pt(v):
    if v is None:
        return "·"
    try:
        return f"{v.pt:.0f}"
    except Exception:
        return str(v)

def numid(par):
    ppr = par._p.find(W + 'pPr')
    if ppr is None:
        return "·"
    npr = ppr.find(W + 'numPr')
    if npr is None:
        return "·"
    nid = npr.find(W + 'numId')
    return nid.get(W + 'val') if nid is not None else "?"

start = next(i for i, t in enumerate(ps) if t.text.strip() == 'ЗМІСТ')
print(f"{'idx':>4} {'sty':<14} {'numId':>5} {'algn':<7} {'FLind':>6} {'Lind':>5} {'sB':>3} {'sA':>3} {'lsp':<5} text")
for i in range(start, len(ps)):
    par = ps[i]
    t = par.text.strip()
    if not t:
        print(f"{i:>4} (EMPTY paragraph)")
        continue
    pf = par.paragraph_format
    sty = (par.style.name or "")[:13]
    al = str(par.alignment).split('.')[-1].split()[0] if par.alignment is not None else "None"
    lsp = pf.line_spacing
    lsr = str(pf.line_spacing_rule).split('.')[-1].split()[0] if pf.line_spacing_rule is not None else "·"
    print(f"{i:>4} {sty:<14} {numid(par):>5} {al[:7]:<7} "
          f"{cm(pf.first_line_indent):>6} {cm(pf.left_indent):>5} "
          f"{pt(pf.space_before):>3} {pt(pf.space_after):>3} {str(lsp)[:5]:<5} {t[:55]}")
