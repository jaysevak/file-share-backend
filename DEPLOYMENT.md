# Quick Deployment Guide

## Deploy to Render (Free)

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `jaysevak/file-share-backend`
5. Settings:
   - Name: `file-share-app`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Your app will be live at: `https://file-share-app.onrender.com`

## Deploy to Railway (Free)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `jaysevak/file-share-backend`
5. Railway auto-detects Node.js and deploys
6. Click "Generate Domain" to get public URL
7. Your app will be live at: `https://your-app.up.railway.app`

## Test Locally

```bash
cd file-share-backend
npm install
npm start
```

Open http://localhost:3000

## How to Use

1. **Send File:**
   - Click upload area or drag & drop file
   - Click "Upload File"
   - Share the 6-digit code

2. **Receive File:**
   - Enter the 6-digit code
   - Click "Download File"
   - File downloads automatically

## Features

✅ Works across different browsers/devices
✅ No localStorage or frontend storage
✅ Files expire after 10 minutes
✅ Clean, simple UI
✅ CORS enabled
✅ Production ready
