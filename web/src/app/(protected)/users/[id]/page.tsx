import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import FriendButton from '@/components/ui/FriendButton'
import Link from 'next/link'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  // Redirect to own profile page
  if (id === user.id) redirect('/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, bio, interests, is_vpo, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Profile stats + communities in common — all in parallel
  const [
    { data: myMemberships },
    { count: friendCount },
    { count: communityCount },
    { count: eventCount },
  ] = await Promise.all([
    supabase.from('community_members').select('community_id').eq('user_id', user.id),
    supabase.from('friendships').select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${id},addressee_id.eq.${id}`)
      .eq('status', 'accepted'),
    supabase.from('community_members').select('id', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('user_id', id),
  ])

  const myIds = (myMemberships ?? []).map(m => m.community_id)

  const { data: sharedCommunities } = myIds.length > 0
    ? await supabase
        .from('community_members')
        .select('community_id, communities(id, name, image_url)')
        .eq('user_id', id)
        .in('community_id', myIds)
        .limit(3)
    : { data: [] }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('uk-UA', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      {/* Back */}
      <Link href="/users" className="text-sm text-gray-400 hover:text-blue-600 transition flex items-center gap-1">
        ← Назад до пошуку
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-5">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.full_name ?? 'Користувач'}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {profile.city && (
                    <span className="text-sm text-gray-500">📍 {profile.city}{profile.region ? `, ${profile.region}` : ''}</span>
                  )}
                  {profile.is_vpo && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">ВПО</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">На платформі з {joinedDate}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <FriendButton
                  currentUserId={user.id}
                  targetUserId={profile.id}
                  targetName={profile.full_name}
                />
                <Link
                  href={`/messages?with=${profile.id}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
                >
                  ✉️ Написати
                </Link>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats row */}
            <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100 flex-wrap">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{friendCount ?? 0}</p>
                <p className="text-xs text-gray-400">Друзів</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{communityCount ?? 0}</p>
                <p className="text-xs text-gray-400">Спільнот</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{eventCount ?? 0}</p>
                <p className="text-xs text-gray-400">Подій</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Інтереси</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((i: string) => (
              <span key={i} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shared communities */}
      {sharedCommunities && sharedCommunities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Спільні спільноти</h2>
          <div className="space-y-2">
            {sharedCommunities.map((m: any) => {
              const c = m.communities
              return c ? (
                <Link
                  key={m.community_id}
                  href={`/communities/${c.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {c.name?.[0] ?? '?'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                </Link>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
