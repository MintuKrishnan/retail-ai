/**
 * Returns an HTML string with query matches wrapped in <mark> tags.
 * Input `text` is HTML-escaped before highlighting to prevent XSS.
 */
export function highlightText(text, query) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  if (!query || !query.trim()) return escaped

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${safeQuery})`, 'gi')

  return escaped.replace(
    regex,
    '<mark class="search-highlight">$1</mark>'
  )
}
