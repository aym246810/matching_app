# ───────────────────────────────────────────────
# 1段目: フロントエンド(React/Vite)をビルド
# ───────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build          # → /app/frontend/dist が生成される

# ───────────────────────────────────────────────
# 2段目: Python(Flask)で API + ビルド済みフロントを配信
# ───────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Python依存をインストール
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# バックエンド本体
COPY backend/ ./backend/

# 1段目でビルドしたフロントを back2.py が参照する場所へ配置
COPY --from=frontend /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
# PORT はホスティング側(Render等)が注入する。未指定時は8000。
ENV PORT=8000
# 商品データはローカルの PRODUCTS を使う(AWS認証情報が無ければ自動フォールバック)
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 back2:app
