import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import win32com.client as win32
src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_Kramar.docx"
pdf = r"C:\Users\viach\Desktop\my-shop\reports\kramar_preview.pdf"
word = win32.Dispatch("Word.Application")
try:
    word.Visible = False
except Exception:
    pass
try:
    doc = word.Documents.Open(src, False, True)
    doc.SaveAs(pdf, FileFormat=17)
    doc.Close(False)
    print("PDF:", pdf)
finally:
    word.Quit()
