# Centralized Expense Manager

A small React app for tracking shared cash contributions and expenses within a
group (e.g. a Ganesh Chaturthi mandal committee). Firebase Firestore is the
only backend — there is no custom server, and no Firebase Authentication
either. Deployed on Vercel.

## How login works

- **Admin** — fixed login: email `admin@ganesh.com`, password
  `ganpatibappa morya`. Checked in the app itself (see `src/constants.js`),
  not via any Firebase Auth service. Full CRUD over contributions and every
  expense, plus managing the team member list.
- **Team members** — pick their name from a list the admin maintains (Admin
  dashboard → **Team** tab). No password. They can add expenses and
  edit/delete only their own (enforced in the UI by comparing names).

There is intentionally no Firebase Authentication setup here — logging in is
just a name/password check in the browser, and Firestore access isn't tied to
a signed-in identity. That keeps setup to "create a project, turn on
Firestore, paste config" with nothing else to configure.

> **Trade-off to know about:** because there's no auth layer, Firestore
> itself can't verify *who* is writing — it can only check that a document
> looks right (has an amount, a name, etc.). Anyone who has your app's URL
> and is willing to open the browser console could write directly to
> Firestore, bypassing the UI's "only edit your own" rule. This is a
> deliberate simplicity trade-off for a small, trusted private group (family,
> a committee) — don't use this setup for anything sensitive, and don't
> publish the app URL beyond the group.

---

# Part A — Firebase setup (do this once, independent of Vercel)

## 1. Create a Firebase project and enable Firestore

