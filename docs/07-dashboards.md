# Dashboards

Dashboards use a sidebar, the same violet, cyan, gold, and navy palette as the public site, and Heroicons. Empty screens say what is missing. They do not show sample students or sample profits.

## Student (`/student`)

- Home: name, cohort, and progress across the three months.
- Progress: modules marked locked, available, or completed, plus mentor notes.
- Sessions: online or in person, Zoom or Meet link, countdown.
- Notifications: list and mark read.
- Profile: name, email, phone, country, password change.
- Story: draft submission with a required consent checkbox.

## Mentor (`/mentor`)

- Overview: counts for applications, cohorts, messages, certificates, and trades.
- Applications: filter and set status.
- Cohorts: create, with end date calculated, and an option to publish an alert.
- Students: enrolled people and progress notes.
- Certificates, trades, alerts, stories, testimonials: lists of real records.
- Messages: contact inbox.
- Profile.

The mentor sidebar does not link to users, roles, settings, audit, or analytics.

## Admin (`/admin`)

The admin sees the mentor tools plus:

- Overview and analytics: counts from the database.
- Users: list and role change. A role change is written to the audit log.
- Mentors: create a mentor account. The new mentor must change the password on first login.
- Settings: the site singleton.
- Audit log: newest actions first.

Hard delete of student data is admin-only and is not offered as a casual button on the mentor screens.
