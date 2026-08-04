# bloom 🌸 — a gentle menstrual cycle tracker

A full-stack period-tracking web app: account-based login, a Node/Express
API, server-side data storage with encrypted notes, phase-based health
suggestions, a prediction engine for future periods, and a "circle" feature
so a partner or family member can follow a private summary of your cycle.

Because data lives on the server rather than in one browser, it's available
from any device you log into.

## Features

- **Accounts** — email/password registration and login, passwords hashed
  with bcrypt, sessions handled with signed JWTs.
- **Cycle logging** — flow level, symptoms, and free-text notes per day.
  Notes are encrypted at rest with AES-256-GCM using a server-held key.
- **Predictions** — average cycle length and period length are computed
  from your own logged history, and used to predict your next period,
  ovulation day, and fertile window.
- **Phase-based suggestions** — the "Today" screen shows different
  activity and wellness tips depending on which of the four cycle phases
  you're in (menstrual, follicular, ovulation, luteal).
- **Circle sharing** — every account gets a private invite code. Anyone who
  enters that code sees only your current phase and predicted next period —
  never your symptoms or notes. You can also keep a personal list of
  partners/children you're tracking alongside, without them needing an
  account.
- **Pastel, floral design** — a blush/rose/lavender palette with a
  signature flower graphic whose petal count and color change with your
  current cycle phase.

## Tech stack

| Layer      | Choice                                             |
|------------|-----------------------------------------------------|
| Backend    | Node.js + Express                                   |
| Data store | A small embedded JSON file store (`server/db.js`) — see note below |
| Auth       | bcrypt password hashing + JWT sessions              |
| Encryption | AES-256-GCM for note fields, server-side key         |
| Frontend   | Vanilla HTML/CSS/JS (no build step, no framework)    |

**On the database:** to keep this project runnable anywhere with zero native
build tooling, the data layer (`server/db.js`) is a small file-backed JSON
store, not a full SQL server. All reads/writes go through a single module
with a clean function-based interface (`createUser`, `upsertEntry`,
`getEntries`, ...), so swapping in Postgres, MySQL, or SQLite later is a
matter of rewriting that one file — no route or frontend code needs to
change. For a resume/portfolio project this is a deliberate, explainable
trade-off; for anything handling real users' health data in production,
swap this for a real managed database with proper backups, and put it
behind HTTPS.

## Getting started

```bash
git clone <your-repo-url>
cd bloom-cycle-tracker
npm install
cp .env.example .env
```

Generate the two secrets `.env` needs and paste them in:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"    # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" # ENCRYPTION_KEY
```

Then start the server:

```bash
npm start
```

Visit `http://localhost:3000`, create an account, and start logging.

## Project structure

```
bloom-cycle-tracker/
├── server/
│   ├── index.js          # Express app entry point
│   ├── db.js             # embedded JSON data store
│   ├── auth.js            # JWT signing/verification middleware
│   ├── crypto.js          # AES-256-GCM helpers for notes
│   ├── predict.js         # cycle prediction algorithm
│   ├── routes/
│   │   ├── auth.js         # register / login / me
│   │   ├── profile.js      # profile + companions
│   │   ├── entries.js      # cycle day logging + predictions
│   │   └── circle.js       # partner/family sharing by invite code
│   └── data/               # bloom.json is created here at runtime (gitignored)
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js              # frontend app (vanilla JS, calls the API)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API overview

All `/api/*` routes except `/api/auth/register`, `/api/auth/login`, and
`/api/health` require an `Authorization: Bearer <token>` header.

| Method | Route                          | Purpose                                  |
|--------|---------------------------------|-------------------------------------------|
| POST   | `/api/auth/register`            | Create an account                         |
| POST   | `/api/auth/login`                | Log in                                    |
| GET    | `/api/auth/me`                   | Current user                              |
| PATCH  | `/api/profile`                   | Update name/cycle defaults                |
| GET    | `/api/profile/companions`        | List partners/children you've noted       |
| POST   | `/api/profile/companions`        | Add a companion                           |
| DELETE | `/api/profile/companions/:i`     | Remove a companion                        |
| GET    | `/api/entries`                   | All of your logged days, decrypted        |
| PUT    | `/api/entries/:date`             | Log/update flow, symptoms, note for a day |
| GET    | `/api/entries/meta/predictions`  | Cycle stats & predictions                 |
| POST   | `/api/circle/follow`             | Follow someone by their invite code       |
| GET    | `/api/circle`                    | People you follow + their shared summary  |

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — the server never
  stores or can recover a plaintext password.
- Notes are encrypted at rest with AES-256-GCM; the server needs
  `ENCRYPTION_KEY` at boot to read or write them.
- `.env` is gitignored — never commit real secrets.
- This project does not include HTTPS termination itself; put it behind a
  reverse proxy (e.g. Caddy, nginx, or your hosting provider's TLS) before
  putting real data through it.
- This is a portfolio-grade implementation, not an audited medical or
  HIPAA-compliant system. It doesn't include rate limiting, email
  verification, password reset flows, or a professional pen test — all
  worth adding before handling real users' health data.

## Disclaimer

Predictions are based on a simple historical-average model, the same
general approach used by most consumer cycle apps. They are estimates,
not medical advice or a form of contraception, and can be inaccurate —
especially with irregular cycles or limited history. Talk to a clinician
for medical decisions.

## License

MIT — do whatever you'd like with this, including using it as a portfolio
piece.
