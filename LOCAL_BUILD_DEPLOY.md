# Deploying via Local Build (For Low-Spec VPS)

This guide explains how to build your Next.js app on your powerful local machine and upload only the necessary files to your VPS. This prevents the VPS from crashing during `npm run build`.

## 1. Configure for Standalone (Recommended)
This creates a smaller, self-contained build.
Open `next.config.ts` and add `output: "standalone"`:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  // ... other config
};
```

## 2. Build Locally
Run this in your **local** terminal (VS Code):
```powershell
npm run build
```
This enables the production build and creates a `.next` folder.

## 3. Prepare Files for Upload
You used `output: "standalone"`, so the build created a special folder `.next/standalone` that contains almost everything you need.

You need to upload **3 things** to your VPS folder (`/var/www/herdiantry.id`).

1.  **The Standalone Content**:
    - Go to `.next/standalone`
    - Copy **CONTENTS** of this folder to VPS (`/var/www/herdiantry.id/`).
    - *Note: This now includes `node_modules` with Linux binaries!*

2.  **The Static Assets** (Required for styles/images):
    - Go to `.next/static`
    - Copy this **FOLDER** to VPS (`/var/www/herdiantry.id/.next/static`).
    - *Result on VPS should be: `/var/www/herdiantry.id/.next/static/...`*

3.  **The Public Folder**:
    - Copy your project's `public` folder to VPS (`/var/www/herdiantry.id/public`).

---

## 4. Upload to VPS (Example with SCP)
Run in PowerShell from your project root:

```powershell
# 1. Zip the standalone files (Everything inside .next/standalone)
cd .next/standalone
Compress-Archive -Path * -DestinationPath ../../deploy_standalone.zip -Force
cd ../..

# 2. Zip the static files
cd .next
Compress-Archive -Path static -DestinationPath ../deploy_static.zip -Force
cd ..

# 3. Zip the public folder
Compress-Archive -Path public -DestinationPath deploy_public.zip -Force

# 4. Zip the .env, ecosystem config, and package-lock.json
Compress-Archive -Path .env, ecosystem.config.js, package-lock.json -DestinationPath deploy_config.zip -Force

# 5. Upload all 4 zips
scp deploy_standalone.zip deploy_static.zip deploy_public.zip deploy_config.zip root@103.214.112.67:/root/myapp/herdiantrys/
```

## 5. Install & Run on VPS
Connect to your VPS terminal (SSH) and run:

```bash
cd /root/myapp/herdiantrys

# 3. Start App (NO Install Needed!)
# Since we pre-bundled everything (including node_modules for Linux), just start it.

# Delete potential conflicting folders (except .next)
rm -rf node_modules public

# Extract everything
unzip -o deploy_standalone.zip
unzip -o deploy_static.zip -d .next/
unzip -o deploy_public.zip
unzip -o deploy_config.zip

# Start with PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```
