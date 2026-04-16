import { useState, useCallback, useRef } from 'react'
import { ingestProducts, searchProducts } from '../api'

export function useProducts() {
  const [products, setProducts] = useState([])        // all enriched products
  const [displayed, setDisplayed] = useState([])      // currently shown
  const [status, setStatus] = useState('idle')        // idle | loading | ready | error
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState(null)            // { message, type }
  const debounceRef = useRef(null)
  const toastRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(toastRef.current)
    setToast({ message, type })
    toastRef.current = setTimeout(() => setToast(null), 3800)
  }, [])

  const loadProducts = useCallback(async () => {
    setStatus('loading')
    try {
      const enriched = await ingestProducts()
      setProducts(enriched)
      setDisplayed(enriched)
      setStatus('ready')
      showToast(`✅ ${enriched.length} products enriched and loaded`, 'success')
    } catch (err) {
      setStatus('error')
      showToast(`❌ ${err.message}`, 'error')
    }
  }, [showToast])

  const handleSearch = useCallback((value) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setDisplayed(products)
        return
      }
      try {
        const results = await searchProducts(value.trim())
        setDisplayed(results)
      } catch (err) {
        console.error('Search error:', err)
      }
    }, 280)
  }, [products])

  const clearSearch = useCallback(() => {
    setQuery('')
    setDisplayed(products)
  }, [products])

  return {
    products,
    displayed,
    status,
    query,
    toast,
    loadProducts,
    handleSearch,
    clearSearch,
  }
}
