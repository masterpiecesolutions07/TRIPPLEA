# Authentication and seeding

## Accounts

- Register, login, and logout.
- Access token is short-lived and stays in memory.
- Refresh token is an httpOnly cookie named `tripplea_refresh`, stored on the user only as a hash, and rotated on refresh.
- Passwords are bcrypt hashes. Rules: 8 characters, one uppercase letter, one lowercase letter, one number.
- Login failures lock the account after repeated attempts.
- Login errors stay generic: "Email or password does not match an account."
- Public registration ignores any role field and always creates a student, plus an application record.
- Logout clears that refresh hash and the cookie.

## Password change

`POST /api/v1/auth/change-password` checks the current password, saves a new hash, clears `mustChangePassword`, and revokes older refresh tokens.

Forgot-password and reset-password are specified as an email flow: random token, stored hashed, expires in 15 to 30 minutes, generic response whether or not the email exists, single use. That email path is not connected yet. Do not pretend a reset email was sent.

## Seeding

From the repo root, after `backend/.env` exists:

```bash
npm run seed
```

Required for the admin, and only read by the seed script:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Rules:

- If an admin already exists, the script skips and does not overwrite.
- If `ADMIN_EMAIL` already belongs to a non-admin, the script stops.
- The seeded admin signs in with `ADMIN_PASSWORD`. The seed does not force a password change.
- No real password is committed. Placeholders live in `backend/.env.example` only.

Optional:

- `MENTOR_NAME`, `MENTOR_EMAIL`, `MENTOR_PASSWORD` create Tripple A's mentor account when all three are set and that email is free. The same password-change flag is set.
- `SEED_SAMPLE=true` inserts site settings if missing, and one draft cohort named as sample data. It does not invent certificates, trades, testimonials, or seat counts.

The admin later creates or removes mentor accounts from `/admin/mentors`.
