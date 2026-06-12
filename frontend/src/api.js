// APIのベースURL。
// - 本番(Flaskがビルド済みフロントを配信): 同一オリジンなので相対パス '/api'
// - ローカル開発(Vite): vite.config.js の proxy が '/api' を :5000 へ転送
// - 別ホストのバックエンドを使いたい場合のみ VITE_API_BASE で上書き
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'
