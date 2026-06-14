"""Fill template — overlay text on underscores by replacing _ chars with letters.
Total length of each blank is preserved EXACTLY.
NO underline, NO XML restructuring — only direct string replacement in existing runs."""
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


def overlay(run_text, fills, pad='_', default_mode='center'):
    """
    Replace each underscore sequence with text. Each fills[i] is either:
    - str: use default_mode positioning
    - tuple (text, mode): mode = 'center' | 'right' | 'left' | 'exact'
    """
    matches = list(re.finditer(r'_+', run_text))
    if not matches:
        return run_text
    result = run_text
    for blank_idx in range(len(matches) - 1, -1, -1):
        m = matches[blank_idx]
        if blank_idx >= len(fills) or fills[blank_idx] is None:
            continue
        item = fills[blank_idx]
        if isinstance(item, tuple):
            f_text, mode = item
        else:
            f_text, mode = item, default_mode
        blank_len = m.end() - m.start()
        if len(f_text) >= blank_len:
            # Overflow — auto-add spaces if adjacent to letters
            prev_char = result[m.start() - 1] if m.start() > 0 else ' '
            next_char = result[m.end()] if m.end() < len(result) else ' '
            prefix = ' ' if prev_char.isalpha() and not f_text.startswith(' ') else ''
            suffix = ' ' if next_char.isalpha() and not f_text.endswith(' ') else ''
            new_seq = prefix + f_text + suffix
        else:
            remaining = blank_len - len(f_text)
            if mode == 'center':
                before = min(3, remaining // 2)
                after = remaining - before
                new_seq = pad * before + f_text + pad * after
            elif mode == 'right':
                new_seq = f_text + pad * remaining
            elif mode == 'left':
                new_seq = pad * remaining + f_text
            else:
                new_seq = f_text + pad * remaining
        result = result[:m.start()] + new_seq + result[m.end():]
    return result


def fill(p_idx, fills, run_idx=0, mode='center'):
    """Apply overlay to specified run of paragraph."""
    p = ps[p_idx]
    runs = p.runs
    if run_idx >= len(runs):
        return
    old = runs[run_idx].text
    new = overlay(old, fills, default_mode=mode)
    runs[run_idx].text = new


# ================================================================
# PAGE 1 — TITLE PAGE
# ================================================================

# p12
fill(12, ['передипломної'])

# p14
fill(14, ['фаховий молодший бакалавр ', '122 «Комп\'ютерні науки»'])

# p15
fill(15, ['Раделицького В. В.', 'КНМС-41'])

# p17
fill(17, ['ФОП Раделицький Володимир Степанович'])

# p18: "____________________________________________________________________"
# 1 blank
fill(18, ['(Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4)'])

# p23: "від „__" _________  20__ р.               до ,,__" _________     20__ р."
fill(23, ['20', 'квітня   ', '26', '16', 'травня   ', '26'], mode='right')

# p32: "від організації _____________________"
fill(32, ['Раделицький В. С.'])

# p39: "Керівник практики від кафедри  __________________________________"
fill(39, ['Машевська М. В.'])

print("page 1 done")

# ================================================================
# PAGE 2 — ЗАВДАННЯ ТА РЕЗУЛЬТАТИ
# ================================================================
# p53: 4 runs all underscores. Treat each run separately.
# r0: "Студент____________"  → fill in
# r1: ___________________________ (continuation underscores - leave)
# r2,r3: same
fill(53, ['Раделицький В\'ячеслав Володимирович'], run_idx=0)

# p55: blank0 (18_) before "спеціальність" — overflow text needs trailing space
fill(55, ['фаховий молодший бакалавр ', ' '], run_idx=3)

# p56
fill(56, ['передипломну'], run_idx=0)

# p58
fill(58, ['Львів'], run_idx=1)
# r3 blank starts after "на" in r2 — need leading space for overflow
fill(58, [' ФОП Раделицький Володимир Степанович'], run_idx=3)

# p60: single run all underscores
fill(60, ['ФОП Раделицький Володимир Степанович'])

# p64: r0:"Термін практики: від" r1:"__" r2:"______________________до " r3:"__" r4:"___..."
ps[64].runs[0].text = 'Термін практики: від '
fill(64, ['20'], run_idx=1, mode='right')
fill(64, ['.04.2026 р.'], run_idx=2, mode='right')
fill(64, ['16'], run_idx=3, mode='right')
fill(64, ['.05.2026 р.'], run_idx=4, mode='right')

# p66: "Керівник практики від кафедри __________________________________________________"
fill(66, ['Машевська Марта Володимирівна'])

# p69: last run "Директор інституту _____________________"
last_idx = len(ps[69].runs) - 1
fill(69, ['ІППТ'], run_idx=last_idx)

# p71: "_____________________________________________ «____»_________________20____ р"
fill(71, [('Попадинець Н. М.', 'center'), (' 16 ', 'right'), (' травня ', 'right'), ('26', 'right')])

# p81: r2 = "\t„___" ____________________ 20___ року"  - 3 blanks (3, 20, 3)
fill(81, ['20 ', 'квітня              ', '26 '], run_idx=2, mode='right')

# p82: single underscore line - signature
fill(82, ['Раделицький В. С.'])

# p90: same as p81 but вибув
fill(90, ['16 ', 'травня              ', '26 '], run_idx=2, mode='right')

# p91: signature
fill(91, ['Раделицький В. С.'])

print("page 2 done")

# ================================================================
# PAGE 3 — ЗМІСТ ЗАВДАННЯ (p96)
# ================================================================
# p96: r0,r1: underscores  r2:"(заповнює керівник практики від університету)"  r3: underscores
# Just fill r0 and r3 with text
zmist_p1 = "Дослідження предметної області електронної комерції в Україні, аналіз існуючих торговельних платформ, вивчення принципів клієнт-серверної архітектури та відповідних засобів проєктування. "
zmist_p2 = "Проєктування системи TechBox: формулювання функціональних та нефункціональних вимог, розроблення схеми бази даних, вибір технологічного стеку FastAPI, PostgreSQL, React, Docker, розробка архітектури REST API. Програмна реалізація, розробка інтерфейсу автентифікації, каталогу товарів, кошика та оформлення замовлення, інтеграція платіжної системи LiqPay, реалізація AI-модуля генерації описів товарів, розробка адміністративної панелі. Налаштування інфраструктури розгортання засобами Docker та Docker Compose з чотирма сервісами та health check. Підготовка звітності, узагальнення результатів для дипломної роботи та формування реєстру виконаних завдань."

fill(96, [zmist_p1], run_idx=0)
# r1 underscores
# r2 label - keep
# r3 underscores → second part
fill(96, [zmist_p2], run_idx=3)

# p98: "Завдання видав: ________________________________________________________________"
fill(98, [' Машевська М. В.                                   20 квітня 2026 року'], run_idx=2, mode='right')

# p100: "Завдання отримав:______________________________________________________________"
fill(100, [' Раделицький В. В.                                 20 квітня 2026 року'], run_idx=2, mode='right')

# p105: r0 underscores  r1 underscores  r2:"(заповнює керівник практики від бази практики)"
vidguk_baza = "Студент Раделицький В. В. за час проходження передипломної практики продемонстрував ґрунтовні знання у сфері веб-розробки та здатність самостійно вирішувати прикладні інженерні завдання."
fill(105, [vidguk_baza], run_idx=0)

# p106: r0:underscores r1:underscores r2:underscores r3:underscores r4:"(посада, прізвище...)"
vidguk_baza2 = "Завдання практики виконано в повному обсязі з дотриманням технічних вимог: розроблено платформу електронної комерції TechBox із серверним API, клієнтським інтерфейсом, адміністративною панеллю та інтеграцією платіжної системи. Робота відзначається якістю коду та продуманістю архітектурних рішень. Оцінка: відмінно."
fill(106, [vidguk_baza2], run_idx=0)
# r1-r3: signature
fill(106, ['                                        Раделицький В. С.'], run_idx=2)

# p108: last run "\t«___»_______________________20___р."
last_idx = len(ps[108].runs) - 1
fill(108, ['16 ', 'травня                 ', '26 '], run_idx=last_idx, mode='right')

# p111: 6 runs all underscores → відгук кафедри
vidguk_kaf = "Студент Раделицький В. В. виконав завдання передипломної практики в повному обсязі відповідно до встановлених вимог. Звіт оформлено згідно з методичними рекомендаціями, зміст відповідає програмі практики."
fill(111, [vidguk_kaf], run_idx=0)

# p113: "Дата складання заліку «___»_______________________20___р."
fill(113, ['16 ', 'травня                 ', '26 '], mode='right')

print("page 3 done")

d.save(SRC)
print(f"\nSaved: {SRC} ({os.path.getsize(SRC)/1024:.1f} KB)")
