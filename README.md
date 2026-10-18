# Fathy Nassef · Sender Suite

A WhatsApp bulk messaging platform built on [Baileys](https://github.com/WhiskeySockets/Baileys).
Send text, images, video, audio and documents to phone numbers, WhatsApp groups, or the
contacts saved in your address book — from one dashboard, with per-campaign progress tracking.

Multiple WhatsApp accounts ("sessions") can be linked at once, each identified by a username.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [Pages](#pages)
- [HTTP API](#http-api)
- [Database schema](#database-schema)
- [Project layout](#project-layout)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known issues and gotchas](#known-issues-and-gotchas)

---

## Features

| Capability | Where |
|---|---|
| Link multiple WhatsApp accounts via QR | `/scan/:username` |
| Delivery analytics (messages sent, reachable vs unreachable contacts) | `/dashboard/:username` |
| Bulk text to a pasted list of numbers | `/bulk/:username` |
| Bulk image / video / document to a list of numbers | `/bulkimage`, `/bulkvideo`, `/bulkfile` |
| Personalised campaigns driven by a spreadsheet | `/bulkexcel/:username` |
| One-off message to a single number | `/phone/:username` |
| **Group campaigns** — multi-select groups, any media, multiple attachments | `/group/:username` |
| **Contact campaigns** — multi-select from your synced WhatsApp address book | `/contacts/:username` |
| Live campaign progress with ETA, sent/unreachable/failed counts | in-page, polls `/jobs/:id` |

Both campaign pages support **select-all** (scoped to the current search), per-row checkboxes,
and **multiple attachments of any type** — each attachment is sent as its own message to every
selected recipient.

---

## Architecture

```
            browser
               │  HTTPS
               ▼
         nginx (host)                 reverse proxy, TLS, WebSocket upgrade
               │  127.0.0.1:3030
               ▼
   ┌───────────────────────────┐
   │  app (Node 20, Express)   │      serves API + the built frontend
   │  dist/index.js            │
   └─────┬───────────────┬─────┘
         │               │
         ▼               ▼
     MySQL           Postgres
  Baileys auth     message log +
  state/sessions   contact store
```

- **One container** serves both the REST API and the compiled React app
  (`express.static("frontend/dist")` with an SPA catch-all).
- **MySQL** stores Baileys authentication state via `mysql-baileys`, so linked sessions
  survive restarts without re-scanning the QR code.
- **Postgres** stores the message log (for dashboard stats) and the synced contact store.

**Stack:** TypeScript · Express 4 · Baileys 7 · ws · React 18 · Vite 4 · MUI 5 · react-query 3

---

## Quick start

### Docker (recommended)

```bash
cp .env.example .env     # then edit the passwords
docker compose up -d --build
```

Open <http://localhost:3030>, type a session name, and scan the QR code with
**WhatsApp → Settings → Linked devices → Link a device**.

> The frontend is built *inside* the image (Dockerfile stage 1). Running `npm run build`
> locally does **not** affect the container — see [Deployment](#deployment).

### Local development

Two terminals, with MySQL and Postgres reachable from the host:

```bash
# backend — watch mode on :3030
npm install
npm run dev

# frontend — Vite dev server on :5173, proxied to the backend
cd frontend
npm install
npm run dev
```

`frontend/.env.development` points the dev server at the backend:

```
VITE_API_URL=http://localhost:3030
VITE_WS_URL=ws://localhost:3030
```

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Backend in watch mode (`tsx`) |
| `npm run build` | Compile backend TypeScript → `dist/` |
| `npm start` | Run the compiled backend |
| `cd frontend && npm run dev` | Vite dev server |
| `cd frontend && npm run build` | Typecheck + build to `frontend/dist/` |
| `cd frontend && npm run lint` | ESLint |
| `npx tsc -p backend --noEmit` | Typecheck the backend only |

---

## Configuration

All settings live in `.env` (see `.env.example`).

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3030` | HTTP port |
| `MYSQL_ROOT_PASSWORD` | — | MySQL password (docker-compose) |
| `POSTGRES_PASSWORD` | — | Postgres password (docker-compose) |
| `MYSQL_*` / `POSTGRES_*` | see example | Connection details for non-Docker runs |
| `COUNTRY_CODE` | `20` | Prepended to **local** numbers in bulk sends |
| `MESSAGE_DELAY_MIN_MS` | `60000` | Minimum pause between messages |
| `MESSAGE_DELAY_MAX_MS` | `120000` | Maximum pause between messages |
| `REPORT_GROUP_ID` | empty | Group JID that receives the xlsx send report |
| `MAX_UPLOAD_MB` | `50` | Per-file upload limit |
| `BAILEYS_LOG_LEVEL` | `fatal` | Raise to `info`/`debug` to diagnose pairing or contact sync |

### About the send delay

Every message waits a **random** interval in `[MIN, MAX]` before the next one. A fixed
interval looks robotic to WhatsApp's anti-spam systems; a randomised one does not.

The defaults are deliberately slow. Plan for it:

| Campaign size | Approximate duration at 60–120s |
|---|---|
| 5 messages | 4–8 minutes |
| 20 messages | 20–40 minutes |
| 96 messages | 1.6–3.2 hours |
| 883 messages | 15–29 hours |

Campaigns run **server-side** — closing the browser does not stop them. Lowering these values
meaningfully increases the risk of the account being banned.

---

## How it works

### Sessions and QR pairing

Each session is a `username` (`[A-Za-z0-9_-]{1,32}`) mapping to one `BaileysProvider`.
The browser opens a WebSocket and sends:

```json
{ "type": "set-username", "username": "mysession" }
```

The server replies with `{ "type": "qr-code", "message": "<data-url>" }` until pairing
completes, then `{ "type": "authenticated" }`. Auth state is written to MySQL, so
`restoreSessions()` brings every session back automatically on boot.

After three unscanned QR regenerations the socket is closed to avoid a reconnect loop.

### Campaigns

`POST /campaign` is the unified endpoint behind both campaign pages. It accepts any mix of
group JIDs (`…@g.us`) and user JIDs (`…@s.whatsapp.net`), an optional message, and any number
of attachments. Content type is chosen per upload from its MIME type:

| MIME prefix | Sent as |
|---|---|
| `image/*` | photo with caption |
| `video/*` | video with caption |
| `audio/*` | audio |
| anything else | document, original filename preserved |

Group JIDs skip the `onWhatsApp()` reachability check (it does not apply to groups);
phone numbers still get it. The endpoint responds **immediately** with a `jobId`; the UI then
polls `GET /jobs/:id` for progress.

### Contact sync

WhatsApp does not expose a "fetch all contacts" API. Contacts arrive as events
(`messaging-history.set`, `contacts.upsert`, `contacts.update`) and are persisted to Postgres
by `backend/contacts.ts`.

A session that paired a while ago will show **zero contacts** until you press
**Sync from WhatsApp** on the Contacts page. That calls
`resyncAppState(["critical_unblock_low"])` after clearing the stored sync version — WhatsApp
only returns a full address-book snapshot when the requested version is `0`; otherwise it
sends an empty delta. See [Known issues](#known-issues-and-gotchas).

`name` is the name **you** saved; `notify` is the push name the contact set themselves. The
"saved contacts only" toggle filters on the former.

---

## Pages

| Route | Page |
|---|---|
| `/` | Session picker / landing |
| `/scan/:username` | QR pairing with live connection status |
| `/dashboard/:username` | Stats and campaign launcher |
| `/bulk/:username` | Bulk text to pasted numbers |
| `/bulkimage/:username` | Bulk image + caption |
| `/bulkvideo/:username` | Bulk video + caption |
| `/bulkfile/:username` | Bulk document |
| `/bulkexcel/:username` | Spreadsheet-driven personalised campaign |
| `/phone/:username` | Single message |
| `/group/:username` | Group campaign (multi-select, any media) |
| `/contacts/:username` | Contact campaign (multi-select, any media) |

---

## HTTP API

Unless noted, requests are JSON and include `username`. File uploads are `multipart/form-data`.

### Campaigns and jobs

| Method | Path | Body | Notes |
|---|---|---|---|
| `POST` | `/campaign` | `username`, `targets`, `message`, `media` (0..n files) | Groups and/or contacts. Returns `{ status, jobId }` |
| `GET` | `/jobs/:id` | — | Progress: `total`, `sent`, `notOnWhatsapp`, `failed`, `errors`, `status` |
| `GET` | `/jobs?username=` | — | Recent jobs (last 100 in memory) |

`targets` accepts a JSON array, a real array, or a newline/comma separated string.

### Contacts

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/contacts/:username?saved=1` | `{ contacts, total, saved }`. `saved=1` limits to your address book |
| `POST` | `/api/contacts/sync` | Forces a full address-book resync |

> Namespaced under `/api` so it does not shadow the `/contacts/:username` **page** route.

### Sending (legacy, per-type)

| Method | Path | Body |
|---|---|---|
| `POST` | `/bulk` | `numbers[]`, `message` |
| `POST` | `/sendimage` | `phoneNumbers`, `caption`, `image` |
| `POST` | `/sendvideo` | `phoneNumbers`, `caption`, `video` |
| `POST` | `/sendfile` | `phoneNumbers`, `file` |
| `POST` | `/sendxlsx` | `file`, `colname` (number column), `message` (message column) |
| `POST` | `/` | `phoneNumber`, `message` — single send |
| `POST` | `/id` | `id`, `message` — single group send |

### Sessions, groups, stats

| Method | Path | Notes |
|---|---|---|
| `GET` | `/usernames` | Known sessions |
| `POST` | `/summery` | Dashboard totals |
| `GET` | `/getgroups/:username` | `[{ name, id }]` |
| `GET` | `/allgroups` | Raw Baileys group metadata |
| `POST` | `/getgroupid/:name` | Resolve a group name to its JID |
| `POST` | `/newgroup` | Create a group |
| `POST` | `/addgroupmembers` | Add members |
| `POST` | `/pfp` | Set a profile picture |

### Status codes

| Code | Meaning |
|---|---|
| `400` | Invalid/missing username or required field |
| `404` | Session not found, or number not on WhatsApp |
| `310` | WhatsApp connection not established — re-scan the QR |

---

## Database schema

### Postgres — `messages`

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` | |
| `username` | `TEXT` | Session |
| `phone_number` | `TEXT` | Recipient JID |
| `on_whatsapp` | `BOOLEAN` | Reachability at send time |
| `message` | `TEXT` | Body, or a media label (`Photo`, `Video`, `File`, `Audio`) |
| `kind` | `TEXT` | `direct` or `group` (default `direct`) |
| `created_at` | `TIMESTAMPTZ` | |

`kind` keeps the dashboard honest: group sends count toward **Messages Sent** but are excluded
from the on/not-on-WhatsApp **contact** tallies, which are meaningless for group JIDs.

### Postgres — `contacts`

| Column | Type | Notes |
|---|---|---|
| `username` | `TEXT` | Part of the primary key |
| `jid` | `TEXT` | Part of the primary key |
| `phone_number` | `TEXT` | Digits only |
| `name` | `TEXT` | Name saved in **your** address book |
| `notify` | `TEXT` | Push name set by the contact |
| `updated_at` | `TIMESTAMPTZ` | |

A partial `contacts.update` never overwrites a stored `name` with null.

### MySQL — `auth`

Managed by `mysql-baileys`: credentials, signal keys and app-state sync keys, keyed by session.

---

## Project layout

```
backend/
  index.ts        Express app, routes, WebSocket, campaign loop
  baileys.ts      BaileysProvider: socket lifecycle, QR, contact events
  contacts.ts     Postgres contact store
  authFix.ts      Workaround for a mysql-baileys decryption bug (see below)
  db.ts           Postgres message log + dashboard summary
  jobs.ts         In-memory job tracking (last 100)
  config.ts       Env parsing
  phone.ts        Number normalisation, JID helpers

frontend/src/
  theme.ts              MUI theme + design tokens
  styles/global.css     Aurora background, animations, third-party skins
  components/
    PageShell           Page frame: backdrop, nav, header
    GlassCard           The surface primitive everything is built from
    RecipientPicker     Multi-select with select-all (groups and contacts)
    AttachmentsInput    Multi-file picker, any type, with previews
    JobProgress         Polls a running campaign
    StatCard, NavBarComponent, FileDropzone, NumbersInput, …
  pages/                One file per route
  api/api.ts            Axios client
```

### Design system

Dark "glass" theme: deep slate base, animated aurora backdrop, frosted cards, emerald→cyan
accents, Space Grotesk headings / Inter body / JetBrains Mono for numbers. Tokens live in
`frontend/src/theme.ts` — change them there, not per component. Honours
`prefers-reduced-motion`.

---

## Deployment

```
nginx (host) → 127.0.0.1:3030 → app container → express.static(frontend/dist)
```

### Deploying a change

```bash
docker compose up -d --build
```

**The frontend is built inside the image.** `.dockerignore` excludes `frontend/dist`, and
Dockerfile stage 1 runs `npm run build` from source. A local build is therefore *only* a
verification step — it never reaches the container. Frontend changes require an image rebuild.

A restart does **not** require re-scanning QR codes: auth state lives in MySQL on a persistent
volume and `restoreSessions()` runs on boot.

### Verifying a deploy

```bash
# the served bundle hash should match frontend/dist/assets/
curl -s 127.0.0.1:3030 | grep -o 'index-[a-z0-9]*\.js'
ls frontend/dist/assets/

docker compose logs app --since 5m | grep -E "ready|Restoring"
```

`nginx-elwafaa.conf` is the reference reverse-proxy config: TLS, a 20 MB body limit, and the
`Upgrade`/`Connection` headers the QR WebSocket needs.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| **Contacts page is empty** | The session paired before contact sync existed. Press **Sync from WhatsApp**. |
| **HTTP 310 on send** | Socket not connected. Re-scan at `/scan/:username`. |
| **QR never appears** | Three regenerations exhausted the retry limit; reload the page. |
| **Campaign looks stuck** | Expected — 60–120s between messages. Check the progress panel's ETA. |
| **Deploy shows the old UI** | The image wasn't rebuilt. Run `docker compose up -d --build`. |
| **Pairing / sync problems** | Set `BAILEYS_LOG_LEVEL=info` and read `docker compose logs app`. |
| **International numbers wrong** | `COUNTRY_CODE` is only applied to *local* numbers; already-international numbers pass through untouched. |

---

## Known issues and gotchas

### `mysql-baileys` corrupts app-state sync keys (worked around)

`backend/authFix.ts` exists for a real bug in the `mysql-baileys` dependency.

Its `keys.get()` passes `app-state-sync-key` rows through its own `fromObject()`, which keeps
`keyData` only when `Array.isArray(keyData)` is true. The value is stored as a base64 **string**,
so that check fails and it falls back to `allocate()` — a stub that returns a zero-filled array
of the correct *length* but none of the real bytes. Baileys then AES-256-decrypts every
app-state snapshot with a 32-byte **zero key** and fails with `bad decrypt`.

The effect: **contact sync silently never worked.** The stored row is fine — only the read path
is broken — so `authFix.ts` re-reads those rows straight from MySQL and decodes them correctly,
leaving every other key type on the library's own path. It also restores
`fingerprint.currentIndex`, which the library overwrote with `rawId`.

If `mysql-baileys` is ever fixed upstream, this file can be deleted.

### Other things worth knowing

- **Jobs are in memory.** The last 100 are kept; a restart loses job history (sent messages are
  still logged to Postgres). Job IDs do not survive a redeploy.
- **Group names repeat.** The pickers show the group ID alongside the name to disambiguate.
  Some groups have no name and display as *Untitled group*.
- **`/getgroups` returns `{ name, id }`**, not `{ label, id }` — the frontend normalises this in
  `api/api.ts`.
- **Existing JIDs bypass `COUNTRY_CODE`.** Running a stored JID through local-number
  normalisation would turn `966…` into `20966…`; `parseTargets` keeps them as-is.
- **The contact listbox renders at most 150 rows** for responsiveness. Select-all still applies
  to *every* match, not just the rendered slice.
- **No automated tests.** `npm test` is a placeholder. Verification is manual plus typecheck
  and lint.

---

## Responsible use

This tool can message a large number of people quickly. Bulk messaging people who have not
opted in is a fast route to a permanent WhatsApp ban, and may breach WhatsApp's Terms of
Service and local laws (e.g. GDPR, Egypt's PDPL). Keep the default delays, message people who
expect to hear from you, and test a campaign on a single recipient before a large run.
