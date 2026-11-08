# CLAUDE.md: Steady

**Steady** (repo `steady`, workspaces `steady-*`): Jacob's private tracker for anxieties and
depression. Log a worry in under 10 seconds, sort it by category, mark it Active / Improving /
Resolved, and add a next small step and a reframe. **Private per member**: no public pages; anyone can
sign up at `/sign-up` (email confirmation required) and sees only their own data. Screens: worry list (filters), quick add, edit entry,
categories, account. A "Need help now?" 988 button is always visible. **Name, copy and sample
entries are placeholders** (dummy data).

Copied from `greenline-landscaping` (working tree, 2026-11-08; greenline has no git repo, so it was
a `tar` export that excluded `.env*`, `node_modules`, build output and images). Design (brief,
sitemap, wireframes, theme, mocks): `../designs/steady/`. Build decisions:
`../.claude/STEADY-BUILD.md`. Read it before re-litigating anything. Spec phases: Phase 1 (this) is
the worry list; Phase 2 adds check-ins, charts, wins, coping toolbox, export.

---

## Structure

```
steady/
├── express/   # API  (steady-express)
├── react/     # Vite + React 19 (steady-react)
├── shared/    # dtos: the API contract (category, worry, member)
└── package.json
```

**Yarn workspaces. Always `yarn`, never `npm`.**

```bash
yarn dev:react      # :5173
yarn dev:express    # :3000
yarn lint
yarn workspace steady-express create:admin <email> <password> [first] [last]   # also makes the 12 starter categories
yarn workspace steady-express seed            # 12 placeholder worries for the first admin account
yarn workspace steady-express seed --force    # replace only the seeded rows
```

> `NODE_AUTH_TOKEN` must be exported or **every** yarn command fails. See `../WORKFLOW.md`.

---

## Rules that are easy to break

- **Privacy first.** Every `/api/categories` and `/api/worries` route is `requireAuth` and every
  query is scoped by `req.userId`. Never return another user's rows, never log entry text.
- **Worry text is encrypted at rest** (`utils/fieldCrypto.ts`, AES-256-GCM): `description`,
  `nextStep`, `reframe`, `notes`. Encrypt on write, decrypt only in `toWorryDto`. Never query, sort
  or index those fields. Express refuses to boot without `FIELD_ENCRYPTION_KEY` (64 hex). Changing
  or losing the key makes old entries unreadable. Tags are plain text (kept filterable).
- **Express imports `@shared/dtos` with `import type` only.** Runtime constants come through
  `express/src/utils/domainConstants.ts` with a relative import.
- **POST/PATCH bodies and list queries use `validateStrict` + Joi** (`utils/validators.ts`).
  Return `400 { error: validationMessage(error) }`.
- **Duplicate check**: text is encrypted, so similarity runs in memory on one user's own worries
  (`utils/similarity.ts`, threshold `SIMILARITY_THRESHOLD`). `POST /api/worries/similar` takes the
  text in the body (never the URL). Quick add asks "This might already be on your list" and never
  blocks a save if the check fails. `/worries/duplicates` lists groups (open, delete, keep both).
- `resolvedAt` is server-owned: set when status becomes `resolved`, cleared when reopened.
- Categories live in Mongo per user (`ensureDefaultCategories`). "Other" (`isDefault`) can't be
  archived. Archive instead of delete so old entries keep their category.
- **The 988 help button stays visible** on sign-in and in the app shell (sidebar card on desktop,
  header pill on phone). Copy in `react/src/config/content.config.ts`.
- `@kozy-dozy/foundation` sends signed-in users to `/admin/dashboard`; `App.tsx` redirects
  `/admin/*` to `/`. Don't use the shared `AuthorityGuard` (it would loop on `/`).
- Sign-up creates the 12 starter categories (`ensureDefaultCategories`). Without `MAILERSEND_API_KEY`,
  dev (`NODE_ENV` not production) prints confirm-email and password-reset links to the server log.
  `create:admin <email> <password>` on an existing email resets its password and verifies it.
- **Placeholder content is dummy data, not TODO notes.** Sample entries: `express/src/scripts/seed-data/`.

## Design system

"Still water", **light only. No light/dark mode, no toggle** (Jacob, 2026-11-08). Tokens in
`react/src/config/brand.tokens.ts` (`steadyTokens`, `@kozy-dozy/tokens` v2 single scheme).

| Role | Token | Hex |
|---|---|---|
| CTA, links, selected pills, intensity dots | `primary` / `primaryHover` | #2C6170 / #224E5A |
| Anxiety chip, active nav | `primaryLight` | #DCEAEE |
| Depression chip | `secondaryLight` | #E4E1F0 |
| Saved / resolved moments | `accentGold` (sand) | #E3C9A0 (dark text only) |
| Page / card / muted | `bg.page` / `bg.card` / `bg.muted` | #F3F6F7 / #FFF / #E6EDEF |
| Text / muted | `text.primary` / `text.muted` | #1C2B30 / #556A70 |
| Status chips | Active / Improving / Resolved | #8A2E1B on #FBE9E4 · #6B4A12 on #F6EBD5 · #1E5E36 on #DDF0E4 |

Fonts: **Outfit** (headings) + **Atkinson Hyperlegible** (body), link in `react/index.html`.
Buttons: pill, mixed case, flat. Touch targets ≥ 44px. App primitives:
`react/src/views/app/components/ui.ts`.

## Frontend

- Routes (`App.tsx`): `AuthLayout` (sign-in, sign-up, email-confirmed, forgot, reset) and, behind
  `ProtectedRoute`, `AppShell` (sidebar ≥1024px; header + bottom tabs + FAB on phone) with `/`,
  `/worries/new`, `/worries/duplicates`, `/worries/:id`, `/categories`, `/account`.
- Screens live in `views/app/pages/*`; shared pieces in `views/app/components/*`
  (`WorryForm` has `quick` and `full` variants), helpers in `views/app/utils/*`.
- Data via `services/shared/{Worry,Category}Service.ts` in `useEffect`; never fetch in components.
- Formik + Yup, dayjs, `react-icons/lu`. Last-used category is remembered in `localStorage`.

## Backend

Module pattern: `modules/<feature>/{route,controller,model,index}.ts`, `asyncHandler`,
`/summary`, `/duplicates`, `/similar` and `/reorder` declared before `/:id`.

Modules: admin (counts only), auth (with `/signup`), **categories**, members, status, **worries**.
Removed from the base: contact, projects, quotes, services, siteContent, sitemap, testimonial, s3.

## Deploy

Vercel (react: root `react`, include files outside root, `NODE_AUTH_TOKEN` in all three envs).
Render (express: root `express`, `yarn install && yarn build`, `yarn start`, plus
`FIELD_ENCRYPTION_KEY`). MongoDB, MailerSend (password reset). No S3. Commits authored by
`Jacob Kunz <jkunz@kozydozy.com>` (Vercel Hobby). Main branch: `master`.

## What NOT to do

- No Tailwind, no npm, no committed `.env` files
- No public pages, analytics on entry text, or sharing features
- No dark mode or theme toggle
- No white text on sand (`accentGold`)
- Don't make the quick-add form longer: details stay behind "More details"
- Never remove or hide the 988 help button
