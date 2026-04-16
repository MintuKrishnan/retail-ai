const BASE = '/api'

export async function ingestProducts() {
  const res = await fetch(`${BASE}/ingest-products`, { method: 'POST' })
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Ingest failed')
  return data.products
}

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`)
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  const data = await res.json()
  return data.products
}

export async function searchProducts(query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  const data = await res.json()
  return data.products
}
