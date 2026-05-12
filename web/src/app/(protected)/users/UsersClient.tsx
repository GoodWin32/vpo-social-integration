'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import FriendButton from '@/components/ui/FriendButton'
import { UKRAINE_REGIONS, INTERESTS } from '@/lib/types'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  region: string | null
  origin_city: string | null
  origin_region: string | null
  bio: string | null
  interests: string[]
  is_vpo: boolean
}

type MyProfile = {
  city: string | null
  region: string | null
  origin_city: string | null
  origin_region: string | null
  interests: string[] | null
}

const MODES = [
  { key: '', label: 'Всі', icon: '🔍' },
  { key: 'compatriots', label: 'Земляки', icon: '🏠', description: 'З мого регіону у моєму місті' },
  { key: 'neighborhood', label: 'У моєму місті', icon: '📍', description: 'Живуть у тому ж місті' },
  { key: 'interests', label: 'Спільні інтереси', icon: '✨', description: 'Збігаються інтереси' },
  { key: 'manual', label: 'Фільтри', icon: '⚙️' },
]

function matchBadges(p: Profile, my: MyProfile | null): { label: string; color: string }[] {
  if (!my) return []
  const badges: { label: string; color: string }[] = []

  const sameOriginRegion = my.origin_region && p.origin_region &&
    p.origin_region.toLowerCase() === my.origin_region.toLowerCase()
  const sameOriginCity = my.origin_city && p.origin_city &&
    p.origin_city.toLowerCase() === my.origin_city.toLowerCase()
  const sameCity = my.city && p.city &&
    p.city.toLowerCase() === my.city.toLowerCase()
  const sharedInterests = (my.interests ?? []).filter(i => (p.interests ?? []).includes(i))

  if (sameOriginCity)    badges.push({ label: `🏠 Земляк з ${p.origin_city}`, color: 'bg-amber-50 text-amber-700 border-amber-200' })
  else if (sameOriginRegion) badges.push({ label: `🏠 З ${p.origin_region}`, color: 'bg-amber-50 text-amber-700 border-amber-200' })
  if (sameCity)          badges.push({ label: `📍 ${p.city}`, color: 'bg-green-50 text-green-700 border-green-200' })
  if (sharedInterests.length > 0) badges.push({
    label: `✨ ${sharedInterests.length} спільних інтерес${sharedInterests.length === 1 ? '' : 'ів'}`,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  })

  return badges
}

