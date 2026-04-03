@echo off
echo ============================
echo   DEPLOY START
echo ============================

echo Resetting local changes...
git reset --hard

echo Pulling latest code...
git pull origin main

if %errorlevel% neq 0 (
  echo Git pull failed!
  pause
  exit /b
)

echo Installing dependencies...
npm install

echo Building project...
npm run build

if %errorlevel% neq 0 (
  echo Build failed! Deployment aborted.
  pause
  exit /b
)

echo Reloading app...
pm2 reload nextjs-app

echo ============================
echo   DEPLOY SUCCESS 🚀
echo ============================

pause