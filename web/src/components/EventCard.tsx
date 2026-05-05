import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Event } from '@/lib/types'
import { formatDate, truncate } from '@/lib/utils'

const formatBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'purple' }> = {
  online:  { label: 'Онлайн',  variant: 'green'  },
  offline: { label: 'Офлайн', variant: 'blue'   },
  hybrid:  { label: 'Гібрид',  variant: 'purple' },
}

export default function EventCard({ event }: { event: Event }) {
  const fmt = formatBadge[event.format] ?? formatBadge.offline
  const isPast = new Date(event.starts_at) < new Date()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-28 bg-gradient-to-br from-green-400 to-green-600 relative">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📅</div>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="gray">Завершено</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{event.title}</h3>
          <Badge variant={fmt.variant} className="shrink-0">{fmt.label}</Badge>
        </div>

        {event.description && (
          <p className="text-sm text-gray-500">{truncate(event.description, 80)}</p>
        )}

        <div className="flex flex-col gap-1 text-xs text-gray-400 mt-auto pt-2">
          <span className="flex items-center gap-1">
            <span>🗓</span>
            {formatDate(event.starts_at)}
          </span>
          {event.city && (
            <span className="flex items-center gap-1">
              <span>📍</span>{event.city}
            </span>
          )}
          {event.participant_count !== undefined && (
            <span className="flex items-center gap-1">
              <span>👤</span>{event.participant_count} учасник{event.participant_count === 1 ? '' : 'ів'}
              {event.max_participants && ` / ${event.max_participants}`}
            </span>
          )}
        </div>

        <Link
          href={`/events/${event.id}`}
          className="mt-2 w-full text-center bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm py-2 rounded-lg transition"
        >
          {isPast ? 'Деталі' : 'Зареєструватись'}
        </Link>
      </div>
    </div>
  )
}
