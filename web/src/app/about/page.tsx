import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const team = [
  { role: 'Розробник проекту', note: 'Дипломна робота' },
]

const problems = [
  { icon: '🏠', text: 'Відсутність постійного житла та невизначеність майбутнього' },
  { icon: '💼', text: 'Труднощі з пошуком роботи та професійною адаптацією' },
  { icon: '👥', text: 'Соціальна ізоляція та брак соціальних зв\'язків' },
  { icon: '📄', text: 'Складнощі з оформленням документів та отриманням пільг' },
  { icon: '🧠', text: 'Психологічний стрес та потреба в підтримці' },
  { icon: '📚', text: 'Проблеми з освітою для дітей та дорослих' },
]

const solutions = [
  { icon: '🔗', title: 'Об\'єднання',    text: 'Платформа об\'єднує переселенців, волонтерів та організації в єдиній екосистемі' },
  { icon: '📡', title: 'Доступність',    text: 'Зручний доступ до ресурсів 24/7 з будь-якого пристрою' },
  { icon: '🤝', title: 'Підтримка',      text: 'Система взаємодопомоги та менторства між користувачами' },
  { icon: '📊', title: 'Прозорість',     text: 'Верифіковані ресурси та перевірена інформація від організацій' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Про платформу</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Дізнайтеся більше про нашу місію та як ми допомагаємо внутрішньо переміщеним особам в Україні
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Наша місія</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Допомогти кожному переселенцю знайти своє місце
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                З початку повномасштабного вторгнення мільйони українців були змушені покинути свої домівки.
                Соціальна інтеграція в новому середовищі — один з найважливіших викликів, з якими стикаються ВПО.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Наша платформа створена для того, щоб полегшити цей процес — об'єднати людей, надати доступ
                до необхідних ресурсів та створити середовище взаємопідтримки.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🇺🇦</div>
              <p className="text-5xl font-bold text-blue-600 mb-2">5М+</p>
              <p className="text-gray-600">внутрішньо переміщених осіб в Україні потребують підтримки</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Проблеми, які ми вирішуємо</h2>
            <p className="text-gray-500 mt-2">Основні виклики, з якими стикаються переселенці</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map(p => (
              <div key={p.text} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-gray-700 text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Як платформа допомагає</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map(s => (
              <div key={s.title} className="flex items-start gap-4 p-6 rounded-2xl border border-gray-100">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Технічна реалізація</h2>
          <p className="text-gray-500 mb-8">Платформа розроблена з використанням сучасних технологій</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Supabase Auth', 'Supabase Realtime'].map(t => (
              <span key={t} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Приєднуйтесь до нас</h2>
        <p className="text-blue-100 mb-6">Разом ми можемо зробити процес адаптації простішим</p>
        <Link href="/signup" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition inline-block">
          Зареєструватись
        </Link>
      </section>

      <Footer />
    </div>
  )
}
