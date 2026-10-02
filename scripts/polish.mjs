import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const files = readdirSync(".").filter((file) => file.endsWith(".html"));

const shared = [
  [
    '<link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="assets/icons/favicon.png" type="image/png">\n  <link rel="apple-touch-icon" href="assets/icons/apple-touch.png">'
  ],
  [
    '<span class="logo__mark" aria-hidden="true">AAA</span>',
    '<img class="logo__img" src="assets/images/logo.jpg" width="48" height="48" alt="">'
  ],
  [
    '<span class="logo__tag">Mentorship</span>',
    '<span class="logo__tag">Growth &amp; Confidence</span>'
  ],
  [
    `  <div class="preloader__mark" aria-hidden="true">AAA</div>
  <p>Triple A</p>`,
    `  <img class="preloader__logo" src="assets/images/logo.jpg" width="88" height="88" alt="">
  <p>Tripple A</p>`
  ],
  [
    " Figures marked as placeholders on this prototype are not verified results.",
    ""
  ],
  [" · Triple A. Prototype.", " · Tripple A."],
  [
    `<li><a href="contact.html#direct" data-channel="email">Email to be confirmed</a></li>
        <li><a href="contact.html#direct" data-channel="whatsapp">WhatsApp to be confirmed</a></li>
        <li><a href="contact.html#direct">City and venue to be confirmed</a></li>`,
    `<li><a href="https://www.tiktok.com/@tripple.a75" target="_blank" rel="noopener noreferrer">TikTok @tripple.a75</a></li>
        <li><a href="contact.html">Write to Tripple A</a></li>
        <li><a href="programme.html">January 2027 cohort</a></li>`
  ],
  [
    'aria-label="WhatsApp number to be confirmed. Go to the contact page."',
    'aria-label="Message Tripple A"'
  ],
  [
    "Simulated market prices for demonstration only. These are not live quotes.",
    "Sample prices for illustration. Not a live market feed."
  ],
  [">Demo data<", ">Sample<"],
  ["assets/images/mentor.svg", "assets/images/abdullahi.jpg"],
  ["Triple A", "Tripple A"]
];

for (const file of files) {
  let html = readFileSync(file, "utf8");
  for (const [from, to] of shared) {
    if (!html.includes(from)) continue;
    html = html.replaceAll(from, to);
  }
  writeFileSync(file, html);
}

console.log(`updated ${files.length} pages`);
