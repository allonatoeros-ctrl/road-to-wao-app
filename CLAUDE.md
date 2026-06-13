# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server on localhost:5173
npm run build        # production build
npm run lint         # ESLint
```

### Playwright tests

**Antigravity modifies files. The user terminal runs Playwright. Never run Playwright from Antigravity (EPERM sandbox errors).**

```bash
# Mocked local E2E (run after any logic change to App/Profile/Messages/Admin/roadToWaoDb.js)
npx playwright test tests/e2e/road-to-wao-current-flows.spec.js --reporter=line --timeout=30000 --output=/tmp/wao-playwright-results-current
npx playwright test tests/e2e/road-to-wao-request-isolation.spec.js --reporter=line --timeout=30000 --output=/tmp/wao-playwright-results
npx playwright test tests/e2e/road-to-wao-admin-cleanup-safety.spec.js --reporter=line --timeout=30000 --output=/tmp/wao-admin-cleanup-safety

# Vercel smoke — real Supabase, read-only (run after Vercel deploy)
./scripts/run-vercel-user-isolation-smoke.sh

# Vercel smoke — real Supabase, creates TEST VERCEL records
./scripts/run-vercel-ride-lifecycle-smoke.sh
./scripts/run-vercel-general-request-lifecycle-smoke.sh
```

Smoke scripts ask for Luca / Sara / Admin passwords interactively. Passwords are never saved.

Before any commit:
```bash
git status --short   # ensure test-results/, playwright-report/, .last-run.json are NOT staged
```

## Architecture

**Single-page React app** — one App.jsx orchestrates all state. Navigation is tab-based (BottomNav), not React Router.

```
src/
  App.jsx                  # root — all global state, auth, data fetching
  services/
    supabaseClient.js      # Supabase init + isSupabaseConfigured guard
    roadToWaoDb.js         # all DB operations (rides, join requests, general requests, admin cleanup)
  components/
    RoadBoard.jsx          # ride listings with filter/sort
    OfferRideModal.jsx     # create ride form
    JoinRequestModal.jsx   # join ride form
    MessagesPanel.jsx      # user's active requests and ride status
    AdminPanel.jsx         # Control Room — all rides, join requests, general requests + cleanup
    ProfilePanel.jsx       # user profile editor
    CosmicAppShell.jsx     # layout shell
    BottomNav.jsx          # tab navigation
    SolarHeroBackground.jsx
```

**Data flow:** `roadToWaoDb.js` wraps every Supabase call and includes an `isSupabaseConfigured` guard — when Supabase env vars are missing, functions return safe mock errors instead of throwing, which is what allows the mocked Playwright tests to work without a real DB.

**Three user roles:**
- Luca (`luca.driver.demo@roadtowao.local`) — driver, creates rides
- Sara (`sara.raver.demo@roadtowao.local`) — raver, joins rides / sends general requests
- Admin (`allonatoeros@gmail.com`) — full Control Room access + cleanup

**Test data safety rule:** Any record created by automated tests must include label `TEST VERCEL` in its content. The `isTestVercelRecord()` function in `roadToWaoDb.js` identifies these — admin cleanup only targets them.

## Supabase schema

Schema file: `supabase/road_to_wao_schema_v1.sql`

Tables: `rides`, `join_requests`, `general_requests`. All auth via Supabase Auth (email/password).

## Playwright test levels

| Level | What | Supabase | Safe to run anytime |
|-------|------|----------|---------------------|
| Local mocked E2E (`tests/e2e/`) | Logic, state, isolation, cleanup | Mocked | ✅ yes |
| Vercel read-only smoke (`tests/smoke/*-real.spec.js`) | Login, session isolation | Real, no writes | ✅ yes |
| Vercel mutation smoke (`tests/smoke/*-lifecycle*.spec.js`) | Full flows | Real, TEST VERCEL writes | ⚠️ after deploy only |

Next tests to add (in order): `tests/e2e/road-to-wao-status-archive-rules.spec.js`, then `tests/smoke/road-to-wao-vercel-admin-control-room-readonly.spec.js`.
