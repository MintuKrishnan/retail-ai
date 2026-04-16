import { useEffect } from 'react'

export default function ProductModal({ product, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!product) return null

  const price = product.price ? `$${Number(product.price).toFixed(2)}` : null
  const enrichedAt = product.enriched_at
    ? new Date(product.enriched_at).toLocaleString()
    : '—'

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/88 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <div className="
        bg-canvas-2 border border-border-bright rounded-xl w-full max-w-[620px]
        max-h-[90vh] overflow-y-auto relative
        shadow-[0_8px_40px_rgba(0,0,0,0.6)] animate-slideUp
      ">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            sticky top-4 float-right mr-4 mt-4 z-10
            w-8 h-8 rounded-full bg-canvas-3 border border-border
            text-ink-muted hover:text-ink hover:bg-border
            flex items-center justify-center text-xs
            transition-colors duration-150
          "
        >
          ✕
        </button>

        {/* Hero image */}
        <img
          src={product.image}
          alt={product.title}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/620/260` }}
          className="w-full h-64 object-cover rounded-t-xl"
        />

        {/* Content */}
        <div className="p-7 flex flex-col gap-4">

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {product.category && (
              <span className="font-display font-semibold text-[11px] uppercase tracking-widest text-ink-muted">
                {product.category}
              </span>
            )}
            {price && (
              <span className="bg-lime text-canvas font-display font-bold text-sm px-3 py-1 rounded-sm">
                {price}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display font-extrabold text-[26px] text-ink tracking-tight leading-none">
            {product.title}
          </h2>

          {/* SEO title */}
          {product.seo_title && (
            <p className="text-xs text-ink-dim italic">
              SEO: {product.seo_title}
            </p>
          )}

          {/* Description */}
          <div>
            <p className="font-display font-bold text-[10px] uppercase tracking-[0.12em] text-ink-dim mb-1.5">
              Description
            </p>
            <p className="text-[15px] text-ink-muted font-light leading-relaxed">
              {product.description || '—'}
            </p>
          </div>

          {/* Tags */}
          <div>
            <p className="font-display font-bold text-[10px] uppercase tracking-[0.12em] text-ink-dim mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(product.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="
                    bg-canvas-3 border border-border text-ink-muted
                    font-display font-semibold text-[10px] uppercase tracking-wider
                    px-2.5 py-1 rounded-sm
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer meta */}
          <div className="pt-4 mt-1 border-t border-border flex gap-4 flex-wrap text-[11px] text-ink-dim">
            <span>ID: {product.id}</span>
            <span>Enriched: {enrichedAt}</span>
            <span>Source: {product.enrichment_source || '—'}</span>
          </div>

        </div>
      </div>
    </div>
  )
}
