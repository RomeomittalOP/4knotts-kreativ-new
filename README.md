# 4 Knotts Kreativ — Premium Agency Platform v2

Multi-page React + GSAP/Framer site with OTP-based auth, dynamic package builder, project briefing workflow, automated email, and MongoDB persistence (with JSON fallback).

---

## 📍 Project Location

```
C:\Users\ASUS\4knotts-kreativ
```

Open in VS Code:

```powershell
code C:\Users\ASUS\4knotts-kreativ
```

(or `File → Open Folder…` and pick that directory)

---

## 🗂 Project Structure

```
4knotts-kreativ/
├── frontend/                          ← React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    ← Router + AuthProvider
│       ├── App.css · index.css
│       ├── api/client.js              ← axios instance + JWT
│       ├── context/
│       │   └── AuthContext.jsx        ← user, login/signup, modal state
│       ├── components/
│       │   ├── Layout/                ← shared shell + nav + footer
│       │   ├── Auth/AuthModal.jsx     ← OTP flow (Framer transitions)
│       │   ├── Hero/ Services/ Portfolio/ Pricing/ About/ Contact/
│       │   └── Particles/ParticleCanvas.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── AboutPage.jsx
│           ├── ServicesPage.jsx
│           ├── PortfolioPage.jsx
│           ├── PricingPage.jsx        ← live cost estimator
│           ├── ContactPage.jsx
│           └── BuildProjectPage.jsx   ← 5-step wizard with file upload
│
└── backend/                           ← Node.js + Express
    ├── server.js
    ├── .env.example                   ← copy to .env and fill
    ├── package.json
    ├── config/db.js                   ← Mongo connect + JSON fallback
    ├── middleware/auth.js             ← JWT verify
    ├── models/                        ← User · Otp · ProjectRequest
    ├── controllers/                   ← auth · contact · pricing · projects
    ├── routes/                        ← /auth · /contact · /pricing · /projects
    ├── services/
    │   ├── emailService.js            ← Nodemailer + HTML templates
    │   ├── otpService.js              ← 6-digit OTP, 5-min TTL, 5 attempts
    │   ├── pricingEngine.js           ← server-authoritative pricing
    │   └── jsonStore.js               ← flat-file fallback
    ├── data/                          ← auto-created JSON DB if no Mongo
    └── uploads/                       ← multer file uploads (auto-created)
```

---

## 🚀 Run Locally

### 1. Backend

```powershell
cd C:\Users\ASUS\4knotts-kreativ\backend
copy .env.example .env             # then edit .env with your SMTP creds (optional)
npm install                         # only first time
npm run dev                         # nodemon hot-reload, port 5000
```

Backend will run with **JSON storage** if `MONGO_URI` is empty/unreachable, and email is **dry-run logged to console** if `SMTP_PASS` is missing — so it works out of the box.

### 2. Frontend

```powershell
cd C:\Users\ASUS\4knotts-kreativ\frontend
npm install                         # only first time
npm run dev                         # Vite, port 3000
```

Open **`http://localhost:3000`** — Vite proxies `/api/*` to port 5000.

---

## ⚙️ Configuration (`backend/.env`)

| Variable           | Purpose                                                |
|--------------------|--------------------------------------------------------|
| `MONGO_URI`        | MongoDB connection. Leave blank → JSON fallback.       |
| `JWT_SECRET`       | 32-char random string for signing tokens.              |
| `SMTP_HOST/PORT/USER/PASS` | Gmail SMTP. Generate App Password at https://myaccount.google.com/apppasswords |
| `EMAIL_FROM`       | `"4 Knotts Kreativ <shubhammittal3555@gmail.com>"`     |
| `ADMIN_EMAIL`      | Where new-lead notifications are sent.                 |
| `SMS_PROVIDER`     | `mock` (logs OTP to console) · `twilio` (real SMS)     |

In dev mode, OTPs are also returned in the API response (`devCode`) and shown in the auth modal so you can log in without configuring SMS.

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Purpose                                       |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/api/auth/send-otp`  | `{ phone, purpose: 'signup'/'login' }`        |
| POST   | `/api/auth/signup`    | `{ name, email, phone, code }` → `{ token }`  |
| POST   | `/api/auth/login`     | `{ phone, code }` → `{ token }`               |
| GET    | `/api/auth/me`        | Returns current user (Bearer token)           |

### Pricing
| Method | Endpoint                  | Purpose                                |
|--------|---------------------------|----------------------------------------|
| GET    | `/api/pricing/catalog`    | Services + packages for the builder    |
| POST   | `/api/pricing/estimate`   | `{ services: [], tier }` → `{ min, max, breakdown }` |
| POST   | `/api/pricing`            | Save selection / lead                  |

### Projects
| Method | Endpoint           | Purpose                                              |
|--------|--------------------|------------------------------------------------------|
| POST   | `/api/projects`    | multipart: name/email/phone/services/tier/budget/timeline/requirements + `files[]` (≤5 × 10 MB) |
| GET    | `/api/projects`    | Admin list (auth required)                          |

### Contact
| Method | Endpoint         | Purpose                                  |
|--------|------------------|------------------------------------------|
| POST   | `/api/contact`   | `{ name, email, message }`               |

---

## 📄 Pages

| Route          | What lives there                                    |
|----------------|------------------------------------------------------|
| `/`            | Hero · process strip · final CTA                    |
| `/about`       | Word-by-word reveal · pillars · stats               |
| `/services`    | Pyramid layout · animated service modal              |
| `/portfolio`   | Horizontal scroll project cards                     |
| `/pricing`     | 3 packages (Basic/Pro/Premium "Starting from ₹X") + custom builder with live `min–max` estimate |
| `/build`       | 5-step wizard → services → tier → budget → brief → review → submit (with file upload) |
| `/contact`     | Form (name/email/message) → confirmation + admin notification emails |

---

## 🎨 Design Tokens

| Token              | Value           |
|--------------------|-----------------|
| `--bg`             | `#000`          |
| `--accent`         | `#ff2e4d` red   |
| `--purple` (silver)| `#9ca3af`       |
| Gradient           | `linear-gradient(135deg, #ff2e4d, #9ca3af)` |
| Heading font       | Orbitron        |
| Body font          | Inter / Space Grotesk |

---

## 🔐 Auth Flow

1. User clicks **Log In** or **Get Started** in nav → `AuthModal` opens
2. Enters phone (signup also asks name + email)
3. Backend issues OTP → SMS (or console in dev)
4. User enters 6-digit code → JWT token returned
5. Token stored in `localStorage('4kk-token')` and attached to all `/api/*` calls
6. User pill replaces login buttons; logout returns to homepage

---

## 🐛 Troubleshooting

- **"OTP failed to send"** in dev → backend not running. Start it on port 5000.
- **Backend says "MONGO_URI not set"** → that's fine, it falls back to JSON files in `backend/data/`.
- **Emails not arriving** → without SMTP creds, emails are logged to the backend console. Add `SMTP_PASS` (Gmail App Password) to send for real.
- **Cannot install backend deps** → run `npm install` again or delete `backend/node_modules` and retry.
