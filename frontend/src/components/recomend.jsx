function RecomendCard({ image, name, description, price, reason, alt }) {
  return (
    <article className="recommend-card">
      <div className="recommend-card__image-wrap">
        <img className="recommend-card__image" src={image} alt={alt || name} />
      </div>
      <div className="recommend-card__body">
        <h2 className="recommend-card__name">{name}</h2>
        <p className="recommend-card__description">{description}</p>
        <p className="recommend-card__price">価格：{price}円</p>
        <div className="recommend-card__reason">
          <span className="recommend-card__reason-label">レコメンド理由</span>
          <p className="recommend-card__reason-text">{reason}</p>
        </div>
      </div>
    </article>
  )
}

export default RecomendCard
