# Fixing 502 Bad Gateway on VPS

A **502 Bad Gateway** means Nginx is working, but it cannot connect to your Next.js app. This usually means your app **crashed** or is **not running on port 3000**.

> [!IMPORTANT]
> **Standalone Mode Update**:
> If you are using the "Local Build" method, you MUST run `server.js`, not `npm start`.
> I have verified and updated `ecosystem.config.js` for you.
> Please upload the new `ecosystem.config.js` to your VPS.

## 1. Check the Crash Logs
This is the most important step. Run this on your VPS:

```bash
pm2 logs next16 --lines 50
```

Look for errors like:
- `Error: P1001: Can't reach database server` -> Prisma/Database issue.
- `Error: Missing environment variable` -> Missing .env values.
- `Error: EADDRINUSE` -> Port 3000 is already taken (maybe by a zombie process).
- `Error: 'sharp' is required` -> Missing image optimization library.

## 2. Common Fixes

### Fix A: Missing Environment Variables
If you see missing variable errors, you need to add them to `ecosystem.config.js` or your `.env` file on the VPS.
Commonly missed: `DATABASE_URL`, `NEXTAUTH_SECRET`, `SANITY_API_TOKEN`.

### Fix B: Architecture Mismatch (Sharp)
If you uploaded `node_modules` from Windows to Linux, it will crash.
**Solution**:
1.  Delete `node_modules` on VPS: `rm -rf node_modules`
2.  Reinstall: `npm install --production`
3.  Restart: `pm2 restart all`

### Fix C: Port Conflict
Start fresh to ensure port 3000 is free.

```bash
# Stop everything
pm2 delete all

# Kill any lingering process on port 3000
fuser -k 3000/tcp

# Start again
pm2 start ecosystem.config.js
```

## 3. Verify App is Running
After restarting, run:
```bash
netstat -tulpn | grep 3000
```
You should see a process listening on port 3000. If not, the app crashed again (check logs).
