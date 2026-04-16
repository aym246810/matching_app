function ProductsCard({ name, price, description, image, alt, onConsider, onChoose }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={image}
          alt={alt || name}
          loading="lazy"
        />
      </div>
      <div className="product-card__body">
        <p className="product-card__prompt">あなたのプロンプト</p>
        <h2 className="product-card__name">{name}</h2>
        <p className="product-card__price">価格：{price}円</p>
        <p className="product-card__note">{description}</p>
        <div className="product-card__actions">
          <button
            className="product-card__button product-card__button--ghost"
            type="button"
            onClick={onConsider}
          >
            気になる！
          </button>
          <button
            className="product-card__button product-card__button--solid"
            type="button"
            onClick={onChoose}
          >
            これにする！
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductsCard
