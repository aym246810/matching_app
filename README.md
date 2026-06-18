# コンビニ在庫連動レコメンドアプリ

気分タグから商品を提案し、選択を繰り返してユーザーにぴったりの一品をレコメンドするアプリ。
レコメンドはMH法（メトロポリス・ヘイスティングス法）でユーザーベクトルに近い商品を抽出する。

- フロントエンド: React (Vite)
- バックエンド: Flask (`backend/back2.py`)
- バックエンドの起動手順は [backend/README.md](backend/README.md) を参照

## アーキテクチャ

このアプリは **AWSあり / なしの2構成** で動作する。コードは同一で、環境変数とAWS認証情報の有無だけで切り替わる。
バックエンドはDynamoDBへの接続に失敗すると自動でローカルデータにフォールバックするため、AWSなしでもそのまま動く。

### ① AWS利用版

商品マスタ・在庫をDynamoDBで管理し、レコメンド理由をBedrock（Claude Haiku 4.5）で生成する本番構成。

```mermaid
flowchart TD
    User["ユーザー (Browser)<br/>React frontend"]
    Admin["管理者"]

    subgraph Host["ホスト環境 (EC2 / App Runner / Lambda 等)"]
        Flask["Flask アプリ (back2.py)<br/>・MH法レコメンドエンジン<br/>・frontend/dist 静的配信<br/>・boto3 クライアント"]
    end

    subgraph AWS["AWS ap-northeast-1"]
        DDB_P["DynamoDB: Products<br/>PK: product_id"]
        DDB_I["DynamoDB: Inventory<br/>PK: store_id / SK: product_id"]
        Bedrock["Amazon Bedrock<br/>Claude Haiku 4.5<br/>(USE_BEDROCK=1 時のみ)"]
    end

    Seed["setup_aws.py<br/>テーブル作成 + シード投入"]

    User -->|"REST: /api/mood, /api/select, /api/final"| Flask
    Admin -->|"PATCH /api/admin/inventory"| Flask
    Flask -->|"query / put_item 在庫照会・更新"| DDB_I
    Flask -->|"get_item 商品取得"| DDB_P
    Flask -->|"invoke_model AIコメント生成"| Bedrock
    Seed -.->|"初期データ投入"| DDB_P
    Seed -.->|"初期データ投入"| DDB_I
```

**セットアップ:**

```bash
# AWS認証情報を設定したうえで
python backend/setup_aws.py   # DynamoDBテーブル作成＋シードデータ投入
export USE_BEDROCK=1          # AIコメント生成を有効化（Windows: set USE_BEDROCK=1）
python backend/back2.py
```

### ② AWS不使用版（無料ホスティング構成）

Render無料枠（Docker + gunicorn）で動かすデモ向け構成。
AWSの3サービスがすべてアプリ内部に置き換わる。設定は [render.yaml](render.yaml) と [Dockerfile](Dockerfile) を参照。

```mermaid
flowchart TD
    User["ユーザー (Browser)<br/>React frontend"]
    Admin["管理者"]

    subgraph Render["Render 無料枠 (Docker / gunicorn)"]
        direction TB
        Flask["Flask アプリ (back2.py)<br/>gunicorn 2 workers"]
        Local["PRODUCTS 定数<br/>(ローカル商品マスタ)"]
        Stub["定型文コメント生成<br/>USE_BEDROCK=0"]
        Dist["frontend/dist<br/>(ビルド済みReact)"]

        Flask -->|"DynamoDB未接続→フォールバック"| Local
        Flask -->|"AIの代わり"| Stub
        Flask --> Dist
    end

    User -->|"REST API"| Flask
    Admin -->|"PATCH /api/admin/inventory<br/>(メモリ上のみ・永続化なし)"| Flask
```

> **注意:** AWS不使用版では在庫更新（`/api/admin/inventory`）が永続化されない。
> DynamoDB未接続のためメモリ上のみで、再起動すると初期化される。デモ用途向け。

### AWSあり / なしの対応表

| 役割 | AWS利用版 | AWS不使用版 |
|---|---|---|
| 商品マスタ | DynamoDB `Products` | `PRODUCTS` 定数（`backend/back2.py`） |
| 在庫管理 | DynamoDB `Inventory` | メモリ上のみ・**再起動で消える** |
| AIコメント | Bedrock (Claude Haiku 4.5) | 定型文 |
| 実行環境 | EC2 / App Runner / Lambda 等 | Render 無料枠（Docker + gunicorn） |
| 切替スイッチ | `USE_BEDROCK=1` + AWS認証情報 | `USE_BEDROCK=0`（既定） |

## APIエンドポイント一覧

| パス | メソッド | 誰が使う | 何をする |
|---|---|---|---|
| `/api/mood` | POST | ユーザー | 気分タグ → 候補3件 |
| `/api/select` | POST | ユーザー | 商品選択 → 次の候補 or 終了 |
| `/api/final` | POST | ユーザー | 最終レコメンド |
| `/api/admin/inventory` | PATCH | 管理者のみ | 在庫数を更新 |
