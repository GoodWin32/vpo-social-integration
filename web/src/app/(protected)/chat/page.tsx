import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatRoom from '@/components/ChatRoom'
import PageHeader from '@/components/layout/PageHeader'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: rooms }, { data: profile }] = await Promise.all([
    supabase.from('rooms').select('*').eq('is_public', true).order('created_at'),
    supabase.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).single(),
  ])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-6 pb-0">
        <PageHeader title="Чат" description="Спілкуйтесь з іншими учасниками платформи" />
      </div>
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <ChatRoom rooms={rooms ?? []} currentUser={profile!} />
      </div>
    </div>
  )
}
