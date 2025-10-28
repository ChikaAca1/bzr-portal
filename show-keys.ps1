# PowerShell Script to Display SSH Keys in Correct Format
# Usage: .\show-keys.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SSH KEYS FOR GITHUB DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# PUBLIC KEY (add to chikaAcaFaca/bzr-portal1)
Write-Host "PUBLIC KEY" -ForegroundColor Green
Write-Host "----------" -ForegroundColor Green
Write-Host "Add this to: https://github.com/chikaAcaFaca/bzr-portal1/settings/keys" -ForegroundColor Yellow
Write-Host "Title: sync-from-chikaaca1-v2" -ForegroundColor Yellow
Write-Host "✅ IMPORTANT: Check 'Allow write access'`n" -ForegroundColor Red

$publicKey = Get-Content "deploy-key-v2.pub" -Raw
Write-Host $publicKey -ForegroundColor White

Write-Host "`n========================================`n" -ForegroundColor Cyan

# PRIVATE KEY (add as DEPLOY_KEY secret)
Write-Host "PRIVATE KEY (SECRET)" -ForegroundColor Green
Write-Host "--------------------" -ForegroundColor Green
Write-Host "Add this to: https://github.com/ChikaAca1/bzr-portal/settings/secrets/actions" -ForegroundColor Yellow
Write-Host "Name: DEPLOY_KEY (update existing secret)" -ForegroundColor Yellow
Write-Host "IMPORTANT: Copy EVERYTHING from BEGIN to END (no extra spaces!)`n" -ForegroundColor Red

$privateKey = Get-Content "deploy-key-v2" -Raw
Write-Host $privateKey -ForegroundColor White

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Fingerprint
Write-Host "KEY FINGERPRINT: SHA256:oZFKHNMgVygOPF4DxBnMUOPmC4e/n3yF/KCcvsqOgzM" -ForegroundColor Magenta

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Copy PUBLIC key and add to target repo (with write access)" -ForegroundColor Gray
Write-Host "2. Copy PRIVATE key and update DEPLOY_KEY secret" -ForegroundColor Gray
Write-Host "3. Run: git push origin main`n" -ForegroundColor Gray
