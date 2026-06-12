# デプロイ手順 — だれでもアクセスできる公開

このアプリを **無料ホスティング(Render)** にデプロイして、URLを知っている人なら
だれでもアクセスできる状態にする手順です。

## 構成

Docker 1イメージで「Flask(API) ＋ ビルド済みReactフロント」を**同じURLから配信**します。

```
ブラウザ ──▶  https://<アプリ名>.onrender.com
                 ├─ /            … React画面(ビルド済み)
                 ├─ /assets/...  … JS / CSS / 画像
                 └─ /api/...     … Flask API
```

- フロントは相対パス `/api` を呼ぶので、CORSも別URL設定も不要。
- 商品データは `back2.py` 内の `PRODUCTS`(ローカル)を使用。**AWS不要・課金なし**。

### AWS版との共存

AWSコードは削除していません。**環境変数だけで切り替わります**。

| | 無料公開モード(既定) | AWSモード |
|---|---|---|
| 商品/在庫 | ローカル `PRODUCTS`(自動フォールバック) | DynamoDB |
| AIコメント | 定型文 | Bedrock |
| 設定 | なし | `USE_BEDROCK=1` ＋ AWS認証情報 |

AWS認証情報を渡さなければ DynamoDB接続は自動的に失敗し、ローカルデータに
フォールバックします([back2.py](backend/back2.py) の `get_in_stock_products`)。
あとで AWS を有効化したくなったら、Render の環境変数に
`USE_BEDROCK=1` と AWS認証情報(`AWS_ACCESS_KEY_ID` 等)を追加するだけです。

---

## 手順A: Renderにデプロイ(本番公開)

### 1. GitHubにpush
Renderはリポジトリを読み込んでビルドします。まだの場合:

```bash
git add .
git commit -m "デプロイ設定を追加"
# GitHubでリポジトリを作成してから:
git remote add origin https://github.com/<あなた>/<リポジトリ名>.git
git push -u origin master
```

### 2. Renderでサービス作成
1. https://render.com/ に登録(GitHubでログインが楽)。
2. **New +** ▶ **Blueprint** を選択。
3. このリポジトリを選ぶ。`render.yaml` が自動で読まれ、無料Webサービスが作られる。
   - もし Blueprint を使わない場合は **New + ▶ Web Service** ▶ リポジトリ選択 ▶
     Runtime を **Docker** にすればOK(`Dockerfile` を自動検出)。
4. **Create** を押すとビルド開始(初回は数分)。
5. 完了すると `https://<アプリ名>.onrender.com` が発行される。これが公開URL。

### 3. 動作確認
発行されたURLを開く → 気分選択 → 商品レコメンドまで動けば成功。

> **無料枠の注意**: 15分アクセスが無いとスリープし、次のアクセスで起動に
> 30秒〜1分かかります(初回だけ待てばOK)。常時即応が必要なら有料プランへ。

---

## 手順B: ローカルで動かす(開発時)

公開とは別に、手元で開発する場合は今まで通り2つ起動します。

```bash
# ターミナル1: バックエンド(:5000)
cd backend
pip install -r requirements.txt
python back2.py

# ターミナル2: フロント(:3000)
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。
フロントの `/api` リクエストは Vite が自動で :5000 へ転送します
([vite.config.js](frontend/vite.config.js) の proxy 設定)。

---

## 手順C: 本番と同じ形をローカルで確認(任意)

Docker があれば、本番とまったく同じ単一サービスを手元で再現できます。

```bash
docker build -t matching-app .
docker run -p 8000:8000 matching-app
# http://localhost:8000 を開く
```

Dockerが無くても、ビルドして Flask に配信させれば確認できます:

```bash
cd frontend && npm run build      # frontend/dist を生成
cd ../backend && python back2.py  # http://localhost:5000 で全部配信
```

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| 画面は出るが商品が出ない | バックのAPIが起動しているか。Renderならログ(Logs)を確認 |
| `frontend not built` と表示 | `cd frontend && npm run build` を実行(本番はDockerが自動実行) |
| Renderの初回アクセスが遅い | 無料枠のスリープ復帰。1分ほど待つ |
| 画像の表示が重い | 一部PNGが大きい。必要なら画像を圧縮するとさらに軽くなる |
