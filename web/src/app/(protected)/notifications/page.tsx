import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import NotificationsClient from './NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Сповіщення"
        description="Ваші останні сповіщення та оновлення"
      />
      <NotificationsClient notifications={notifications ?? []} userId={user.id} />
    </div>
  )
}
