import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-700">ВПО Платформа</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {profile?.full_name || user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Вітаємо, {profile?.full_name?.split(' ')[0] || 'користувач'}!
        </h2>
        <p className="text-gray-500 mb-8">Платформа соціальної інтеграції ВПО в Україні</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/chat" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition group">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Чат</h3>
            <p className="text-sm text-gray-500 mt-1">Спілкуйтесь з іншими переселенцями та волонтерами</p>
          </Link>

          <Link href="/resources" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition group">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Ресурси</h3>
            <p className="text-sm text-gray-500 mt-1">Соціальні служби, організації та контакти</p>
          </Link>

          <Link href="/profile" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition group">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Профіль</h3>
            <p className="text-sm text-gray-500 mt-1">Ваші особисті дані та налаштування</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
