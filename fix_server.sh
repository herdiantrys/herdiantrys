#!/bin/bash

# 1. Buat Swap 2GB (PENTING untuk VPS RAM Kecil)
echo "📦 Membuat Swap Memory 2GB..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# 2. Optimalisasi System Limits
echo "🚀 Mengatur System Limits..."
sysctl vm.swappiness=10
echo "vm.swappiness=10" >> /etc/sysctl.conf

# 3. Re-install Dependencies dengan Bersih
echo "🧹 Membersihkan & Re-install Project..."
cd /root/myapp/herdiantrys
pm2 stop all
rm -rf node_modules
npm install --production --no-audit

# 4. Update Config PM2 untuk Hemat RAM
# Kita paksa max_memory_restart dan instances=1
echo "⚙️ Mengupdate Config PM2..."
cat > ecosystem.config.js <<EOF
module.exports = {
    apps: [
        {
            name: "herdiantrys",
            script: "server.js",
            instances: 1, 
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            max_memory_restart: "400M" 
        },
    ],
};
EOF

# 5. Start Ulang
echo "✅ Menyalakan Website..."
pm2 restart all
pm2 save

echo "🎉 Selesai! Script ini telah mengaktifkan Swap Memory agar CPU tidak 100% lagi."