export default function UsersClient({
  profiles,
  myProfile,
  currentUserId,
  activeMode,
  initialQ,
  initialRegion,
  initialCity,
  initialOriginRegion,
  initialInterests,
}: {
  profiles: Profile[]
  myProfile: MyProfile | null
  currentUserId: string
  activeMode: string
  initialQ: string
  initialRegion: string
  initialCity: string
  initialOriginRegion: string
  initialInterests: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [q, setQ] = useState(initialQ)
  const [region, setRegion] = useState(initialRegion)
  const [city, setCity] = useState(initialCity)
  const [originRegion, setOriginRegion] = useState(initialOriginRegion)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialInterests ? initialInterests.split(',').filter(Boolean) : []
  )
  const [showInterestPicker, setShowInterestPicker] = useState(false)

  const currentMode = activeMode || ''
  const isManual = currentMode === 'manual' || (currentMode === '' && (initialQ || initialRegion || initialCity || initialOriginRegion || initialInterests))

  function navigate(params: Record<string, string>) {
    const p = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v) })
    startTransition(() => router.push(`/users?${p.toString()}`))
  }

  function setMode(mode: string) {
    if (mode === 'manual') navigate({ mode: 'manual' })
    else navigate(mode ? { mode } : {})
  }

  function runSearch() {
    const params: Record<string, string> = { mode: 'manual' }
    if (q.trim())             params.q = q.trim()
    if (region)               params.region = region
    if (city.trim())          params.city = city.trim()
    if (originRegion)         params.origin_region = originRegion
    if (selectedInterests.length) params.interests = selectedInterests.join(',')
    navigate(params)
  }

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  // Mode descriptions for missing data
  const missingDataHint = () => {
    if (currentMode === 'compatriots' && !myProfile?.origin_region) {
      return 'Вкажіть регіон походження у своєму профілі, щоб знайти земляків.'
    }
    if ((currentMode === 'compatriots' || currentMode === 'neighborhood') && !myProfile?.city) {
      return 'Вкажіть поточне місто у своєму профілі.'
    }
    if (currentMode === 'interests' && !myProfile?.interests?.length) {
      return 'Вкажіть інтереси у своєму профілі, щоб знайти людей зі спільними захопленнями.'
    }
    return null
  }

  const hint = missingDataHint()

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Люди</h1>
        <p className="text-sm text-gray-500 mt-0.5">Знаходьте переселенців та волонтерів на платформі</p>
      </div>

      {/* Mode tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-3 flex gap-1.5 flex-wrap">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            title={m.description}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
              currentMode === m.key || (m.key === '' && !currentMode && !isManual)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode descriptions */}
      {currentMode === 'compatriots' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <span className="text-lg shrink-0">🏠</span>
          <div>
            <strong>Земляки</strong> — переселенці з{' '}
            <strong>{myProfile?.origin_region ?? '—'}</strong>, які зараз живуть у{' '}
            <strong>{myProfile?.city ?? '—'}</strong> як і ви.
          </div>
        </div>
      )}
      {currentMode === 'neighborhood' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-green-800 flex items-start gap-2">
          <span className="text-lg shrink-0">📍</span>
          <div>Люди, що живуть у <strong>{myProfile?.city ?? '—'}</strong> як і ви.</div>
        </div>
      )}
      {currentMode === 'interests' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="text-lg shrink-0">✨</span>
          <div>Люди зі спільними інтересами: <strong>{(myProfile?.interests ?? []).join(', ') || '—'}</strong></div>
        </div>
      )}

      {/* Missing data warning */}
      {hint && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-orange-700 flex items-center justify-between gap-3">
          <span>⚠️ {hint}</span>
          <Link href="/profile/edit" className="text-xs font-medium underline shrink-0">Заповнити профіль</Link>
        </div>
      )}

      {/* Manual filters panel */}
      {(currentMode === 'manual' || isManual) && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="Пошук за ім'ям..."
              className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="📍 Поточне місто..."
              className="min-w-36 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Поточний регіон — всі</option>
              {UKRAINE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={originRegion}
              onChange={e => setOriginRegion(e.target.value)}
              className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">🏠 Регіон походження — всі</option>
              {UKRAINE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Interests filter */}
          <div>
            <button
              type="button"
              onClick={() => setShowInterestPicker(v => !v)}
              className="text-sm text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
            >
              ✨ {selectedInterests.length > 0 ? `Інтереси: ${selectedInterests.join(', ')}` : 'Додати фільтр інтересів'}
              <span className="text-xs">{showInterestPicker ? '▲' : '▼'}</span>
            </button>
            {showInterestPicker && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition border ${
                      selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={runSearch}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Знайти
            </button>
            <button
              onClick={() => {
                setQ(''); setRegion(''); setCity(''); setOriginRegion(''); setSelectedInterests([])
                navigate({})
              }}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition"
            >
              Скинути
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl block mb-3">
            {currentMode === 'compatriots' ? '🏠' : currentMode === 'neighborhood' ? '📍' : '🔍'}
          </span>
          <p className="text-gray-500 font-medium">
            {currentMode === 'compatriots'
              ? 'Земляків поки не знайдено'
              : currentMode === 'neighborhood'
              ? 'У вашому місті поки нікого немає'
              : currentMode === 'interests'
              ? 'Нікого зі спільними інтересами не знайдено'
              : 'Нікого не знайдено'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Спробуйте змінити параметри пошуку</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 px-1">Знайдено: {profiles.length}</p>
          {profiles.map(p => {
            const badges = matchBadges(p, myProfile)
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-4">
                <Link href={`/users/${p.id}`} className="shrink-0 mt-0.5">
                  <Avatar src={p.avatar_url} name={p.full_name} size="md" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/users/${p.id}`}
                      className="font-semibold text-gray-800 hover:text-blue-600 transition"
                    >
                      {p.full_name ?? 'Користувач'}
                    </Link>
                    {p.is_vpo && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">ВПО</span>
                    )}
                  </div>

                  {/* Match badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {badges.map(b => (
                        <span key={b.label} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${b.color}`}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    {p.city && (
                      <span className="text-xs text-gray-400">📍 {p.city}{p.region ? `, ${p.region}` : ''}</span>
                    )}
                    {p.origin_region && (
                      <span className="text-xs text-gray-400">🏠 з {p.origin_city ? `${p.origin_city}, ` : ''}{p.origin_region}</span>
                    )}
                  </div>

                  {p.bio && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.bio}</p>
                  )}
                  {p.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.interests.slice(0, 4).map(i => {
                        const isShared = (myProfile?.interests ?? []).includes(i)
                        return (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isShared
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {i}
                          </span>
                        )
                      })}
                      {p.interests.length > 4 && (
                        <span className="text-xs text-gray-400">+{p.interests.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 mt-0.5">
                  <FriendButton
                    currentUserId={currentUserId}
                    targetUserId={p.id}
                    targetName={p.full_name}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
