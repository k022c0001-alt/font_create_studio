# Design-to-Code Studio

Figma スクリーンショットや UI 画像を解析し、React JSX/CSS を生成する Electron + React + FastAPI アプリです。`webforge-ai-desktop` の構成パターンを再利用しつつ、Design-to-Code 専用のワークフローを独立させています。

## セットアップ

```bash
cd design-to-code-studio
npm install
python3 -m pip install -r requirements.txt
cp .env.example .env
```

## 開発起動

```bash
npm run dev
```

- Frontend: http://localhost:5180
- Backend: http://localhost:8010
- Electron: preload 経由で IPC ブリッジを利用

ブラウザ単体で確認したい場合は `npm run dev:frontend` と `npm run dev:python` を別々に起動してください。Frontend は IPC が無い場合、自動で FastAPI HTTP API にフォールバックします。

## Fontapply 連携（外部フォント編集バックエンド）

`Font Studio` 画面は `kakutixyou/Fontapply` を別プロセスで利用します。`font_create_studio` 側で Fontapply を同梱せず、外部APIへ接続します。

1. Fontapply を先に起動（既定: `http://127.0.0.1:8000`）
2. 次に本リポジトリで `npm run dev` を実行
3. `Font Studio` で接続確認・グリフ取得・保存を実行

### 現時点で利用する Fontapply API 範囲

- `GET /health`
- `GET /api/glyphs`
- `GET /api/glyphs/{unicode}?project_id=...`
- `GET /api/glyphs/{unicode}/metrics`
- `PUT /api/glyphs/{unicode}?project_id=...`

`project_id` は任意です。未指定時は Fontapply 側の共通領域（既定動作）を利用します。

### 今後の拡張予定

- `weight/width/slant/roundness` パラメーター型は先行定義済み（UI境界のみ）
- パラメトリック変形、TTF/WOFF2 エクスポート連携は **Fontapply 側 API 実装後** に追加
- 本PRでは未実装の Fontapply エンドポイントを呼び出しません

## 主要機能

- Dashboard で SQLite 保存済みプロジェクトを一覧・作成・削除
- Design Converter で画像アップロード → Claude Vision 解析 → JSX/CSS 生成
- Font Studio で Fontapply への接続確認・対応グリフ取得・グリフ保存
- Electron IPC からバックエンド API とエクスポート処理を呼び出し
- Claude API キー未設定時は Pillow ベースの簡易レイアウト抽出にフォールバック

## API

### Design routes

- `POST /design/upload` - 画像アップロード（任意で既存 `project_id` を指定して画像更新）
- `POST /design/analyze` - 保存済み画像を解析
- `POST /design/generate-jsx` - JSX/CSS を生成

### Project routes

- `GET /projects` - プロジェクト一覧
- `POST /projects` - プロジェクト作成
- `GET /projects/{project_id}` - プロジェクト取得
- `PATCH /projects/{project_id}` - プロジェクト更新
- `DELETE /projects/{project_id}` - プロジェクト削除

## ディレクトリ構成

```
design-to-code-studio/
├── electron/              # Electron main/preload と IPC ハンドラー
├── frontend/              # React + Vite frontend
├── python_backend/        # FastAPI backend
├── database/              # SQLite repository
├── shared/                # IPC channels / shared TS types
└── tests/                 # Backend regression tests
```

## 環境変数

- `CLAUDE_API_KEY` - Claude Vision 利用時の API キー
- `CLAUDE_MODEL` - 利用する Claude モデル名
- `DESIGN_DB_PATH` - SQLite DB ファイルパス
- `UPLOAD_DIR` - 画像保存先
- `VITE_DESIGN_API_BASE_URL` - ブラウザフォールバック時の Design API ベース URL（既定 `http://localhost:8010`）
- `VITE_FONT_API_BASE_URL` - Fontapply API ベース URL（既定 `http://127.0.0.1:8000`）
