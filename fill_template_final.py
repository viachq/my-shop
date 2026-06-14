"""Fill template with multi-run + UNDERLINE FORMATTING approach.
NO underscore characters. Lines are made by underline formatting on text + spaces."""
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Pt
from copy import deepcopy
from lxml import etree

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
WN = W[:-1] + '}'
SRC = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy - Copy.docx"

d = Document(SRC)
ps = d.paragraphs


def rebuild_para(p, parts):
    """
    Rebuild paragraph runs.
    parts: list of (text, underlined_bool).
    Formatting copied from first existing run.
    """
    if not p.runs:
        return
    template_r = p.runs[0]._r
    # Remove all existing runs
    for r in list(p._p.findall(W + 'r')):
        p._p.remove(r)
    for text, underlined in parts:
        new_r = deepcopy(template_r)
        # Clear text/tab from copy
        for t_el in new_r.findall(W + 't'):
            new_r.remove(t_el)
        for tab in new_r.findall(W + 'tab'):
            new_r.remove(tab)
        for br in new_r.findall(W + 'br'):
            new_r.remove(br)
        rPr = new_r.find(W + 'rPr')
        if rPr is None:
            rPr = etree.SubElement(new_r, WN + 'rPr')
            new_r.insert(0, rPr)
        # Remove any existing underline setting
        for u in rPr.findall(W + 'u'):
            rPr.remove(u)
        if underlined:
            u = etree.SubElement(rPr, WN + 'u')
            u.set(WN + 'val', 'single')
        # Add text
        t_el = etree.SubElement(new_r, WN + 't')
        t_el.text = text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        p._p.append(new_r)


# ================================================================
# PAGE 1 — TITLE PAGE
# ================================================================

# p12: "про проходження_______ практики"
rebuild_para(ps[12], [
    ('про проходження ', False),
    ('переддипломної', True),
    ('                        ', True),
    (' практики ', False),
])

# p14: "освітнньо-професійний ступінь_______спеціальність__________"
rebuild_para(ps[14], [
    ('освітнньо-професійний ступінь ', False),
    ('фаховий молодший бакалавр', True),
    (' спеціальність ', False),
    ('122 «Комп\'ютерні науки»', True),
])

# p15: "студента (ки)_______групи________"
rebuild_para(ps[15], [
    ('студента (ки) ', False),
    ('Раделицького В\'ячеслава Володимировича', True),
    ('                ', True),
    (' групи ', False),
    ('КНМС-41', True),
    ('        ', True),
])

# p17: "на (в)____________________________________"
rebuild_para(ps[17], [
    ('на (в) ', False),
    ('ФОП Раделицький Володимир Степанович', True),
    ('                          ', True),
])

# p18: address line
rebuild_para(ps[18], [
    ('Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4', True),
])

# p23: dates
rebuild_para(ps[23], [
    ('від „', False),
    ('20', True),
    ('” ', False),
    ('квітня', True),
    ('    2026 р.               до ,,', False),
    ('16', True),
    ('” ', False),
    ('травня', True),
    ('     2026 р.', False),
])

# p32: керівник від організації
rebuild_para(ps[32], [
    ('від організації ', False),
    ('Раделицький В. С.', True),
    ('                  ', True),
])

# p39: керівник кафедри
rebuild_para(ps[39], [
    ('Керівник практики від кафедри  ', False),
    ('Машевська М. В.', True),
    ('                   ', True),
])

print("page 1 done")

# ================================================================
# PAGE 2
# ================================================================

# p53: Студент ПІБ
rebuild_para(ps[53], [
    ('Студент ', False),
    ('Раделицький В\'ячеслав Володимирович', True),
    ('                                            ', True),
])

# p55: ступінь + спеціальність (preserve trailing tab)
rebuild_para(ps[55], [
    ('Освітнньо-професійний ступінь ', False),
    ('фаховий молодший бакалавр', True),
    (' спеціальність ', False),
    ('122 «Комп\'ютерні науки»', True),
    ('\t', False),
])

