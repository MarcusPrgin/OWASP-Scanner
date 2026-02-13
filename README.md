# OWASP Website Scanner

## Features

- 🌐 Scan any public website URL
- 🔍 Passive OWASP-inspired checks
  - HTTPS usage
  - Common security headers (CSP, HSTS, etc.)
  - robots.txt presence
- 📋 Stores scans and findings in SQLite
- 🗂️ Viewable in UI **and** directly in DBeaver
- ⚡ Fast MVP setup, easy to extend

---

## Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **SQLite**
- **Drizzle ORM**
- **better-sqlite3**

---

## Screens / Pages

- **Landing page** – overview + actions
- **Scan page** – enter URL and start scan
- **Results list** – all previous scans
- **Scan details** – findings with severity and evidence

---
