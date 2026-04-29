import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import AdminUserActions from './AdminUserActions'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; role?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

  if (params.q)      query = query.ilike('full_name', `%${params.q}%`)
  if (params.status) query = query.eq('status', params.status)
  if (params.role)   query = query.eq('role', params.role)

  const { data: users, count } = await query.limit(100)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Управління користувачами" description={`Всього: ${count ?? users?.length ?? 0} користувачів`} />

      {/* Filters */}
      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={params.q} placeholder="Пошук за ім'ям..." className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="status" defaultValue={params.status} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Всі статуси</option>
          <option value="active">Активні</option>
          <option value="blocked">Заблоковані</option>
        </select>
        <select name="role" defaultValue={params.role} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">Всі ролі</option>
          <option value="user">Користувачі</option>
          <option value="admin">Адміністратори</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
          Шукати
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Користувач</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Місто</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Дата реєстрації</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Роль</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-800">{user.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-32">{user.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.city ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === 'blocked' ? 'red' : 'green'}>
                    {user.status === 'blocked' ? 'Заблок.' : 'Активний'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'admin' ? 'purple' : 'gray'}>
                    {user.role === 'admin' ? 'Адмін' : 'Юзер'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminUserActions userId={user.id} currentStatus={user.status} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="py-12 text-center text-gray-400">Користувачів не знайдено</div>
        )}
      </div>
    </div>
  )
}
