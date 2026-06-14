import sys, zipfile, shutil, re, os
sys.stdout.reconfigure(encoding='utf-8')

src = r"C:\Users\viach\Desktop\word_data\data\практика\Звіт_з_практики_Kramar.docx"
tmp = src + ".tmp"

ORPHAN_MEDIA = {"word/media/image1.png", "word/media/image2.png",
                "word/media/image3.png", "word/media/image4.png"}
ORPHAN_RIDS = {"rId9", "rId10", "rId11", "rId12"}

zin = zipfile.ZipFile(src, "r")
zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)

for item in zin.infolist():
    name = item.filename
    if name in ORPHAN_MEDIA:
        continue
    data = zin.read(name)
    if name == "word/_rels/document.xml.rels":
        text = data.decode("utf-8")
        for rid in ORPHAN_RIDS:
            text = re.sub(r'<Relationship Id="%s"[^>]*/>' % rid, "", text)
        data = text.encode("utf-8")
    zout.writestr(item, data)

zin.close()
zout.close()
shutil.move(tmp, src)
print(f"Cleaned. Size: {os.path.getsize(src)/1024:.1f} KB")

# re-verify
import zipfile as zf
z = zf.ZipFile(src)
media = [n for n in z.namelist() if n.startswith('word/media/')]
rels = z.read('word/_rels/document.xml.rels').decode('utf-8')
print("media:", media)
print("orphan rIds still present:", [r for r in ORPHAN_RIDS if r + '"' in rels])
