$word = New-Object -ComObject Word.Application
$word.Visible = $false
$files = @(
  "C:\Users\viach\Desktop\word_data\data\практика\ДР Практика_Титулка (1) (2).docx",
  "C:\Users\viach\Desktop\word_data\data\практика\ШАБЛОН_Звіту_з_практики_+_зразок_змісту.docx",
  "C:\Users\viach\Desktop\word_data\data\практика\Титулка_та_завдання_v2.docx"
)
foreach ($f in $files) {
  $doc = $word.Documents.Open($f, $false, $true)
  $pages = $doc.ComputeStatistics(2)  # wdStatisticPages = 2
  Write-Output "$([System.IO.Path]::GetFileName($f)) => $pages pages"
  $doc.Close($false)
}
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
