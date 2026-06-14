"""Fill template — replace SOME underscores with text, keep the rest as underscores.
Total length of each underscore sequence is preserved so lines stay the same width.
Text is underlined for emphasis."""
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


def split_run_at_blanks(p, run_idx, replacements):
    """
    In paragraph p, run at index run_idx contains underscore blanks.
    `replacements` is a dict { blank_index_in_run: fill_text } where blank_index
    is 0-based index of the underscore sequence within that run.
    The text fills the START of the underscore sequence and underscores remain
    for the rest. The fill text is underlined.
    """
    run = p.runs[run_idx]
    text = run.text
    # Find all underscore sequences
    matches = list(re.finditer(r'_+', text))
    if not matches:
        return

    # Build segments: list of (text, is_underlined)
    segments = []
    last_end = 0
    for blank_idx, m in enumerate(matches):
        # Add non-blank text before this blank
        if m.start() > last_end:
            segments.append((text[last_end:m.start()], False, False))
        blank_len = m.end() - m.start()
        if blank_idx in replacements:
            fill = replacements[blank_idx]
            if len(fill) >= blank_len:
                # Text is as long or longer than blank — text fills entire blank
                segments.append((fill, True, False))
            else:
                # Text + remaining underscores
                remaining = '_' * (blank_len - len(fill))
                segments.append((fill, True, False))
                segments.append((remaining, False, True))  # underscores, not underlined
        else:
            # Keep the underscores as-is
            segments.append(('_' * blank_len, False, True))
        last_end = m.end()
    # Trailing text after last blank
    if last_end < len(text):
        segments.append((text[last_end:], False, False))

    # Get template run XML to clone formatting
    template_r = run._r

    # Insert new runs before original, then remove original
    parent = template_r.getparent()
    template_idx = list(parent).index(template_r)

    for i, (seg_text, underlined, is_underscore) in enumerate(segments):
        new_r = deepcopy(template_r)
        # Clear text + tabs
        for t in new_r.findall(W + 't'):
            new_r.remove(t)
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
        t_el.text = seg_text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        parent.insert(template_idx + i, new_r)
    # Remove original run
    parent.remove(template_r)


def fill_para_simple(p, replacements):
    """Single-run paragraph: replace blanks in run 0."""
    split_run_at_blanks(p, 0, replacements)


# ================================================================
# PAGE 1 — TITLE PAGE
# ================================================================

# p12: 1 blank → передипломної
fill_para_simple(ps[12], {0: 'передипломної'})
print("p12")

# p14: 2 blanks → фах. мол. бакалавр / 122 «Комп'ютерні науки»
fill_para_simple(ps[14], {0: ' фах. мол. бакалавр ', 1: ' 122 «Комп\'ютерні науки» '})
print("p14")

# p15: 2 blanks → Раделицького В. В. / КНМС-41
fill_para_simple(ps[15], {0: ' Раделицького В. В. ', 1: ' КНМС-41 '})
print("p15")

# p17: 1 blank → ФОП Раделицький Володимир Степанович
fill_para_simple(ps[17], {0: ' ФОП Раделицький Володимир Степанович '})
print("p17")

# p18: 1 blank → address
fill_para_simple(ps[18], {0: ' (Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4) '})
print("p18")

# p23: 4 blanks "від „__" _________  20__ р.   до ,,__" _________  20__ р."
# 0: 20  1: квітня  2: 26  3: 16  4: травня  5: 26
fill_para_simple(ps[23], {0: '20', 1: ' квітня ', 2: '26', 3: '16', 4: ' травня ', 5: '26'})
print("p23")

# p32: "від організації _____________________"
fill_para_simple(ps[32], {0: ' Раделицький В. С. '})
print("p32")

# p39: "Керівник практики від кафедри  __________________________________"
fill_para_simple(ps[39], {0: ' Машевська М. В. '})
print("p39")

# ================================================================
# PAGE 2 — ЗАВДАННЯ ТА РЕЗУЛЬТАТИ
# ================================================================

