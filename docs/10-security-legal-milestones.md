# Security, legal notes, and build order

## Security

- Validate input. Reject unknown fields that start with `$` or contain a dot.
- Rate-limit login, register, and contact.
- Helmet, CORS locked to the frontend origin, httpOnly refresh cookie.
- Check the role on every staff and admin route.
- Do not return whether an email exists during a future forgot-password request.
- Do not put Cloudinary or SMTP secrets in the frontend.

## Legal

The footer, registration, applications, and any trade card show the risk disclaimer: forex and CFD trading can lead to losing the money deposited; this site is education; it is not financial advice and it does not promise profit.

Certificates, trades, and stories that name a student need the consent flag. Hide account numbers on published images.

Keep the Abdiwali Moalimuu credit on the public site.

Privacy and terms pages describe what the forms collect and that accounts live in the database.

## Build order

1. Setup, models, register and login. Done.
2. Password change and admin seeding. Done. Email reset still open.
3. Public pages in React. Done for the current pages. Trades, achievements, stories, and apply pages still open.
4. Cloudinary certificates.
5. Trades.
6. Open-cohort applications, waitlist, and the scheduler.
7. Alerts and email.
8. Student progress updates by the mentor.
9. Story editor and publishing.
10. Deeper admin analytics.
11. Tests and a security pass.
12. Deployment.

Each later step should follow the file in this folder that matches it, and should not add a package the step does not need.
