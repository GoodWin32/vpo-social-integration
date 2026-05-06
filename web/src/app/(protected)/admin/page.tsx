import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import { formatRelativeTime } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: communityCount },
    { count: eventCount },
    { count: resourceCount },
    { count: pendingComplaintCount },
    { data: recentUsers },
    { data: recentActions },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('communities').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('post_complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('id, full_name, city, role, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('admin_actions').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(10),
  ])

  const stats = [
    { icon: '👤', label: 'Користувачів', value: userCount ?? 0,             href: '/admin/users',       color: 'blue'   },
    { icon: '👥', label: 'Спільнот',     value: communityCount ?? 0,        href: '/admin/communities', color: 'green'  },
    { icon: '📅', label: 'Подій',        value: eventCount ?? 0,            href: '/admin/events',      color: 'purple' },
    { icon: '📋', label: 'Ресурсів',     value: resourceCount ?? 0,         href: '/admin/resources',   color: 'orange' },
    { icon: '🚩', label: 'Нових скарг',  value: pendingComplaintCount ?? 0, href: '/admin/complaints',  color: 'red'    },
  ]

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50 text-red-600',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Адміністрування" description="Управління платформою ВПО" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${colorMap[s.color]}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Нові користувачі</h2>
            <Link href="/admin/users" className="text-blue-600 text-sm hover:underline">Всі →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers?.map(u => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.full_name ?? 'Без імені'}</p>
                  <p className="text-xs text-gray-400">{u.city ?? '—'} · {formatRelativeTime(u.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {u.status === 'blocked' ? 'Заблоковано' : 'Активний'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Швидкі дії</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Керування користувачами', href: '/admin/users',        icon: '👤' },
              { label: 'Модерація спільнот',       href: '/admin/communities',  icon: '👥' },
              { label: 'Управління подіями',        href: '/admin/events',       icon: '📅' },
              { label: 'Ресурси допомоги',          href: '/admin/resources',    icon: '📋' },
              { label: 'Скарги користувачів',       href: '/admin/complaints',   icon: '🚩' },
            ].map(a => (
              <Link key={a.href} href={a.href} className="bg-gray-50 hover:bg-blue-50 rounded-xl p-4 text-center group transition">
                <span className="text-2xl block mb-1">{a.icon}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Admin log */}
      {recentActions && recentActions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="font-bold text-gray-900 mb-4">Журнал дій</h2>
          <div className="space-y-2">
            {recentActions.map(a => (
              <div key={a.id} className="flex items-start justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium text-gray-700">{a.profiles?.full_name ?? 'Адмін'}</span>
                  <span className="text-gray-500 ml-2">{a.description}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">{formatRelativeTime(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
