export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, city, role, status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-gray-800">Акаунт заблоковано</h1>
          <p className="text-gray-500 mt-2 text-sm">Зверніться до адміністратора для отримання допомоги.</p>
        </div>
      </div>
    )
  }

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        profile={profile}
        isAdmin={profile?.role === 'admin'}
        unreadCount={unreadCount ?? 0}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
