# File Share Application

A simple file sharing application similar to Send Anywhere.

## Features

- Upload files and get a 6-digit code
- Download files using the code
- Files expire after 10 minutes
- Works across different browsers and devices
- No file size limit (configurable)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

The server will run on `http://localhost:3000`

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Build Command: `npm install`
5. Start Command: `npm start`

### Deploy to Railway

1. Push code to GitHub
2. Create new project on Railway
3. Connect your repository
4. Railway will auto-detect and deploy

## API Endpoints

- `POST /upload` - Upload a file
- `GET /download/:code` - Download file by code
- `GET /check/:code` - Check if code is valid
- `GET /health` - Health check

## Environment Variables

- `PORT` - Server port (default: 3000)

## Project Structure

```
file-share-backend/
├── server.js           # Express server
├── package.json        # Dependencies
├── public/
│   ├── index.html     # Frontend UI
│   └── app.js         # Frontend logic
└── uploads/           # Temporary file storage
```
