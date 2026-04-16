export default function SearchBar({ query, onChange, onClear, resultCount, totalCount }) {
  const hasQuery = query.length > 0

  return (
    <section className="px-6 py-16 border-b border-border bg-gradient-to-b from-[#111115] to-canvas">
      <div className="max-w-2xl mx-auto">

        {/* Hero text */}
        <h1 className="font-display font-extrabold text-[clamp(40px,6vw,72px)] leading-none tracking-tighter text-ink mb-4">
          AI-Enriched
          <em className="not-italic text-lime block">Product Search</em>
        </h1>
        <p className="text-ink-muted font-light text-[15px] leading-relaxed max-w-lg mb-9">
          Products enriched with AI descriptions, SEO titles &amp; tags — powered by a
          pluggable enrichment pipeline.
        </p>

        {/* Search bar */}
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[22px] text-ink-dim pointer-events-none z-10 leading-none">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by title, description or tag…"
            autoComplete="off"
            className="
              w-full pl-12 pr-12 py-4 bg-canvas-2 border border-border rounded
              text-ink font-body text-base placeholder-ink-dim outline-none
              transition-all duration-150
              focus:border-lime focus:shadow-[0_0_0_3px_rgba(212,245,66,0.08)]
            "
          />
          {hasQuery && (
            <button
              onClick={onClear}
              className="absolute right-4 text-ink-dim hover:text-ink text-sm transition-colors p-1"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        {/* Result meta */}
        {hasQuery && (
          <p className="mt-3 text-[13px] text-ink-muted animate-fadeIn">
            <strong className="text-lime">{resultCount}</strong>{' '}
            result{resultCount !== 1 ? 's' : ''} for "
            <em className="not-italic text-ink">{query}</em>" —{' '}
            {totalCount} products indexed
          </p>
        )}

      </div>
    </section>
  )
}
