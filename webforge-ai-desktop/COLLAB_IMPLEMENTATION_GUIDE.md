# リアルタイムコラボレーション実装ガイド

## 📋 概要

このドキュメントは、WebForge AI Desktop にリアルタイムコラボレーション機能を実装するための完全なガイドです。

**実装内容:**
- WebSocket ベースの複数ユーザー同時編集
- Operational Transform による競合解決
- ユーザープレゼンス（カーソル位置・選択状態）のリアルタイム同期
- 操作履歴管理と同期

---

## 🏗️ ファイル構成

### バックエンド (Python)

```
python_backend/
├── services/collab_engine/
│   ├── __init__.py
│   ├── connection_manager.py     ← セッション・ユーザー管理
│   └── operation_transform.py    ← OT アルゴリズム実装
├── api/
│   └── routes_collab.py          ← WebSocket エンドポイント
```

### フロントエンド (React)

```
frontend/src/
├── hooks/
│   ├── useCollaboration.ts       ← WebSocket 管理
│   └── usePresence.ts            ← カーソル追跡
├── components/collab/
│   ├── CollaborativeCanvas.tsx   ← 共有キャンバス
│   ├── UserPresenceIndicator.tsx ← ユーザー表示
│   └── ConflictNotification.tsx  ← 競合通知
└── store/
    └── collaborationStore.ts     ← Zustand ストア
```

### 共通型定義 (TypeScript)

```
shared/
├── types/collab.ts              ← 操作・セッション型
└── constants/collabChannels.ts  ← IPC チャンネル定数
```

---

## 🚀 セットアップ手順

### ステップ 1: 依存関係インストール

```bash
# Python
pip install python-socketio python-engineio

# Node.js の場合（オプション）
npm install socket.io-client
```

### ステップ 2: FastAPI に WebSocket ルーター登録

**ファイル: `python_backend/main.py`**

既存のコードに以下を追加:

```python
from fastapi import FastAPI
from .api.routes_collab import router as collab_router

app = FastAPI()

# 既存ルーター...

# コラボレーションルーター追加
app.include_router(collab_router)
```

### ステップ 3: React コンポーネント統合

**ファイル: `frontend/src/pages/FontStudio.tsx`**

```typescript
import CollaborativeCanvas from '../components/collab/CollaborativeCanvas';

export default function FontStudio() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="font-studio">
      <CollaborativeCanvas projectId={projectId} />
      {/* 既存のコンポーネント... */}
    </div>
  );
}
```

---

## 🔄 通信フロー

### WebSocket メッセージ形式

#### 1. 接続時

```json
{
  "type": "sync_request",
  "client_version": 0
}
```

#### 2. ユーザー操作送信

```json
{
  "type": "operation",
  "operation_type": "modify_metrics",
  "glyph_id": "A",
  "content": {
    "field": "stroke_width",
    "value": 120
  },
  "client_version": 1
}
```

#### 3. プレゼンス更新

```json
{
  "type": "presence",
  "cursor": { "x": 150, "y": 200 },
  "selected_glyph": "A"
}
```

#### 4. サーバーからのリモート操作

```json
{
  "type": "remote_operation",
  "operation": {
    "id": "uuid",
    "type": "modify_metrics",
    "glyph_id": "A",
    "user_id": "alice",
    "content": { "field": "stroke_width", "value": 120 },
    "timestamp": 1234567890
  },
  "sender_user_id": "alice"
}
```

#### 5. ユーザープレゼンス更新

```json
{
  "type": "cursor_moved",
  "user_id": "alice",
  "session_id": "uuid",
  "cursor": { "x": 150, "y": 200 },
  "selected_glyph": "A"
}
```

---

## 🎯 主要機能の詳細

### 1. Operational Transform (OT)

**目的:** 同時編集時の競合を自動解決

**実装:** `operation_transform.py`

```python
# 例: 2人が同じグリフのストロークを同時に変更
UserA: modify_stroke(A, width=100)  # timestamp: 100
UserB: modify_stroke(A, width=120)  # timestamp: 101

# OT が自動的にマージ（新しい方を採用）
Result: modify_stroke(A, width=120)
```

**対応する競合:**
- ✅ 異なるグリフへの操作 → 競合なし
- ✅ 異なる操作タイプ → 競合なし
- ✅ 同じメトリクス項目 → 新しい値を採用
- ✅ 同じポイントの同時移動 → 新しい位置を採用

### 2. ユーザープレゼンス

**機能:**
- リアルタイムカーソル表示
- ユーザーごとに異なる色を割り当て
- 選択中のグリフを表示
- アクティブユーザー一覧

**更新頻度:** 100ms（スロットリング）

### 3. 操作履歴

**管理方法:**
- メモリ内に操作を蓄積
- クライアント接続時に欠落操作を送信
- 本番環境では Redis/DB に永続化推奨

---

## 🧪 テスト方法

### 単一ブラウザ (複数タブ)

1. **タブ1:** `http://localhost:5180/projects/test-project`
2. **タブ2:** 同じ URL を開く
3. タブ1 でグリフを選択 → タブ2 でカーソルが表示される
4. タブ1 でグリフを編集 → タブ2 で変更がリアルタイム反映

### 複数ブラウザ

1. Chrome: `http://localhost:5180/projects/test-project`
2. Firefox: 同じ URL を開く
3. 各ブラウザで操作 → リアルタイム同期を確認

### WebSocket デバッグ

ブラウザの DevTools:

```javascript
// Console で WebSocket メッセージを確認
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
}
```

---

## ⚠️ トラブルシューティング

### 接続できない

```
❌ WebSocket closed
```

**原因:** FastAPI バックエンドが起動していない

```bash
python -m uvicorn python_backend.main:app --reload --port 8000
```

### 操作が同期されない

**原因:** `project_id` または `user_id` が異なっている

```typescript
// localStorageに user_id を保存
localStorage.setItem('userId', 'alice');
```

### カーソルがちらつく

**解決:** `updatePresence` のスロットリング間隔を調整

```typescript
// useCollaboration.ts の 100ms を変更
setInterval(() => updatePresence(...), 200);  // 200ms に変更
```

---

## 🔮 将来の拡張

### Phase 2: OCR統合
- 手書き画像からグリフ自動生成
- Vision API で画像からデザイン提案

### Phase 3: Design-to-Code連携
- Figma スクリーンショット → JSX自動生成
- 生成されたコンポーネントに合わせてフォント提案

### Phase 4: Advanced CRDT
- より複雑な競合解決（CRDT ライブラリ導入）
- オフライン対応
- タイムトラベル機能

---

## 📚 参考資料

- [Operational Transform](https://en.wikipedia.org/wiki/Operational_transformation)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/)
- [Collaborative Editing](https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing/)

---

## 🤝 コントリビューション

バグ報告や機能提案は GitHub Issues にお願いします。

---

**作成日:** 2026-05-20  
**バージョン:** 1.0.0
