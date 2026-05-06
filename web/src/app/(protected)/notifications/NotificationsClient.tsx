'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationItem from '@/components/NotificationItem'
import { Notification } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'

export default function NotificationsClient({
  notifications: initial,
  userId,
}: {
  notifications: Notification[]
  userId: string
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initial)
  const supabase = createClient()

  // Auto-mark ALL unread as read the moment the page opens
  useEffect(() => {
    const hasUnread = initial.some(n => !n.is_read)
    if (!hasUnread) return

    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime: receive new notifications while on this page and mark them read immediately
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const n = payload.new as Notification
          // Mark read immediately since user is already viewing this page
          await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
          setNotifications(prev => [{ ...n, is_read: true }, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function handleRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <div>
      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔔"
          title="Немає сповіщень"
          description="Тут будуть з'являтись сповіщення про нові повідомлення, події та оновлення спільнот"
        />
      )}
    </div>
  )
}
