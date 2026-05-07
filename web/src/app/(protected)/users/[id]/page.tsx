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
  if (id === user.id) redirect('/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, region, bio, interests, is_vpo, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [
    { data: myMemberships },
    { count: friendCount },
    { count: communityCount },
    { count: eventCount },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from('community_members').select('community_id').eq('user_id', user.id),
    supabase.from('friendships')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${id},addressee_id.eq.${id}`)
      .eq('status', 'accepted'),
    supabase.from('community_members').select('id', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('community_posts')
      .select('id, content, created_at, communities(id, name)')
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const myIds = (myMemberships ?? []).map(m => m.community_id)

  const { data: sharedCommunities } = myIds.length > 0
    ? await supabase
        .from('community_members')
        .select('community_id, communities(id, name, image_url)')
        .eq('user_id', id)
        .in('community_id', myIds)
        .limit(4)
    : { data: [] }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('uk-UA', {
    year: 'numeric', month: 'long',
  })

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'сьогодні'
    if (days === 1) return 'вчора'
    if (days < 7) return `${days} дн. тому`
    if (days < 30) return `${Math.floor(days / 7)} тиж. тому`
    return `${Math.floor(days / 30)} міс. тому`
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Back link */}
      <div className="px-6 pt-6 pb-2">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition">
          ← Назад до пошуку
        </Link>
      </div>

      {/* Cover + avatar hero */}
      <div className="relative mx-6 rounded-2xl overflow-hidden shadow-sm mb-0">
        {/* Cover banner */}
        <div className="h-36 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500" />

        {/* Avatar + name row */}
        <div className="bg-white px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-10 flex-wrap">
            {/* Avatar with ring */}
            <div className="ring-4 ring-white rounded-full shrink-0">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap pb-1">
              <FriendButton
                currentUserId={user.id}
                targetUserId={profile.id}
                targetName={profile.full_name}
              />
              <Link
                href={`/messages?with=${profile.id}`}
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                ✉️ Написати
              </Link>
            </div>
          </div>

          {/* Name + meta */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {profile.full_name ?? 'Користувач'}
              </h1>
              {profile.is_vpo && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold border border-blue-100">
                  🇺🇦 ВПО
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
              {(profile.city || profile.region) && (
                <span className="flex items-center gap-1">
                  📍 {profile.city}{profile.region ? `, ${profile.region}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                🗓 На платформі з {joinedDate}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mx-6 mt-3 bg-white rounded-2xl shadow-sm px-6 py-4 grid grid-cols-3 divide-x divide-gray-100">
        <div className="text-center pr-4">
          <p className="text-2xl font-bold text-gray-900">{friendCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Друзів</p>
        </div>
        <div className="text-center px-4">
          <p className="text-2xl font-bold text-gray-900">{communityCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Спільнот</p>
        </div>
        <div className="text-center pl-4">
          <p className="text-2xl font-bold text-gray-900">{eventCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Подій</p>
        </div>
      </div>

      <div className="mx-6 mt-3 grid md:grid-cols-2 gap-3">
        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-base">✨</span> Інтереси
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shared communities */}
        {sharedCommunities && sharedCommunities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-base">👥</span> Спільні спільноти
            </h2>
            <div className="space-y-1.5">
              {sharedCommunities.map((m: any) => {
                const c = m.communities
                return c ? (
                  <Link
                    key={m.community_id}
                    href={`/communities/${c.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0 group-hover:bg-blue-200 transition">
                      {c.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600 transition truncate">
                      {c.name}
                    </span>
                  </Link>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent posts */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="mx-6 mt-3 bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-base">📝</span> Останні дописи
          </h2>
          <div className="space-y-4">
            {recentPosts.map((post: any) => (
              <div key={post.id} className="border-l-2 border-blue-100 pl-4">
                <div className="flex items-center gap-2 mb-1.5">
                  {post.communities && (
                    <Link
                      href={`/communities/${post.communities.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      {post.communities.name}
                    </Link>
                  )}
                  <span className="text-xs text-gray-400">· {timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
