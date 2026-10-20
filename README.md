# G-NOTES

Handwritten notes, with a brain for every subject. A single-page app: `index.html` is the whole thing.

## Run it locally

```bash
python -m http.server 8080
```

Open http://localhost:8080. It opens to the home page: sign in (or continue without an account), then pick a subject.

## Put it on GitHub

```bash
git init
git add .
git commit -m "G-NOTES"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Every push to `main` runs `.github/workflows/pages.yml` and publishes the site at
`https://<you>.github.io/<repo>/`. On an iPad, open that address in Safari and use
**Share → Add to Home Screen** to get it as an app (`manifest.webmanifest`, the PNG icons and `sw.js` set that up). After the first load it opens with no network: `sw.js` keeps the app and the PDF reader, and your notes already live on the device. Bump `CACHE` in `sw.js` when you want every device to drop its old copy.

## Accounts

All sign-in goes through one interface, `Auth`, in `index.html`. Which provider runs is chosen in `config.js`.

| provider | what it does |
| --- | --- |
| `local` (default) | Accounts live in this browser only. **Not secure** and not shared between devices. It exists so the whole flow works today. |
| `supabase` | Real accounts online: email + password, and GitHub sign-in. Written but not yet tried against a live project. |

### Turning on real accounts (Supabase, free tier)

1. Create a project at https://supabase.com.
2. **Authentication → Providers → GitHub**: enable it. Create a GitHub OAuth app
   (GitHub → Settings → Developer settings → OAuth Apps) with the callback URL Supabase shows you,
   and paste its client ID and secret into Supabase.
3. **Authentication → URL Configuration**: add your Pages address (`https://<you>.github.io/<repo>/`)
   as the Site URL and as a redirect URL.
4. Put the project URL and the public **anon** key in `config.js` and set `provider: 'supabase'`.
   The anon key is meant to be public. Never commit a service-role key.

## What is still to do

- **Per-account notebooks.** Right now there is one notebook per browser, whoever signs in. The next step is storing
  each notebook against the account's id (a Supabase table with row-level security, so people can only read their own).

## Questions: practice order, difficulty, mock exams

The **Questions** button opens a small menu: practise **in sequence** or in **random order** (a shuffled deck, so nothing repeats until every question has been drawn), build a **mock exam**, or manage the attached paper.

After each question you rate it 1 (easy) to 5 (could not do it). Ratings are kept as a history per question, so recent attempts count most and a question you have left alone for weeks drifts back toward uncertain. That rating is turned into a predicted chance of getting it right: 1 = 97%, 2 = 88%, 3 = 72%, 4 = 50%, 5 = 25%.

### How a mock exam is built, and why

| Rule in the builder | Evidence |
| --- | --- |
| Aim for a predicted score of about **85%** (78% for *Weak spots*, 72% for *Challenge*), not as hard as possible | Wilson, Shenhav, Straccia & Cohen (2019), "The Eighty Five Percent Rule for optimal learning", *Nature Communications* 10:4646. https://www.nature.com/articles/s41467-019-12552-4 |
| Include a minority of stretch questions rather than only comfortable ones | Bjork & Bjork (2011), "Making things hard on yourself, but in a good way: creating desirable difficulties to enhance learning", in *Psychology and the Real World* |
| Mix sections: no two neighbouring questions come from the same section | Rohrer & Taylor (2007), *Instructional Science* 35; Taylor & Rohrer (2010), *Applied Cognitive Psychology* 24. Interleaved practice scored 63% on a later test against 20% for blocked practice, although it felt harder during practice. https://digitalcommons.usf.edu/psy_facpub/1760/ |
| Being tested beats rereading, and corrective feedback strengthens it, so questions you rated 4 or 5 come back first | Roediger & Karpicke (2006), *Perspectives on Psychological Science* 1(3); Rowland (2014), *Psychological Bulletin* 140(6) |
| The longer since you last saw a question, the more due it is; anything seen in the last 30 minutes is skipped | Cepeda, Pashler, Vul, Wixted & Rohrer (2006), "Distributed practice in verbal recall tasks", *Psychological Bulletin* 132(3). https://www.yorku.ca/ncepeda/publications/CPVWR2006.html |
| The mix is recomputed from your own ratings every time | Kalyuga, Ayres, Chandler & Sweller (2003), "The expertise reversal effect", *Educational Psychologist* 38(1): what helps a beginner stops helping as expertise grows |
| A few easier questions first, the stretch questions last | Studies of item order find easy-to-hard tests give equal or slightly better scores and less anxiety than hard-first (mixed evidence; no study found it worse) |

The steps: score every question (predicted success, how overdue, whether you missed it last time, a little randomness); fill quotas of easy / core / stretch questions by that score; swap questions in or out until the predicted score reaches the target; order warm-up, then core, then stretch, mixing sections within each; budget time from the ratings (about 2 + 1.5 x difficulty minutes per question).

Limits worth knowing: the 85% result is a theoretical result for training on a task, applied here as a design target and not a proven optimum for exam revision; the difficulty ratings are your own judgement, not measured; and if two devices rate questions at once, both sets of ratings are kept.

## Files

| file | |
| --- | --- |
| `index.html` | the app |
| `config.js` | public settings, including which sign-in provider to use |
| `manifest.webmanifest`, `icon.svg` | installable-app details |
| `.github/workflows/pages.yml` | publishes the site to GitHub Pages |
