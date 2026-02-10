# Fix 504 Timeout by Removing Clerk Conflict

## Goal
Resolve the 504 Gateway Time-out on the VPS by removing the conflicting and potentially misconfigured Clerk authentication, leaving the working NextAuth + Sanity integration.

## User Review Required
> [!WARNING]
> This plan involves **removing Clerk** (`@clerk/nextjs`) from your application.
> You appear to be using **NextAuth** (Auth.js) for your actual authentication in `page.tsx` and `auth.ts`.
> Having both active, especially with `ClerkProvider` in `layout.tsx`, can cause server-side hangs if Clerk keys are missing on the VPS.

**Confirm**:
- You are strictly using NextAuth (Google/Credentials with Sanity).
- You do NOT needing Clerk features.

## Proposed Changes

### Configuration
#### [DELETE] [proxy.ts](file:///c:/website/next16/proxy.ts)
- This file contains Clerk middleware but is currently ignored by Next.js (wrong filename).
- We will delete it to clean up the codebase.

### App Structure
#### [MODIFY] [app/layout.tsx](file:///c:/website/next16/app/layout.tsx)
- Remove `ClerkProvider` wrapper.
- Remove `import { ClerkProvider } ...`.
- This ensures the app doesn't try to initialize Clerk on the server, preventing potential timeouts.

### Dependencies
- (Optional) Uninstall `@clerk/nextjs` later.

#### [NEW] [shop.actions.ts](file:///c:/website/next16/lib/actions/shop.actions.ts)
#### [NEW] [ShopClient.tsx](file:///c:/website/next16/components/Shop/ShopClient.tsx)

### Shop & Inventory
- **Interactive Purchasing**: Real-time coin deduction and item acquisition.
- **Live Feedback**: Elegant toast notifications and modal confirmations.
- **Instant Equip**: Apply effects immediately upon purchase/equip.

## Verification Plan
### Automated Tests
- Run `npm run build` to ensure no Clerk references remain.
- Run `npm run dev` and check `localhost:3000` to verify login still works with NextAuth.

### Manual Verification
- User will need to deploy to VPS and check if 504 is resolved.
- Check `netstat` and `pm2 logs` on VPS if issue persists.
