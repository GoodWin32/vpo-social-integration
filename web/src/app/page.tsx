export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import CommunityCard from '@/components/CommunityCard'
import EventCard from '@/components/EventCard'
import { Community, Event } from '@/lib/types'

const features = [
  { icon: '👥', title: 'Спільноти',        desc: 'Знайдіть людей зі схожим досвідом у вашому місті або онлайн' },
  { icon: '📅', title: 'Події та заходи',   desc: 'Беріть участь у воркшопах, зустрічах та культурних подіях' },
  { icon: '📋', title: 'Корисні ресурси',   desc: 'Доступ до перевіреної інформації про соціальні служби та допомогу' },
  { icon: '💬', title: 'Спілкування',       desc: 'Листуйтеся з іншими переселенцями та волонтерами' },
  { icon: '🤝', title: 'Підтримка',         desc: 'Отримайте допомогу з житлом, роботою, документами' },
  { icon: '🛡️', title: 'Безпека',           desc: 'Модерована платформа із захистом персональних даних' },
]

const stats = [
  { value: '10 000+', label: 'Зареєстрованих користувачів' },
  { value: '500+',    label: 'Активних спільнот' },
  { value: '1 200+',  label: 'Проведених подій' },
  { value: '3 000+',  label: 'Корисних ресурсів' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: communities }, { data: events }] = await Promise.all([
    supabase.from('communities').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('events').select('*').eq('is_approved', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-blue-500/40 text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🇺🇦 Платформа для внутрішньо переміщених осіб
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Знайди свою спільноту.<br />Отримай підтримку.
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Ми допомагаємо ВПО знайти нових друзів, корисні ресурси та можливості для соціальної інтеграції в новому місті.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition text-lg shadow-lg">
              Приєднатись до платформи
            </Link>
            <Link href="/resources" className="border-2 border-white/60 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition text-lg">
              Знайти допомогу
            </Link>
            <Link href="/communities" className="text-blue-200 hover:text-white font-medium transition underline underline-offset-4">
              Переглянути спільноти →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Все що вам потрібно — в одному місці</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Платформа створена спеціально для потреб переселенців та тих, хто хоче допомогти.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities preview */}
      {communities && communities.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Активні спільноти</h2>
              <Link href="/communities" className="text-blue-600 hover:underline text-sm font-medium">Усі спільноти →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(communities as Community[]).map(c => <CommunityCard key={c.id} community={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* Events preview */}
      {events && events.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Найближчі події</h2>
              <Link href="/events" className="text-blue-600 hover:underline text-sm font-medium">Усі події →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(events as Event[]).map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Готові розпочати?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Приєднуйтесь до тисяч переселенців, які вже знайшли підтримку на нашій платформі.
          </p>
          <Link href="/signup" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-10 py-4 rounded-xl transition text-lg shadow-lg inline-block">
            Зареєструватись безкоштовно
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
