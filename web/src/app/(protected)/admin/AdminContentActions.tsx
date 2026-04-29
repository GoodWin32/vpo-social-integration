'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminContentActions({
  table,
  id,
  approved,
  viewHref,
}: {
  table: 'communities' | 'events'
  id: string
  approved: boolean
  viewHref: string
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggleApprove() {
    setLoading(true)
    await supabase.from(table).update({ is_approved: !approved }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Видалити назавжди?')) return
    setLoading(true)
    await supabase.from(table).delete().eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1.5">
      <Link href={viewHref} className="text-xs px-2.5 py-1 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
        Перегляд
      </Link>
      <button
        onClick={toggleApprove}
        disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition disabled:opacity-50 ${
          approved ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
        }`}
      >
        {approved ? 'Приховати' : 'Схвалити'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-2.5 py-1 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
      >
        Видалити
      </button>
    </div>
  )
}
