# Tripple A Mentorship

The mentorship site for Abdullahi Abukar Ahmed (Tripple A). He teaches a 3-month forex path from beginner to advanced. The Law and Order strategy is credited to Grand Mentor Abdiwali Moalimuu. The mark on the logo is Growth & Confidence.

The site is HTML, CSS, and vanilla JavaScript. Accounts, theme, and which updates you have opened stay in the browser. There is no server, payment, or live market feed.

## Run it

JSON pages need a local server. From this folder:

```bash
node scripts/serve.mjs
```

Open http://127.0.0.1:8765. Opening the files directly with `file://` will not load the updates or the curriculum.

## Pages

Home, About, Strategy, Programme, Updates, Contact, Register, Login, Dashboard, and a 404 page. Terms and privacy notices are linked from registration.

## Images

- Mentor portrait: `assets/images/abdullahi.jpg`
- Full logo file: `assets/images/logo.jpg`
- Circular mark used in the header and loading screen: `assets/images/logo-mark.png`
- Favicon: `assets/icons/favicon.png`
- Apple touch icon: `assets/icons/apple-touch.png`

To replace the logo, drop the new file over `assets/images/logo.jpg`, then replace `logo-mark.png`, `favicon.png`, and `apple-touch.png` with crops of the same mark.

## Contact details

TikTok is set to [@tripple.a75](https://www.tiktok.com/@tripple.a75). Phone, email, and WhatsApp stay blank until they are confirmed, so the site does not point at a guessed number. Set them in `js/config.js`:

- `email`
- `phoneDisplay` and `phoneTel`
- `whatsappNumber` as digits with the country code, for example `2547XXXXXXXX`
- `socials.facebook`, `youtube`, `discord`, and `instagram`

The next cohort opens on 11 January 2027, 09:00 UTC+3. Starter plans begin at 120 USD. A different price is agreed with Tripple A. The in-person venue is sent after registration.

## Accounts

Register on this device, then open the dashboard. The password is stored as a salt plus a SHA-256 hash in the browser, so the form does not keep the plain password. A live site needs server-side password hashing. Clearing this site’s storage in the browser removes the account.