# p56: вид практики
rebuild_para(ps[56], [
    ('Скерований на практику ', False),
    ('переддипломну', True),
    ('                                              ', True),
])

# p58: місто + організація
rebuild_para(ps[58], [
    ('в місто ', False),
    ('Львів', True),
    ('                         ', True),
    (' на ', False),
    ('ФОП Раделицький Володимир Степанович', True),
])

# p60: адреса організації
rebuild_para(ps[60], [
    ('Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4', True),
    ('        ', True),
])

# p64: термін
rebuild_para(ps[64], [
    ('Термін практики: від ', False),
    ('20 квітня 2026 р.', True),
    ('          ', True),
    (' до ', False),
    ('16 травня 2026 р.', True),
    ('                ', True),
])

# p66: керівник від кафедри
rebuild_para(ps[66], [
    ('Керівник практики від кафедри ', False),
    ('Машевська Марта Володимирівна', True),
    ('                                                    ', True),
    (' ', False),
])

# p69 — keep tabs structure, only modify last run "Директор інституту..."
runs69 = ps[69].runs
last_idx = len(runs69) - 1
# Rebuild only the last run portion
last_r = runs69[last_idx]._r
parent = last_r.getparent()
last_pos = list(parent).index(last_r)
parent.remove(last_r)
# Insert: "Директор інституту " (no UL) + "ІППТ" (UL) + spaces (UL)
template_r = ps[69].runs[0]._r if ps[69].runs else last_r
for text, underlined in [
    ('Директор інституту ', False),
    ('ІППТ', True),
    ('                 ', True),
]:
    new_r = deepcopy(template_r)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underlined:
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = text
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    parent.insert(last_pos, new_r)
    last_pos += 1

# p71: "________________________ «____»_____________20____ р"
rebuild_para(ps[71], [
    ('Попадинець Н. М.', True),
    ('                             ', True),
    (' «', False),
    (' 16 ', True),
    ('» ', False),
    ('травня', True),
    ('             20', False),
    ('26', True),
    (' р', False),
])

# p81: r0 prefix + r1 tab + r2 "\t„___"____________________ 20___ року"
# Keep r0, r1, modify r2 to multi-run
runs81 = ps[81].runs
# Build replacements for r2
r2 = runs81[2]._r
parent = r2.getparent()
r2_pos = list(parent).index(r2)
parent.remove(r2)
template_r = runs81[0]._r
date_parts = [
    ('\t„', False),
    ('20', True),
    ('” ', False),
    ('квітня', True),
    ('                 ', True),
    (' 2026', False),
    ('  ', True),
    (' року', False),
]
for text, underlined in date_parts:
    new_r = deepcopy(template_r)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underlined:
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    if '\t' in text:
        # Split by tab
        sub_parts = re.split(r'(\t)', text)
        for sp in sub_parts:
            if sp == '\t':
                etree.SubElement(new_r, WN + 'tab')
            elif sp:
                t_el = etree.SubElement(new_r, WN + 't')
                t_el.text = sp
                t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    else:
        t_el = etree.SubElement(new_r, WN + 't')
        t_el.text = text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    parent.insert(r2_pos, new_r)
    r2_pos += 1

# p82: signature line
rebuild_para(ps[82], [
    ('                                                                   ', False),
    ('Раделицький В. С.                                ', True),
])

# p90: same as p81 but вибув
runs90 = ps[90].runs
r2 = runs90[2]._r
parent = r2.getparent()
r2_pos = list(parent).index(r2)
parent.remove(r2)
template_r = runs90[0]._r
date_parts = [
    ('\t “', False),
    ('16', True),
    ('” ', False),
    ('травня', True),
    ('                 ', True),
    (' 2026', False),
    ('  ', True),
    (' року', False),
]
for text, underlined in date_parts:
    new_r = deepcopy(template_r)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underlined:
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    if '\t' in text:
        sub_parts = re.split(r'(\t)', text)
        for sp in sub_parts:
            if sp == '\t':
                etree.SubElement(new_r, WN + 'tab')
            elif sp:
                t_el = etree.SubElement(new_r, WN + 't')
                t_el.text = sp
                t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    else:
        t_el = etree.SubElement(new_r, WN + 't')
        t_el.text = text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    parent.insert(r2_pos, new_r)
    r2_pos += 1

