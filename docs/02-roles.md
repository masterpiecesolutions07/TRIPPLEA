# Roles

| Role | Who |
| --- | --- |
| Visitor | Anyone who is not signed in |
| Student | A registered mentee. Public registration can only create this role |
| Mentor | Tripple A. Runs the mentorship and its content |
| Admin | Full control of accounts, roles, settings, and deletion |

The mentor gets what is needed to teach and publish. Creating users, changing roles, system settings, audit logs, analytics, and hard delete stay with the admin.

## Permission matrix

| Capability | Visitor | Student | Mentor | Admin |
| --- | --- | --- | --- | --- |
| View public pages | Yes | Yes | Yes | Yes |
| Apply while intake is open | Yes | — | — | — |
| Own dashboard and progress | No | Yes | Yes | Yes |
| Review applications | No | No | Yes | Yes |
| Approve, reject, or waitlist | No | No | Yes | Yes |
| Open or close a cohort | No | No | Yes | Yes |
| Certificates, trades, alerts, testimonials | No | No | Yes | Yes |
| Write a story | No | Draft only | Yes | Yes |
| Publish a story | No | No | Yes | Yes |
| Update a student's modules | No | No | Yes | Yes |
| Create, delete, or change a user's role | No | No | No | Yes |
| Create or remove a mentor account | No | No | No | Yes |
| Settings, audit logs, analytics, hard delete | No | No | No | Yes |

Both the API and the React routes enforce this. A mentor token that calls an admin route receives 403.
