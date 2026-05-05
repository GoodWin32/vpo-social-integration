import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import AdminContentActions from '../AdminContentActions'

export default async function AdminCommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('communities')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const { data: communities } = await query.limit(100)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Управління спільнотами" description={`Всього: ${communities?.length ?? 0}`} />

      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
        <input name="q" defaultValue={params.q} placeholder="Пошук за назвою..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">Шукати</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Назва</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Категорія</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Створив</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Дата</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {communities?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{c.name}</p>
                  {c.city && <p className="text-xs text-gray-400">📍 {c.city}</p>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {c.category ? <Badge variant="blue">{c.category}</Badge> : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.profiles?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.is_approved ? 'green' : 'yellow'}>
                    {c.is_approved ? 'Активна' : 'На перевірці'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminContentActions table="communities" id={c.id} approved={c.is_approved} viewHref={`/communities/${c.id}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!communities || communities.length === 0) && (
          <div className="py-12 text-center text-gray-400">Спільнот не знайдено</div>
        )}
      </div>
    </div>
  )
}
