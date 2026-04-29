import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CommunityCard from '@/components/CommunityCard'
import EventCard from '@/components/EventCard'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { profileCompletion } from '@/lib/utils'
import { Community, Event } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: communities },
    { data: events },
    { data: myCommunities },
    { data: myEvents },
    { count: unread },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('communities').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('events').select('*').eq('is_approved', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
    supabase.from('community_members').select('communities(*)').eq('user_id', user.id).limit(3),
    supabase.from('event_participants').select('events(*)').eq('user_id', user.id).limit(3),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
  ])

  const completion = profileCompletion(profile ?? {})
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Користувач'

  const statCards = [
    { icon: '👥', label: 'Спільнот',   value: myCommunities?.length ?? 0,  href: '/communities' },
    { icon: '📅', label: 'Подій',      value: myEvents?.length ?? 0,        href: '/events'      },
    { icon: '🔔', label: 'Сповіщень',  value: unread ?? 0,                   href: '/notifications' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="lg" className="border-2 border-white/30" />
          <div>
            <p className="text-blue-200 text-sm">Ласкаво просимо,</p>
            <h1 className="text-2xl font-bold">{firstName}!</h1>
            {profile?.city && <p className="text-blue-200 text-sm mt-0.5">📍 {profile.city}</p>}
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-blue-200 text-xs mb-1">Заповненість профілю</p>
          <p className="text-3xl font-bold">{completion}%</p>
          <div className="w-32 h-1.5 bg-blue-500 rounded-full mt-2">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      {/* Profile completion banner */}
      {completion < 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">Заповніть профіль на {100 - completion}% більше</p>
              <p className="text-xs text-yellow-600">Повний профіль допоможе знайти відповідні спільноти та ресурси</p>
            </div>
          </div>
          <Link href="/profile" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
            Заповнити
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recommended communities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Рекомендовані спільноти</h2>
            <Link href="/communities" className="text-blue-600 text-sm hover:underline">Усі →</Link>
          </div>
          <div className="space-y-3">
            {(communities as Community[] ?? []).slice(0, 3).map(c => (
              <Link key={c.id} href={`/communities/${c.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg shrink-0">👥</div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 group-hover:text-blue-600 transition truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.city ?? c.region ?? 'Онлайн'}</p>
                </div>
                {c.category && <Badge variant="blue" className="shrink-0">{c.category}</Badge>}
              </Link>
            ))}
            {(!communities || communities.length === 0) && (
              <div className="text-center py-8 text-gray-400 text-sm">Поки немає спільнот</div>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Найближчі події</h2>
            <Link href="/events" className="text-blue-600 text-sm hover:underline">Усі →</Link>
          </div>
          <div className="space-y-3">
            {(events as Event[] ?? []).slice(0, 3).map(e => (
              <Link key={e.id} href={`/events/${e.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg shrink-0">📅</div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 group-hover:text-green-600 transition truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' }).format(new Date(e.starts_at))}
                    {e.city && ` · ${e.city}`}
                  </p>
                </div>
              </Link>
            ))}
            {(!events || events.length === 0) && (
              <div className="text-center py-8 text-gray-400 text-sm">Поки немає подій</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '👥', label: 'Створити спільноту', href: '/communities/create', color: 'blue' },
          { icon: '📅', label: 'Організувати подію',  href: '/events/create',      color: 'green' },
          { icon: '📋', label: 'Знайти ресурс',       href: '/resources',          color: 'purple' },
          { icon: '👤', label: 'Редагувати профіль',  href: '/profile',            color: 'orange' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
          >
            <span className="text-2xl block mb-2">{link.icon}</span>
            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
