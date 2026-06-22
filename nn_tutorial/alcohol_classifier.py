"""
Chainerチュートリアル13章「ニューラルネットワークの基礎」
https://tutorials.chainer.org/ja/13_Basics_of_Neural_Networks.html
で説明されている順伝播・誤差逆伝播・勾配降下法を、
そのまま「赤ワイン/白ワインの分類」に当てはめた学習用の実装。

NumPyのみを使い、フレームワークの自動微分には頼らず、
forward / loss / backward / update の4ステップを全て自分の式で書く。
"""

import numpy as np

np.random.seed(0)

# ----------------------------------------------------------------------
# 1. データを用意する
#    特徴量: 年数, アルコール度数, 色の濃さ
#    ラベル : 赤ワイン = 1, 白ワイン = 0
# ----------------------------------------------------------------------
N_PER_CLASS = 50

# 赤ワインらしいデータ(色が濃く、度数が高めの傾向)
red_years = np.random.normal(5, 1.5, N_PER_CLASS)
red_alcohol = np.random.normal(13.5, 0.8, N_PER_CLASS)
red_color = np.random.normal(8, 1.0, N_PER_CLASS)
red = np.stack([red_years, red_alcohol, red_color], axis=1)

# 白ワインらしいデータ(色が薄く、度数が低めの傾向)
white_years = np.random.normal(2, 1.0, N_PER_CLASS)
white_alcohol = np.random.normal(11.0, 0.8, N_PER_CLASS)
white_color = np.random.normal(2, 1.0, N_PER_CLASS)
white = np.stack([white_years, white_alcohol, white_color], axis=1)

X = np.vstack([red, white])
t = np.concatenate([np.ones(N_PER_CLASS), np.zeros(N_PER_CLASS)]).reshape(-1, 1)

# シャッフルしてから訓練用(80件)とテスト用(20件)に分割する
indices = np.random.permutation(len(X))
X, t = X[indices], t[indices]

n_train = int(len(X) * 0.8)
X_train, X_test = X[:n_train], X[n_train:]
t_train, t_test = t[:n_train], t[n_train:]

# シグモイドに渡す値が大きすぎると学習が進みにくくなるため、
# 訓練データの平均・標準偏差で標準化する(テストにも同じ値を使う)
mean = X_train.mean(axis=0)
std = X_train.std(axis=0)
X_train = (X_train - mean) / std
X_test = (X_test - mean) / std


# ----------------------------------------------------------------------
# 2. ネットワークを定義する
#    入力3 -> 中間層4(シグモイド) -> 出力1(シグモイド)
# ----------------------------------------------------------------------
def sigmoid(x):
    return 1 / (1 + np.exp(-x))


n_input, n_hidden, n_output = 3, 4, 1

W1 = np.random.randn(n_input, n_hidden) * 0.5
b1 = np.zeros(n_hidden)
W2 = np.random.randn(n_hidden, n_output) * 0.5
b2 = np.zeros(n_output)


# ----------------------------------------------------------------------
# 3. 学習(勾配降下法でW1, b1, W2, b2を更新していく)
# ----------------------------------------------------------------------
learning_rate = 0.1
n_epochs = 2000

for epoch in range(n_epochs):
    # --- 順伝播 ---
    u1 = X_train.dot(W1) + b1
    h1 = sigmoid(u1)
    u2 = h1.dot(W2) + b2
    y = sigmoid(u2)

    # --- 損失(交差エントロピー誤差) ---
    eps = 1e-7  # log(0)を避けるための微小値
    loss = -np.mean(t_train * np.log(y + eps) + (1 - t_train) * np.log(1 - y + eps))

    # --- 逆伝播(連鎖律で勾配を求める) ---
    # シグモイド出力 + 交差エントロピーの組み合わせでは dL/du2 がこの形になる
    dL_du2 = (y - t_train) / len(X_train)
    dL_dW2 = h1.T.dot(dL_du2)
    dL_db2 = dL_du2.sum(axis=0)

    dL_dh1 = dL_du2.dot(W2.T)
    dL_du1 = dL_dh1 * h1 * (1 - h1)  # シグモイドの導関数
    dL_dW1 = X_train.T.dot(dL_du1)
    dL_db1 = dL_du1.sum(axis=0)

    # --- パラメータ更新 ---
    W2 -= learning_rate * dL_dW2
    b2 -= learning_rate * dL_db2
    W1 -= learning_rate * dL_dW1
    b1 -= learning_rate * dL_db1

    if epoch % 200 == 0:
        print(f"epoch {epoch:4d}: loss = {loss:.4f}")


# ----------------------------------------------------------------------
# 4. テストデータで評価する
# ----------------------------------------------------------------------
h1_test = sigmoid(X_test.dot(W1) + b1)
y_test = sigmoid(h1_test.dot(W2) + b2)
predicted = (y_test > 0.5).astype(int)

accuracy = (predicted == t_test).mean()
print(f"\nテストデータでの正解率: {accuracy * 100:.1f}%")
