import sys
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32

files = [
    r"C:\Users\viach\Desktop\word_data\data\практика\ДР Практика_Титулка (1) (2).docx",
    r"C:\Users\viach\Desktop\word_data\data\практика\ШАБЛОН_Звіту_з_практики_+_зразок_змісту.docx",
    r"C:\Users\viach\Desktop\word_data\data\практика\Титулка_та_завдання_v2.docx",
]

word = win32.Dispatch("Word.Application")
word.Visible = False
try:
    for f in files:
        doc = word.Documents.Open(f, False, True)
        pages = doc.ComputeStatistics(2)  # wdStatisticPages
        import os
        print(f"{os.path.basename(f)} => {pages} pages")
        doc.Close(False)
finally:
    word.Quit()
