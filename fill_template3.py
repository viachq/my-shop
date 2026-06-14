"""Fill template — replace underscore blanks with UNDERLINED text (no underscore chars left)."""
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Pt
from copy import deepcopy

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
WN = W[:-1] + '}'
SRC = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy - Copy.docx"

d = Document(SRC)
ps = d.paragraphs


def make_run_xml(text, template_run, underline=True):
    """Create new <w:r> with copied formatting from template_run, optional underline."""
    new_r = deepcopy(template_run._r)
    # Clear existing text nodes
    for t in new_r.findall(W + 't'):
        new_r.remove(t)
    # Ensure rPr exists
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        from lxml import etree
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    # Remove existing underline
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    if underline:
        from lxml import etree
        u = etree.SubElement(rPr, WN + 'u')
        u.set(WN + 'val', 'single')
    # Add text
    from lxml import etree
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = text
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return new_r


def replace_blanks_with_underlined(p, segments):
    """
    segments: list of strings or (text, is_underlined) tuples in order.
    Underscore runs in the paragraph get replaced with underlined text.
    Plain text runs (no underscores) get kept as-is.
    Actually: this function rebuilds the paragraph from `segments`,
    using each run's formatting as a template for non-underlined parts.
    """
    pass  # implemented per-paragraph below


def rebuild_para(p, parts):
    """
    Rebuild paragraph runs from `parts` list.
    Each part is (text, underline_bool). Formatting copied from first existing run.
    """
    if not p.runs:
        return
    template = p.runs[0]
    # Remove all existing runs
    for r in list(p._p.findall(W + 'r')):
        p._p.remove(r)
    # Insert new runs at end of paragraph (before pPr's next siblings - but pPr is first child)
    from lxml import etree
    for text, underline in parts:
        new_r = deepcopy(template._r)
        # Clear text nodes from copy
        for t in new_r.findall(W + 't'):
            new_r.remove(t)
        for tab in new_r.findall(W + 'tab'):
            new_r.remove(tab)
        rPr = new_r.find(W + 'rPr')
        if rPr is None:
            rPr = etree.SubElement(new_r, WN + 'rPr')
        # Remove old underline
        for u in rPr.findall(W + 'u'):
            rPr.remove(u)
        if underline:
            u = etree.SubElement(rPr, WN + 'u')
            u.set(WN + 'val', 'single')
        t_el = etree.SubElement(new_r, WN + 't')
        t_el.text = text
        t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        p._p.append(new_r)


# ================================================================
# PAGE 1 — TITLE PAGE
# ================================================================

# Para 12: "про проходження_______ практики "
rebuild_para(ps[12], [
    ('про проходження ', False),
    ('передипломної                                                ', True),
    (' практики ', False),
])
print("p12")

# Para 14: ступінь + спеціальність
rebuild_para(ps[14], [
    ('освітньо-професійний ступінь ', False),
    ('фах. мол. бакалавр', True),
    ('   спеціальність ', False),
    ('122 «Комп\'ютерні науки»  ', True),
])
print("p14")

# Para 15: студент + група
rebuild_para(ps[15], [
    ('студента (ки) ', False),
    ('Раделицького В. В.                                ', True),
    (' групи ', False),
    ('КНМС-41          ', True),
])
print("p15")

# Para 17: на (в)
rebuild_para(ps[17], [
    ('на (в) ', False),
    ('ФОП Раделицький Володимир Степанович                                ', True),
])
print("p17")

# Para 18: address
rebuild_para(ps[18], [
    ('(Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4)            ', True),
])
print("p18")

# Para 23: dates
rebuild_para(ps[23], [
    ('від „', False),
    ('20', True),
    ('" ', False),
    ('квітня         ', True),
    ('  2026 р.               до ,,', False),
    ('16', True),
    ('" ', False),
    ('травня         ', True),
    ('  2026 р.', False),
])
print("p23")

# Para 32: від організації
rebuild_para(ps[32], [
    ('від організації ', False),
    ('Раделицький В. С.    ', True),
])
print("p32")

