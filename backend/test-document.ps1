# PowerShell skripta za testiranje OCR-a

param(
    [string]$FolderPath = "D:\Users\User\Dropbox\POSO\Sluzba bezbednosti 2012\2018\Sistematizacija\sistematizacija mart 2025"
)

# Pronadji sve PDF fajlove
$files = Get-ChildItem -Path $FolderPath -Filter "*.pdf" -File | Sort-Object Name

if ($files.Count -eq 0) {
    Write-Host "Nije pronadjen nijedan PDF fajl" -ForegroundColor Red
    exit 1
}

Write-Host "Pronadjeno $($files.Count) PDF fajlova:" -ForegroundColor Cyan
for ($i = 0; $i -lt $files.Count; $i++) {
    Write-Host "  [$i] $($files[$i].Name) - $([math]::Round($files[$i].Length / 1KB, 2)) KB"
}

# Uzmi prvi fajl (OPIS POSLOVA based na sort order)
$pdfFile = $files[2]  # Treci fajl po sortiranju

Write-Host "`nOdabran fajl: $($pdfFile.Name)" -ForegroundColor Green
Write-Host "Puna putanja: $($pdfFile.FullName)" -ForegroundColor Cyan
Write-Host "Velicina: $([math]::Round($pdfFile.Length / 1KB, 2)) KB`n" -ForegroundColor Yellow

# Pokreni test
Write-Host "Pokretanje OCR testa...`n" -ForegroundColor Yellow

# Pozovi Node.js direktno - koristi Claude Vision (bez Azure OCR-a)
Write-Host "Koristim Claude Vision API (bez Azure OCR-a)...`n" -ForegroundColor Magenta
& npx tsx src/test-claude-vision.ts $pdfFile.FullName
