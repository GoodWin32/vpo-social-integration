import { createClient } from '@/lib/supabase/server'
import ResourceCard from '@/components/ResourceCard'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Resource } from '@/lib/types'
import { UKRAINE_REGIONS } from '@/lib/types'
import Link from 'next/link'

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; region?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase.from('resource_categories').select('*').order('name')

  let query = supabase
    .from('resources')
    .select('*, resource_categories(*)')
    .order('created_at', { ascending: false })

  if (params.q)        query = query.ilike('title', `%${params.q}%`)
  if (params.region)   query = query.eq('region', params.region)
  if (params.category) {
    const cat = categories?.find(c => c.slug === params.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data: resources } = await query.limit(50)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Ресурси та допомога"
        description="Перевірена інформація про соціальні служби та організації допомоги"
      />

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        <Link
          href="/resources"
          className={`px-4 py-2 rounded-full text-sm font-medium transition border ${!params.category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
        >
          Всі
        </Link>
        {categories?.map(cat => (
          <Link
            key={cat.id}
            href={`/resources?category=${cat.slug}${params.region ? `&region=${params.region}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${params.category === cat.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Search & filters */}
      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Пошук</label>
          <input name="q" defaultValue={params.q} placeholder="Назва організації або ресурсу..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input type="hidden" name="category" value={params.category ?? ''} />
        <div className="min-w-40">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Регіон</label>
          <select name="region" defaultValue={params.region} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі регіони</option>
            {UKRAINE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
          Шукати
        </button>
      </form>

      {resources && resources.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">Знайдено {resources.length} ресурсів</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(resources as Resource[]).map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </>
      ) : (
        <EmptyState icon="📋" title="Ресурсів не знайдено" description="Спробуйте змінити параметри пошуку" />
      )}
    </div>
  )
}