# Para 39: керівник кафедри
rebuild_para(ps[39], [
    ('Керівник практики від кафедри  ', False),
    ('Машевська М. В.                          ', True),
])
print("p39")

# ================================================================
# PAGE 2 — ЗАВДАННЯ ТА РЕЗУЛЬТАТИ
# ================================================================

# Para 53: студент
rebuild_para(ps[53], [
    ('Студент   ', False),
    ('Раделицький В\'ячеслав Володимирович                                                  ', True),
])
print("p53")

# Para 55: ступінь + спеціальність (preserve "122 Компютерні науки" already present)
rebuild_para(ps[55], [
    ('Освітньо-професійний ступінь ', False),
    ('фах. мол. бакалавр       ', True),
    (' спеціальність ', False),
    ('122  "Комп\'ютерні науки"', True),
    ('\t', False),
])
print("p55")

# Para 56: вид практики
rebuild_para(ps[56], [
    ('Скерований на практику ', False),
    ('передипломну                                                          ', True),
    (' ', False),
])
print("p56")

# Para 58: в місто + на
rebuild_para(ps[58], [
    ('в місто ', False),
    ('Львів                       ', True),
    (' на ', False),
    ('ФОП Раделицький Володимир Степанович         ', True),
    (' ', False),
])
print("p58")

# Para 60: назва організації
rebuild_para(ps[60], [
    ('ФОП Раделицький Володимир Степанович                                                        ', True),
])
print("p60")

# Para 64: термін
rebuild_para(ps[64], [
    ('Термін практики: від ', False),
    ('20.04.2026 р.                  ', True),
    (' до ', False),
    ('16.05.2026 р.                                  ', True),
])
print("p64")

# Para 66: керівник від кафедри
rebuild_para(ps[66], [
    ('Керівник практики від кафедри ', False),
    ('Машевська Марта Володимирівна                                                    ', True),
    (' ', False),
])
print("p66")

# Para 69: keep tabs + директор інституту
# This one has 10 runs with tabs. Replace last run only with underlined ІППТ
# Keep tab structure
runs69 = ps[69].runs
last_idx = len(runs69) - 1
# Modify last run: "Директор інституту _____________________"
# We need: "Директор інституту " + underlined "ІППТ"
# Use rebuild approach but on last run only - actually just edit text and add underline via xml
last_r = runs69[last_idx]._r
# Clear text from this run
from lxml import etree
for t in last_r.findall(W + 't'):
    last_r.remove(t)
# Add "Директор інституту " (no underline)
t1 = etree.SubElement(last_r, WN + 't')
t1.text = 'Директор інституту '
t1.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
# Insert new run after this one for underlined "ІППТ"
new_r = deepcopy(last_r)
for t in new_r.findall(W + 't'):
    new_r.remove(t)
rPr = new_r.find(W + 'rPr')
if rPr is None:
    rPr = etree.SubElement(new_r, WN + 'rPr')
    new_r.insert(0, rPr)
for u in rPr.findall(W + 'u'):
    rPr.remove(u)
u = etree.SubElement(rPr, WN + 'u')
u.set(WN + 'val', 'single')
t2 = etree.SubElement(new_r, WN + 't')
t2.text = 'ІППТ                    '
t2.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
last_r.addnext(new_r)
print("p69")

# Para 71: Попадинець + дата
rebuild_para(ps[71], [
    ('     ', False),
    ('Попадинець Н. М.                                          ', True),
    (' «    »', False),
    ('                       ', True),
    ('20', False),
    ('26', True),
    (' р', False),
])
print("p71")

# Para 81: прибув
# Original: r0="Прибув на базу практики "  r1="\t"  r2="\t„___" ____________________ 20___ року"
# Keep r0 and r1 structure - replace r2
runs81 = ps[81].runs
# Modify r2 to have underlined date
r2 = runs81[2]._r
for t in r2.findall(W + 't'):
    r2.remove(t)
for tab in r2.findall(W + 'tab'):
    r2.remove(tab)
