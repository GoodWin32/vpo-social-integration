'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import FriendButton from '@/components/ui/FriendButton'
import { UKRAINE_REGIONS } from '@/lib/types'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  region: string | null
  bio: string | null
  interests: string[]
  is_vpo: boolean
}

export default function UsersClient({
  profiles,
  currentUserId,
  initialQ,
  initialRegion,
}: {
  profiles: Profile[]
  currentUserId: string
  initialQ: string
  initialRegion: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)
  const [region, setRegion] = useState(initialRegion)

  function search() {
    const params = new URLSearchParams()
    if (q.trim())      params.set('q', q.trim())
    if (region.trim()) params.set('region', region.trim())
    startTransition(() => router.push(`/users?${params.toString()}`))
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Пошук за ім'ям..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option value="">Всі регіони</option>
          {UKRAINE_REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={search}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Знайти
        </button>
      </div>

      {/* Results */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-gray-500 font-medium">Нікого не знайдено</p>
          <p className="text-sm text-gray-400 mt-1">Спробуйте змінити параметри пошуку</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 px-1">Знайдено: {profiles.length}</p>
          {profiles.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <Link href={`/users/${p.id}`} className="shrink-0">
                <Avatar src={p.avatar_url} name={p.full_name} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/users/${p.id}`}
                  className="font-semibold text-gray-800 hover:text-blue-600 transition truncate block"
                >
                  {p.full_name ?? 'Користувач'}
                </Link>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {p.city && (
                    <span className="text-xs text-gray-400">📍 {p.city}{p.region ? `, ${p.region}` : ''}</span>
                  )}
                  {p.is_vpo && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">ВПО</span>
                  )}
                </div>
                {p.bio && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.bio}</p>
                )}
                {p.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.interests.slice(0, 3).map(i => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                    {p.interests.length > 3 && (
                      <span className="text-xs text-gray-400">+{p.interests.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <FriendButton
                  currentUserId={currentUserId}
                  targetUserId={p.id}
                  targetName={p.full_name}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
