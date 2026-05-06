'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ComplaintActions({
  complaintId,
  postId,
  currentStatus,
}: {
  complaintId: string
  postId: string | null
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateStatus(status: 'reviewed' | 'dismissed') {
    setLoading(true)
    await supabase
      .from('post_complaints')
      .update({ status })
      .eq('id', complaintId)
    setLoading(false)
    router.refresh()
  }

  async function deletePost() {
    if (!postId) return
    if (!confirm('Видалити допис назавжди? Це незворотно.')) return
    setLoading(true)
    await supabase.from('community_posts').delete().eq('id', postId)
    // Mark complaint as reviewed after deleting the post
    await supabase
      .from('post_complaints')
      .update({ status: 'reviewed' })
      .eq('id', complaintId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      {currentStatus !== 'reviewed' && (
        <button
          onClick={() => updateStatus('reviewed')}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-50 text-green-700 hover:bg-green-100 transition disabled:opacity-50"
        >
          ✓ Розглянуто
        </button>
      )}
      {currentStatus !== 'dismissed' && (
        <button
          onClick={() => updateStatus('dismissed')}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Відхилити
        </button>
      )}
      {postId && (
        <button
          onClick={deletePost}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
        >
          Видалити допис
        </button>
      )}
    </div>
  )
}
