# hackathon
# ハッカソン — コンビニ在庫連動レコメンドアプリ

## セットアップ手順

### 1. ライブラリのインストール

**Mac:**
```bash
pip3 install flask flask-cors boto3
```

**Windows:**
```bash
pip install flask flask-cors boto3
```

### 2. サーバーの起動

**Mac:**
```bash
python3 back2.py
```

**Windows:**
```bash
python back2.py
```

起動したらこの表示が出ればOK：
```
* Running on http://127.0.0.1:5000
* Debugger is active!
```

### 3. フロントと繋げる場合

APIのベースURLは `http://localhost:5000` です。
フロントを起動してから、バックも起動してください。

## テストの実行
```bash
# Mac
python3 test_back.py

# Windows
python test_back.py
```

## APIエンドポイント一覧

| パス | メソッド | 誰が使う | 何をする |
|---|---|---|---|
| `/api/mood` | POST | ユーザー | 気分タグ → 候補3件 |
| `/api/select` | POST | ユーザー | 商品選択 → 次の候補 or 終了 |
| `/api/final` | POST | ユーザー | 最終レコメンド |
| `/api/admin/inventory` | PATCH | 管理者のみ | 在庫数を更新 |

## 注意事項

- サーバー起動中はターミナルを閉じない
- 止める時は `Ctrl + C`
- コードを変更すると自動で再起動される