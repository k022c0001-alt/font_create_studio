# Design-to-Code Studio

FigmaスクリーンショットやUI画像を解析し、React JSX/CSSを生成する独立Electronアプリです。

## セットアップ

```bash
cd design-to-code-studio
npm install
python3 -m pip install -r requirements.txt
cp .env.example .env
```

## 起動

```bash
npm run dev
```

- Frontend: http://localhost:5180
- Backend: http://localhost:8010

## API

- `POST /design/upload`
- `POST /design/analyze`
- `POST /design/generate-jsx`

## 備考

- 画像解析は Claude Vision API を優先利用します。
- APIキー未設定時はローカルの簡易解析（Pillow）にフォールバックします。
