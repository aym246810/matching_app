// assets/products 内の画像を商品ID(ファイル名)をキーに自動で読み込む
const modules = import.meta.glob('../assets/products/*.{jpg,png}', {
  eager: true,
  import: 'default',
})

const productImages = {}
for (const [path, url] of Object.entries(modules)) {
  const id = path.split('/').pop().replace(/\.(jpg|png)$/, '')
  productImages[id] = url
}

export function getProductImage(imageId) {
  return productImages[imageId]
}

export default productImages