# p53 has 4 runs all underscores essentially. Treat as combining all into run 0.
# r0: "Студент____________"  r1: "_____________________________"  r2: "____________________________"  r3: "__"
# Better: combine all underscores into one logical blank
# Strategy: replace blank in r0 with name, clear r1-r3
split_run_at_blanks(ps[53], 0, {0: ' Раделицький В\'ячеслав Володимирович'})
# Clear remaining runs that are just underscores
# Note indices shift after split — but we can find them by text
for r in ps[53].runs:
    if re.fullmatch(r'_+', r.text):
        # Keep them as underscore line (already are)
        pass
print("p53")

# p55: r0:"О" r1:"світнньо-професійний ступінь" r2:" " r3:"__________________спеціальність_" r4:"122..." r5:tab
# Only r3 has blanks
split_run_at_blanks(ps[55], 3, {0: ' фах. мол. бакалавр ', 1: ' '})
print("p55")

# p56: 5 runs, 4 blanks
# r0:"Скерований на практику______" r1:"___________" r2:"__________________________" r3:"____________" r4:"____ "
# Replace blank in r0 with text
split_run_at_blanks(ps[56], 0, {0: ' передипломну '})
print("p56")

# p58: r0:"в місто" r1:"_____" r2:"на" r3:"_____" r4:"_____" r5:"" r6:"_____"
# r1 → " Львів "    r3 → " ФОП Раделицький Володимир Степанович "
split_run_at_blanks(ps[58], 1, {0: ' Львів '})
# After split, run indices shift. Find new index of r3 (the next blank run after "на")
# Simpler: re-find by text
for i, r in enumerate(ps[58].runs):
    if r.text == 'на':
        # next run should be blank
        if i + 1 < len(ps[58].runs):
            split_run_at_blanks(ps[58], i + 1, {0: ' ФОП Раделицький Володимир Степанович '})
        break
print("p58")

# p60: single run all underscores → full org name
fill_para_simple(ps[60], {0: ' ФОП Раделицький Володимир Степанович '})
print("p60")

# p64: r0:"Термін практики: від" r1:"__" r2:"______________________до " r3:"__" r4:"___..."
# r1: "20.04"  r2 contains: "______________________" + "до " (1 blank)
# r3: "16.05"  r4: dates
split_run_at_blanks(ps[64], 1, {0: '20.04.2026 р.'})
# Now find r2 - has 1 blank
for i, r in enumerate(ps[64].runs):
    if 'до' in r.text and '_' in r.text:
        split_run_at_blanks(ps[64], i, {0: ' '})
        break
# Find r3 (next blank run)
for i, r in enumerate(ps[64].runs):
    if r.text == '__':
        split_run_at_blanks(ps[64], i, {0: '16.05.2026 р.'})
        break
print("p64")

# p66: "Керівник практики від кафедри __________________________________________________"
fill_para_simple(ps[66], {0: ' Машевська Марта Володимирівна '})
print("p66")

# p69: last run "Директор інституту _____________________"
last_idx = len(ps[69].runs) - 1
split_run_at_blanks(ps[69], last_idx, {0: ' ІППТ '})
print("p69")

# p71: "_____________________________________________ «____»_________________20____ р"
# 4 blanks: 0=name, 1=date day, 2=date month/year, 3=year suffix
fill_para_simple(ps[71], {0: ' Попадинець Н. М. ', 1: '  ', 2: ' травня 2026 ', 3: ''})
print("p71")

# p81: "Прибув на базу практики \t\t„___" ____________________ 20___ року"
# r0:"Прибув на базу практики "  r1:"\t"  r2:"\t„___" ____________________ 20___ року"
# r2 has 3 blanks
split_run_at_blanks(ps[81], 2, {0: '20', 1: ' квітня ', 2: '26'})
print("p81")

# p82: single blank line under "Прибув" → signature
fill_para_simple(ps[82], {0: ' Раделицький В. С. '})
print("p82")

# p90: "Вибув з бази практики \t\t \"___" ____________________ 20___ року"
split_run_at_blanks(ps[90], 2, {0: '16', 1: ' травня ', 2: '26'})
print("p90")

# p91: signature
fill_para_simple(ps[91], {0: ' Раделицький В. С. '})
print("p91")

