# Event Management System - Deployment Guide

## System Overview
This is a full-stack Event Management System built with:
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: Next.js (React), Tailwind CSS

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)
- Vercel CLI (optional for frontend deployment)

## 1. Backend Setup (`d:/FYP/event/backend`)

### Environment Variables
Ensure `.env` file exists in `backend/` with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=production
```

### Install & Run
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### Troubleshooting Connection
- **"querySrv ENOTFOUND"**: This indicates a DNS/Network issue connecting to MongoDB Atlas.
    - **Fix**: Check `backend/src/config/db.js` and ensure you have internet access.
    - **Password**: Ensure needed to replace `<db_password>` in `.env` with your real password.
    - **Offline Mode**: Ensure a local MongoDB is running at `mongodb://127.0.0.1:27017`.
- **"Registration failed"**: This means the frontend cannot talk to the backend. Ensure the backend is running (`npm start`) on port 5000.

## 2. Frontend Setup (`d:/FYP/event/frontend`)

### Environment Variables
Ensure `.env.local` file exists in `frontend/` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Install & Build
```bash
cd frontend
npm install
npm run build
npm start
```
The app will be available at `http://localhost:3000`.

## 3. Deployment

### Backend (AWS/Render/Heroku)
1. Push `backend` folder to your git repository.
2. Connect to hosting provider.
3. Set Environment Variables in the dashboard.
4. Deploy.

### Frontend (Vercel)
1. Push `frontend` folder to your git repository.
2. Import project into Vercel.
3. Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://my-ems-backend.onrender.com/api`).
4. Deploy.

## 4. Verification
- Visit the deployed frontend URL.
- Register a new account (Organizer Role).
- Create a test event.
- Verify it appears on the dashboard.
