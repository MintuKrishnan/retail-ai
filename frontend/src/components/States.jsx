export function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center px-8">
      <span className="text-[64px] text-ink-dim leading-none mb-5">◫</span>
      <h2 className="font-display font-bold text-2xl text-ink mb-2">No products loaded yet</h2>
      <p className="text-ink-muted text-[15px]">
        Click <strong className="text-lime font-semibold">Load Products</strong> in the header to ingest and enrich the catalog.
      </p>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center py-20 gap-6">
      <div className="w-14 h-14 border-2 border-border border-t-lime rounded-full animate-spin" />
      <p className="text-ink-muted text-sm tracking-wide">Enriching products with AI…</p>
    </div>
  )
}

export function NoResultsState() {
  return (
    <div className="flex flex-col items-center py-20 text-center px-8">
      <span className="text-[64px] text-ink-dim leading-none mb-5">◌</span>
      <h2 className="font-display font-bold text-2xl text-ink mb-2">No results found</h2>
      <p className="text-ink-muted text-[15px]">Try a different search term.</p>
    </div>
  )
}
