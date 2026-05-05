import Link from 'next/link'
import { Notification } from '@/lib/types'
import { formatRelativeTime, cn } from '@/lib/utils'

const typeIcons: Record<string, string> = {
  message:   '💬',
  event:     '📅',
  community: '👥',
  admin:     '⚙️',
}

export default function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification
  onRead?: (id: string) => void
}) {
  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer',
        notification.is_read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'
      )}
      onClick={() => !notification.is_read && onRead?.(notification.id)}
    >
      <span className="text-xl shrink-0 mt-0.5">
        {typeIcons[notification.type] ?? '🔔'}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', notification.is_read ? 'text-gray-700' : 'text-gray-900')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-gray-500 mt-0.5">{notification.body}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
      )}
    </div>
  )

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>
  }
  return content
}
