import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import AdminContentActions from '../AdminContentActions'

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*, profiles(full_name)')
    .order('starts_at', { ascending: false })

  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: events } = await query.limit(100)

  const formatLabel: Record<string, string> = { online: 'Онлайн', offline: 'Офлайн', hybrid: 'Гібрид' }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Управління подіями" description={`Всього: ${events?.length ?? 0}`} />

      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
        <input name="q" defaultValue={params.q} placeholder="Пошук за назвою..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Шукати</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Подія</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Формат</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Організатор</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Дата</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events?.map(e => {
              const isPast = new Date(e.starts_at) < new Date()
              return (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{e.title}</p>
                    {e.city && <p className="text-xs text-gray-400">📍 {e.city}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={e.format === 'online' ? 'green' : e.format === 'hybrid' ? 'purple' : 'blue'}>
                      {formatLabel[e.format] ?? e.format}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{e.profiles?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(e.starts_at)}</td>
                  <td className="px-4 py-3">
                    {isPast
                      ? <Badge variant="gray">Завершено</Badge>
                      : e.is_approved
                        ? <Badge variant="green">Активна</Badge>
                        : <Badge variant="yellow">На перевірці</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <AdminContentActions table="events" id={e.id} approved={e.is_approved} viewHref={`/events/${e.id}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <div className="py-12 text-center text-gray-400">Подій не знайдено</div>
        )}
      </div>
    </div>
  )
}
