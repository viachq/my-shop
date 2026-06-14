import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32

f = r"C:\Users\viach\Desktop\word_data\data\практика\Титулка_та_завдання_v3.docx"
word = win32.Dispatch("Word.Application")
word.Visible = False
try:
    doc = word.Documents.Open(f, False, True)
    pages = doc.ComputeStatistics(2)
    print(f"{os.path.basename(f)} => {pages} pages")
    doc.Close(False)
finally:
    word.Quit()
