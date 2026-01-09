# BERI 🎓 - Bespoke Education Retrieval Infrastructure

**BERI** is a fully browser-based, privacy-first RAG (Retrieval-Augmented Generation) system designed for Haberdashers' Elstree Schools. It enables students and staff to query school policies and educational materials using a local LLM, with **zero server dependencies** and **complete offline functionality**.

## 🎯 Project Overview

### Background
BERI is a student-led initiative by Énora Hauduc and Ravjoth Brar, designed to provide a custom AI assistant trained on Habs' internal resources. This demo serves as a proof-of-concept using school policy documents.

### Core Principles
- **100% Private**: All data stays on the user's device - no external API calls
- **Offline-First**: Works without WiFi once assets are cached
- **No Backend**: Purely static frontend application
- **RAG Architecture**: Reduces hallucinations by grounding responses in actual documents
- **British Context**: Uses British English spelling and UK educational terminology

### Demo Scope
This proof-of-concept demonstrates BERI's capabilities using 4 Habs policy documents:
1. **E-Safety Policy** - Online safety guidelines and procedures
2. **Data Protection Policy** - GDPR compliance and data handling
3. **Acceptable Use Policy - Students** - IT usage rules and responsibilities
4. **Academic Integrity Policy** - Plagiarism, AI use, and academic honesty

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BERI Browser Application                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐    ┌──────────────┐    ┌───────────────────────┐ │
│  │   UI Layer    │    │  RAG Engine  │    │   Local LLM Layer     │ │
│  │   (React)     │◄──►│  (JS/TS)     │◄──►│   (WebLLM/WebGPU)     │ │
│  └───────────────┘    └──────────────┘    └───────────────────────┘ │
│          │                   │                       │              │
│          ▼                   ▼                       ▼              │
│  ┌───────────────┐    ┌──────────────┐    ┌───────────────────────┐ │
│  │  Tailwind CSS │    │  Embeddings  │    │  Qwen2.5-0.5B-Instruct│ │
│  │  Styling      │    │  (MiniLM-L6) │    │  (~360MB cached)      │ │
│  └───────────────┘    └──────────────┘    └───────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│                    ┌──────────────────┐                             │
│                    │    IndexedDB     │                             │
│                    │  (Chunk Storage) │                             │
│                    └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

#### Hardware Requirements
- **GPU**: WebGPU-compatible graphics card recommended
- **RAM**: Minimum 4GB available
- **Storage**: ~500MB for cached models

#### Browser Support
| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 113+ | ✅ Recommended | Best WebGPU support |
| Edge 113+ | ✅ Supported | Same engine as Chrome |
| Firefox | ⚠️ Experimental | WebGPU flag required |
| Safari | ❌ Not supported | Limited WebGPU |

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Beri_trial_policies
   ```

2. **Install dependencies**
   ```bash
   npm install --ignore-scripts
   ```

   > **Note**: We use `--ignore-scripts` to avoid issues with optional dependencies. The required packages will still install correctly.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` in Chrome 113+ or Edge 113+

### First Launch

On first launch, BERI will:
1. Check browser compatibility (WebGPU and IndexedDB)
2. Load the embedding model (~22MB download, cached)
3. Load the local LLM (~360MB download, cached)
4. Index policy documents into IndexedDB

**This initial download takes 2-5 minutes** depending on your connection. Subsequent visits will load instantly from cache.

---

## 📚 Usage

### Asking Questions

Simply type your question about Habs policies in the input box and press Enter or click Send. Examples:

- "What is the school's policy on mobile phones?"
- "Can I use ChatGPT for my homework?"
- "What happens if I share my password?"
- "What is personal data under GDPR?"

### Understanding Responses

BERI will:
- Answer based on the policy documents
- Cite which policy the information comes from
- Provide source references at the bottom of each response
- Politely decline if the answer isn't in the policies

---

## 🔧 Technical Details

### Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Embeddings**: Transformers.js (Xenova/all-MiniLM-L6-v2)
- **LLM**: WebLLM (Qwen2.5-0.5B-Instruct)
- **Storage**: IndexedDB (via idb library)
- **Acceleration**: WebGPU

### Project Structure