# p91: signature
rebuild_para(ps[91], [
    ('                                                                   ', False),
    ('Раделицький В. С.                                ', True),
])

print("page 2 done")

# ================================================================
# PAGE 3 — Зміст завдання, відгуки
# ================================================================
# p96 has: r0 _ underscores, r1 _ underscores, r2 "(заповнює керівник...)", r3 _ underscores
# Replace whole paragraph with the zmist text + label
zmist_lines = [
    "Дослідження предметної області електронної комерції в Україні, аналіз існуючих торговельних платформ, вивчення принципів клієнт-серверної архітектури та відповідних засобів проєктування.",
    "Проєктування системи TechBox: формулювання функціональних та нефункціональних вимог, розроблення схеми бази даних, вибір технологічного стеку FastAPI, PostgreSQL, React, Docker, розробка архітектури REST API.",
    "Програмна реалізація, розробка інтерфейсу автентифікації, каталогу товарів, кошика та оформлення замовлення, інтеграція платіжної системи LiqPay, реалізація AI-модуля генерації описів товарів, розробка адміністративної панелі.",
    "Налаштування інфраструктури розгортання засобами Docker та Docker Compose з чотирма сервісами та health check.",
    "Підготовка звітності, узагальнення результатів для дипломної роботи та формування реєстру виконаних завдань.",
]

# Build parts for p96: first 2 lines + br, then label, then remaining lines
# Need br elements between lines
template_r = ps[96].runs[0]._r
parent = ps[96]._p
# Find the label run (the one with "заповнює")
label_r = None
for r in parent.findall(W + 'r'):
    txt = ''.join((t.text or '') for t in r.findall(W + 't'))
    if 'заповнює' in txt:
        label_r = r
        break

# Remove all runs
for r in list(parent.findall(W + 'r')):
    parent.remove(r)

def make_text_run(text, underlined=False, template=None):
    if template is None:
        template = template_r
    new_r = deepcopy(template)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    for br in new_r.findall(W + 'br'):
        new_r.remove(br)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underlined:
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = text
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return new_r

def make_br_run(template=None):
    if template is None:
        template = template_r
    new_r = deepcopy(template)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    for br in new_r.findall(W + 'br'):
        new_r.remove(br)
    rPr = new_r.find(W + 'rPr')
    if rPr is not None:
        for u in rPr.findall(W + 'u'):
            rPr.remove(u)
    etree.SubElement(new_r, WN + 'br')
    return new_r

# First 2 lines + line breaks
for i, line in enumerate(zmist_lines[:2]):
    parent.append(make_text_run(line, underlined=True))
    parent.append(make_br_run())

# Label (preserved from original)
if label_r is not None:
    parent.append(label_r)
    parent.append(make_br_run())

# Remaining 3 lines
for i, line in enumerate(zmist_lines[2:]):
    parent.append(make_text_run(line, underlined=True))
    if i < len(zmist_lines[2:]) - 1:
        parent.append(make_br_run())

# p98: "Завдання видав: ____________________"
# r0:"Завдання видав" r1:":" r2:" _______________________"
rebuild_para(ps[98], [
    ('Завдання видав: ', False),
    ('Машевська М. В.', True),
    ('                                            20 квітня 2026 року', True),
])

# p100: "Завдання отримав:_______________________"
rebuild_para(ps[100], [
    ('Завдання отримав: ', False),
    ('Раделицький В. В.', True),
    ('                                          20 квітня 2026 року', True),
])

