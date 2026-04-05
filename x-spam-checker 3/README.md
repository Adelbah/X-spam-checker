# X Spam Compliance Checker

A platform that automatically analyzes any X (Twitter) account for spam policy violations — just enter a handle.

---

## How it works

1. User enters an X handle
2. The frontend calls YOUR backend (on Vercel)
3. The backend fetches real data from the X API (tweets, follower counts, activity)
4. Claude analyzes everything against X's rules
5. Results are shown — your API keys never leave the server

---

## Step-by-step setup

### Step 1 — Get your X API credentials

1. Go to https://developer.twitter.com
2. Sign in with your X account
3. Click **"Sign up for Free Account"** (the free tier is enough)
4. Create a new **Project** and **App**
5. In your app settings, find **"Keys and Tokens"**
6. Copy your **Bearer Token** — you'll need this

### Step 2 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** and create a new key
4. Copy it — you'll need this too

### Step 3 — Set up the project on your computer

You need Node.js installed. If you don't have it:
- Download from https://nodejs.org (choose the LTS version)

Then open your terminal (Command Prompt on Windows, Terminal on Mac) and run:

```bash
# 1. Go into the project folder
cd x-spam-checker

# 2. Install dependencies
npm install

# 3. Open the .env.local file and paste your keys
```

Open `.env.local` in any text editor and replace the placeholder values:

```
X_BEARER_TOKEN=paste_your_x_bearer_token_here
ANTHROPIC_API_KEY=paste_your_anthropic_key_here
```

### Step 4 — Test it locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Try entering any X handle!

### Step 5 — Deploy to Vercel (go live!)

1. Go to https://vercel.com and sign up with GitHub
2. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Then create a repo on github.com and follow their instructions to push
   ```
3. In Vercel, click **"Add New Project"** and import your GitHub repo
4. Before deploying, go to **Environment Variables** in Vercel and add:
   - `X_BEARER_TOKEN` → your X Bearer Token
   - `ANTHROPIC_API_KEY` → your Anthropic API key
5. Click **Deploy** — Vercel gives you a live URL!

> ⚠️ IMPORTANT: Never commit your `.env.local` file to GitHub. It's already in `.gitignore` so this is handled automatically.

---

## What gets analyzed

- **Posting frequency** — average and max posts per day vs X's limits
- **Follower/following ratio** — unusual ratios flag spam
- **Account age vs activity** — new accounts posting heavily are flagged
- **Content duplication** — repeated/identical tweets detected
- **Engagement patterns** — likes/replies/retweets analyzed
- **Peak posting hours** — bot-like posting at odd hours detected
- **Profile completeness** — incomplete profiles are a spam signal
- **Bio analysis** — spam keywords flagged

---

## Project structure

```
x-spam-checker/
├── pages/
│   ├── index.js          ← frontend UI (React)
│   └── api/
│       └── check.js      ← secure backend (your API keys live here)
├── styles/
│   ├── globals.css
│   └── Home.module.css
├── .env.local            ← your secret keys (NEVER share this)
├── .gitignore            ← keeps .env.local out of git
└── package.json
```

---

## Need help?

If something isn't working, common issues:

- **"User not found"** — the X handle might not exist or the account is private
- **"Analysis failed"** — check your API keys in `.env.local` are correct
- **X API rate limits** — the free tier allows 500,000 tweet reads/month. More than enough for most use.
