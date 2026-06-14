"""Fill template preserving structure — only replace underscore blanks with text."""
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from docx.shared import Pt

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
SRC = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_TechBox_v9 - Copy - Copy.docx"

d = Document(SRC)
ps = d.paragraphs


def fill_blanks(run_text, fill_text, pad_char='_'):
    """Replace the longest underscore sequence in run_text with fill_text,
    padded with pad_char to maintain the same total length."""
    # Find longest underscore sequence
    matches = list(re.finditer(r'_+', run_text))
    if not matches:
        return run_text
    longest = max(matches, key=lambda m: m.end() - m.start())
    blank_len = longest.end() - longest.start()
    # Pad fill text to same length
    if len(fill_text) < blank_len:
        padded = fill_text + pad_char * (blank_len - len(fill_text))
    else:
        padded = fill_text
    return run_text[:longest.start()] + padded + run_text[longest.end():]


def fill_all_blanks(run_text, fill_texts, pad_char='_'):
    """Replace each underscore sequence with corresponding fill_text in order."""
    matches = list(re.finditer(r'_+', run_text))
    if not matches or not fill_texts:
        return run_text
    result = run_text
    offset = 0
    for match, fill in zip(matches, fill_texts):
        start = match.start() + offset
        end = match.end() + offset
        blank_len = end - start
        if len(fill) < blank_len:
            padded = fill + pad_char * (blank_len - len(fill))
        else:
            padded = fill
        result = result[:start] + padded + result[end:]
        offset += len(padded) - (end - start)
    return result


def fill_para_single(p, fill_text, pad='_'):
    """For single-run paragraph, replace underscore blank with text."""
    if p.runs:
        p.runs[0].text = fill_blanks(p.runs[0].text, fill_text, pad)


# ================================================================
# PAGE 1 — TITLE PAGE
# ================================================================

# Para 12: "про проходження_______ практики "
ps[12].runs[0].text = fill_blanks(ps[12].runs[0].text, ' передипломної ')
print("p12: передипломної")

# Para 14: "освітнньо-професійний ступінь__________спеціальність___________________"
# Two blanks: ступінь + спеціальність
ps[14].runs[0].text = fill_all_blanks(
    ps[14].runs[0].text,
    [' фаховий молодший бакалавр ', ' 122 «Комп\'ютерні науки» ']
)
print("p14: ступінь + спеціальність")

# Para 15: "студента (ки)______________________________________групи______________"
ps[15].runs[0].text = fill_all_blanks(
    ps[15].runs[0].text,
    [' Раделицького В. В.________________', ' КНМС-41______']
)
print("p15: студент + група")

# Para 17: "на (в)________________________________________________________________"
ps[17].runs[0].text = fill_blanks(ps[17].runs[0].text, ' ФОП Раделицький Володимир Степанович___________')
print("p17: організація")

# Para 18: "____________________________________________________________________"
ps[18].runs[0].text = fill_blanks(ps[18].runs[0].text, '(Львівська обл., Миколаївський р-н, с. Вербіж, вул. Івана Франка, 6/4)')
print("p18: адреса")

# Para 23: dates
ps[23].runs[0].text = 'від „20" квітня  2026 р.               до „16" травня     2026 р.'
print("p23: дати")

# Para 32: "від організації _____________________"
ps[32].runs[0].text = fill_blanks(ps[32].runs[0].text, ' Раделицький В. С.')
print("p32: керівник від організації")

# Para 39: "Керівник практики від кафедри  __________________________________"
ps[39].runs[0].text = fill_blanks(ps[39].runs[0].text, ' Машевська М. В._____________')
print("p39: керівник від кафедри")

# ================================================================
# PAGE 2 — ЗАВДАННЯ ТА РЕЗУЛЬТАТИ
# ================================================================

# Para 53: multi-run, all underscores → student name
# r0: "Студент____________"  r1-r3: more underscores
ps[53].runs[0].text = fill_blanks(ps[53].runs[0].text, ' Раделицький В\'ячеслав Володимирович')
for r in ps[53].runs[1:]:
    r.text = re.sub(r'_+', lambda m: '_' * len(m.group()), r.text)  # keep as-is
print("p53: студент ПІБ")

# Para 55: multi-run - ступінь + спеціальність
# r0: "О" r1: "світнньо-професійний ступінь" r2: " " r3: "__________________спеціальність_" r4: "122..." r5: tab
ps[55].runs[3].text = fill_all_blanks(
    ps[55].runs[3].text,
    [' фах. мол. бакалавр ']
)
print("p55: ступінь p2")

# Para 56: "Скерований на практику______..."
ps[56].runs[0].text = fill_blanks(ps[56].runs[0].text, ' передипломну ')
print("p56: вид практики")

# Para 58: "в місто________________________________на______..."
ps[58].runs[1].text = fill_blanks(ps[58].runs[1].text, '______ Львів __________________')
# runs 3-6: after "на" — org name
combined = ''.join(r.text for r in ps[58].runs[3:])
ps[58].runs[3].text = ' ФОП Раделицький Володимир Степанович'
for r in ps[58].runs[4:]:
    r.text = ''
