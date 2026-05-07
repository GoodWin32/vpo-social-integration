import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import UsersClient from './UsersClient'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { q = '', region = '' } = await searchParams

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, bio, interests, is_vpo')
    .neq('id', user.id)
    .order('full_name', { ascending: true })
    .limit(50)

  if (q.trim()) {
    query = query.ilike('full_name', `%${q.trim()}%`)
  }
  if (region.trim()) {
    query = query.eq('region', region.trim())
  }

  const { data: profiles } = await query

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Люди"
        description="Знаходьте переселенців та волонтерів на платформі"
      />
      <UsersClient
        profiles={profiles ?? []}
        currentUserId={user.id}
        initialQ={q}
        initialRegion={region}
      />
    </div>
  )
}
