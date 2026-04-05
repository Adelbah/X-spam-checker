# X-spam-checker
this is a platform that help in analizing a users x post to be able to report wether the x handle has in some of it post spams or has break x rules
No worries at all! Here's everything from scratch, step by step.

---

## Step 1 — Install Node.js

Node.js is the engine that runs your app.

1. Go to **https://nodejs.org**
2. Click the big **"LTS"** download button
3. Open the downloaded file and install it (just keep clicking Next/Continue)
4. When done, you won't see any app open — that's normal, it works in the background

---

## Step 2 — Unzip the folder

- **Windows:** Right-click the zip file → **"Extract All"** → click Extract
- **Mac:** Just double-click the zip file

You'll now have a folder called **x-spam-checker**

---

## Step 3 — Rename two hidden files

Inside the folder you'll see **env.local** and **gitignore.txt** — rename them:

- `env.local` → `.env.local` *(add a dot at the very start)*
- `gitignore.txt` → `.gitignore` *(add a dot at the start, remove .txt)*

**On Windows** it may warn you about changing extensions — click **Yes**

---

## Step 4 — Get your X API key

1. Go to **https://developer.twitter.com**
2. Sign in with your X account
3. Click **"Sign up for Free Account"**
4. Fill in the form — describe it as a personal project
5. Once approved, click **"Create Project"** then **"Create App"**
6. Go to your app → **"Keys and Tokens"**
7. Copy the **Bearer Token** — save it somewhere temporarily

---

## Step 5 — Get your Anthropic API key

1. Go to **https://console.anthropic.com**
2. Sign up (free)
3. Click **"API Keys"** on the left
4. Click **"Create Key"** → copy it

---

## Step 6 — Paste your keys into the project

1. Open the **x-spam-checker** folder
2. Find the file now called **`.env.local`**
3. Open it with Notepad (Windows) or TextEdit (Mac)
4. Replace the placeholder text so it looks like this:

```
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAAyour_actual_token_here
ANTHROPIC_API_KEY=sk-ant-your_actual_key_here
```

5. Save and close the file

---

## Step 7 — Open Terminal inside the folder

**On Windows:**
1. Open the **x-spam-checker** folder
2. Click the address bar at the top (where it shows the folder path)
3. Type `cmd` and press Enter — a black window opens

**On Mac:**
1. Open the **x-spam-checker** folder in Finder
2. Right-click on an empty space inside the folder
3. Click **"New Terminal at Folder"**

---

## Step 8 — Install the project dependencies

In the terminal window, type this and press Enter:

```
npm install
```

You'll see a lot of text scrolling — that's normal. Wait for it to finish (1-2 minutes).

---

## Step 9 — Run the app

In the same terminal, type this and press Enter:

```
npm run dev
```

When you see **"ready on http://localhost:3000"** — your app is running!

---

## Step 10 — Open your app

Open your browser and go to:

**http://localhost:3000**

Type any X handle and click Analyze. It should work! 🎉

---

## Step 11 — Put it online (Vercel)

Once it's working locally, to get a public link:

1. Go to **https://github.com** and create a free account
2. Create a **New Repository**, name it `x-spam-checker`, keep it private
3. Download **GitHub Desktop** from **https://desktop.github.com** — this makes uploading easy
4. Open GitHub Desktop → **Add Existing Repository** → select your x-spam-checker folder
5. Click **Publish Repository**

Then:

6. Go to **https://vercel.com** and sign up with your GitHub account
7. Click **"Add New Project"** → select your `x-spam-checker` repo
8. Before clicking Deploy, scroll to **"Environment Variables"** and add:
   - Name: `X_BEARER_TOKEN` → paste your X token
   - Name: `ANTHROPIC_API_KEY` → paste your Anthropic key
9. Click **Deploy**

Vercel will give you a link like **https://x-spam-checker.vercel.app** that anyone can use!

---

**Stuck anywhere?** Just tell me exactly what you see on your screen and I'll help you through it.
