import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import JoinCommunityButton from './JoinCommunityButton'
import PostForm from './PostForm'
import MemberList from './MemberList'

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: community }, { data: members }, { data: posts }, { data: events }] = await Promise.all([
    supabase.from('communities').select('*, profiles(id, full_name, avatar_url)').eq('id', id).single(),
    supabase.from('community_members').select('*, profiles(id, full_name, avatar_url, city)').eq('community_id', id).order('joined_at').limit(20),
    supabase.from('community_posts').select('*, profiles(id, full_name, avatar_url)').eq('community_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('events').select('*').eq('community_id', id).gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
  ])

  if (!community) notFound()

  const isMember = user ? members?.some(m => m.user_id === user.id) ?? false : false
  const isCreator = user?.id === community.created_by
  const memberCount = members?.length ?? 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-700 relative">
          {community.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={community.image_url} alt={community.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
              {community.category && <Badge variant="blue">{community.category}</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              {community.city && <span>📍 {community.city}{community.region && `, ${community.region}`}</span>}
              <span>👤 {memberCount} учасник{memberCount === 1 ? '' : memberCount < 5 ? 'и' : 'ів'}</span>
              <span>📅 Створено {formatDate(community.created_at)}</span>
            </div>
          </div>
          {user && (
            <JoinCommunityButton
              communityId={community.id}
              userId={user.id}
              isMember={isMember}
            />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {community.description && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Про спільноту</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{community.description}</p>
            </div>
          )}

          {/* Rules */}
          {community.rules && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">📜 Правила</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{community.rules}</p>
            </div>
          )}

          {/* Posts */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Оголошення та дописи</h2>

            {isMember && user && (
              <PostForm communityId={community.id} userId={user.id} />
            )}

            {posts && posts.length > 0 ? (
              <div className="space-y-4 mt-4">
                {posts.map(post => (
                  <div key={post.id} className="border-t border-gray-50 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar src={post.profiles?.avatar_url} name={post.profiles?.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{post.profiles?.full_name}</p>
                        <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-10">{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">Поки немає дописів</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Organizer */}
          {community.profiles && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Організатор</h3>
              <div className="flex items-center gap-3">
                <Avatar src={community.profiles.avatar_url} name={community.profiles.full_name} size="sm" />
                <p className="text-sm font-medium text-gray-700">{community.profiles.full_name}</p>
              </div>
            </div>
          )}

          {/* Members */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">
              Учасники ({memberCount})
            </h3>
            <MemberList
              members={(members ?? []).slice(0, 12) as Parameters<typeof MemberList>[0]['members']}
              currentUserId={user?.id ?? null}
            />
            {memberCount > 12 && (
              <p className="text-xs text-gray-400 mt-2 text-center">+{memberCount - 12} ще</p>
            )}
          </div>

          {/* Related events */}
          {events && events.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Найближчі події</h3>
              <div className="space-y-3">
                {events.map(e => (
                  <a key={e.id} href={`/events/${e.id}`} className="flex items-start gap-2 group">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">{e.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(e.starts_at, { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Creator tools */}
          {isCreator && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">⚙️ Управління</h3>
              <div className="space-y-2">
                <a href={`/communities/${community.id}/edit`} className="block w-full text-center text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg transition">
                  Редагувати спільноту
                </a>
                <a href={`/events/create?community=${community.id}`} className="block w-full text-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg transition">
                  Створити подію
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
