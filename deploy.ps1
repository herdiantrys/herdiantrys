# Konfigurasi Server
$ServerIP = "103.214.112.67"
$Port = "22" # Port default setelah reinstall
$User = "root"
$RemotePath = "/root/myapp/herdiantrys"
$PM2ProcessName = "herdiantrys" 

Write-Host "🚀 Memulai Deployment ke $ServerIP Port $Port..." -ForegroundColor Cyan

# 1. Build Lokal
Write-Host "📦 Menggunakan hasil build manual..." -ForegroundColor Yellow
# npm run build
# if ($LASTEXITCODE -ne 0) {
#     Write-Host "❌ Build gagal." -ForegroundColor Red
#     exit
# }

# 2. Persiapkan Struktur Standalone
Write-Host "📂 Menyiapkan file deployment..." -ForegroundColor Yellow
$DeployDir = ".next\standalone"

# Copy .next/static ke standalone/.next/static
if (!(Test-Path "$DeployDir\.next\static")) {
    New-Item -ItemType Directory -Force -Path "$DeployDir\.next\static" | Out-Null
}
Copy-Item -Recurse -Force ".next\static\*" "$DeployDir\.next\static"

# Copy public ke standalone/public
if (!(Test-Path "$DeployDir\public")) {
    New-Item -ItemType Directory -Force -Path "$DeployDir\public" | Out-Null
}
Copy-Item -Recurse -Force "public\*" "$DeployDir\public"

# Copy ecosystem.config.js agar PM2 bisa start
if (Test-Path "ecosystem.config.js") {
    Copy-Item "ecosystem.config.js" "$DeployDir\ecosystem.config.js"
}
else {
    Write-Host "⚠️ ecosystem.config.js tidak ditemukan!" -ForegroundColor Red
}

# Hapus .env dari standalone agar tidak menimpa file di server (karena beda format CRLF/LF)
if (Test-Path "$DeployDir\.env") { Remove-Item "$DeployDir\.env" }

# 3. Zip file
Write-Host "compression 🤐 Compressing files..." -ForegroundColor Yellow
$ZipFile = "deploy_package.zip"
if (Test-Path $ZipFile) { Remove-Item $ZipFile }
Compress-Archive -Path "$DeployDir\*" -DestinationPath $ZipFile

# 4. Upload
Write-Host "cloud_upload ☁️  Uploading to VPS..." -ForegroundColor Cyan
# Using explicit key path if it exists, otherwise rely on Agent
$KeyPath = "$HOME\.ssh\id_ed25519"

if (Test-Path $KeyPath) {
    Write-Host "Using SSH Key: $KeyPath" -ForegroundColor Gray
    scp -i $KeyPath -P $Port $ZipFile "$User@$ServerIP`:$RemotePath/$ZipFile"
}
else {
    Write-Host "Using Default SSH Agent/Config" -ForegroundColor Gray
    scp -P $Port $ZipFile "$User@$ServerIP`:$RemotePath/$ZipFile"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload gagal. Pastikan Port benar ($Port), SSH key terpasang, atau password benar." -ForegroundColor Red
    exit
}

# 5. Eksekusi Remote (Unzip & Restart)
Write-Host "💻 Menginstall di VPS..." -ForegroundColor Cyan
# Menggunakan satu baris perintah untuk menghindari masalah CRLF (Windows Enter)
# Added npm install --production to ensure linux binaries are correct
$RemoteCommands = "cd $RemotePath && rm -rf .next public package.json && unzip -o $ZipFile && rm $ZipFile && npm install --production && (pm2 restart $PM2ProcessName || pm2 start ecosystem.config.js) && echo '✅ Deployment Selesai!'"

if (Test-Path $KeyPath) {
    ssh -i $KeyPath -p $Port "$User@$ServerIP" $RemoteCommands
}
else {
    ssh -p $Port "$User@$ServerIP" $RemoteCommands
}

Write-Host "🎉 Selesai! Cek website Anda." -ForegroundColor Green