print("p58: місто + на")

# Para 60: full org name line
ps[60].runs[0].text = fill_blanks(ps[60].runs[0].text, ' ФОП Раделицький Володимир Степанович________________________')
print("p60: назва організації")

# Para 64: термін - multi-run
# r0: "Термін практики: від" r1: "__" r2: "______________________до " r3: "__" r4: "___..."
ps[64].runs[1].text = ' 20.04.2026 р.'
ps[64].runs[2].text = '_______________до '
ps[64].runs[3].text = ' 16.05.2026 р.'
ps[64].runs[4].text = '___________________'
print("p64: термін")

# Para 66: керівник від кафедри
ps[66].runs[0].text = fill_blanks(ps[66].runs[0].text, ' Машевська Марта Володимирівна________')
print("p66: керівник кафедри p2")

# Para 69: директор інституту - last run
ps[69].runs[-1].text = 'Директор інституту ___ІППТ____________'
print("p69: директор ІППТ")

# Para 71: Попадинець
ps[71].runs[0].text = '    Попадинець Н. М._________________________ «    »_________________2026 р'
print("p71: Попадинець")

# Para 81: прибув дата
ps[81].runs[2].text = '\t„20"     квітня           2026 року'
print("p81: прибув")

# Para 82: відповідальна особа
ps[82].runs[0].text = fill_blanks(ps[82].runs[0].text, '_______________________________________________Раделицький В. С.')
print("p82: відповідальна особа прибув")

# Para 90: вибув
ps[90].runs[2].text = '\t „16"     травня           2026 року'
print("p90: вибув")

# Para 91: відповідальна особа
ps[91].runs[0].text = fill_blanks(ps[91].runs[0].text, '_______________________________________________Раделицький В. С.')
print("p91: відповідальна особа вибув")

# ================================================================
# PAGE 3 — ЗМІСТ ЗАВДАННЯ (para 96)
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
# Replace underscore runs with zmist text, keep the "(заповнює...)" label
# r0: underscores r1: underscores r2: "(заповнює...)" r3: underscores
ps[96].runs[0].text = zmist
ps[96].runs[1].text = ''  # clear extra underscores
# r2 stays (label)
ps[96].runs[3].text = ''  # clear trailing underscores
print("p96: зміст завдання")

# Para 98: завдання видав
ps[98].runs[2].text = ' Машевська М. В.______________________________20 квітня 2026 року'
print("p98: завдання видав")

# Para 100: завдання отримав
ps[100].runs[2].text = ' Раделицький В. В.______________________________20 квітня 2026 року'
print("p100: завдання отримав")

# ================================================================
# ВІДГУК ВІД БАЗИ ПРАКТИКИ (paras 105-106)
# ================================================================
vidguk_baza = (
    "Студент Раделицький В. В. за час проходження передипломної практики "
    "продемонстрував ґрунтовні знання у сфері веб-розробки та здатність самостійно "
    "вирішувати прикладні інженерні завдання. Завдання практики виконано в повному "
    "обсязі з дотриманням технічних вимог: розроблено повнофункціональну платформу "
    "електронної комерції TechBox із серверним API, клієнтським інтерфейсом, "
    "адміністративною панеллю та інтеграцією платіжної системи. Робота відзначається "
    "якістю коду, продуманістю архітектурних рішень та вмінням працювати із сучасними "
    "технологіями. Практикант виявив дисциплінованість, ініціативність та високу "
    "працездатність.\n"
    "Оцінка: відмінно."
)
# r0: underscores r1: underscores r2: "(заповнює...)"
ps[105].runs[0].text = vidguk_baza
ps[105].runs[1].text = ''
# r2 stays
print("p105: відгук бази")

# Para 106: continuation + (посада, прізвище...)
# r0-r3: underscores, r4: label
ps[106].runs[0].text = ''
ps[106].runs[1].text = ''
ps[106].runs[2].text = '___________________________________Раделицький В. С.'
ps[106].runs[3].text = ''
# r4 stays (label)
print("p106: підпис бази")

# Para 108: дата відгуку
ps[108].runs[-1].text = '\t«16»       травня          2026р.'
print("p108: дата відгуку")

# ================================================================
# ВІДГУК ВІД КАФЕДРИ (para 111)
# ================================================================
vidguk_kaf = (
    "Студент Раделицький В. В. виконав завдання передипломної практики "
    "в повному обсязі відповідно до встановлених вимог. Звіт оформлено згідно "
    "з методичними рекомендаціями, зміст відповідає програмі практики."
)
# 6 runs all underscores — use first, clear rest
ps[111].runs[0].text = vidguk_kaf
for r in ps[111].runs[1:]:
    r.text = ''
print("p111: відгук кафедри")

# Para 113: дата заліку
ps[113].runs[0].text = 'Дата складання заліку «16»       травня          2026р.'
print("p113: дата заліку")

d.save(SRC)
print(f"\nSaved: {SRC} ({os.path.getsize(SRC)/1024:.1f} KB)")
