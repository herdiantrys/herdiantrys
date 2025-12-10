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
    - *Note: This includes `node_modules`, `server.js`, and `package.json`.*

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

# 4. Upload all 3 zips
scp deploy_standalone.zip deploy_static.zip deploy_public.zip root@herdiantry.id:/var/www/herdiantry.id/
```

## 5. Install & Run on VPS
Connect to your VPS terminal (SSH) and run:

```bash
cd /var/www/herdiantry.id

# 1. Clean old files (Optional but recommended)
# BE CAREFUL: Make sure you are in the right folder!
rm -rf .next public node_modules

# 2. Unzip Files
unzip -o deploy_standalone.zip
unzip -o deploy_static.zip -d .next/ # Extracts static into .next/static
unzip -o deploy_public.zip
rm deploy_*.zip

# 3. Start App (No npm install needed!)
# The standalone build already has the necessary node_modules.
pm2 delete all
pm2 start server.js --name "next-app"
pm2 save
```
