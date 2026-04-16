export default function Header({ onLoad, loading }) {
  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between" style={{ height: '60px' }}>

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="text-lime text-2xl leading-none">◈</span>
          <span className="font-display font-extrabold text-[17px] uppercase tracking-tight text-ink">
            RetailAI{' '}
            <sup className="text-[9px] font-semibold text-ink-muted tracking-widest align-top mt-0.5 ml-0.5">
              POC
            </sup>
          </span>
        </div>

        {/* Load button */}
        <button
          onClick={onLoad}
          disabled={loading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded font-display text-[13px]
            font-semibold uppercase tracking-wider transition-all duration-150
            ${loading
              ? 'bg-canvas-3 text-ink-dim cursor-not-allowed'
              : 'bg-lime text-canvas hover:bg-lime-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(212,245,66,0.25)] active:translate-y-0'
            }
          `}
        >
          <span className={`text-base leading-none ${loading ? 'animate-spin' : ''}`}>⟳</span>
          <span>{loading ? 'Enriching…' : 'Load Products'}</span>
        </button>

      </div>
    </header>
  )
}
