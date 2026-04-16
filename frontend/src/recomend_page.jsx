import RecomendCard from './components/recomend'
import custardChouxImage from './assets/unnamed.jpg'
import cheeseHashImage from './assets/unnamed (1).jpg'
import crispyChickenImage from './assets/unnamed (2).jpg'

const productImages = {
  'custard-choux': custardChouxImage,
  'cheese-hash': cheeseHashImage,
  'crispy-chicken': crispyChickenImage,
}

function RecomendPage({ product }) {
  if (!product) {
    return null
  }

  const item = {
    ...product,
    image: productImages[product.image] || custardChouxImage,
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
    </div>
  )
}

export default RecomendPage
