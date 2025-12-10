# VPS Troubleshooting Checklist for 504 Gateway Time-out

## 1. Check Environment Variables
The most common cause for 504 errors in Next.js apps connected to external services (like Sanity) is missing or incorrect environment variables on the production server.

Ensure the following variables are set in your VPS `.env` file or deployment configuration:

```bash
# Sanity Config
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
NEXT_PUBLIC_SANITY_API_VERSION=...
SANITY_API_TOKEN=... (Required for writeClient)

# NextAuth Config (If using NextAuth)
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Clerk Config (If using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

**Action**: Verify these exist on the server. If `SANITY_API_TOKEN` is missing, fetch requests might fail or hang if they expect authentication.

## 2. Port and Firewall
Ensure your Next.js app is actually running on the port Nginx is forwarding to (usually 3000).

Run this on your VPS:
```bash
netstat -tulpn | grep 3000
```
If nothing is listening, your app crashed. Check logs.

## 3. Logs
Check the real-time logs of your Next.js application to see if it's "hanging" or crashing.

```bash
# If using pm2
pm2 logs

# If running directly
journalctl -u your-service-name -f
```

## 4. Clerk vs NextAuth Conflict
Your project contains BOTH `ClerkProvider` (Clerk) and `NextAuth` (Auth.js). 
- `app/layout.tsx` wraps the app in `<ClerkProvider>`.
- `app/(root)/page.tsx` uses `auth()` from NextAuth.

**Recommendation**:
- I have already removed `ClerkProvider` from the codebase.
- **CRITICAL**: Ensure you are running in **PRODUCTION MODE**.
  - Running `npm run dev` on a VPS causes **100% CPU** and **504 Timeouts** because it recompiles the app on every visit.
  - You MUST use `npm start`.

**Action**: Use the new `ecosystem.config.js` I created:
  ```bash
  git pull origin main
  npm install
  npm run build
  
  # Delete old process
  pm2 delete all
  
  # Start with correct config
  pm2 start ecosystem.config.js
  ```