1. Go to the [Firebase Console](https://console.firebase.google.com/) and
   click **Add project** (the free "Spark" plan is enough).
2. In the left sidebar go to **Build → Firestore Database** and click
   **Create database**. Pick a region close to your users and start in
   **production mode** (we supply our own rules below).

That's the only Firebase Console setup needed — no Authentication providers
to enable, no manual user creation.

## 2. Find your Firebase config

1. In the Firebase Console, click the gear icon → **Project settings**.
2. Under **Your apps**, click the **</>** (web) icon to register a new web
   app (any nickname is fine; you don't need Firebase Hosting).
3. Firebase shows a `firebaseConfig` object — that's the JSON you need:

   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   }
   ```

   You can always get back to this screen later from **Project settings →
   Your apps → SDK setup and configuration → Config**.

## 3. Environment variables

The app reads its Firebase config from environment variables (never hardcode
them in source). Copy `.env.example` to `.env.local` and fill in the values
from step 2:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

- **Local dev:** put these in a file named `.env.local` in the project root
  (it's git-ignored, so real values never get committed). Vite only exposes
  variables prefixed with `VITE_` to client code, which is why the names
  above all start with `VITE_`.
- **Vercel deployment:** in your Vercel project, go to **Settings →
  Environment Variables** and add each of the six variables above (same
  names, same values), then redeploy.

## 4. Deploy the Firestore security rules

The rules live in [`firestore.rules`](firestore.rules) at the repo root.
They validate that documents have the right shape (a positive amount, a
non-empty name, etc.) but — since there's no login backend — can't restrict
*who* writes. See the trade-off note above.

Deploy them with the [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pick your Firebase project, alias it e.g. "default"
firebase deploy --only firestore:rules
```

Or just paste the contents of `firestore.rules` into **Firestore Database →
Rules** in the Firebase Console and click **Publish** — whichever is quicker.

By the end of Part A you should have: a Firestore database, and the 6
`VITE_FIREBASE_*` values from step 2 written down somewhere. Everything below
is independent of *how* you host the app.

## 5. (Optional) run locally first

```bash
npm install
npm run dev
```

Uses the values from `.env.local` (step 3). Open the printed local URL
(typically `http://localhost:5173`), log in as Admin, go to **Team**, and add
your group's names. Skip straight to Part B if you'd rather just deploy.

---

# Part B — Deploy to Vercel

You need the repo pushed to GitHub (or GitLab/Bitbucket) and the 6
`VITE_FIREBASE_*` values from Part A, step 2.

1. Push this repository to GitHub (or GitLab/Bitbucket) if you haven't
   already:
   ```bash
   git init                      # skip if already a git repo
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and sign in (GitHub login is
   easiest). Click **Add New → Project** and import this repo.
3. Vercel auto-detects the **Vite** framework preset — leave the build
   settings as-is (build command `vite build`, output directory `dist`,
   install command `npm install`).
4. Before clicking Deploy, open **Environment Variables** on the same
   import screen (or afterwards under **Settings → Environment Variables**)
   and add all six, applied to Production, Preview, and Development:

   | Name | Value |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | from Firebase config |
   | `VITE_FIREBASE_AUTH_DOMAIN` | from Firebase config |
   | `VITE_FIREBASE_PROJECT_ID` | from Firebase config |
   | `VITE_FIREBASE_STORAGE_BUCKET` | from Firebase config |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase config |
   | `VITE_FIREBASE_APP_ID` | from Firebase config |

5. Click **Deploy**. Vercel builds and gives you a live `*.vercel.app` URL.
6. Open the URL, log in as Admin, go to **Team**, and add your group's
   names so people can log in.

That's it — every future `git push` to your default branch triggers an
automatic redeploy. If you ever rotate the Firebase project or its config,
update the same env vars in **Settings → Environment Variables** and
redeploy (Vercel's "..." menu → **Redeploy**, or just push a commit).

---

## Project structure

```
src/
  constants.js          Admin email/password, session storage key
  firebase.js           Firebase app/firestore init from env vars
  context/
    AuthContext.jsx      Login state: admin vs named user (localStorage only)
    ConfirmContext.jsx   Reusable "are you sure?" confirmation modal
  hooks/
    useCollection.js     Real-time Firestore listener (onSnapshot)
  components/
    ProtectedRoute.jsx   Requires any logged-in session
    AdminRoute.jsx       Requires the admin session (route-level gate)
    NavBar.jsx, BalanceSummary.jsx
    ExpenseForm.jsx, ExpenseList.jsx
    ContributionForm.jsx, ContributionList.jsx
    ManageMembers.jsx    Admin: add/remove names in the `members` collection
  pages/
    LoginPage.jsx, UserDashboard.jsx, AdminDashboard.jsx
firestore.rules          Shape-validation rules (see trade-off note above)
```

To change the admin email/password, edit `src/constants.js`.

## Testing the core flows

Before relying on this for a real event, click through:

1. **Team setup (as admin):** log in as Admin, go to **Team**, add a couple
   of names, confirm they appear and can be removed.
2. **Contribution CRUD (as admin):** add a contribution, confirm the total
   budget updates instantly; edit its amount, confirm the total updates;
   delete it, confirm it disappears and the total drops.
3. **Expense CRUD (as a team member):** log in as one of the names you
   added, add an expense, confirm it appears for everyone (open a second
   browser/incognito window logged in as another name). Confirm you
   **cannot** edit/delete another member's expense (no Edit/Delete buttons
   should appear on their rows).
4. **Expense CRUD (as admin):** confirm the admin sees Edit/Delete on
   *every* expense regardless of who added it.
5. **Balance recalculation:** with two browser windows open side-by-side
   (one admin, one team member), add/edit/delete on one side and confirm the
   Total Budget / Total Spent / Remaining Balance update live on the other
   without a refresh.
6. **Access control:** while logged in as a team member, navigate directly to
   `/admin` in the URL bar — you should be redirected to `/dashboard`, not
   shown the admin screen.

## SEO

Basic on-page SEO is in place, targeting "Ambika cha Raja" / "Ambika Ganapati":

- `index.html` — title, meta description/keywords, Open Graph & Twitter card
  tags (for WhatsApp/social link previews), a `WebSite` JSON-LD block, and an
  emoji favicon (no image files needed).
- `src/pages/LoginPage.jsx` — the visible `<h1>` uses the same keywords (on-page
  text matters as much as meta tags).
- `public/robots.txt` and `public/sitemap.xml` — basic crawl hints.

**One thing to fix after you deploy:** search and replace
`REPLACE_WITH_YOUR_DOMAIN` in `index.html` (3 spots: canonical link, `og:url`,
and the JSON-LD `url`), `public/robots.txt`, and `public/sitemap.xml` with
your real Vercel URL or custom domain (e.g. `ambika-expense-manager.vercel.app`).
Then commit and redeploy.

To actually get indexed by Google, see the Google Search Console + Chrome
Lighthouse steps your conversation with Claude covered — in short: verify the
site in Search Console, submit `sitemap.xml`, and request indexing for the
homepage URL.
