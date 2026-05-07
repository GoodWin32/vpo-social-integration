import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HelpClient from './HelpClient'

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string; city?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { type, category, city } = await searchParams

  let query = supabase
    .from('help_requests')
    .select('*, profiles(id, full_name, avatar_url, city)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (type === 'need' || type === 'offer') query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (city) query = query.ilike('city', `%${city}%`)

  const { data: requests } = await query

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤝 Дошка взаємодопомоги</h1>
          <p className="text-sm text-gray-500 mt-1">Запропонуйте або попросіть допомогу</p>
        </div>
        <Link
          href="/help/create"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
        >
          + Додати оголошення
        </Link>
      </div>

      <HelpClient requests={requests ?? []} currentUserId={user.id} />
    </div>
  )
}
