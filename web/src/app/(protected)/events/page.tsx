import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EventCard from '@/components/EventCard'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Event } from '@/lib/types'
import { EVENT_CATEGORIES, UKRAINE_REGIONS } from '@/lib/types'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; region?: string; format?: string; upcoming?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*')
    .eq('is_approved', true)
    .order('starts_at')

  if (params.q)        query = query.ilike('title', `%${params.q}%`)
  if (params.category) query = query.eq('category', params.category)
  if (params.region)   query = query.eq('region', params.region)
  if (params.format)   query = query.eq('format', params.format)
  if (params.upcoming !== 'false') query = query.gte('starts_at', new Date().toISOString())

  const { data: events } = await query.limit(50)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Події"
        description="Знайдіть заходи та зустрічі поруч з вами"
        action={
          <Link href="/events/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Створити подію
          </Link>
        }
      />

      {/* Filters */}
      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Пошук</label>
          <input name="q" defaultValue={params.q} placeholder="Назва події..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="min-w-36">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Категорія</label>
          <select name="category" defaultValue={params.category} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі категорії</option>
            {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-36">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Регіон</label>
          <select name="region" defaultValue={params.region} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі регіони</option>
            {UKRAINE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="min-w-28">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Формат</label>
          <select name="format" defaultValue={params.format} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Будь-який</option>
            <option value="online">Онлайн</option>
            <option value="offline">Офлайн</option>
            <option value="hybrid">Гібрид</option>
          </select>
        </div>
        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" name="upcoming" value="false" id="past" defaultChecked={params.upcoming === 'false'} className="rounded" />
          <label htmlFor="past" className="text-sm text-gray-600">Показати минулі</label>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
          Шукати
        </button>
        {(params.q || params.category || params.region || params.format) && (
          <Link href="/events" className="text-sm text-gray-400 hover:text-gray-600 py-2">Скинути</Link>
        )}
      </form>

      {events && events.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">Знайдено {events.length} подій</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(events as Event[]).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </>
      ) : (
        <EmptyState
          icon="📅"
          title="Подій не знайдено"
          description="Спробуйте змінити параметри пошуку або організуйте власну подію"
          action={
            <Link href="/events/create" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-block">
              Створити подію
            </Link>
          }
        />
      )}
    </div>
  )
}
