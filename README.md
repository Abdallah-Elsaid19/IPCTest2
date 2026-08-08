# IPC Website

This repository is split into clear project parts:

- `frontend/` - existing Vite + React + TypeScript IPC website.
- `backend/` - Django + Django REST Framework API using PostgreSQL.
- `docs/` - planning, image optimisation notes, and project references.
- `.gitignore` - generated files, secrets, uploads, logs, and dependencies.
- `README.md` - setup, migrations, environment, and deployment notes.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8030`.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
docker compose up -d postgres
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8030
```

Django Admin: `http://localhost:8030/admin/`

## Environment

Backend settings are loaded from `backend/.env` with `django-environ`.

Required production values:

- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS`
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- email backend settings

## API

Public endpoints:

- `POST /api/applications`
- `POST /api/contact`
- `POST /api/events/register`
- `POST /api/awards/interest`
- `POST /api/newsletter`
- `GET /api/membership-grades`
- `GET /api/media`

Authentication endpoints:

- `GET /api/csrf` initialises CSRF protection.
- `POST /api/auth/login` accepts email/password and sets HttpOnly access and refresh cookies.
- `POST /api/auth/refresh` rotates the refresh token and cookies.
- `POST /api/auth/logout` blacklists the refresh token and clears both cookies.
- `GET /api/auth/me` returns the authenticated user's safe profile.
- `GET /api/admin/dashboard` returns the staff-only operational dashboard from existing IPC tables.

JWTs are not returned to or stored by JavaScript. Run `python manage.py migrate` after installing requirements to create Simple JWT's outstanding/blacklisted token tables. In production, keep `AUTH_COOKIE_SECURE=True` and serve the frontend/API over HTTPS.

Admin review:

- Use Django Admin for applications, evidence uploads, reviewer notes, and statuses.
- Staff-only DRF endpoint: `/api/admin/applications`.

Application statuses:

- `submitted`
- `under_review`
- `more_info_required`
- `approved`
- `rejected`

## Image Optimisation

The current frontend uses remote `readdy.ai` image URLs, not local raster files. The implemented `ResponsiveImage` component adds intrinsic dimensions, `srcset`, `sizes`, lazy loading by default, and high priority for critical hero imagery. The backend includes `media_library` with Pillow-backed dimensions and fields for WebP/AVIF alternatives when local managed assets are introduced.

## Verification

```bash
cd frontend
npm run type-check
npm run build

cd ../backend
python -m compileall .
```

Run Django checks after installing dependencies:

```bash
python manage.py check
```

## Deployment

- Serve `frontend/out` from a static host/CDN after `npm run build`.
- Run Django with Gunicorn/ASGI behind HTTPS.
- Use managed PostgreSQL in production.
- Store `backend/media/` on persistent storage or object storage.
- Set secure cookies and trusted origins for the production domain.
