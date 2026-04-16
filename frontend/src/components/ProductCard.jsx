import { highlightText } from '../utils/highlight'

export default function ProductCard({ product, query, onClick, index }) {
  const price = product.price ? `$${Number(product.price).toFixed(2)}` : null
  const visibleTags = (product.tags || []).slice(0, 4)

  return (
    <article
      onClick={() => onClick(product)}
      className="
        group bg-[#131315] border border-border rounded-xl overflow-hidden
        cursor-pointer flex flex-col
        transition-all duration-150
        hover:border-border-bright hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]
        animate-fadeUp
      "
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-canvas-3">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${product.id}/400/300`
          }}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
        {product.category && (
          <span className="
            absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-ink-muted
            font-display font-semibold text-[10px] uppercase tracking-widest
            px-2.5 py-1 rounded-sm border border-border
          ">
            {product.category}
          </span>
        )}
        {price && (
          <span className="
            absolute top-3 right-3 bg-lime text-canvas
            font-display font-bold text-[13px] px-2.5 py-1 rounded-sm
          ">
            {price}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h2
          className="font-display font-bold text-base text-ink leading-tight tracking-tight"
          dangerouslySetInnerHTML={{ __html: highlightText(product.title || '—', query) }}
        />
        <p
          className="text-[13px] text-ink-muted font-light leading-relaxed line-clamp-2"
          dangerouslySetInnerHTML={{ __html: highlightText(product.description || '', query) }}
        />
        <div className="flex flex-wrap gap-1.5 mt-1">
          {visibleTags.map((tag) => {
            const isMatch = query && tag.toLowerCase().includes(query.toLowerCase())
            return (
              <span
                key={tag}
                className={`
                  font-display font-semibold text-[10px] uppercase tracking-wider
                  px-2 py-0.5 rounded-sm border transition-colors
                  ${isMatch
                    ? 'bg-lime-dim border-lime/20 text-lime'
                    : 'bg-canvas-3 border-border text-ink-muted'
                  }
                `}
              >
                {tag}
              </span>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <span className="font-display text-[11px] uppercase tracking-wider text-ink-dim">
          ⚙ {product.enrichment_source || 'ai'}
        </span>
        <span className="text-lime text-base transition-transform duration-150 group-hover:translate-x-1">
          →
        </span>
      </div>
    </article>
  )
}
