import RecomendCard from './components/recomend'
import { getProductImage } from './data/product_images'

function RecomendPage({ product, onRestart }) {
  if (!product) {
    return null
  }

  const item = {
    ...product,
    image: getProductImage(product.image),
    reason: product.reason || product.ai_comment || '今の気分にぴったりの一品です。',
  }

  return (
    <div className="recommend-page">
      <header className="recommend-page__header">
        <p className="recommend-page__eyebrow">おすすめセレクション</p>
        <h1 className="recommend-page__title">今日のレコメンド</h1>
      </header>
      <section className="recommend-grid">
        <RecomendCard {...item} />
      </section>
      {onRestart && (
        <div className="recommend-page__header">
          <button
            type="button"
            className="product-card__button product-card__button--ghost"
            onClick={onRestart}
          >
            最初からやり直す
          </button>
        </div>
      )}
    </div>
  )
}

export default RecomendPage
