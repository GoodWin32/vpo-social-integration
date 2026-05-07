'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: string }

const mainNav: NavItem[] = [
  { href: '/dashboard',     label: 'Головна',      icon: '🏠' },
  { href: '/communities',   label: 'Спільноти',    icon: '👥' },
  { href: '/events',        label: 'Події',         icon: '📅' },
  { href: '/resources',     label: 'Ресурси',       icon: '📋' },
  { href: '/chat',          label: 'Чат',           icon: '💬' },
  { href: '/messages',      label: 'Повідомлення',  icon: '✉️' },
  { href: '/friends',       label: 'Друзі',         icon: '🤝' },
  { href: '/users',         label: 'Люди',          icon: '🔍' },
  { href: '/help',          label: 'Взаємодопомога', icon: '🤲' },
  { href: '/notifications', label: 'Сповіщення',    icon: '🔔' },
]

const profileNav: NavItem[] = [
  { href: '/profile', label: 'Профіль', icon: '👤' },
]

const adminNav: NavItem[] = [
  { href: '/admin',              label: 'Адмін панель', icon: '⚙️' },
  { href: '/admin/users',        label: 'Користувачі',  icon: '👤' },
  { href: '/admin/communities',  label: 'Спільноти',    icon: '👥' },
  { href: '/admin/events',       label: 'Події',        icon: '📅' },
  { href: '/admin/resources',    label: 'Ресурси',      icon: '📋' },
  { href: '/admin/complaints',   label: 'Скарги',       icon: '🚩' },
]

export default function Sidebar({
  profile,
  isAdmin = false,
  unreadCount: initialUnread = 0,
  unreadDmCount: initialDm = 0,
  pendingFriendCount: initialFriends = 0,
}: {
  profile: { id: string; full_name: string | null; avatar_url: string | null; city: string | null } | null
  isAdmin?: boolean
  unreadCount?: number
  unreadDmCount?: number
  pendingFriendCount?: number
}) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount]         = useState(initialUnread)
  const [unreadDmCount, setUnreadDmCount]     = useState(initialDm)
  const [pendingFriendCount, setPendingFriendCount] = useState(initialFriends)

  // Keep badge counts live via Realtime
  useEffect(() => {
    if (!profile?.id) return
    const supabase = createClient()
    const userId = profile.id

    // Notification badge — drop to 0 when user visits /notifications
    const notifChannel = supabase
      .channel(`sidebar-notif:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        async () => {
          const { count } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)
          setUnreadCount(count ?? 0)
        })
      .subscribe()

    // DM badge
    const dmChannel = supabase
      .channel(`sidebar-dm:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${userId}` },
        async () => {
          const { count } = await supabase
            .from('direct_messages')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false)
          setUnreadDmCount(count ?? 0)
        })
      .subscribe()

    // Friend request badge
    const friendChannel = supabase
      .channel(`sidebar-friends:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `addressee_id=eq.${userId}` },
        async () => {
          const { count } = await supabase
            .from('friendships')
            .select('id', { count: 'exact', head: true })
            .eq('addressee_id', userId)
            .eq('status', 'pending')
          setPendingFriendCount(count ?? 0)
        })
      .subscribe()

    return () => {
      supabase.removeChannel(notifChannel)
      supabase.removeChannel(dmChannel)
      supabase.removeChannel(friendChannel)
    }
  }, [profile?.id])

  // When navigating to /notifications, reset the badge immediately
  useEffect(() => {
    if (pathname === '/notifications') setUnreadCount(0)
    if (pathname === '/messages')      setUnreadDmCount(0)
    if (pathname === '/friends')       setPendingFriendCount(0)
  }, [pathname])

  function Badge({ count, color }: { count: number; color: string }) {
    if (count === 0) return null
    return (
      <span className={`ml-auto text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${color}`}>
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  function NavLink({ href, label, icon }: NavItem) {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <span className="text-base">{icon}</span>
        <span>{label}</span>
        {href === '/notifications' && <Badge count={unreadCount}      color="bg-red-500"    />}
        {href === '/messages'      && <Badge count={unreadDmCount}    color="bg-blue-600"   />}
        {href === '/friends'       && <Badge count={pendingFriendCount} color="bg-orange-500" />}
      </Link>
    )
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🇺🇦</span>
          <span className="font-bold text-blue-700">ВПО Платформа</span>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-100">
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {profile?.full_name ?? 'Користувач'}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile?.city ?? 'Місто не вказано'}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {mainNav.map(item => <NavLink key={item.href} {...item} />)}

        <div className="my-2 border-t border-gray-100" />

        {profileNav.map(item => <NavLink key={item.href} {...item} />)}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-gray-100" />
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Адміністрування
            </p>
            {adminNav.map(item => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <span>🚪</span>
            <span>Вийти</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
