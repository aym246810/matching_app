# test_back.py
# Flaskもboto3も不要で動く。back2.pyと同じフォルダに置いて実行

import json

# ── back2.pyの関数を直接インポート ──
# (AWSに繋がなくてもローカルデータで動く)
from back2 import (
    build_user_vector, update_user_vector, recommend,
    product_to_json, generate_ai_comment, PRODUCTS, TAGS
)

def run_test(label, result):
    print(f"\n{'='*50}")
    print(f"【{label}】")
    print(json.dumps(result, ensure_ascii=False, indent=2))

# ─────────────────────────────────────────
# テスト1: /api/mood の動作確認
# フロント→バック: 気分タグを送る
# ─────────────────────────────────────────
mood_tags   = ["甘い", "チョコ", "濃厚"]
user_vector = build_user_vector(mood_tags)
products    = PRODUCTS  # ローカルデータ使用
candidates  = recommend(user_vector, products)

mood_response = {
    "user_vector":     user_vector,
    "cycle":           1,
    "max_cycles":      3,
    "candidates":      [product_to_json(p) for p in candidates],
    "no_match_option": True,
}
run_test("/api/mood レスポンス", mood_response)

# ─────────────────────────────────────────
# テスト2: /api/select（気になる）の動作確認
# フロント→バック: action="interested" で次の候補を要求
# ─────────────────────────────────────────
selected = candidates[0]
user_vector_2 = update_user_vector(user_vector, selected["vector"])
selected_ids  = [selected["id"]]
next_candidates = recommend(user_vector_2, products, exclude_ids=selected_ids)
next_cycle = 2
is_final   = next_cycle >= 3

select_interested_response = {
    "user_vector":     user_vector_2,
    "cycle":           next_cycle,
    "max_cycles":      3,
    "candidates":      [product_to_json(p) for p in next_candidates],
    "no_match_option": not is_final,
    "is_final":        is_final,
}
run_test(f"/api/select（気になる）→ {selected['name']} を気になる", select_interested_response)

# ─────────────────────────────────────────
# テスト3: /api/select（それにする）の動作確認
# フロント→バック: action="decide" で即finalへ
# ─────────────────────────────────────────
decided_product  = product_to_json(next_candidates[0])
ai_comment       = generate_ai_comment(user_vector_2, decided_product)

select_decide_response = {
    "recommendation": decided_product,
    "ai_comment":     ai_comment,
}
run_test(f"/api/select（それにする）→ {decided_product['name']} に決定", select_decide_response)

# ─────────────────────────────────────────
# テスト4: /api/final の動作確認
# 3サイクル全部回した後の最終レスポンス
# ─────────────────────────────────────────
final_product = product_to_json(next_candidates[0])
ai_comment_final = generate_ai_comment(user_vector_2, final_product)

final_response = {
    "recommendation": final_product,
    "ai_comment":     ai_comment_final,
}
run_test("/api/final レスポンス（3サイクル後）", final_response)

# ─────────────────────────────────────────
# テスト5: no_match（気分に合うものない）の動作確認
# ─────────────────────────────────────────
no_match_candidates = recommend(user_vector, products)  # ベクトル更新なし

no_match_response = {
    "user_vector":     user_vector,
    "cycle":           2,
    "max_cycles":      3,
    "candidates":      [product_to_json(p) for p in no_match_candidates],
    "no_match_option": True,
    "is_final":        False,
}
run_test("/api/select（no_match=True）", no_match_response)

print("\n\n✅ 全テスト完了！")