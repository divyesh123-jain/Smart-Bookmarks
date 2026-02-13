'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Bookmark } from '@/types/bookmark'

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarks:', error)
      } else {
        setBookmarks(data || [])
      }

      setLoading(false)

      channel = supabase
        .channel('bookmarks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new as Bookmark, ...prev])
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
              )
            } else if (payload.eventType === 'UPDATE') {
              setBookmarks((prev) =>
                prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
              )
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="py-12 flex items-center gap-2">
        <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-sm text-white/50">Loading bookmarks…</span>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 rounded-lg border border-dashed border-white/15 text-center">
        <p className="text-sm text-white/40">No bookmarks yet.</p>
        <p className="text-xs text-white/30 mt-1">Add one above.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 hover:border-white/15 transition-colors"
        >
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 py-0.5"
          >
            <span className="text-sm text-white block truncate group-hover:text-white/90">
              {bookmark.title}
            </span>
            <span className="text-xs text-white/40 truncate block mt-0.5">
              {bookmark.url}
            </span>
          </a>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="shrink-0 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete bookmark"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
