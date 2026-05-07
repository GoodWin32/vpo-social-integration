import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CommunityCard from '@/components/CommunityCard'
import PageHeader from '@/components/layout/PageHeader'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { Community } from '@/lib/types'
import { COMMUNITY_CATEGORIES, UKRAINE_REGIONS } from '@/lib/types'

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; region?: string; city?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('communities')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (params.q)        query = query.ilike('name', `%${params.q}%`)
  if (params.category) query = query.eq('category', params.category)
  if (params.region)   query = query.eq('region', params.region)
  if (params.city)     query = query.ilike('city', `%${params.city}%`)

  const { data: communities } = await query.limit(50)

  const memberCounts: Record<string, number> = {}
  if (communities) {
    for (const c of communities) {
      const { count } = await supabase
        .from('community_members')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', c.id)
      memberCounts[c.id] = count ?? 0
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Спільноти"
        description="Знайдіть спільноту за інтересами або створіть власну"
        action={
          <Link href="/communities/create">
            <Button>+ Створити спільноту</Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Пошук</label>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Назва спільноти..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-40">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Категорія</label>
          <select name="category" defaultValue={params.category} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі категорії</option>
            {COMMUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-40">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Регіон</label>
          <select name="region" defaultValue={params.region} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі регіони</option>
            {UKRAINE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="min-w-32">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Місто</label>
          <input name="city" defaultValue={params.city} placeholder="Київ..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
          Шукати
        </button>
        {(params.q || params.category || params.region || params.city) && (
          <Link href="/communities" className="text-sm text-gray-400 hover:text-gray-600 transition py-2">
            Скинути
          </Link>
        )}
      </form>

      {/* Results */}
      {communities && communities.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">Знайдено {communities.length} спільнот</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(communities as Community[]).map(c => (
              <CommunityCard key={c.id} community={c} memberCount={memberCounts[c.id] ?? 0} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon="👥"
          title="Спільнот не знайдено"
          description="Спробуйте змінити параметри пошуку або створіть нову спільноту"
          action={
            <Link href="/communities/create">
              <Button>Створити першу спільноту</Button>
            </Link>
          }
        />
      )}
    </div>
  )
}
