'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminUserActions({
  userId,
  currentStatus,
  currentRole,
}: {
  userId: string
  currentStatus: string
  currentRole: string
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggleBlock() {
    setLoading(true)
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    setLoading(false)
    router.refresh()
  }

  async function toggleAdmin() {
    setLoading(true)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={toggleBlock}
        disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition disabled:opacity-50 ${
          currentStatus === 'blocked'
            ? 'bg-green-50 text-green-600 hover:bg-green-100'
            : 'bg-red-50 text-red-600 hover:bg-red-100'
        }`}
      >
        {currentStatus === 'blocked' ? 'Розблок.' : 'Блок.'}
      </button>
      <button
        onClick={toggleAdmin}
        disabled={loading}
        className="text-xs px-2.5 py-1 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
      >
        {currentRole === 'admin' ? '↓ Юзер' : '↑ Адмін'}
      </button>
    </div>
  )
}
