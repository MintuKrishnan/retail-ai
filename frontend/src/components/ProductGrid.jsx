import ProductCard from './ProductCard'

export default function ProductGrid({ products, query, onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          query={query}
          onClick={onCardClick}
          index={i}
        />
      ))}
    </div>
  )
}