tab_el = etree.SubElement(r2, WN + 'tab')
t_a = etree.SubElement(r2, WN + 't')
t_a.text = '„'
t_a.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
# Insert underlined runs after r2
def insert_underlined_after(ref_r, text):
    new_r = deepcopy(ref_r)
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
    u = etree.SubElement(rPr, WN + 'u')
    u.set(WN + 'val', 'single')
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = text
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    ref_r.addnext(new_r)
    return new_r

def insert_plain_after(ref_r, text):
    new_r = deepcopy(ref_r)
    for t in new_r.findall(W + 't'):
        new_r.remove(t)
    for tab in new_r.findall(W + 'tab'):
        new_r.remove(tab)
    rPr = new_r.find(W + 'rPr')
    if rPr is not None:
        for u in rPr.findall(W + 'u'):
            rPr.remove(u)
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = text
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    ref_r.addnext(new_r)
    return new_r

# Insert in reverse order (each goes right after r2)
# Final desired: "Прибув на базу практики \t\t„20" квітня      2026 року"
last = insert_plain_after(r2, ' року')
last = insert_underlined_after(r2, '2026')
last = insert_plain_after(r2, ' ')
last = insert_underlined_after(r2, 'квітня         ')
last = insert_plain_after(r2, '" ')
last = insert_underlined_after(r2, '20')
print("p81")

# Para 82: підпис відповідальної
rebuild_para(ps[82], [
    ('                                                                          ', False),
    ('Раделицький В. С.                                       ', True),
])
print("p82")

# Para 90: вибув - same pattern as p81
runs90 = ps[90].runs
r2 = runs90[2]._r
for t in r2.findall(W + 't'):
    r2.remove(t)
for tab in r2.findall(W + 'tab'):
    r2.remove(tab)
tab_el = etree.SubElement(r2, WN + 'tab')
t_a = etree.SubElement(r2, WN + 't')
t_a.text = ' “'
t_a.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
last = insert_plain_after(r2, ' року')
last = insert_underlined_after(r2, '2026')
last = insert_plain_after(r2, ' ')
last = insert_underlined_after(r2, 'травня         ')
last = insert_plain_after(r2, '” ')
last = insert_underlined_after(r2, '16')
print("p90")

# Para 91
rebuild_para(ps[91], [
    ('                                                                          ', False),
    ('Раделицький В. С.                                       ', True),
])
print("p91")

# ================================================================
# PAGE 3 — ЗМІСТ ЗАВДАННЯ
# ================================================================
zmist = (
    "Дослідження предметної області електронної комерції в Україні, "
    "аналіз існуючих торговельних платформ, вивчення принципів клієнт-серверної "
    "архітектури та відповідних засобів проєктування.\n"
    "Проєктування системи TechBox: формулювання функціональних та нефункціональних "
    "вимог, розроблення схеми бази даних, вибір технологічного стеку FastAPI, "
    "PostgreSQL, React, Docker, розробка архітектури REST API.\n"
    "Програмна реалізація, розробка інтерфейсу автентифікації, каталогу товарів, "
    "кошика та оформлення замовлення, інтеграція платіжної системи LiqPay, "
    "реалізація AI-модуля генерації описів товарів, розробка адміністративної панелі.\n"
    "Налаштування інфраструктури розгортання засобами Docker та Docker Compose "
    "з чотирма сервісами та health check.\n"
    "Підготовка звітності, узагальнення результатів для дипломної роботи та формування "
    "реєстру виконаних завдань."
)
# Para 96 has multi-line content with newlines - need separate paragraphs OR use line breaks
# python-docx: \n in text doesn't break. Use rebuild with single text, then handle.
# Simpler: split zmist by \n into separate runs with line breaks
parts96 = []
lines = zmist.split('\n')
for i, line in enumerate(lines):
    parts96.append((line, True))
    if i < len(lines) - 1:
        parts96.append(('\n', False))  # won't actually break - need <w:br/>

# Use special handler with line breaks
runs96 = ps[96].runs
template_r = runs96[0]._r
# Remove all runs
for r in list(ps[96]._p.findall(W + 'r')):
    ps[96]._p.remove(r)

