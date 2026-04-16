import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState } from 'react'
import ProductsPage from './Products_page'
import './index.css'
import RecomendPage from './recomend_page'
import MoodsPage from './moods_page'
import './moods.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
)

function AppRoot() {
  // 【修正】気分データ（複数の情報を含む）を保存するように変更
  const [moodData, setMoodData] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (selectedProduct) {
    return <RecomendPage product={selectedProduct} />
  }

  // 気分データが存在すれば ProductsPage を表示
  if (moodData) {
    return (
      <ProductsPage 
        initialData={moodData}
        onChoose={setSelectedProduct} 
      />
    )
  }

  return <MoodsPage onChoose={setMoodData} />
}