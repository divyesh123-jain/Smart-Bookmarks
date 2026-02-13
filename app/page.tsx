import { createClient } from '@/lib/supabase/server'
import AddBookmark from '@/components/AddBookmark'
import BookmarkList from '@/components/BookmarkList'
import Landing from '@/components/Landing'
import LogoutButton from '@/components/LogoutButton'

export default async function Home() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
  }

  if (!user) {
    return <Landing />
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-lg font-medium tracking-tight text-white">
            Bookmarks
          </h1>
          <LogoutButton />
        </header>
        <AddBookmark />
        <BookmarkList />
      </div>
    </main>
  )
}
