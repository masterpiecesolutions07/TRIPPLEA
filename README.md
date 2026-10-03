# Tripple A

MongoDB, Express, React, and Node site for Abdullahi Abukar Ahmed (Tripple A).

## Development

In this folder, not inside `frontend` or `backend`:

```bash
npm run dev
```

That starts the API at http://127.0.0.1:5000 and the website at http://localhost:5173 together. The website forwards `/api` to the API.

Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` plus the two JWT secrets before the API can connect.

The reference guide is in [docs/README.md](docs/README.md).

## First admin

Put `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run `npm run seed`. If an admin already exists, the command leaves that password alone and does not force a password change.
