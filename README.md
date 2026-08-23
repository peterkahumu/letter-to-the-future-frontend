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
│   └── unsubscribe/
├── components/
│   ├── LetterForm.tsx       # the main compose form
│   ├── RichTextEditor.tsx   # Tiptap editor
│   ├── MediaAttachment.tsx  # upload to Cloudinary via the API
│   ├── LetterCard.tsx       # feed item
│   ├── ReportDialog.tsx     # report a public letter
│   ├── Modal.tsx, Navbar.tsx, Footer.tsx
│   ├── PaperBackground.tsx, PointerGlow.tsx   # visual treatment
│   └── ThemeProvider.tsx    # light/dark
└── lib/
    └── api.ts               # every call to the backend
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
