# Design

| Token | Value |
| --- | --- |
| Violet | `#7C3AED` |
| Cyan | `#06B6D4` |
| Emerald | `#10B981` |
| Gold | `#F59E0B` |
| Coral | `#F43F5E` |
| Navy | `#0B1020` |
| Paper | `#F8FAFC` |

Headings use Sora. Body text uses Inter. Dark is the default theme. The choice is stored as `triplea_theme`.

Cards use a 16 to 24px radius, a soft shadow, and a slight lift on hover. Motion is reduced when the visitor asks for it.

Icons in the dashboards are Heroicons (`@heroicons/react`, outline set). The public site still uses the existing sprite for brand social marks.

Dashboard layout:

- Left sidebar on wide screens, a horizontal nav on small screens.
- Active item uses the violet tint.
- Tables scroll sideways on a phone instead of squeezing columns.
- Empty states name the next action, such as "No applications yet."

Do not add a second visual system. New screens reuse these tokens.
