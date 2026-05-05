'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

const faqs = [
  { q: 'Хто може зареєструватись на платформі?',  a: 'Будь-хто — ВПО, волонтери, організації та всі, хто хоче допомогти.' },
  { q: 'Чи безкоштовне користування платформою?',  a: 'Так, платформа повністю безкоштовна для всіх користувачів.' },
  { q: 'Як можна створити спільноту або подію?',   a: 'Після реєстрації перейдіть до розділу "Спільноти" або "Події" та натисніть "Створити".' },
  { q: 'Як перевіряються ресурси на платформі?',   a: 'Адміністратори перевіряють кожен ресурс перед публікацією.' },
  { q: 'Що робити, якщо я бачу порушення правил?', a: 'Скористайтесь формою нижче або кнопкою "Поскаржитись" на сторінці контенту.' },
]

export default function ContactClient() {
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Зв&apos;яжіться з нами</h1>
          <p className="text-blue-100 text-lg">Ми завжди раді відповісти на ваші запитання</p>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-16 px-4 bg-white flex-1">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактна інформація</h2>
            <div className="space-y-4">
              {[
                { icon: '📧', label: 'Email',   value: 'support@vpo-platform.ua' },
                { icon: '📞', label: 'Телефон', value: '+38 (044) 000-00-00' },
                { icon: '📍', label: 'Адреса',  value: 'м. Київ, Україна' },
                { icon: '🕐', label: 'Графік',  value: 'Пн–Пт, 9:00–18:00' },
              ].map(c => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                    <p className="text-gray-700">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-3">Ми в соціальних мережах</h3>
              <div className="flex gap-3">
                {['Telegram', 'Facebook', 'Instagram'].map(s => (
                  <span key={s} className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Написати нам</h2>
            {sent ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-gray-800 text-xl mb-2">Повідомлення надіслано!</h3>
                <p className="text-gray-500">Ми відповімо протягом 1–2 робочих днів.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input name="name"  label="Ім'я"  value={form.name}  onChange={handleChange} required placeholder="Ваше ім'я" />
                  <Input name="email" label="Email" value={form.email} onChange={handleChange} required type="email" placeholder="your@email.com" />
                </div>
                <Input    name="subject" label="Тема"        value={form.subject}  onChange={handleChange} required placeholder="Тема звернення" />
                <Textarea name="message" label="Повідомлення" value={form.message} onChange={handleChange} required rows={5} placeholder="Опишіть питання..." />
                <Button type="submit" loading={loading} size="lg" className="w-full">Надіслати повідомлення</Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Часті запитання</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-800 font-medium hover:bg-gray-50 transition">
                  {faq.q}
                  <span className="text-gray-400 ml-4">{openFaq === i ? '▲' : '▼'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
