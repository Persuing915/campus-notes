# 📚 Campus Notes — SY CSE

A MERN stack web app for Second Year CSE students to upload and download study notes.

## Features
- Register/Login (JWT auth)
- Upload notes (PDF, DOC, PPT, TXT, Images — max 20MB)
- Download notes
- Filter by subject
- Search by title
- Delete your own notes
- Download counter

## Tech Stack
- **Frontend:** React, React Router, Axios, React Toastify
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **File Upload:** Multer

---

## Setup & Run

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Start MongoDB
Make sure MongoDB is running locally on port 27017.

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

Open http://localhost:3000
