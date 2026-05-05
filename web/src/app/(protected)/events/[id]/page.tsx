import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDateTime, formatDate } from '@/lib/utils'
import RegisterEventButton from './RegisterEventButton'

const formatLabels: Record<string, { label: string; icon: string }> = {
  online:  { label: 'Онлайн',  icon: '💻' },
  offline: { label: 'Офлайн', icon: '📍' },
  hybrid:  { label: 'Гібрид',  icon: '🔀' },
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: event }, { data: participants }] = await Promise.all([
    supabase.from('events').select('*, profiles(id, full_name, avatar_url, city)').eq('id', id).single(),
    supabase.from('event_participants').select('*, profiles(id, full_name, avatar_url)').eq('event_id', id).order('registered_at').limit(50),
  ])

  if (!event) notFound()

  const isRegistered = user ? participants?.some(p => p.user_id === user.id) ?? false : false
  const participantCount = participants?.length ?? 0
  const isFull = event.max_participants ? participantCount >= event.max_participants : false
  const isPast = new Date(event.starts_at) < new Date()
  const fmt = formatLabels[event.format] ?? formatLabels.offline

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Cover */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-br from-green-400 to-green-700 relative">
          {event.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          )}
          {isPast && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium">Подія завершена</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                <Badge variant={event.format === 'online' ? 'green' : event.format === 'hybrid' ? 'purple' : 'blue'}>
                  {fmt.icon} {fmt.label}
                </Badge>
                {event.category && <Badge variant="gray">{event.category}</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>🗓 {formatDateTime(event.starts_at)}</span>
                {event.ends_at && <span>до {formatDateTime(event.ends_at)}</span>}
              </div>
            </div>
            {user && !isPast && (
              <RegisterEventButton
                eventId={event.id}
                userId={user.id}
                isRegistered={isRegistered}
                isFull={isFull && !isRegistered}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {event.description && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Про подію</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Учасники ({participantCount}{event.max_participants ? `/${event.max_participants}` : ''})
            </h2>
            {participants && participants.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Avatar src={p.profiles?.avatar_url} name={p.profiles?.full_name} size="sm" />
                    <p className="text-sm text-gray-700 truncate">{p.profiles?.full_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Поки немає учасників</p>
            )}
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Деталі події</h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span>🗓</span>
                <div>
                  <p>{formatDate(event.starts_at)}</p>
                  <p className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.starts_at))}
                    {event.ends_at && ` — ${new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.ends_at))}`}
                  </p>
                </div>
              </div>

              {(event.city || event.address) && (
                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <div>
                    {event.city && <p>{event.city}{event.region && `, ${event.region}`}</p>}
                    {event.address && <p className="text-xs text-gray-400">{event.address}</p>}
                  </div>
                </div>
              )}

              {event.online_link && (
                <div className="flex items-start gap-2">
                  <span>💻</span>
                  <a href={event.online_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    Посилання на трансляцію
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>
                  {participantCount} учасник{participantCount === 1 ? '' : 'ів'}
                  {event.max_participants && ` (макс. ${event.max_participants})`}
                </span>
              </div>
            </div>
          </div>

          {/* Organizer */}
          {event.profiles && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Організатор</h3>
              <div className="flex items-center gap-3">
                <Avatar src={event.profiles.avatar_url} name={event.profiles.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{event.profiles.full_name}</p>
                  {event.profiles.city && <p className="text-xs text-gray-400">{event.profiles.city}</p>}
                </div>
              </div>
            </div>
          )}

          {user && !isPast && (
            <RegisterEventButton
              eventId={event.id}
              userId={user.id}
              isRegistered={isRegistered}
              isFull={isFull && !isRegistered}
              fullWidth
            />
          )}
        </div>
      </div>
    </div>
  )
}