# ================================================================
# PAGE 3 — ЗМІСТ ЗАВДАННЯ
# ================================================================
# p96: r0,r1: underscores  r2: "(заповнює керівник практики від університету)"  r3: underscores
zmist_lines = [
    "Дослідження предметної області електронної комерції в Україні, аналіз існуючих торговельних платформ, вивчення принципів клієнт-серверної архітектури та відповідних засобів проєктування.",
    "Проєктування системи TechBox: формулювання функціональних та нефункціональних вимог, розроблення схеми бази даних, вибір технологічного стеку FastAPI, PostgreSQL, React, Docker, розробка архітектури REST API.",
    "Програмна реалізація, розробка інтерфейсу автентифікації, каталогу товарів, кошика та оформлення замовлення, інтеграція платіжної системи LiqPay, реалізація AI-модуля генерації описів товарів, розробка адміністративної панелі.",
    "Налаштування інфраструктури розгортання засобами Docker та Docker Compose з чотирма сервісами та health check.",
    "Підготовка звітності, узагальнення результатів для дипломної роботи та формування реєстру виконаних завдань.",
]

# Replace r0 (underscores before label) with first line + break
# r1 underscores cleared
# r3 (after label) keeps the rest of lines with breaks
runs96 = ps[96].runs
template_r = runs96[0]._r
parent96 = ps[96]._p

# Build: line1<br>line2<br>line3 in r0 position
def make_run(template, text, underlined=False):
    new_r = deepcopy(template)
    for t in new_r.findall(W + 't'):
        new_r.remove(t)
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

def make_br_run(template):
    new_r = deepcopy(template)
    for t in new_r.findall(W + 't'):
        new_r.remove(t)
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

# Find run indices: r0 = first run (underscores), label run = run with "заповнює"
runs_list = list(parent96.findall(W + 'r'))
# Identify label run
label_idx = None
for i, r in enumerate(runs_list):
    txt = ''.join(t.text or '' for t in r.findall(W + 't'))
    if 'заповнює' in txt:
        label_idx = i
        break

# Replace r0 + r1 with: line1, br, line2, br
# Insert before label
if label_idx is not None and label_idx >= 2:
    # Remove r0, r1
    for r in runs_list[:label_idx]:
        parent96.remove(r)
    # Insert new runs before label
    label_r = runs_list[label_idx]
    insert_idx = list(parent96).index(label_r)
    # First two lines + breaks
    new_runs = []
    for i, line in enumerate(zmist_lines[:2]):
        new_runs.append(make_run(template_r, line, underlined=True))
        new_runs.append(make_br_run(template_r))
    for i, nr in enumerate(new_runs):
        parent96.insert(insert_idx + i, nr)
    # After label, insert remaining lines
    # Remove runs after label (which were r3 underscores)
    all_runs_now = list(parent96.findall(W + 'r'))
    label_pos = None
    for i, r in enumerate(all_runs_now):
        txt = ''.join(t.text or '' for t in r.findall(W + 't'))
        if 'заповнює' in txt:
            label_pos = i
            break
    for r in all_runs_now[label_pos + 1:]:
        parent96.remove(r)
    # Insert remaining lines after label
    label_r = all_runs_now[label_pos]
    insert_idx = list(parent96).index(label_r) + 1
    new_runs = []
    new_runs.append(make_br_run(template_r))
    for i, line in enumerate(zmist_lines[2:]):
        new_runs.append(make_run(template_r, line, underlined=True))
        if i < len(zmist_lines[2:]) - 1:
            new_runs.append(make_br_run(template_r))
    for i, nr in enumerate(new_runs):
        parent96.insert(insert_idx + i, nr)
print("p96")

# p98: "Завдання видав: ________________________________________________________________"
fill_para_simple(ps[98], {0: ' Машевська М. В.                                      20 квітня 2026 року'})
print("p98")

# p100: "Завдання отримав:______________________________________________________________"
fill_para_simple(ps[100], {0: ' Раделицький В. В.                                  20 квітня 2026 року'})
print("p100")