```
beri-demo/
├── index.html                  # Entry HTML
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main app component
│   ├── components/             # React components
│   │   ├── Header.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ChatContainer.jsx
│   │   ├── MessageBubble.jsx
│   │   └── InputArea.jsx
│   ├── lib/                    # Core library modules
│   │   ├── beri.js             # Main orchestration
│   │   ├── embeddings.js       # Embeddings wrapper
│   │   ├── llm.js              # LLM wrapper
│   │   ├── retrieval.js        # RAG retrieval logic
│   │   ├── storage.js          # IndexedDB operations
│   │   └── systemPrompt.js     # BERI system prompt
│   ├── data/
│   │   └── policies.json       # Pre-embedded policy chunks
│   └── styles/
│       └── index.css           # Global styles
├── scripts/
│   └── preprocess-policies.js  # Policy preprocessing script
└── raw/                        # Raw policy text files
    ├── e-safety-policy.txt
    ├── data-protection-policy.txt
    ├── acceptable-use-policy.txt
    └── academic-integrity-policy.txt
```

### Data Flow

```
User Query → Embed Query → Cosine Similarity Search → Top-4 Chunks →
BERI System Prompt + Context + Query → Local LLM → Streamed Response
```

---

## 🛠️ Development

### Preprocessing Policy Documents

**Note**: Due to dependency complexities with the `sharp` image processing library (which is an optional dependency of Transformers.js), the preprocessing script requires additional setup.

#### Option 1: Using Python (Recommended)

Create a Python virtual environment and use sentence-transformers:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install sentence-transformers

# Create a Python preprocessing script
python scripts/preprocess-policies.py
```

#### Option 2: Fix Sharp Installation

If you prefer to use the Node.js script:

```bash
# Remove node_modules and reinstall with sharp properly
rm -rf node_modules
npm install

# Run preprocessing
npm run preprocess
```

#### Option 3: Docker

```bash
# Use a Docker container with all dependencies pre-installed
docker run -v $(pwd):/app -w /app node:18 npm run preprocess
```

The preprocessing script will:
1. Read policy text files from `raw/`
2. Chunk them into ~125-word segments with 25-word overlap
3. Generate 384-dimensional embeddings using MiniLM
4. Save to `src/data/policies.json`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in `dist/` that can be deployed to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

---

## 🔒 Privacy & Security

### Data Handling
- **No External Calls**: All processing happens locally in the browser
- **No Data Collection**: No analytics, logging, or telemetry
- **No Server**: Purely client-side application
- **GDPR Compliant**: Aligns with Habs Data Protection Policy

### What Gets Stored
- **IndexedDB**: Policy chunks and embeddings (can be cleared anytime)
- **Browser Cache**: AI models (~400MB, managed by browser)
- **No Chat History**: Messages are not persisted between sessions

---

## ⚠️ Known Limitations

1. **Initial Download**: First visit requires ~400MB download for models
2. **Processing Speed**: Local LLM is slower than cloud APIs (2-5 tokens/sec)
3. **Model Capabilities**: Qwen2.5-0.5B is a small model - complex reasoning may be limited
4. **Mobile Support**: WebGPU support on mobile browsers is limited
5. **Context Window**: Limited to top-4 most relevant chunks per query

---

## 🧪 Example Test Queries

```
1. "What is the school's policy on mobile phones?"
   Expected: E-Safety Policy, Appendix 1

2. "Can I use ChatGPT for my homework?"
   Expected: Academic Integrity Policy, Appendix A

3. "What happens if I share my password?"
   Expected: Acceptable Use Policy, Access & Security

4. "What is personal data under GDPR?"
   Expected: Data Protection Policy, Definitions

5. "Who is the DSL at Habs?"
   Expected: E-Safety Policy, Roles and Responsibilities

6. "What are the consequences for plagiarism?"
   Expected: Academic Integrity Policy, Consequences
```

---

## 🚧 Future Enhancements

- [ ] Chat history persistence (optional, local-only)
- [ ] Export conversation as PDF
- [ ] Support for more document types (PDF, DOCX)
- [ ] Larger model options for more capable reasoning
- [ ] Multiple language support
- [ ] Voice input/output
- [ ] Progressive Web App (PWA) for offline mobile use

---

## 📄 License

This project, including the underlying idea, design, model architectures, and source code (the **Project IP**), has been created by the student team: **Énora Hauduc** and **Ravjoth Brar**.

The schools are granted a non-exclusive, non-transferable, royalty-free licence for internal educational use only.

---

## 🙏 Acknowledgements

- **Anthropic** - AI guidance and best practices
- **Hugging Face** - Transformers.js library
- **MLC AI** - WebLLM framework
- **Habs Centre for Innovation** - Project support
- **Xenova** - MiniLM embeddings model

---

## 📞 Support

For questions or issues:
- **Technical Issues**: Open an issue in this repository
- **School-Specific Queries**: Contact the Habs IT Department
- **Project Creators**: Énora Hauduc & Ravjoth Brar

---

**Built with ❤️ by Habs students, for the Habs community**
