# Panduan Setup VPS Ubuntu 20.04 untuk Next.js (Clean Install)

Karena Anda baru saja install ulang VPS, kita perlu menginstall software dasar (Node.js, PM2, Nginx) sebelum menjalankan script deploy.

## Langkah 1: Login ke VPS
Buka terminal (Powershell/CMD) di komputer Anda dan SSH ke server:
```bash
ssh root@103.214.112.67
```
> **Catatan:** Jika muncul error "Remote host identification has changed", jalankan perintah ini di komputer lokal Anda untuk menghapus key lama:
> `ssh-keygen -R 103.214.112.67`

## Langkah 2: Install Node.js & Dependencies
Jalankan perintah berikut baris per baris di dalam **VPS**:

```bash
# 1. Update sistem
apt update && apt upgrade -y

# 2. Install Curl & Unzip
apt install curl unzip -y

# 3. Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Verifikasi instalasi
node -v 
# Output harus v20.x.x
npm -v

# 5. Install PM2 (Process Manager) secara global
npm install -g pm2

# 6. Install Nginx (Web Server)
apt install nginx -y
```

## Langkah 3: Siapkan Direktori Project
Kita perlu membuat folder tujuan deployment yang sesuai dengan script `deploy.ps1` Anda (`/root/myapp/herdiantrys`).

```bash
# Buat direktori
mkdir -p /root/myapp/herdiantrys

# Masuk ke direktori
cd /root/myapp/herdiantrys
```

## Langkah 4: Setup Environment Variables (.env)
Script deploy Anda **tidak** mengupload file `.env` (demi keamanan). Anda harus membuatnya manual di server.

1. Di VPS, buat file `.env`:
   ```bash
   nano .env
   ```
2. Salin isi dari file `.env` di komputer lokal Anda, lalu paste ke terminal VPS (Klik kanan biasanya untuk paste).
3. Simpan: Tekan `Ctrl+X`, lalu `Y`, lalu `Enter`.

## Langkah 5: Setup Firewall (Opsional tapi Direkomendasikan)
Aktifkan firewall dan izinkan port penting.

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```
(Tekan `y` jika diminta konfirmasi).

---

## Langkah 6: Jalankan Deployment dari Komputer Lokal
Sekarang server sudah siap menerima file.
1. Kembali ke terminal VS Code di komputer Anda (bukan VPS).
2. Jalankan script deploy:
   ```powershell
   ./deploy.ps1
   ```
3. Script akan membuild project, mengupload, dan merestart PM2.

---

## Langkah 7: Konfigurasi Nginx (Reverse Proxy)
Agar website bisa diakses tanpa port `:3000`, kita setup Nginx.

1. Di VPS, buat config baru:
   ```bash
   nano /etc/nginx/sites-available/nextjs
   ```

2. Paste konfigurasi berikut (Ganti `herdiantry.id` dengan domain Anda jika ada, atau biarkan `_` jika pakai IP):

   ```nginx
   server {
       listen 80;
       server_name herdiantry.id www.herdiantry.id 103.214.112.67;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Simpan (`Ctrl+X`, `Y`, `Enter`).

4. Aktifkan config:
   ```bash
   ln -s /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
   rm /etc/nginx/sites-enabled/default  # Hapus config default
   nginx -t                              # Cek error
   systemctl restart nginx
   ```

## Selesai!
Sekarang buka browser dan akses IP/Domain Anda.
