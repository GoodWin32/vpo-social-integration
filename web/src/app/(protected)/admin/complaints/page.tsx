import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { formatRelativeTime } from '@/lib/utils'
import ComplaintActions from './ComplaintActions'

const REASON_LABELS: Record<string, string> = {
  spam:           'Спам',
  harassment:     'Образа',
  misinformation: 'Дезінформація',
  inappropriate:  'Неприйнятний контент',
  other:          'Інше',
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Очікує',    cls: 'bg-yellow-100 text-yellow-700' },
  reviewed:  { label: 'Розглянуто', cls: 'bg-green-100  text-green-700'  },
  dismissed: { label: 'Відхилено', cls: 'bg-gray-100   text-gray-500'   },
}

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { status = 'pending' } = await searchParams

  const query = supabase
    .from('post_complaints')
    .select(`
      id, reason, comment, status, created_at,
      community_posts (
        id, content, community_id, author_id,
        profiles ( id, full_name, avatar_url )
      ),
      profiles ( id, full_name )
    `)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query.eq('status', status)
  }

  const { data: complaints } = await query

  const tabs = [
    { value: 'pending',   label: 'Нові'       },
    { value: 'reviewed',  label: 'Розглянуті' },
    { value: 'dismissed', label: 'Відхилені'  },
    { value: 'all',       label: 'Всі'        },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Скарги на дописи"
        description="Модерація скарг користувачів"
      />

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
        {tabs.map(tab => (
          <a
            key={tab.value}
            href={`/admin/complaints?status=${tab.value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              status === tab.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {complaints && complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map(c => {
            const post = c.community_posts as {
              id: string; content: string; community_id: string; author_id: string
              profiles?: { id: string; full_name: string | null; avatar_url: string | null } | null
            } | null
            const reporter = c.profiles as { id: string; full_name: string | null } | null
            const statusInfo = STATUS_LABELS[c.status] ?? STATUS_LABELS.pending

            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-50">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Post content */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-1">
                        Автор допису: <span className="font-medium text-gray-600">{post?.profiles?.full_name ?? '—'}</span>
                        {post?.community_id && (
                          <>
                            {' · '}
                            <a
                              href={`/communities/${post.community_id}`}
                              className="text-blue-500 hover:underline"
                            >
                              Перейти до спільноти
                            </a>
                          </>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">
                        {post?.content ?? 'Допис видалено'}
                      </p>
                    </div>

                    {/* Complaint meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>
                        🚩 <span className="font-medium text-gray-700">{REASON_LABELS[c.reason] ?? c.reason}</span>
                      </span>
                      <span>
                        Від: <span className="font-medium text-gray-700">{reporter?.full_name ?? 'Невідомий'}</span>
                      </span>
                      <span>{formatRelativeTime(c.created_at)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {c.comment && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        &ldquo;{c.comment}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <ComplaintActions
                    complaintId={c.id}
                    postId={post?.id ?? null}
                    currentStatus={c.status}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-gray-500 font-medium">Скарг немає</p>
          <p className="text-sm text-gray-400 mt-1">У цій категорії поки що нічого немає</p>
        </div>
      )}
    </div>
  )
}
