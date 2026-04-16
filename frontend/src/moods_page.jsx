import { useState } from 'react';
import MoodsCard from './components/moods_card';
import moods from './data/moods.json';

function MoodsPage({ onChoose }) {
  const [selectedMoods, setSelectedMoods] = useState([]);

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood.id)) {
      // すでに選ばれていたら、リストから外す
      setSelectedMoods(selectedMoods.filter(id => id !== mood.id));
    } else {
      // まだ選ばれていなければ、リストに追加する
      setSelectedMoods([...selectedMoods, mood.id]);
    }
  };

  // 【追加】「次へ」ボタンが押された時の処理
  const handleNext = async () => {
    if (selectedMoods.length === 0) {
      alert("気分を1つ以上選択してください");
      return;
    }

    try {
      // 選択された気分IDから、対応する気分名を取得
      const moodTags = moods
        .filter((m) => selectedMoods.includes(m.id))
        .map((m) => m.name);

      // バックエンドの /api/mood エンドポイントに気分タグを送信
      const response = await fetch('http://localhost:5000/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mood_tags: moodTags,
          store_id: 1 
        }),
      });

      if (!response.ok) {
        throw new Error('商品の取得に失敗しました');
      }

      // バックエンドからのレスポンスデータを受け取る
      const data = await response.json();
      
      // 親(main.jsx)に渡すデータを作成
      // ProductsPage が必要なデータを渡す
      onChoose({
        moodTags: moodTags,
        initialCandidates: data.candidates || [],
        userVector: data.user_vector || [],
        cycle: data.cycle || 1,
        maxCycles: data.max_cycles || 3,
        noMatchOption: Boolean(data.no_match_option),
      });
      
    } catch (error) {
      alert("エラーが発生しました: " + error.message);
    }
  };

  return (
    <div className="moods-page">
      <header className="moods-page__header">
        <h1 className="moods-page__title">今の気分は？</h1>
        {/* 文言を少し変更 */}
        <p className="moods-page__subtitle">当てはまるものを選択してください（複数選択可）</p>
      </header>
      
      <section className="moods-list">
        {moods.map((mood) => (
          <MoodsCard
            key={mood.id}
            name={mood.name}
            // 【変更】選択中かどうか（true/false）と、クリック時の関数を渡す
            isSelected={selectedMoods.includes(mood.id)}
            onClick={() => toggleMood(mood)}
          />
        ))}
      </section>

      {/* 【追加】次へボタン */}
      <button className="moods-page__next-btn" onClick={handleNext}>
        次へ進む
      </button>
    </div>
  );
}

export default MoodsPage;
