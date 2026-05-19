from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
DB_PATH = Path(os.getenv('DESIGN_DB_PATH', ROOT_DIR / 'database' / 'design_studio.db'))
UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', ROOT_DIR / 'assets' / 'uploads'))
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY', '')
CLAUDE_MODEL = os.getenv('CLAUDE_MODEL', 'claude-3-5-sonnet-20241022')
MAX_UPLOAD_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
