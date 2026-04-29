'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PostForm({ communityId, userId }: { communityId: string; userId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await supabase.from('community_posts').insert({ community_id: communityId, author_id: userId, content: content.trim() })
    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Написати допис або оголошення..."
        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 self-end"
      >
        Опублікувати
      </button>
    </form>
  )
}
