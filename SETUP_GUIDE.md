# BERI Setup and Testing Guide

Complete step-by-step instructions for setting up and running the BERI Policy Assistant with Python backend and sentence-transformers.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Adding the Beri Logo](#adding-the-beri-logo)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18.0.0 or higher)
  - Download: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Python** (v3.9 or higher)
  - Download: https://www.python.org/downloads/
  - Verify installation: `python --version` or `python3 --version`

- **pip** (comes with Python)
  - Verify installation: `pip --version` or `pip3 --version`

### Browser Requirements
- **Chrome 113+** or **Edge 113+** (for WebGPU support)
- At least **4GB RAM** available
- ~500MB free disk space for model caching

---

## Adding the Beri Logo

1. Save the Beri logo image you have to the following location:
   ```
   public/images/beri-logo.png
   ```

2. The logo should be:
   - PNG format with transparent background
   - Approximately 200x80 pixels (or similar aspect ratio)
   - High resolution for crisp display

3. If you don't have the logo yet, the application will fall back to using an emoji (🎓)

---

## Backend Setup

### Step 1: Navigate to the Backend Directory
```bash
cd backend
```

### Step 2: Create a Python Virtual Environment (Recommended)

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` appear in your terminal prompt.

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- sentence-transformers (embeddings model)
- PyPDF2 (PDF processing)
- numpy (numerical operations)
- pydantic (data validation)

**Note:** This may take 3-5 minutes as it downloads the necessary packages.

### Step 4: Verify Backend Installation
```bash
python main.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Loading sentence-transformers model...
INFO:     Model loaded successfully!
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal window open!** The backend server needs to run continuously.

---

## Frontend Setup

### Step 1: Open a New Terminal Window
Leave the backend server running and open a **new terminal window**.

### Step 2: Navigate to Project Root
```bash
cd /path/to/Beri_trial_policies
```

### Step 3: Install Node Dependencies
```bash
npm install
```

This will install:
- React & React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- @xenova/transformers (browser-based ML)
- @mlc-ai/web-llm (local language model)
- And other dependencies

**Note:** This may take 2-3 minutes.

### Step 4: Verify Frontend Installation
```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## Running the Application

You need **TWO terminal windows** running simultaneously:

### Terminal 1: Backend Server
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend Dev Server
```bash
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

### Accessing the Application
1. Open your browser (Chrome or Edge)
2. Navigate to: **http://localhost:5173/**
3. Wait for the application to initialize (this may take 1-2 minutes on first load as models are downloaded)

---

## Testing the Application

### Test 1: Backend Health Check

**In Terminal or Browser:**
```bash
curl http://localhost:8000/health
```

**Or visit in browser:**
```
http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "num_chunks": 0
}
```

### Test 2: Upload a PDF Policy Document

1. **Prepare a test PDF:**
   - Use any of the PDFs from the `raw/` directory
   - Or use your own policy document

2. **In the BERI web interface:**
   - Click the upload area or drag and drop a PDF
   - Wait for processing (should take 5-15 seconds depending on file size)
   - You should see a success message with the number of chunks created

3. **Verify upload:**
   ```bash
   curl http://localhost:8000/health
   ```

   The `num_chunks` should now be greater than 0.

### Test 3: Ask a Question

1. **In the chat interface, type a question like:**
   ```
   What is the e-safety policy regarding social media?
   ```

2. **Expected behavior:**
   - Your question appears in the chat
   - BERI shows "is typing..."
   - Response streams in word-by-word
   - Sources are shown below the response

3. **Verify the response includes:**
   - Relevant information from the uploaded document
   - Source citations at the bottom
   - British English spelling and grammar

### Test 4: Upload Multiple Documents

1. Upload 2-3 different policy PDFs
2. Ask a question that spans multiple policies:
   ```
   How do the data protection and e-safety policies work together?
   ```

3. **Verify:**
   - Response draws from multiple documents
   - Multiple sources are cited
   - Information is synthesized coherently

### Test 5: Clear Data

1. Click the "Clear All" button in the uploader
2. Check backend health:
   ```bash
   curl http://localhost:8000/health
   ```

   `num_chunks` should be back to 0

---

## Complete Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Application loads in browser
- [ ] Models download and initialize (first load only)
- [ ] Status indicator shows "Ready"
- [ ] Can upload a PDF successfully
- [ ] PDF is processed and chunked
- [ ] Can ask a question and receive a response
- [ ] Response includes source citations
- [ ] Can upload multiple PDFs
- [ ] Can clear all data
- [ ] Chat interface scrolls properly
- [ ] Logo displays correctly (or emoji fallback works)

---

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem: Port 8000 already in use**
```bash
# Find and kill the process using port 8000
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
# Then kill the PID shown
taskkill /PID <PID> /F
```

**Problem: Model loading fails**
```bash
# Ensure you have enough disk space (need ~2GB)
df -h

# Try clearing pip cache and reinstalling
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

### Frontend Issues

**Problem: `npm: command not found`**
- Install Node.js from https://nodejs.org/

**Problem: `Cannot connect to backend server`**
- Verify backend is running on http://localhost:8000
- Check terminal for backend errors
- Try visiting http://localhost:8000/health in browser

**Problem: WebGPU not supported**
- Use Chrome 113+ or Edge 113+
- Check: chrome://gpu/ to verify WebGPU is enabled
- Try Chrome Canary if stable version doesn't work

**Problem: Models won't download**
- Check internet connection
- Clear browser cache (Ctrl+Shift+Delete)
- Check available disk space
- Try in incognito mode

**Problem: Upload fails**
```bash
# Check backend logs for errors
# Common issue: PDF has no extractable text
# Solution: Use a different PDF or OCR the document
```

### General Issues

**Problem: Application is slow**
- First load is always slow (model download)
- Subsequent loads should be faster (models cached)
- Ensure no other heavy applications running
- Close unnecessary browser tabs

**Problem: Responses are gibberish**
- Model may not be fully loaded
- Try refreshing the page
- Check browser console for errors (F12)

**Problem: No sources shown**
- No PDFs uploaded yet
- Upload at least one PDF before asking questions
- Check backend has chunks: `curl http://localhost:8000/health`

---

## API Endpoints Reference

### Health Check
```bash
GET http://localhost:8000/health
```

### Upload PDF
```bash
POST http://localhost:8000/upload-pdf
Content-Type: multipart/form-data
Body: file=<pdf-file>
```

### Query Policies
```bash
POST http://localhost:8000/query
Content-Type: application/json
Body: {"query": "your question", "top_k": 4}
```

### Clear Data
```bash
POST http://localhost:8000/clear
```

---

## Command Quick Reference

### Start Backend
```bash
cd backend
source venv/bin/activate
python main.py
```

### Start Frontend
```bash
npm run dev
```

### Stop Servers
- Press `Ctrl+C` in each terminal window

### Deactivate Virtual Environment
```bash
deactivate
```

---

## Next Steps

After successful testing:

1. **Production Build:**
   ```bash
   npm run build
   ```

2. **Deploy Backend:**
   - Consider using Railway, Render, or AWS
   - Update CORS settings in `backend/main.py`

3. **Deploy Frontend:**
   - Upload `dist/` folder to Netlify, Vercel, or GitHub Pages
   - Update API URL in `src/lib/api.js`

4. **Customize:**
   - Add more policies
   - Adjust chunk size and overlap
   - Customize system prompt
   - Add authentication

---

## Support

If you encounter issues not covered here:
1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for Python errors
3. Verify all prerequisites are installed correctly
4. Try clearing all caches and starting fresh

Enjoy using BERI! 🎓
