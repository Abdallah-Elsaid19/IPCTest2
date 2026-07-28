# IPC User Panel technical audit

## Existing platform

1. React 19, TypeScript, Vite, React Router, Tailwind, React Hook Form and Zod.
2. Django 5, Django REST Framework, PostgreSQL, Simple JWT and Pillow.
3. Authentication uses rotating JWT access/refresh tokens in HttpOnly cookies. Cookie-authenticated writes enforce CSRF. `AuthContext` restores `/api/auth/me`; `apiJson` performs one shared refresh flow.
4. The existing auth implementation is consumed unchanged: `AuthContext.tsx`, `ProtectedRoute.tsx`, `authApi.ts`, `Login.tsx`, `api.ts`, `accounts/authentication.py` and `accounts/views.py`.
5. Django's user model plus `AdminProfile` provide identity and the current staff/admin role model.
6. Existing authoritative domains include membership grades/applications/evidence, award categories/programmes, events/registrations, managed scholarships/clubs content, admin notifications and the Django/admin React dashboards.
7. Reusable UI includes the protected route, auth context, API client, notification helpers, design tokens and responsive admin-shell patterns.

## Missing functionality

Member-owned extended profiles, draft ownership for membership applications,
scholarship applications, award nominations, club membership/community records,
private documents, member notifications, programme enquiries, support tickets and
preferences do not exist.

## Implementation

- Add one `user_panel` Django app for missing member-owned records and reference
  existing membership, award, event and user tables.
- Extend the existing membership application with nullable authenticated owner,
  draft/action-required/withdrawn statuses and saved step.
- Expose authenticated `/api/user/*` endpoints with owner-scoped querysets and
  active-club membership checks.
- Add a lazy-loaded `/user/*` route tree inside the existing router and wrap its
  layout with the existing `ProtectedRoute`.
- Do not modify or duplicate authentication state, login/logout, refresh, cookie,
  CSRF, current-user or API-client implementation.

