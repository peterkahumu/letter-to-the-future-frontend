# Letter to the Future — Frontend ✉️

Next.js app for [Letter to the Future](https://github.com/peterkahumu/letter-to-the-future-backend):
write a letter, pick a delivery date, and it arrives by email when the time comes.

**Backend repository:** [letter-to-the-future-backend](https://github.com/peterkahumu/letter-to-the-future-backend)

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Editor | Tiptap (rich text) |
| Icons | lucide-react |
| Sanitising | DOMPurify (client side; the API sanitises again on write) |
| Hosting | Cloudflare Pages |

## Getting started

```bash
npm install

cp .env.example .env.local   # point at your backend
npm run dev
```

Open <http://localhost:3000>. The backend needs to be running too — see the
backend README.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

`NEXT_PUBLIC_` variables are **inlined into the browser bundle at build
time**, not read at runtime. Changing it means rebuilding, and it must never
hold anything secret.

Whatever origin this app is served from also has to be allowed by the
backend's `FRONTEND_URL` (or `ALLOWED_ORIGIN_REGEX`), or every request fails
CORS. Preview deploys are the usual thing to forget.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/compose` | Write and schedule a letter |
| `/confirmation/[id]` | Writer's status page — where the letter is, and cancel it while it's still stoppable |
| `/confirm/[id]` | Where the recipient's emailed link lands; confirming schedules the letter |
| `/public` | Feed of delivered letters their writers chose to share |
| `/unsubscribe` | Stop all letters to an address |

`/confirm/[id]` and `/unsubscribe` are reached from emailed links carrying a
token. The backend builds those URLs from its own `FRONTEND_URL`, so that
value has to match where this app actually lives.

### Accounts

| Route | Purpose |
|---|---|
| `/login`, `/register` | Sign in or create an account |
| `/verify-email` | Lands from the confirmation email; signs you in |
| `/forgot-password`, `/reset-password` | Password recovery |

### Signed in

| Route | Purpose |
|---|---|
| `/dashboard` | Overview — counts, next delivery, writing streak, recent items |
| `/dashboard/letters` | Your letters. Read-only, on purpose |
| `/dashboard/journals` | Your notebooks |
| `/dashboard/journals/[id]` | One notebook and its entries — write and edit here |
| `/dashboard/settings` | Profile, password, live sessions, delete account |

### Admin

`/admin`, `/admin/users`, `/admin/moderation`, `/admin/delivery` — statistics,
user management, the report queue, and delivery health. Admins are ordinary
users with a wider role, so they keep their own dashboard too.

Journals and diary entries are private to whoever wrote them. There is no
admin screen that shows their contents, because there is no API that returns
them.

## Sessions

Sign-in returns a short-lived access token and a refresh token, both held in
`localStorage` (`lib/tokens.ts`) and sent as `Authorization: Bearer`. Any
script running on this origin can read them, which is why the app ships no
third-party scripts and why every letter and entry body is sanitized on the
server before it is ever rendered.

`lib/api.ts` attaches the token, and on a `401` refreshes once and replays
the request. That refresh is **single-flight**: a dashboard fires several
requests at once, so without sharing one in-flight refresh each 401 would
start its own, and every attempt after the first would present a token the
first had already rotated — which the backend correctly reads as theft and
answers by ending every session.

`RequireAuth` gates the dashboard and admin trees. It is a UX guard, not a
security boundary: the API authorises every request independently, so
editing your way past it yields an empty shell and a string of 401s.

## Layout

```
src/
├── app/
│   ├── layout.tsx           # shell, theme, fonts
│   ├── page.tsx             # landing
│   ├── compose/             # the writing flow
│   ├── confirm/[id]/        # recipient confirmation
│   ├── confirmation/[id]/   # writer's "check your inbox" screen
│   ├── public/              # public feed
│   ├── unsubscribe/
│   ├── login/, register/    # account entry points
│   ├── verify-email/, forgot-password/, reset-password/
│   ├── dashboard/           # overview, letters, journals, settings
│   └── admin/               # stats, users, moderation, delivery
├── components/
│   ├── LetterForm.tsx       # the main compose form
│   ├── RichTextEditor.tsx   # Tiptap editor, shared with journal entries
│   ├── MediaAttachment.tsx  # upload to Cloudinary via the API
│   ├── LetterCard.tsx       # feed item
│   ├── ReportDialog.tsx     # report a public letter
│   ├── EntryEditor.tsx      # write or edit a diary entry
│   ├── JournalCard.tsx      # notebook tile
│   ├── RequireAuth.tsx      # gate for /dashboard and /admin
│   ├── UserMenu.tsx         # account menu in the navbar
│   ├── AuthCard.tsx, FormField.tsx, SubmitButton.tsx, Alert.tsx, StatTile.tsx
│   ├── DashboardNav.tsx, AdminNav.tsx
│   ├── Modal.tsx, Navbar.tsx, Footer.tsx
│   ├── PaperBackground.tsx, PointerGlow.tsx   # visual treatment
│   └── ThemeProvider.tsx    # light/dark
└── lib/
    ├── api.ts               # every call to the backend
    ├── auth.tsx             # session context
    ├── tokens.ts            # where tokens live in the browser
    └── format.ts            # shared date and status formatting
```

## Deployment

Cloudflare Pages, configured in `wrangler.toml`. Set `NEXT_PUBLIC_API_URL`
in the Pages project's build environment variables — it's baked in at build
time, so a change needs a fresh deploy, not just a restart.

After deploying to a new URL, add that origin to the backend's
`FRONTEND_URL` and redeploy the backend. The backend also uses the first
entry of that list to build the links it emails, so if it's wrong,
confirmation emails point somewhere useless.

## License

MIT
