# WebForge AI Desktop

🎨 AI-powered font & site designer with Electron + React + FastAPI

## Overview

WebForge AI Desktop is a comprehensive tool for creating and customizing fonts and websites using AI assistance. It combines:

- **Frontend**: React + TypeScript (Vite)
- **Desktop**: Electron (Chromium-based)
- **Backend**: Python FastAPI
- **AI**: OpenAI GPT-4o / Claude API

## Project Structure

```
webforge-ai-desktop/
├── electron/              # Electron main process
├── frontend/              # React frontend (Vite)
├── python_backend/        # FastAPI backend
├── database/              # SQLite repositories
├── shared/                # Shared types & constants
└── assets/                # Static resources
```

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd webforge-ai-desktop

# Install dependencies
npm install
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your API keys
```

### Development

```bash
# Start all services (Electron + Vite + Python)
npm run dev

# Or start individually
npm run dev:vite      # Frontend only
npm run dev:electron  # Electron only
npm run dev:python    # Python backend only
```

### Font export API (backend)

```bash
curl -X POST http://localhost:8000/api/fonts/export \
  -H "Content-Type: application/json" \
  -o ExportTest-Regular.ttf \
  -d '{
    "metadata": {"family_name":"ExportTest","style_name":"Regular"},
    "format":"ttf",
    "glyphs":[
      {
        "name":"A",
        "unicode":65,
        "metrics":{"advance_width":600,"left_side_bearing":20},
        "contours":[
          {"points":[
            {"x":50,"y":0,"on_curve":true},
            {"x":300,"y":700,"on_curve":true},
            {"x":550,"y":0,"on_curve":true}
          ]}
        ]
      }
    ]
  }'
```

```bash
curl -X POST http://localhost:8000/api/fonts/export/validate \
  -H "Content-Type: application/json" \
  -d '{ ...same payload... }'
```

### Build

```bash
# Build all
npm run build

# Build specific parts
npm run build:electron
vite build
```

## Features

### Phase 1: MVP (Current)
- ✅ Project management (CRUD)
- ✅ Visual site builder
- ✅ Font customization (Variable Fonts)
- ✅ AI chat for design suggestions
- ✅ Browser preview
- ✅ Export as ZIP

### Phase 2: Expansion
- Font subsetting & WOFF2 conversion
- Advanced glyph editing
- Template library
- Collaboration features

### Phase 3: Advanced
- Real-time collaborative editing
- Advanced animation timeline
- Custom font generation from scratch
- API for external tools

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Zustand (state management)
- React Router

### Desktop
- Electron 27
- Context Bridge IPC

### Backend
- FastAPI
- SQLite
- Pydantic
- fonttools
- OpenAI API

## Environment Variables

```bash
# .env
OPENAI_API_KEY=sk_test_...
PYTHON_BACKEND_URL=http://localhost:8000
ELECTRON_DEV=true
```

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT
