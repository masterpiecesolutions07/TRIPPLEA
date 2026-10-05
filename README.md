# Tripple A

MongoDB, Express, React, and Node site for Abdullahi Abukar Ahmed (Tripple A).

The product guide is in [docs/README.md](docs/README.md). This file is how to run the app on your machine.

## What you need

- Node.js and npm
- A MongoDB database that is already running

The API does not download or start MongoDB for you. Point `MONGO_URI` at a database you already have, local or hosted.

## 1. Install

From this folder (the repo root, the one that contains `frontend` and `backend`):

```powershell
npm install
```

That installs both workspaces. Do not install packages inside `frontend` or `backend` separately.

## 2. Environment

```powershell
Copy-Item backend\.env.example backend\.env
```

Open `backend/.env` and replace the placeholder values. The API refuses to start if `MONGO_URI`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` are missing.

| Variable | What to put |
| --- | --- |
| `PORT` | API port. Leave `5000` unless that port is taken. |
| `NODE_ENV` | `development` while you are working locally. |
| `MONGO_URI` | Your real database URL. The example `mongodb://127.0.0.1:27017/tripplea` is only valid if MongoDB is running on this machine. |
| `JWT_ACCESS_SECRET` | A long random string. Do not reuse the example text. |
| `JWT_REFRESH_SECRET` | A different long random string. |
| `ACCESS_EXPIRES` | Access token lifetime. `15m` is the default. |
| `REFRESH_EXPIRES` | Refresh token lifetime. `7d` is the default. |
| `FRONTEND_URL` | The site origin the API allows. Keep `http://localhost:5173` for local development. |
| `ADMIN_NAME` | The real admin's name. Used only by the seed command. |
| `ADMIN_EMAIL` | The real admin email. Used only by the seed command. |
| `ADMIN_PASSWORD` | The real admin password. At least 8 characters, with an uppercase letter, a lowercase letter, and a number. |
| `MENTOR_NAME` | Optional. Leave empty if you do not want a mentor account yet. |
| `MENTOR_EMAIL` | Optional. Set together with the other two mentor fields, or leave all three empty. |
| `MENTOR_PASSWORD` | Optional. Same password rules as the admin password. |
| `CLOUDINARY_CLOUD_NAME` | From the Cloudinary dashboard. Leave empty to keep photos on this computer. |
| `CLOUDINARY_API_KEY` | From the same Cloudinary dashboard. |
| `CLOUDINARY_API_SECRET` | From the same Cloudinary dashboard. Do not share it. |

Do not commit `backend/.env`. It holds secrets.

These values are the real configuration. The seed command creates the admin (and the mentor, if those three fields are filled) and, once, the course outline. It does not insert sample cohorts, certificates, trades, or testimonials.

## 3. Start the site and the API

Stay in the repo root:

```powershell
npm run dev
```

That runs both processes together:

- `[api]` is the Express server, at http://127.0.0.1:5000
- `[web]` is the React site, at http://localhost:5173

Open **http://localhost:5173**. The site sends `/api` to the API. Use `localhost` for the site. `http://127.0.0.1:5173` can fail to connect on Windows even while `localhost` works.

Check the API on its own at http://127.0.0.1:5000/api/v1/health. A healthy response is `{ "ok": true }`.

Stop both with Ctrl+C in that same terminal. If Windows asks `Terminate batch job (Y/N)?`, answer `Y` for both the API and the site.

Run `npm run dev` from the repo root every time. Running it inside `frontend` starts only the website. The pages will load, then API calls fail with `ECONNREFUSED 127.0.0.1:5000` because nothing is listening on port 5000.

## 4. Create the first admin

After MongoDB is reachable and `backend/.env` has the admin fields:

```powershell
npm run seed
```

Run this from the repo root as well.

- The admin can sign in at http://localhost:5173/login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The seed does not force a password change.
- If an admin already exists, the command skips that account and does not change the password.
- If `ADMIN_EMAIL` already belongs to a non-admin account, seeding stops.
- A mentor account is created only when `MENTOR_NAME`, `MENTOR_EMAIL`, and `MENTOR_PASSWORD` are all set. That account signs in with those values and is not asked to change the password.
- The course outline is created once, as drafts: 3 phases, 24 modules, and 57 lessons. Titles and short placeholder descriptions only. No videos, files, or published lessons. Run the command again and this outline is left as it is. Mentors and admins edit it at http://localhost:5173/mentor/course. Who can study is managed at http://localhost:5173/mentor/enrollments. Approving an application opens the course once that person has a student account. Access stays open unless a mentor pauses it or sets an end date.
- Cohorts, applications, certificates, and questions are added later from the dashboards. They are not part of the seed.
- When a lesson video is added later, keep it unlisted or limited to this site. A student can share a link, so a public video address is not private. YouTube unlisted, Vimeo privacy settings, or a signed Cloudinary video link are the suitable choices. The course pages do not publish those links.

The admin dashboard is http://localhost:5173/admin. Questions on the public site are edited at http://localhost:5173/admin/faqs.

## If it does not start

**`Missing environment variables`**  
`backend/.env` is missing, empty, or not the file the API loaded. The API reads `.env` from the `backend` folder. Fill `MONGO_URI` and both JWT secrets, then run `npm run dev` again from the repo root.

**`ECONNREFUSED 127.0.0.1:5000` in the `[web]` log**  
The site is up and the API is not. Read the `[api]` lines above that message. The usual causes are a missing env value, MongoDB refusing the connection, or the crash fixed by restarting from the repo root.

**MongoDB connection error in the `[api]` log**  
Nothing is accepting connections at `MONGO_URI`. Start that database, or change `MONGO_URI` to the hosted database you intend to use.

**`argument handler must be a function`**  
This was a startup bug in the staff routes. Pull the current `backend/src/controllers/staffController.js` and start again. If it still appears, the `[api]` stack trace names the file and line to fix.

**Port already in use**  
Another `npm run dev` is still running. Stop it with Ctrl+C, or change `PORT` in `backend/.env` and the Vite proxy in `frontend/vite.config.js` so they match.

## Production

There is no single production command at the repo root. Build and run the two folders separately.

Site, from the repo root:

```powershell
npm run build -w frontend
npm run preview -w frontend
```

`preview` serves the built site locally. A host should serve the `frontend/dist` folder.

API, from the repo root, with `NODE_ENV=production` and the real `MONGO_URI`, JWT secrets, and `FRONTEND_URL` in `backend/.env`:

```powershell
npm run start -w backend
```

The live site is [https://tripplea-1.onrender.com](https://tripplea-1.onrender.com). The live API is [https://tripplea-ki19.onrender.com](https://tripplea-ki19.onrender.com). A production build of the site calls `https://tripplea-ki19.onrender.com/api/v1`. On the API, set `FRONTEND_URL` to `https://tripplea-1.onrender.com` (localhost can stay in the list for local work). Redeploy both services after changing those values. The site rewrite in `frontend/public/_redirects` keeps paths such as `/login` on the live site.
