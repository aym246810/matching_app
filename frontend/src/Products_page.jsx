import { useEffect, useState } from 'react'
import ProductsCard from './components/products_card'
import { getProductImage } from './data/product_images'
import { API_BASE } from './api'

function ProductsPage({ initialData, onChoose }) {
  const [products, setProducts] = useState([])
  const [userVector, setUserVector] = useState([])
  const [cycle, setCycle] = useState(1)
  const [maxCycles, setMaxCycles] = useState(3)
  const [selectedIds, setSelectedIds] = useState([])
  const [noMatchOption, setNoMatchOption] = useState(true)
  const [isFinal, setIsFinal] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // initialData から初期化
    if (initialData) {
      setProducts(initialData.initialCandidates || [])
      setUserVector(initialData.userVector || [])
      setCycle(initialData.cycle || 1)
      setMaxCycles(initialData.maxCycles || 3)
      setNoMatchOption(Boolean(initialData.noMatchOption))
      setSelectedIds([])
      setError('')
    }
  }, [])

  const handleSelect = async (product) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_vector: userVector,
          cycle,
          selected_product: product,
          selected_ids: selectedIds,
          store_id: 1,
          action: 'interested',
          no_match: false,
        }),
      })
      if (!response.ok) {
        throw new Error('商品の送信に失敗しました。')
      }
      const data = await response.json()
      setProducts(data.candidates || [])
      setUserVector(data.user_vector || userVector)
      setCycle(data.cycle || cycle)
      setMaxCycles(data.max_cycles || maxCycles)
      setNoMatchOption(Boolean(data.no_match_option))
      setIsFinal(Boolean(data.is_final))
      setSelectedIds((prev) => [...prev, product.id])
      setError('')
    } catch (e) {
      setError('商品の送信に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleChoose = async (product) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_vector: userVector,
          cycle,
          selected_product: product,
          selected_ids: selectedIds,
          store_id: 1,
          action: 'decide',
          no_match: false,
        }),
      })
      if (!response.ok) {
        throw new Error('レコメンドの取得に失敗しました。')
      }
      const data = await response.json()
      onChoose({
        ...(data.recommendation || product),
        reason: data.ai_comment,
      })
      setError('')
    } catch (e) {
      setError('レコメンドの取得に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleNoMatch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_vector: userVector,
          cycle,
          selected_product: null,
          selected_ids: selectedIds,
          store_id: 1,
          action: 'interested',
          no_match: true,
        }),
      })
      if (!response.ok) {
        throw new Error('候補の更新に失敗しました。')
      }
      const data = await response.json()
      setProducts(data.candidates || [])
      setUserVector(data.user_vector || userVector)
      setCycle(data.cycle || cycle)
      setMaxCycles(data.max_cycles || maxCycles)
      setNoMatchOption(Boolean(data.no_match_option))
      setIsFinal(Boolean(data.is_final))
      setError('')
    } catch (e) {
      setError('候補の更新に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="products-page">
      <header className="products-page__header">
        <h1 className="products-page__title">おすすめ3選（{cycle} / {maxCycles}）</h1>
        {isFinal && (
          <p className="products-page__subtitle">最終候補です。この中から選んでください！</p>
        )}
      </header>
      {error && <p className="products-page__error">{error}</p>}
      {loading && <p className="products-page__error">読み込み中...</p>}
      <section className="products-grid">
        {products.map((product) => (
          <ProductsCard
            key={product.id}
            name={product.name}
            price={product.price}
            description={product.description}
            image={getProductImage(product.image)}
            alt={product.alt}
            onConsider={isFinal ? null : () => handleSelect(product)}
            onChoose={() => handleChoose(product)}
          />
        ))}
      </section>
      {noMatchOption && (
        <div className="products-page__header">
          <button type="button" className="product-card__button product-card__button--ghost" onClick={handleNoMatch}>
            気分に合うものがない
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
