import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/ui/Avatar'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🇺🇦</span>
          <span className="font-bold text-blue-700 text-lg">ВПО Платформа</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/communities" className="hover:text-blue-600 transition">Спільноти</Link>
          <Link href="/events" className="hover:text-blue-600 transition">Події</Link>
          <Link href="/resources" className="hover:text-blue-600 transition">Ресурси</Link>
          <Link href="/about" className="hover:text-blue-600 transition">Про нас</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {profile?.full_name?.split(' ')[0] ?? 'Кабінет'}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Увійти
              </Link>
              <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
