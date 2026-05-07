'use client'

import { useState } from 'react'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'

type HelpRequest = {
  id: string
  type: 'need' | 'offer'
  category: string
  title: string
  description: string | null
  city: string | null
  region: string | null
  contact_info: string | null
  created_at: string
  author_id: string
  profiles?: { id: string; full_name: string | null; avatar_url: string | null; city: string | null } | null
}

const CATEGORIES = [
  'Житло', 'Транспорт', 'Їжа', 'Одяг', 'Медицина', 'Психологічна підтримка',
  'Юридична допомога', 'Документи', 'Робота', 'Навчання', 'Дитячий садок / школа',
  'Речі', 'Фінансова допомога', 'Інше',
]

const typeLabels: Record<string, { label: string; color: string }> = {
  need: { label: 'Потрібна допомога', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  offer: { label: 'Пропоную допомогу', color: 'bg-green-100 text-green-700 border-green-200' },
}

export default function HelpClient({
  requests,
  currentUserId,
}: {
  requests: HelpRequest[]
  currentUserId: string
}) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'need' | 'offer'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const filtered = requests.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (categoryFilter && r.category !== categoryFilter) return false
    if (cityFilter && !r.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        {/* Type tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {(['all', 'need', 'offer'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                typeFilter === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'all' ? 'Всі' : t === 'need' ? '🙏 Потреби' : '💚 Пропозиції'}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600"
        >
          <option value="">Всі категорії</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* City */}
        <input
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          placeholder="🔍 Місто..."
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 flex-1 min-w-32"
        />

        {(typeFilter !== 'all' || categoryFilter || cityFilter) && (
          <button
            onClick={() => { setTypeFilter('all'); setCategoryFilter(''); setCityFilter('') }}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            ✕ Скинути
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">Оголошень не знайдено</p>
          <Link href="/help/create" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Додати перше оголошення →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(r => {
            const t = typeLabels[r.type]
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${t.color}`}>
                    {t.label}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(r.created_at)}</span>
                </div>

                {/* Category + title */}
                <div>
                  <span className="text-xs text-gray-400">{r.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-0.5 leading-snug">{r.title}</h3>
                </div>

                {/* Description */}
                {r.description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{r.description}</p>
                )}

                {/* Location */}
                {(r.city || r.region) && (
                  <p className="text-xs text-gray-400">
                    📍 {r.city}{r.region ? `, ${r.region}` : ''}
                  </p>
                )}

                {/* Footer: author + contact */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
                  <Link href={`/users/${r.author_id}`} className="flex items-center gap-2 hover:opacity-80 transition">
                    <Avatar src={r.profiles?.avatar_url} name={r.profiles?.full_name} size="xs" />
                    <span className="text-xs font-medium text-gray-700">
                      {r.profiles?.full_name ?? 'Користувач'}
                    </span>
                  </Link>
                  {r.contact_info && (
                    <span className="text-xs text-gray-500 truncate max-w-[140px]" title={r.contact_info}>
                      📞 {r.contact_info}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