for i, line in enumerate(lines):
    new_r = deepcopy(template_r)
    for t in new_r.findall(W + 't'):
        new_r.remove(t)
    rPr = new_r.find(W + 'rPr')
    if rPr is None:
        rPr = etree.SubElement(new_r, WN + 'rPr')
        new_r.insert(0, rPr)
    for u in rPr.findall(W + 'u'):
        rPr.remove(u)
    u = etree.SubElement(rPr, WN + 'u')
    u.set(WN + 'val', 'single')
    t_el = etree.SubElement(new_r, WN + 't')
    t_el.text = line
    t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    ps[96]._p.append(new_r)
    if i < len(lines) - 1:
        br_r = deepcopy(template_r)
        for t in br_r.findall(W + 't'):
            br_r.remove(t)
        br_rPr = br_r.find(W + 'rPr')
        if br_rPr is not None:
            for u in br_rPr.findall(W + 'u'):
                br_rPr.remove(u)
        etree.SubElement(br_r, WN + 'br')
        ps[96]._p.append(br_r)
print("p96")

# Para 98: завдання видав
rebuild_para(ps[98], [
    ('Завдання видав', False),
    (': ', False),
    ('Машевська М. В.                                            20 квітня 2026 року', True),
])
print("p98")

# Para 100: завдання отримав
rebuild_para(ps[100], [
    ('Завдання отримав', False),
    (': ', False),
    ('Раделицький В. В.                                          20 квітня 2026 року', True),
])
print("p100")

# ================================================================
# ВІДГУК ВІД БАЗИ (paras 105-106)
# ================================================================
vidguk_baza = (
    "Студент Раделицький В. В. за час проходження передипломної практики "
    "продемонстрував ґрунтовні знання у сфері веб-розробки та здатність самостійно "
    "вирішувати прикладні інженерні завдання. Завдання практики виконано в повному "
    "обсязі з дотриманням технічних вимог: розроблено повнофункціональну платформу "
    "електронної комерції TechBox із серверним API, клієнтським інтерфейсом, "
    "адміністративною панеллю та інтеграцією платіжної системи. Робота відзначається "
    "якістю коду, продуманістю архітектурних рішень та вмінням працювати із сучасними "
    "технологіями. Оцінка: відмінно."
)
rebuild_para(ps[105], [
    (vidguk_baza, True),
])
print("p105")

# Para 106: keep the (посада...) label at end, add signature
rebuild_para(ps[106], [
    ('                                                                                 ', False),
    ('Раделицький В. С.                                              ', True),
    (' (посада, прізвище, ім\'я, по батькові та підпис керівника практики від бази практики)', False),
])
print("p106")

# Para 108: дата відгуку
runs108 = ps[108].runs
last_r = runs108[-1]._r
for t in last_r.findall(W + 't'):
    last_r.remove(t)
for tab in last_r.findall(W + 'tab'):
    last_r.remove(tab)
tab_el = etree.SubElement(last_r, WN + 'tab')
t_el = etree.SubElement(last_r, WN + 't')
t_el.text = '«'
t_el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
last = insert_plain_after(last_r, 'р.')
last = insert_underlined_after(last_r, '26')
last = insert_plain_after(last_r, '20')
last = insert_underlined_after(last_r, 'травня         ')
last = insert_plain_after(last_r, '»')
last = insert_underlined_after(last_r, '16')
print("p108")

# ================================================================
# ВІДГУК ВІД КАФЕДРИ (para 111)
# ================================================================
vidguk_kaf = (
    "Студент Раделицький В. В. виконав завдання передипломної практики "
    "в повному обсязі відповідно до встановлених вимог. Звіт оформлено згідно "
    "з методичними рекомендаціями, зміст відповідає програмі практики."
)
rebuild_para(ps[111], [
    (vidguk_kaf, True),
])
print("p111")

# Para 113: дата заліку
rebuild_para(ps[113], [
    ('Дата складання заліку «', False),
    ('16', True),
    ('»', False),
    ('травня         ', True),
    ('20', False),
    ('26', True),
    ('р.', False),
])
print("p113")

d.save(SRC)
print(f"\nSaved: {SRC} ({os.path.getsize(SRC)/1024:.1f} KB)")
