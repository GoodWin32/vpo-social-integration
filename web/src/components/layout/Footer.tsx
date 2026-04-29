import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇺🇦</span>
              <span className="font-bold text-white text-lg">ВПО Платформа</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Платформа соціальної інтеграції внутрішньо переміщених осіб в Україні.
              Ми допомагаємо знайти спільноту, підтримку та нові можливості.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Платформа</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/communities" className="hover:text-white transition">Спільноти</Link></li>
              <li><Link href="/events"      className="hover:text-white transition">Події</Link></li>
              <li><Link href="/resources"   className="hover:text-white transition">Ресурси</Link></li>
              <li><Link href="/about"       className="hover:text-white transition">Про нас</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Підтримка</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition">Контакти</Link></li>
              <li><Link href="/signup"  className="hover:text-white transition">Реєстрація</Link></li>
              <li><Link href="/login"   className="hover:text-white transition">Вхід</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} ВПО Платформа. Усі права захищено.</p>
          <p>Дипломний проект — Веб-платформа соціальної інтеграції ВПО</p>
        </div>
      </div>
    </footer>
  )
}
