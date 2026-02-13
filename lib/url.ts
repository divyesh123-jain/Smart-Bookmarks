export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function validateUrl(url: string): { ok: true; url: string } | { ok: false; error: string } {
  const normalized = normalizeUrl(url)
  if (!normalized) return { ok: false, error: 'URL is required' }
  try {
    const u = new URL(normalized)
    if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, error: 'URL must be http or https' }
    const host = u.hostname
    if (!host || (host !== 'localhost' && !host.includes('.'))) return { ok: false, error: 'Enter a valid URL (e.g. example.com)' }
    return { ok: true, url: normalized }
  } catch {
    return { ok: false, error: 'Invalid URL' }
  }
}

export function urlToTitle(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'Link'
  }
}
