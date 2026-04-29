import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatRoom from '@/components/ChatRoom'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_public', true)
    .order('created_at')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 transition">←</a>
          <h1 className="text-lg font-bold text-blue-700">Чат</h1>
        </div>
      </header>
      <ChatRoom rooms={rooms ?? []} currentUser={profile!} />
    </div>
  )
}
