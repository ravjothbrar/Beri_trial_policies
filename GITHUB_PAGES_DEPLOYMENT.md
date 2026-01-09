# Deploy BERI to GitHub Pages

Complete guide to deploying your client-side BERI application to GitHub Pages.

## What You Get

- **Free hosting** on GitHub Pages
- **HTTPS** automatically enabled
- **No backend required** - everything runs in the browser
- **Upload PDFs** directly in the browser
- **Works offline** after first load (models cached)
- **URL**: `https://yourusername.github.io/Beri_trial_policies/`

---

## Prerequisites

✅ GitHub account
✅ Git installed on your computer
✅ Code already on GitHub (which you have!)

---

## Step 1: Update package.json for GitHub Pages

Add a `base` path for GitHub Pages deployment:

```bash
npm install --save-dev gh-pages
```

Then update your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --base=/Beri_trial_policies/",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

---

## Step 2: Update vite.config.js

Add the base path to your Vite config:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Beri_trial_policies/',
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm', '@xenova/transformers']
  }
})
```

---

## Step 3: Build the Project

Run the build command:

```bash
npm run build
```

This creates a `dist/` folder with your optimized app.

**Expected output:**
```
✓ built in 15s
dist/index.html                   2.5 kB
dist/assets/index-abc123.css     125.0 kB
dist/assets/index-def456.js      450.0 kB
```

---

## Step 4: Deploy to GitHub Pages

### Option A: Using GitHub Actions (Recommended)

1. **Create workflow file:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Click **Save**

3. **Push your changes:**
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

4. **Wait for deployment:**
   - Go to **Actions** tab
   - Watch the workflow run
   - Once complete, your site is live!

### Option B: Using gh-pages package (Alternative)

```bash
npm install --save-dev gh-pages
npm run deploy
```

This automatically builds and pushes to the `gh-pages` branch.

Then enable GitHub Pages:
- Go to **Settings** → **Pages**
- Select **Source**: Deploy from a branch
- Select **Branch**: `gh-pages` → `/ (root)`
- Click **Save**

---

## Step 5: Access Your Site

Your site will be available at:
```
https://rimico2099.github.io/Beri_trial_policies/
```

⏱️ **First deployment takes 2-5 minutes**

---

## Step 6: Test Your Deployed Site

1. **Open the URL** in Chrome or Edge
2. **Wait for models to download** (2-5 minutes, only first time)
3. **Upload a PDF** from your computer
4. **Ask a question**
5. **Verify response** with sources

---

## How It Works (Client-Side)

```
┌─────────────────────────────────────────┐
│  GitHub Pages (Static Hosting)         │
│  - Serves HTML, CSS, JS                 │
│  - Free HTTPS                           │
│  - No server-side code                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  User's Browser                         │
│  1. Upload PDF                          │
│  2. Extract text (pdf.js)               │
│  3. Create chunks                       │
│  4. Generate embeddings (transformers)  │
│  5. Store in IndexedDB                  │
│  6. Query with semantic search          │
│  7. Generate answer (WebLLM)            │
│  8. Display with sources                │
└─────────────────────────────────────────┘
```

**Everything runs in the browser! No backend needed.**

---

## Updating Your Site

Every time you make changes:

### If using GitHub Actions:
```bash
git add .
git commit -m "Update BERI"
git push origin main
```

GitHub automatically rebuilds and redeploys!

### If using gh-pages package:
```bash
npm run deploy
```

---

## Troubleshooting

### Issue: 404 Not Found

**Solution:** Make sure base path matches in:
- `package.json` build script: `--base=/Beri_trial_policies/`
- `vite.config.js`: `base: '/Beri_trial_policies/'`

### Issue: Blank page

**Solution:**
- Check browser console (F12) for errors
- Verify you're using Chrome 113+ or Edge 113+
- Clear browser cache and reload

### Issue: Models won't download

**Solution:**
- Check internet connection
- Models are ~400MB - may take time
- Try incognito mode
- Check if Content-Security-Policy blocks downloads

### Issue: PDF upload fails

**Solution:**
- Make sure PDF has text (not scanned image)
- Try a different PDF
- Check browser console for specific error

### Issue: GitHub Actions fails

**Solution:**
- Check Actions tab for error details
- Verify `npm install` runs locally
- Check Node version in workflow (should be 18+)

---

## Configuration Options

### Custom Domain

To use your own domain:

1. Create `public/CNAME` file with your domain:
   ```
   beri.yourschool.com
   ```

2. Update DNS records (check GitHub docs)

3. Rebuild and deploy

### Analytics

Add Google Analytics or similar to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Performance Tips

### Optimize First Load

1. **Preload models** (advanced):
   - Cache models on CDN
   - Update model URLs in code

2. **Service Worker** (advanced):
   - Add PWA support for offline functionality
   - Cache static assets aggressively

3. **Lazy load components**:
   - Split code by route
   - Load PDF processor only when needed

### Reduce Bundle Size

```bash
# Analyze bundle
npm run build -- --mode=production

# Check dist/ folder size
du -sh dist/
```

Current size: ~500KB JS + ~400MB models (downloaded once)

---

## Privacy & Security

✅ **All processing client-side**
✅ **PDFs never leave user's browser**
✅ **No tracking or analytics** (unless you add them)
✅ **HTTPS enabled by default**
✅ **No cookies required**

### Security Headers

GitHub Pages automatically adds:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

### CORS

Models are loaded from CDN with proper CORS headers.

---

## Cost

**GitHub Pages is FREE for public repositories!**

- ✅ Unlimited bandwidth (fair use)
- ✅ 1GB storage limit (you'll use ~50MB)
- ✅ 100GB/month bandwidth soft limit
- ✅ Free HTTPS certificate

For private repos: Requires GitHub Pro ($4/month)

---

## Limitations

**GitHub Pages:**
- 1GB repository size limit
- 100GB/month bandwidth soft limit
- No server-side processing
- Public repositories only (free tier)

**Browser Requirements:**
- Chrome 113+ or Edge 113+
- 4GB RAM recommended
- ~500MB storage for cached models
- WebGPU support required

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build for production |
| `npm run deploy` | Build and deploy |
| `npm run preview` | Preview production build locally |

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Local development |
| `https://rimico2099.github.io/Beri_trial_policies/` | Production site |

---

## Next Steps After Deployment

1. **Test thoroughly** with different PDFs
2. **Share URL** with beta testers
3. **Monitor** GitHub Actions for build issues
4. **Add custom domain** (optional)
5. **Setup analytics** (optional)
6. **Add more features**:
   - Chat history export
   - Multiple language support
   - Batch PDF upload
   - Keyboard shortcuts

---

## Support

- **Build fails:** Check GitHub Actions logs
- **Site not loading:** Verify GitHub Pages is enabled
- **Models not downloading:** Check browser console
- **General issues:** See README.md troubleshooting section

---

**Your BERI app is now deployed and accessible worldwide! 🎓**

No servers. No backend. No costs. Just pure client-side AI magic.
