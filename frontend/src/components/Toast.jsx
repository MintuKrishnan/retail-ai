export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div
      className={`
        fixed bottom-7 right-7 z-[300]
        bg-canvas-2 border-border-bright text-ink
        text-[13px] px-5 py-3 rounded shadow-[0_8px_40px_rgba(0,0,0,0.6)]
        max-w-xs border animate-slideToast
        ${toast.type === 'success' ? 'border-l-2 border-l-lime' : ''}
        ${toast.type === 'error' ? 'border-l-2 border-l-coral' : ''}
      `}
    >
      {toast.message}
    </div>
  )
}
