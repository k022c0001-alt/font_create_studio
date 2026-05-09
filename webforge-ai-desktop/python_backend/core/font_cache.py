"""
core/font_cache.py
──────────────────
生成・変換済みフォントをプロセスメモリ上に一時保持するキャッシュ。

役割:
  /fonts/generate や /fonts/subset で作ったフォントを
  font_id (UUID) で参照できるようにする。
  /fonts/preview/{id} や /fonts/convert で使い回す。

設計:
  - シングルトン（FontCache.instance()）
  - TTL 付き（デフォルト 30 分、アクセスで更新）
  - 最大エントリ数制限（メモリ保護）
  - スレッドセーフ（threading.Lock）
"""

from __future__ import annotations
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CachedFont:
    """キャッシュの1エントリ。"""
    font_id:     str
    font_bytes:  bytes          # TTF or WOFF2
    family_name: str
    style_name:  str
    is_woff2:    bool
    created_at:  float = field(default_factory=time.monotonic)
    accessed_at: float = field(default_factory=time.monotonic)

    def touch(self) -> None:
        """アクセス時刻を更新する（TTL をリセット）。"""
        self.accessed_at = time.monotonic()

    @property
    def age_seconds(self) -> float:
        return time.monotonic() - self.accessed_at


class FontCache:
    """
    生成済みフォントの一時キャッシュ。

    使い方:
        cache = FontCache.instance()

        # 保存
        font_id = cache.put(woff2_bytes, "MyFont", "Regular", is_woff2=True)

        # 取得
        entry = cache.get(font_id)
        if entry:
            return entry.font_bytes

        # 削除
        cache.delete(font_id)
    """

    _instance: Optional["FontCache"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(
        self,
        ttl_seconds:   int = 1800,   # 30 分
        max_entries:   int = 100,
        max_bytes:     int = 200 * 1024 * 1024,  # 200MB
    ) -> None:
        self._ttl        = ttl_seconds
        self._max        = max_entries
        self._max_bytes  = max_bytes
        self._store:     dict[str, CachedFont] = {}
        self._rw_lock    = threading.Lock()

    @classmethod
    def instance(cls) -> "FontCache":
        """シングルトンインスタンスを返す。"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    # ──────────────────────────────
    # 基本操作
    # ──────────────────────────────

    def put(
        self,
        font_bytes:  bytes,
        family_name: str,
        style_name:  str,
        is_woff2:    bool = True,
    ) -> str:
        """
        フォントを保存して font_id を返す。
        容量超過時は古いエントリを自動削除する。
        """
        self._evict_expired()

        with self._rw_lock:
            # 容量チェック
            if len(self._store) >= self._max:
                self._evict_oldest()
            if self._total_bytes() + len(font_bytes) > self._max_bytes:
                self._evict_oldest(n=max(1, len(self._store) // 4))

            font_id = str(uuid.uuid4())
            self._store[font_id] = CachedFont(
                font_id=font_id,
                font_bytes=font_bytes,
                family_name=family_name,
                style_name=style_name,
                is_woff2=is_woff2,
            )
            return font_id

    def get(self, font_id: str) -> Optional[CachedFont]:
        """
        font_id でエントリを取得する。
        見つからない・有効期限切れの場合は None。
        """
        with self._rw_lock:
            entry = self._store.get(font_id)
            if entry is None:
                return None
            if entry.age_seconds > self._ttl:
                del self._store[font_id]
                return None
            entry.touch()
            return entry

    def delete(self, font_id: str) -> bool:
        """エントリを削除する。存在した場合 True。"""
        with self._rw_lock:
            return self._store.pop(font_id, None) is not None

    def exists(self, font_id: str) -> bool:
        return self.get(font_id) is not None

    # ──────────────────────────────
    # 統計・管理
    # ──────────────────────────────

    @property
    def entry_count(self) -> int:
        with self._rw_lock:
            return len(self._store)

    def stats(self) -> dict:
        with self._rw_lock:
            return {
                "entries":    len(self._store),
                "total_bytes": self._total_bytes(),
                "max_entries": self._max,
                "ttl_seconds": self._ttl,
            }

    def clear(self) -> None:
        with self._rw_lock:
            self._store.clear()

    # ──────────────────────────────
    # 内部
    # ──────────────────────────────

    def _evict_expired(self) -> None:
        with self._rw_lock:
            expired = [k for k, v in self._store.items()
                       if v.age_seconds > self._ttl]
            for k in expired:
                del self._store[k]

    def _evict_oldest(self, n: int = 1) -> None:
        """最も古いエントリを n 件削除する（Lock 取得済み前提）。"""
        sorted_keys = sorted(
            self._store.keys(),
            key=lambda k: self._store[k].accessed_at
        )
        for k in sorted_keys[:n]:
            del self._store[k]

    def _total_bytes(self) -> int:
        """保持中の全フォントバイト数合計（Lock 取得済み前提）。"""
        return sum(len(e.font_bytes) for e in self._store.values())