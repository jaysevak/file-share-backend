const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// In-memory storage for file metadata
const fileStore = new Map();

// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Auto-delete file after expiry
function scheduleFileDeletion(code, filePath, expiryTime) {
    const delay = expiryTime - Date.now();
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted expired file: ${filePath}`);
        }
        fileStore.delete(code);
        console.log(`Removed code: ${code}`);
    }, delay);
}

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const code = generateCode();
        const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes

        const fileData = {
            code: code,
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            expiryTime: expiryTime
        };

        fileStore.set(code, fileData);
        scheduleFileDeletion(code, req.file.path, expiryTime);

        res.json({
            success: true,
            code: code,
            filename: req.file.originalname,
            size: req.file.size,
            expiresIn: '10 minutes'
        });

        console.log(`File uploaded: ${req.file.originalname} with code: ${code}`);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Download endpoint
app.get('/download/:code', (req, res) => {
    try {
        const code = req.params.code;
        const fileData = fileStore.get(code);

        if (!fileData) {
            return res.status(404).json({ error: 'File not found or expired' });
        }

        if (Date.now() > fileData.expiryTime) {
            fileStore.delete(code);
            if (fs.existsSync(fileData.path)) {
                fs.unlinkSync(fileData.path);
            }
            return res.status(410).json({ error: 'File expired' });
        }

        if (!fs.existsSync(fileData.path)) {
            fileStore.delete(code);
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(fileData.path, fileData.originalName, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ error: 'Download failed' });
            } else {
                console.log(`File downloaded: ${fileData.originalName} with code: ${code}`);
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Check code validity endpoint
app.get('/check/:code', (req, res) => {
    const code = req.params.code;
    const fileData = fileStore.get(code);

    if (!fileData) {
        return res.json({ valid: false });
    }

    if (Date.now() > fileData.expiryTime) {
        return res.json({ valid: false });
    }

    res.json({
        valid: true,
        filename: fileData.originalName,
        size: fileData.size,
        expiresIn: Math.ceil((fileData.expiryTime - Date.now()) / 1000)
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', activeFiles: fileStore.size });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Upload endpoint: http://localhost:${PORT}/upload`);
    console.log(`Download endpoint: http://localhost:${PORT}/download/:code`);
});
