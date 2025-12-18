# Changelog

## [Unreleased]

- Fix: Ensure JWT secret fallback and consistent token payload (`userId`) in `AuthService.generateTokens` to avoid runtime errors when `JWT_SECRET` is missing. ✅
- Fix: Make login error handling return appropriate HTTP status codes (400/401/500) in `AuthController`. ✅
- Add: `scripts/test-auth.ts` simple verification script to validate token generation locally. ✅
- Fix: Attach `teamId` & `role` to `req.user` in `auth.middleware` by resolving primary team membership; allow `POST /projects` to fallback to `req.user.teamId` when body omits it. ✅
- Add: Implemented basic drift detection logic and persistence (`src/services/drift.service.ts`). Added tests: `scripts/test-drift.ts` and `npm run test:drift`. ✅
- Add: Added endpoint to list drift detections `GET /api/projects/:projectId/drift` (`src/controllers/drift.controller.ts`, `src/routes/drift.routes.ts`) and `scripts/test-list-drift.ts`. ✅
- Consolidate: Unified auth flow between backend and frontend — added refresh endpoint (`POST /api/auth/refresh`), HttpOnly refresh cookie on login/register/github OAuth, and client refresh/auto-refresh logic. ✅
- Add: Persist refresh tokens in DB (`RefreshToken` model) and implement rotation & revocation (store hashed token, revoke on logout/rotation). Added `scripts/test-refresh-revoke.ts` to verify rotation. ✅
- Add: Scalable scheduler for drift detection using Bull + Redis with in-memory fallback; admin endpoints to start/stop/run scheduler (`/api/admin/drift/*`). Added `scripts/test-scheduler.ts`. ✅
