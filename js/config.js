/**
 * Site-wide settings. Leave contact fields empty until Triple A confirms them.
 * A filled whatsappNumber should be digits only, with country code, e.g. "2547XXXXXXXX".
 * Password hashes in this prototype are a demo. Production auth must hash on a server.
 */

export const SITE = {
  brand: "Tripple A",
  mentor: "Abdullahi Abukar Ahmed",
  strategyAuthor: "Abdiwali Moalimuu",
  email: "",
  phoneDisplay: "",
  phoneTel: "",
  whatsappNumber: "",
  location: "Online, and in person with the cohort",
  venue: "The venue is sent after you register",
  cohortLabel: "January 2027",
  socials: {
    tiktok: "https://www.tiktok.com/@tripple.a75",
    facebook: "",
    youtube: "",
    discord: "",
    instagram: ""
  }
};

export const KEYS = {
  theme: "triplea_theme",
  users: "triplea_users",
  session: "triplea_session",
  read: "triplea_read",
  prep: "triplea_prep",
  enquiries: "triplea_enquiries",
  newsletter: "triplea_newsletter",
  seen: "triplea_seen"
};