# p105: Відгук від бази — r0,r1 underscores, r2 "(заповнює...)"
vidguk_baza_p1 = "Студент Раделицький В. В. за час проходження переддипломної практики продемонстрував ґрунтовні знання у сфері веб-розробки та здатність самостійно вирішувати прикладні інженерні завдання."

template_r = ps[105].runs[0]._r
parent = ps[105]._p
label_r = None
for r in parent.findall(W + 'r'):
    txt = ''.join((t.text or '') for t in r.findall(W + 't'))
    if 'заповнює' in txt:
        label_r = r
        break
for r in list(parent.findall(W + 'r')):
    parent.remove(r)
parent.append(make_text_run(vidguk_baza_p1, underlined=True, template=template_r))
parent.append(make_br_run(template=template_r))
if label_r is not None:
    parent.append(label_r)

# p106: continuation — r0..r3 underscores, r4 "(посада, прізвище...)"
vidguk_baza_p2 = "Завдання практики виконано в повному обсязі з дотриманням технічних вимог: розроблено повнофункціональну платформу електронної комерції TechBox із серверним API, клієнтським інтерфейсом, адміністративною панеллю та інтеграцією платіжної системи. Робота відзначається якістю коду, продуманістю архітектурних рішень та вмінням працювати із сучасними технологіями. Оцінка: відмінно."

template_r = ps[106].runs[0]._r
parent = ps[106]._p
label_r = None
for r in parent.findall(W + 'r'):
    txt = ''.join((t.text or '') for t in r.findall(W + 't'))
    if 'посада' in txt:
        label_r = r
        break
for r in list(parent.findall(W + 'r')):
    parent.remove(r)
parent.append(make_text_run(vidguk_baza_p2, underlined=True, template=template_r))
parent.append(make_br_run(template=template_r))
parent.append(make_text_run('                                  Раделицький В. С.                          ', underlined=True, template=template_r))
parent.append(make_br_run(template=template_r))
if label_r is not None:
    parent.append(label_r)

# p108: дата відгуку - last run tab + «___»______20___р.
runs108 = ps[108].runs
last_idx = len(runs108) - 1
last_r = runs108[last_idx]._r
parent = last_r.getparent()
pos = list(parent).index(last_r)
parent.remove(last_r)
template_r = runs108[0]._r if runs108 else last_r
date_parts = [
    ('\t«', False),
    ('16', True),
    ('» ', False),
    ('травня', True),
    ('             20', False),
    ('26', True),
    ('р.', False),
]
for text, underlined in date_parts:
    new_r = deepcopy(template_r)
    for t_el in new_r.findall(W + 't'):
        new_r.remove(t_el)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underlined:
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    if '\t' in text:
        sub_parts = re.split(r'(\t)', text)
        for sp in sub_parts:
            if sp == '\t':
                etree.SubElement(new_r, WN + 'tab')
            elif sp:
                t_el = etree.SubElement(new_r, WN + 't')
                t_el.text = sp
                t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    else:
        t_el = etree.SubElement(new_r, WN + 't')
        t_el.text = text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    parent.insert(pos, new_r)
    pos += 1

# p111: Відгук кафедри
vidguk_kaf = "Студент Раделицький В. В. виконав завдання переддипломної практики в повному обсязі відповідно до встановлених вимог. Звіт оформлено згідно з методичними рекомендаціями, зміст відповідає програмі практики."

template_r = ps[111].runs[0]._r
parent = ps[111]._p
for r in list(parent.findall(W + 'r')):
    parent.remove(r)
parent.append(make_text_run(vidguk_kaf, underlined=True, template=template_r))

# p113: "Дата складання заліку «___»______________________20___р."
rebuild_para(ps[113], [
    ('Дата складання заліку «', False),
    ('16', True),
    ('» ', False),
    ('травня', True),
    ('                    20', False),
    ('26', True),
    ('р.', False),
])

print("page 3 done")

d.save(SRC)
print(f"\nSaved: {SRC} ({os.path.getsize(SRC)/1024:.1f} KB)")
