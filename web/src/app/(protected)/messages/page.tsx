import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import DirectMessages from '@/components/DirectMessages'
import PageHeader from '@/components/layout/PageHeader'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: dms }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).single(),
    supabase
      .from('direct_messages')
      .select('*, sender:profiles!sender_id(id, full_name, avatar_url), receiver:profiles!receiver_id(id, full_name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  // Build deduplicated conversation list (one entry per partner, most recent first)
  type DMRow = {
    id: string; sender_id: string; receiver_id: string; content: string
    is_read: boolean; created_at: string
    sender: { id: string; full_name: string | null; avatar_url: string | null }
    receiver: { id: string; full_name: string | null; avatar_url: string | null }
  }

  const seen = new Map<string, { partner: { id: string; full_name: string | null; avatar_url: string | null }; lastMessage: DMRow; unreadCount: number }>()

  for (const dm of (dms ?? []) as DMRow[]) {
    const partner = dm.sender_id === user.id ? dm.receiver : dm.sender
    if (!seen.has(partner.id)) {
      seen.set(partner.id, { partner, lastMessage: dm, unreadCount: 0 })
    }
    if (dm.receiver_id === user.id && !dm.is_read) {
      seen.get(partner.id)!.unreadCount++
    }
  }

  const conversations = Array.from(seen.values())

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-6 pb-0">
        <PageHeader
          title="Повідомлення"
          description="Особисте листування з іншими користувачами"
        />
      </div>
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <Suspense>
          <DirectMessages currentUser={profile!} initialConversations={conversations} />
        </Suspense>
      </div>
    </div>
  )
}
