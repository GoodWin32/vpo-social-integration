export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl">🇺🇦</span>
          <span className="font-bold text-blue-700">ВПО Платформа</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>
      <p className="text-center text-xs text-gray-400 pb-4">
        © {new Date().getFullYear()} ВПО Платформа. Усі права захищено.
      </p>
    </div>
  )
}
