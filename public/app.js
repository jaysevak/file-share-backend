const API_URL = window.location.origin;

let selectedFile = null;

// Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const uploadBtn = document.getElementById('uploadBtn');
const codeDisplay = document.getElementById('codeDisplay');
const shareCode = document.getElementById('shareCode');
const uploadStatus = document.getElementById('uploadStatus');
const codeInput = document.getElementById('codeInput');
const downloadBtn = document.getElementById('downloadBtn');
const downloadStatus = document.getElementById('downloadStatus');

// Upload area click
uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
    }
});

// File selection
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect() {
    selectedFile = fileInput.files[0];
    if (selectedFile) {
        fileName.textContent = selectedFile.name;
        fileSize.textContent = formatFileSize(selectedFile.size);
        fileInfo.classList.add('show');
        uploadBtn.disabled = false;
        codeDisplay.classList.remove('show');
        hideStatus(uploadStatus);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Upload file
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    uploadBtn.disabled = true;
    showStatus(uploadStatus, 'Uploading...', 'info');

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server error. Please try a smaller file or try again later.');
        }

        const result = await response.json();

        if (response.ok && result.success) {
            shareCode.textContent = result.code;
            codeDisplay.classList.add('show');
            showStatus(uploadStatus, 'Upload successful!', 'success');
            
            // Reset form
            setTimeout(() => {
                fileInput.value = '';
                selectedFile = null;
                fileInfo.classList.remove('show');
                uploadBtn.disabled = true;
            }, 1000);
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        showStatus(uploadStatus, 'Upload failed: ' + error.message, 'error');
        uploadBtn.disabled = false;
    }
});

// Code input - only numbers
codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Download file
downloadBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();

    if (code.length !== 6) {
        showStatus(downloadStatus, 'Please enter a valid 6-digit code', 'error');
        return;
    }

    downloadBtn.disabled = true;
    showStatus(downloadStatus, 'Checking code...', 'info');

    try {
        // Check if code is valid first
        const checkResponse = await fetch(`${API_URL}/check/${code}`);
        const checkResult = await checkResponse.json();

        if (!checkResult.valid) {
            throw new Error('Code not found or expired');
        }

        showStatus(downloadStatus, `Downloading ${checkResult.filename}...`, 'info');

        // Download file
        const downloadUrl = `${API_URL}/download/${code}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = checkResult.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showStatus(downloadStatus, 'Download started!', 'success');
        codeInput.value = '';
        
        setTimeout(() => {
            downloadBtn.disabled = false;
        }, 2000);
    } catch (error) {
        showStatus(downloadStatus, error.message, 'error');
        downloadBtn.disabled = false;
    }
});

// Status helpers
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status show ${type}`;
}

function hideStatus(element) {
    element.classList.remove('show');
}
