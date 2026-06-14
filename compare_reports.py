import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
import difflib

A = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy.docx"
B = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_Kramar.docx"

def body(path):
    d = Document(path)
    ts = [p.text.strip() for p in d.paragraphs]
    i = ts.index('ЗМІСТ')
    return [t for t in ts[i:] if t]

a = body(A)
b = body(B)
print(f"TechBox body paragraphs: {len(a)}")
print(f"Kramar  body paragraphs: {len(b)}")

# overall similarity
sm = difflib.SequenceMatcher(None, "\n".join(a), "\n".join(b))
print(f"\nOverall text similarity ratio: {sm.ratio():.1%}")

# paragraph-level: how many Kramar paragraphs are >70% similar to ANY TechBox paragraph
near = []
for bp in b:
    if len(bp) < 25:
        continue
    best = 0.0
    bestmatch = ""
    for ap in a:
        r = difflib.SequenceMatcher(None, ap, bp).ratio()
        if r > best:
            best = r; bestmatch = ap
    if best >= 0.6:
        near.append((round(best, 2), bp[:70], bestmatch[:70]))

print(f"\nKramar paragraphs with >=60% match to a TechBox paragraph: {len(near)}")
for score, bp, ap in near:
    print(f"  [{score}] K: {bp}")
    print(f"         T: {ap}")

# identical lines
ident = set(a) & set(b)
ident = [x for x in ident if len(x) > 15]
print(f"\nIdentical non-trivial lines: {len(ident)}")
for x in ident:
    print(f"  = {x[:90]}")