# ================================================================
# ВІДГУК ВІД БАЗИ
# ================================================================
vidguk_baza_lines = [
    "Студент Раделицький В. В. за час проходження передипломної практики продемонстрував ґрунтовні знання у сфері веб-розробки та здатність самостійно вирішувати прикладні інженерні завдання.",
    "Завдання практики виконано в повному обсязі з дотриманням технічних вимог: розроблено повнофункціональну платформу електронної комерції TechBox із серверним API, клієнтським інтерфейсом, адміністративною панеллю та інтеграцією платіжної системи.",
    "Робота відзначається якістю коду, продуманістю архітектурних рішень та вмінням працювати із сучасними технологіями.",
    "Оцінка: відмінно.",
]

# p105: r0:underscores r1:underscores r2:"(заповнює...)"
runs105 = list(ps[105]._p.findall(W + 'r'))
label_idx105 = None
for i, r in enumerate(runs105):
    txt = ''.join(t.text or '' for t in r.findall(W + 't'))
    if 'заповнює' in txt:
        label_idx105 = i
        break

template_r105 = runs105[0]
parent105 = ps[105]._p
if label_idx105 is not None:
    for r in runs105[:label_idx105]:
        parent105.remove(r)
    new_runs_iter = list(parent105.findall(W + 'r'))
    label_r = None
    for r in new_runs_iter:
        txt = ''.join(t.text or '' for t in r.findall(W + 't'))
        if 'заповнює' in txt:
            label_r = r
            break
    insert_idx = list(parent105).index(label_r)
    new_runs = []
    new_runs.append(make_run(template_r105, vidguk_baza_lines[0], underlined=True))
    new_runs.append(make_br_run(template_r105))
    for i, nr in enumerate(new_runs):
        parent105.insert(insert_idx + i, nr)
print("p105")

# p106: r0-r3 underscores, r4 label "(посада, прізвище...)"
# Insert remaining lines + signature before label
runs106 = list(ps[106]._p.findall(W + 'r'))
label_idx106 = None
for i, r in enumerate(runs106):
    txt = ''.join(t.text or '' for t in r.findall(W + 't'))
    if 'посада' in txt:
        label_idx106 = i
        break

template_r106 = runs106[0]
parent106 = ps[106]._p
if label_idx106 is not None:
    for r in runs106[:label_idx106]:
        parent106.remove(r)
    runs_now = list(parent106.findall(W + 'r'))
    label_r = None
    for r in runs_now:
        txt = ''.join(t.text or '' for t in r.findall(W + 't'))
        if 'посада' in txt:
            label_r = r
            break
    insert_idx = list(parent106).index(label_r)
    new_runs = []
    for i, line in enumerate(vidguk_baza_lines[1:]):
        new_runs.append(make_run(template_r106, line, underlined=True))
        new_runs.append(make_br_run(template_r106))
    new_runs.append(make_run(template_r106, '                                                Раделицький В. С. ', underlined=True))
    for i, nr in enumerate(new_runs):
        parent106.insert(insert_idx + i, nr)
print("p106")

# p108: last run "\t«___»_______________________20___р."
last_idx108 = len(ps[108].runs) - 1
split_run_at_blanks(ps[108], last_idx108, {0: '16', 1: ' травня ', 2: '26'})
print("p108")

# ================================================================
# ВІДГУК ВІД КАФЕДРИ (p111)
# ================================================================
vidguk_kaf = (
    "Студент Раделицький В. В. виконав завдання передипломної практики в повному обсязі "
    "відповідно до встановлених вимог. Звіт оформлено згідно з методичними рекомендаціями, "
    "зміст відповідає програмі практики."
)
# 6 runs all underscores
runs111 = list(ps[111]._p.findall(W + 'r'))
template_r111 = runs111[0]
parent111 = ps[111]._p
# Remove all
for r in runs111:
    parent111.remove(r)
# Add new
parent111.append(make_run(template_r111, vidguk_kaf, underlined=True))
print("p111")

# p113: "Дата складання заліку «___»_______________________20___р."
fill_para_simple(ps[113], {0: '16', 1: ' травня ', 2: '26'})
print("p113")

d.save(SRC)
print(f"\nSaved: {SRC} ({os.path.getsize(SRC)/1024:.1f} KB)")
