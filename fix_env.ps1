# Konfigurasi
$ServerIP = "103.214.112.67"
$User = "root"
$RemotePath = "/root/myapp/herdiantrys"

Write-Host "Memperbaiki .env di server..." -ForegroundColor Cyan

# 1. Baca .env local
$EnvContent = Get-Content .env -Raw

# 2. Convert CRLF ke LF (Windows ke Linux)
$EnvContentUnix = $EnvContent -replace "`r`n", "`n"

# 3. Simpan ke file sementara
$TempFile = "env_linux.tmp"
[System.IO.File]::WriteAllText($TempFile, $EnvContentUnix)

# 4. Upload file yang sudah bersih
Write-Host "Uploading clean .env..."
scp -P 22 $TempFile "$User@$ServerIP`:$RemotePath/.env"

# 5. Hapus file sementara
Remove-Item $TempFile

# 6. Restart PM2
Write-Host "Restarting Server..."
$Cmd = "cd $RemotePath; pm2 restart herdiantrys --update-env"
ssh -p 22 "$User@$ServerIP" $Cmd

Write-Host "Selesai! Coba refresh website sekarang." -ForegroundColor Green
