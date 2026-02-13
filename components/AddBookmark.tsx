'use client'

import { createClient } from '@/lib/supabase/client'
import { validateUrl, urlToTitle } from '@/lib/url'
import { useState } from 'react'

export default function AddBookmark() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validated = validateUrl(url)
    if (!validated.ok) {
      setError(validated.error)
      return
    }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const bookmarkTitle = title.trim() || urlToTitle(validated.url)
    const { error: err } = await supabase.from('bookmarks').insert({
      url: validated.url,
      title: bookmarkTitle,
      user_id: user.id,
    })

    if (err) {
      setError(err.message)
    } else {
      setUrl('')
      setTitle('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL or type e.g. example.com"
          required
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm"
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full py-2.5 bg-white text-[#0a0a0a] text-sm font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          {loading ? 'Adding…' : 'Add bookmark'}
        </button>
      </div>
    </form>
  )
}
