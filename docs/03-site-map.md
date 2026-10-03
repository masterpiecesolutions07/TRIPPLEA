# Site map

There is one HTML file: `frontend/index.html`. Every screen is a React route.

## Public

| Page | Route |
| --- | --- |
| Landing | `/` |
| About | `/about` |
| Strategy | `/strategy` |
| Programme | `/programme` |
| Updates | `/updates` |
| Contact | `/contact` |
| Register and login | `/register`, `/login` |
| Terms and privacy | `/terms`, `/privacy` |
| Not found | any unknown path |

Later public routes from the requirements: `/trades`, `/achievements`, `/stories`, `/stories/:slug`, `/apply`, `/forgot-password`, `/reset-password/:token`.

The landing page keeps the current sections: hero, sample ticker, stats, Law and Order teaser, three-month roadmap, mentor preview, standards, updates, FAQ, cohort call to action, footer credit, six social slots, and the risk disclaimer.

When no cohort is open, the apply action becomes a waitlist. When a cohort is open, it shows the name, start, seats, mode, and a countdown.

## Signed-in areas

| Area | Route prefix | Who |
| --- | --- | --- |
| Student | `/student` | student, mentor, admin |
| Mentor | `/mentor` | mentor, admin |
| Admin | `/admin` | admin |
| Password change | `/change-password` | any signed-in user |

A seeded admin goes straight to the admin dashboard. `/change-password` stays available from the profile when they choose to change it.
