# Content

## Certificates

Categories: `passed_account`, `withdrawal`, `milestone`, `other`.

Every certificate needs a consent flag. The upload screen tells the mentor to hide account numbers. Deleting a certificate later must also delete its Cloudinary file. The public gallery and the landing page show published, consented items only.

Cloudinary is the upload store. The API secret stays on the server. Folders: `triple-a/certificates`, `triple-a/trades`, `triple-a/stories`, `triple-a/avatars`, `triple-a/applications`. Images: JPG, PNG, WebP, max 5 MB. Application files stay private to the mentor and admin.

## Trades

Fields include instrument, buy or sell, session, timeframe, entry, stop, target, risk-reward, setup, notes, chart images, and status: `live`, `closed_win`, `closed_loss`, `break_even`.

Every public trade card carries the education disclaimer. Summary counts, if shown, are labelled educational. Do not publish a win rate as a promise.

## Alerts and notifications

Public alerts have a title, message, type (`info`, `success`, `warning`, `urgent`, `cohort`), link, window, active flag, and pin.

In-app notifications go to one student, a cohort, or all students, with an unread count.

## Stories

A student may submit a draft with consent. Status moves `draft` → `pending_review` → `published`. The mentor publishes. Consent is required before a story or certificate shows a student's name.

Categories: `journey`, `success_story`, `market_insight`, `announcement`.

## Contact and settings

Contact messages are stored. Emailing the mentor is specified and waits on the mail provider. Admin settings hold contact details, social URLs, programme stats, the 120 USD floor, and the Abdiwali credit sentence. Leave a contact field empty until it is confirmed.
