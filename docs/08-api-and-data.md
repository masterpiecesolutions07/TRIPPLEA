# API and data

Prefix: `/api/v1`.

## Collections

User, Application, Cohort, Settings, Waitlist, StudentProgress, Session, Certificate, Trade, Alert, Notification, Post, Testimonial, ContactMessage, AuditLog.

Indexes belong on email, slug, status, category, createdAt, and the pair cohort + status.

User public fields are id, name, email, role, phone, country, avatar, verification, `mustChangePassword`, and createdAt. Password hashes, reset tokens, and refresh hashes are never returned.

## Routes in this build

| Method | Path | Who |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh` | public, logout and refresh use the cookie |
| GET | `/auth/me` | signed in |
| POST | `/auth/change-password` | signed in |
| POST | `/messages` | public |
| GET | `/staff/overview` and list routes under `/staff` | mentor, admin |
| PATCH | `/staff/applications/:id/status` | mentor, admin |
| POST | `/staff/cohorts` | mentor, admin |
| GET | `/student/home`, `/student/sessions`, `/student/notifications` | signed in |
| POST | `/student/stories` | signed in, consent required |
| GET, PATCH | `/admin/users`, `/admin/users/:id/role` | admin |
| POST | `/admin/mentors` | admin |
| GET | `/admin/audit-logs`, `/admin/analytics` | admin |
| GET, PATCH | `/admin/settings` | admin |

## Routes still to add

Forgot and reset password, email verification, public settings and galleries, waitlist, certificate and trade uploads, notification read state, CSV export of applications, and cohort scheduler jobs. See [10-security-legal-milestones.md](10-security-legal-milestones.md) for the order.

## Environment

`backend/.env.example` lists `PORT`, `NODE_ENV`, `MONGO_URI`, JWT secrets and lifetimes, `FRONTEND_URL`, admin seed values, optional mentor seed values, and `SEED_SAMPLE`. Cloudinary and email variables are added when those services are connected. Never commit `.env`.
