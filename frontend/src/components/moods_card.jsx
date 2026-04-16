// 【変更】isSelected を受け取る
function MoodsCard({ name, onClick, isSelected }) {
  return (
    // 【変更】isSelected が true なら 'is-selected' クラスを追加する
    <article 
      className={`mood-card ${isSelected ? 'is-selected' : ''}`} 
      onClick={onClick}
    >
      <div className="mood-card__body">
        <h2 className="mood-card__name">{name}</h2>
      </div>
    </article>
  );
}

export default MoodsCard;

/*function MoodsCard({ name }) {
  return (
    <article className="mood-card">
      <div className="mood-card__body">
        <h2 className="mood-card__name">{name}</h2>
      </div>
    </article>
  );
}

export default MoodsCard;
*/