# 🚀 Deploy Campus Notes — Step by Step

---

## STEP 1 — Upload code to GitHub (5 minutes)

1. Go to https://github.com → Sign up (free)
2. Click green **"New"** button → Repository name: `campus-notes`
3. Click **"Create repository"**
4. Open terminal in your project folder (WEB folder) and run:

```bash
git init
git add .
git commit -m "campus notes app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campus-notes.git
git push -u origin main
```
Replace YOUR_USERNAME with your GitHub username.

---

## STEP 2 — MongoDB Atlas (Free Database) (5 minutes)

1. Go to https://mongodb.com/atlas → Click **"Try Free"**
2. Sign up with Google or Email
3. Choose **FREE** plan (M0 Sandbox)
4. Choose any region → Click **"Create"**
5. Username: `campusadmin` | Password: `campus123` → Click **"Create User"**
6. Click **"Add My Current IP"** → then also add `0.0.0.0/0` → Click **"Finish"**
7. Click **"Connect"** → **"Drivers"** → Copy the string that looks like:
   ```
   mongodb+srv://campusadmin:campus123@cluster0.xxxxx.mongodb.net/campus_notes
   ```
   ⚠️ Save this — you need it in Step 3

---

## STEP 3 — Render (Free Backend) (5 minutes)

1. Go to https://render.com → Click **"Get Started for Free"**
2. Sign up with **GitHub**
3. Click **"New +"** → **"Web Service"**
4. Connect your `campus-notes` GitHub repo
5. Fill in:
   - Name: `campus-notes-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: **Free**
6. Scroll down → Click **"Add Environment Variable"** → Add these 3:

   | Key | Value |
   |-----|-------|
   | MONGO_URI | paste your MongoDB string from Step 2 |
   | JWT_SECRET | campusnotes_secret_2024 |
   | FRONTEND_URL | https://campus-notes.vercel.app |

7. Click **"Create Web Service"**
8. Wait 2-3 minutes → You get a URL like:
   ```
   https://campus-notes-backend.onrender.com
   ```
   ⚠️ Save this URL — you need it in Step 4

---

## STEP 4 — Update Frontend with Backend URL

Open file: `frontend/src/api/axios.js`
Change the URL to your Render URL:
```js
const API = axios.create({ 
  baseURL: 'https://campus-notes-backend.onrender.com/api'
});
```

Then push to GitHub again:
```bash
git add .
git commit -m "update api url"
git push
```

---

## STEP 5 — Vercel (Free Frontend) (3 minutes)

1. Go to https://vercel.com → Click **"Sign Up"**
2. Sign up with **GitHub**
3. Click **"Add New Project"**
4. Import your `campus-notes` repo
5. Fill in:
   - Root Directory: `frontend`
   - Framework: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Click **"Deploy"**
7. Wait 2 minutes → You get a URL like:
   ```
   https://campus-notes.vercel.app
   ```

---

## STEP 6 — Update CORS on Backend

Go to Render → Your service → Environment → Update:
```
FRONTEND_URL = https://campus-notes.vercel.app
```
Click **"Save Changes"** → Render will redeploy automatically.

---

## ✅ Done! Your website is live at:
```
https://campus-notes.vercel.app
```

Share this link with your classmates — anyone can register and use it!

---

## ⚠️ Important Notes
- Render free tier sleeps after 15 min — first load may take 30 seconds
- MongoDB Atlas free = 512MB storage (enough for thousands of notes)
- Vercel free = unlimited frontend hosting
