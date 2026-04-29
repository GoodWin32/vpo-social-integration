'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationItem from '@/components/NotificationItem'
import { Notification } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function NotificationsClient({ notifications: initial, userId }: { notifications: Notification[]; userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>(initial)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const unread = notifications.filter(n => !n.is_read)

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    router.refresh()
  }

  async function markAllRead() {
    setLoading(true)
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      {unread.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{unread.length} непрочитаних</p>
          <Button variant="ghost" size="sm" loading={loading} onClick={markAllRead}>
            Позначити всі прочитаними
          </Button>
        </div>
      )}

      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
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
