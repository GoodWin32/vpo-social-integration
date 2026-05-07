'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Житло', 'Транспорт', 'Їжа', 'Одяг', 'Медицина', 'Психологічна підтримка',
  'Юридична допомога', 'Документи', 'Робота', 'Навчання', 'Дитячий садок / школа',
  'Речі', 'Фінансова допомога', 'Інше',
]

export default function CreateHelpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState<'need' | 'offer'>('need')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !title.trim()) { setError('Заповніть обов\'язкові поля'); return }
    setSubmitting(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: err } = await supabase.from('help_requests').insert({
      author_id: user.id,
      type,
      category,
      title: title.trim(),
      description: description.trim() || null,
      city: city.trim() || null,
      region: region.trim() || null,
      contact_info: contactInfo.trim() || null,
    })

    if (err) { setError(err.message); setSubmitting(false); return }
    router.push('/help')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-blue-600 transition mb-4 flex items-center gap-1">
        ← Назад
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Нове оголошення</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип оголошення *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('need')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                  type === 'need' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                🙏 Потрібна допомога
              </button>
              <button
                type="button"
                onClick={() => setType('offer')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                  type === 'offer' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                💚 Пропоную допомогу
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категорія *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Оберіть категорію</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Коротко опишіть що потрібно або що пропонуєте"
              required
              maxLength={120}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Детальніше..."
              rows={4}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Місто</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Київ"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
              <input
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="Київська"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактна інформація</label>
            <input
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              placeholder="Телефон, Telegram, email..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Публікація...' : 'Опублікувати'}
          </button>
        </form>
      </div>
    </div>
  )
}
