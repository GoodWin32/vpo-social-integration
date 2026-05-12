import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    region?: string
    city?: string
    origin_region?: string
    interests?: string
    mode?: string
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // Fetch current user's full profile for smart matching
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('city, region, origin_city, origin_region, interests')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, origin_city, origin_region, bio, interests, is_vpo')
    .neq('id', user.id)
    .order('full_name', { ascending: true })
    .limit(80)

  // Mode: "compatriots" — same origin AND same current city
  if (params.mode === 'compatriots') {
    if (myProfile?.origin_region) query = query.eq('origin_region', myProfile.origin_region)
    if (myProfile?.city)          query = query.ilike('city', myProfile.city)
  }
  // Mode: "neighborhood" — same current city
  else if (params.mode === 'neighborhood') {
    if (myProfile?.city) query = query.ilike('city', myProfile.city)
  }
  // Mode: "interests" — only VPO with any shared interest
  else if (params.mode === 'interests') {
    if (myProfile?.interests?.length) query = query.overlaps('interests', myProfile.interests)
  }
  // Manual filters
  else {
    if (params.q?.trim())             query = query.ilike('full_name', `%${params.q.trim()}%`)
    if (params.region?.trim())        query = query.eq('region', params.region.trim())
    if (params.city?.trim())          query = query.ilike('city', `%${params.city.trim()}%`)
    if (params.origin_region?.trim()) query = query.eq('origin_region', params.origin_region.trim())
    if (params.interests?.trim()) {
      const list = params.interests.split(',').map(s => s.trim()).filter(Boolean)
      if (list.length) query = query.overlaps('interests', list)
    }
  }

  const { data: profiles } = await query

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <UsersClient
        profiles={profiles ?? []}
        myProfile={myProfile ?? null}
        currentUserId={user.id}
        activeMode={params.mode ?? ''}
        initialQ={params.q ?? ''}
        initialRegion={params.region ?? ''}
        initialCity={params.city ?? ''}
        initialOriginRegion={params.origin_region ?? ''}
        initialInterests={params.interests ?? ''}
      />
    </div>
  )
}
