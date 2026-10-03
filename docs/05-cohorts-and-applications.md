# Cohorts and applications

## Cohort

The mentor or admin creates a cohort at any time.

| Field | Rule |
| --- | --- |
| Name | Free text, for example "Cohort 7" |
| Start date | Any date |
| End date | Calculated as start plus 3 months. Do not ask the user to type it |
| Mode | `online`, `physical`, or `both` |
| Seats | Limit, with `seatsTaken` updated when students are enrolled |
| Price from | Default 120 USD |
| Links | Zoom and Google Meet |
| Venue | Sent to enrolled students. Do not invent an address |
| Status | `draft`, `open`, `full`, `closed`, `in_progress`, `completed`, `cancelled` |

Opening and closing can be manual. A cohort also closes when the deadline passes or seats are full. It moves to `in_progress` on the start date and `completed` on the end date. Several cohorts may exist at once.

The create form can publish a public alert. Default copy names the cohort, the start date, and the seat limit, and links to apply. That alert turns off when the cohort closes or fills. The mentor can edit, pin, or remove it.

## Application

Fields: full name, email, phone, country, city, experience, chosen open cohort, mode (`online` or `physical`), plan (from 120 USD or custom), goals, why join, availability, optional attachment, consent.

Statuses: `pending`, `under_review`, `approved`, `rejected`, `waitlisted`.

The mentor and admin get a searchable table, filters, notes, and those status actions. Approval should link or create the student account and enrol them in the cohort. Welcome email is specified and is not sent until an email provider is configured. Until then, approval must not invent a password or claim an email went out.

If no cohort is `open`, the public apply page shows a closed state and a waitlist form (`name`, `email`, `phone`, interest in a cohort or the next one). Publishing a new cohort is specified to email that waitlist. Do not mark people as notified until the email actually sends.

Applications are refused by the API when the cohort is not open, even if the form is bypassed.
