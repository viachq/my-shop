import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32

src = r"C:\Users\viach\Desktop\word_data\data\практика\Титулка_та_завдання_v3.docx"
pdf = r"C:\Users\viach\Desktop\my-shop\reports\v3_preview.pdf"
os.makedirs(os.path.dirname(pdf), exist_ok=True)

word = win32.Dispatch("Word.Application")
word.Visible = False
try:
    doc = word.Documents.Open(src, False, True)
    doc.SaveAs(pdf, FileFormat=17)  # wdFormatPDF
    print(f"PDF: {pdf}")
    doc.Close(False)
finally:
    word.Quit()
