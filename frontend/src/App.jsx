import { useState } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import Toast from './components/Toast'
import { EmptyState, LoadingState, NoResultsState } from './components/States'
import { useProducts } from './hooks/useProducts'

export default function App() {
  const {
    products,
    displayed,
    status,
    query,
    toast,
    loadProducts,
    handleSearch,
    clearSearch,
  } = useProducts()

  const [selectedProduct, setSelectedProduct] = useState(null)

  const isLoading  = status === 'loading'
  const isIdle     = status === 'idle' || status === 'error'
  const isReady    = status === 'ready'
  const noResults  = isReady && query && displayed.length === 0

  return (
    <div className="min-h-screen bg-canvas font-body">

      <Header onLoad={loadProducts} loading={isLoading} />

      <SearchBar
        query={query}
        onChange={handleSearch}
        onClear={clearSearch}
        resultCount={displayed.length}
        totalCount={products.length}
      />

      <main className="max-w-6xl mx-auto px-6 py-12 pb-20">
        {isIdle     && <EmptyState />}
        {isLoading  && <LoadingState />}
        {noResults  && <NoResultsState />}
        {isReady && !noResults && (
          <ProductGrid
            products={displayed}
            query={query}
            onCardClick={setSelectedProduct}
          />
        )}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Toast toast={toast} />

    </div>
  )
}
