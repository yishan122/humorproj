# Project 1 Test Plan (Caption Creation + Rating App)

## Scope
This document covers **Project 1 only** (as requested): the caption creation and rating workflow.

## Branch-based test tree

### A. Entry & configuration branch
1. Open `/` with valid Supabase env vars.
   - Expected: News snippets (or configured data) render without crash.
2. Open `/` without Supabase env vars.
   - Expected: Friendly configuration message is shown instead of app crash.

### B. Authentication branch
1. Open `/login`.
   - Expected: Sign-in button appears.
2. Click **Sign in with Google**.
   - Expected: OAuth redirect starts and callback route is reachable.

### C. Protected area branch
1. Access `/protected` while unauthenticated.
   - Expected: access is blocked or redirected by existing auth logic.
2. Access `/protected` while authenticated.
   - Expected: upload and vote UI are available.

### D. Upload → caption generation branch
1. Select an image file.
   - Expected: local preview appears.
2. Click **Upload & Generate Captions**.
   - Expected sequence:
     - Step 1: Presigned URL generation
     - Step 2: Upload to presigned URL
     - Step 3: Register image URL
     - Step 4: Caption generation
3. Validate result formatting.
   - Expected: caption list renders regardless of API returning array/object shape.

### E. Rating/voting branch
1. Click upvote/downvote while unauthenticated.
   - Expected: user prompt to log in.
2. Click upvote/downvote while authenticated.
   - Expected: vote persisted via upsert and success feedback shown.

### F. Quality gates branch (release readiness)
1. Run lint.
2. Run production build.
3. Repeat full workflow 3 times.
   - Expected: all runs pass consistently.

## What was tested / issues found / fixes (2–3 bullets)
- Ran full workflow checks (`npm run lint` + `npm run build`) **3 times**; confirmed reproducible pass after fixes.
- Fixed build-breaking paths: removed runtime Google Font fetch dependency and prevented Supabase client initialization from failing during prerender.
- Fixed lint/type-flow issues in upload module (`any` handling + image preview rendering path), then revalidated all workflow runs.

## Submission notes
- Project 1 commit: `5c36c41` (latest tested commit at the time of validation).
- Vercel commit-specific URL for Project 1: _to be filled from your deployment dashboard_.
