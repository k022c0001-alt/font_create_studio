"""Simple file-based cache for generated artefacts."""
import hashlib
import json
from pathlib import Path


class FileCache:
    """Cache generated content to avoid redundant LLM / processing calls."""

    def __init__(self, cache_dir: str):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _key_path(self, key: str) -> Path:
        hashed = hashlib.sha256(key.encode()).hexdigest()
        return self.cache_dir / f"{hashed}.json"

    def get(self, key: str) -> dict | None:
        """Return cached value for key, or None if not cached."""
        path = self._key_path(key)
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
        return None

    def set(self, key: str, value: dict) -> None:
        """Store value under key in the cache."""
        self._key_path(key).write_text(json.dumps(value), encoding="utf-8")

    def delete(self, key: str) -> None:
        """Remove a cached entry."""
        path = self._key_path(key)
        if path.exists():
            path.unlink()
