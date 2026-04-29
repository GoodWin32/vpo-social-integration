'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { EVENT_CATEGORIES, UKRAINE_REGIONS } from '@/lib/types'
import { Suspense } from 'react'

const categoryOptions = EVENT_CATEGORIES.map(c => ({ value: c, label: c }))
const regionOptions   = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))
const formatOptions   = [
  { value: 'offline', label: 'Офлайн' },
  { value: 'online',  label: 'Онлайн' },
  { value: 'hybrid',  label: 'Гібридний' },
]

function CreateEventForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '', description: '', city: '', region: '',
    address: '', online_link: '', format: 'offline',
    category: '', image_url: '',
    starts_at: '', ends_at: '',
    max_participants: '',
    community_id: searchParams.get('community') ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.title.trim())    errs.title = 'Назва обов\'язкова'
    if (!form.starts_at)       errs.starts_at = 'Дата початку обов\'язкова'
    if (!form.category)        errs.category = 'Оберіть категорію'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('events').insert({
      title:           form.title.trim(),
      description:     form.description || null,
      city:            form.city || null,
      region:          form.region || null,
      address:         form.address || null,
      online_link:     form.online_link || null,
      format:          form.format,
      category:        form.category || null,
      image_url:       form.image_url || null,
      starts_at:       form.starts_at,
      ends_at:         form.ends_at || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      community_id:    form.community_id || null,
      organizer_id:    user.id,
    }).select().single()

    if (error) {
      setErrors({ submit: error.message })
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push(`/events/${data.id}`), 1500)
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Подію створено!</h2>
        <p className="text-gray-500 text-sm">Перенаправлення...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <Input label="Назва події" required value={form.title} onChange={e => setField('title', e.target.value)} error={errors.title} placeholder="Наприклад: Майстер-клас з кераміки" />
      <Textarea label="Опис" value={form.description} onChange={e => setField('description', e.target.value)} rows={4} placeholder="Розкажіть про подію..." />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Категорія" required value={form.category} onChange={e => setField('category', e.target.value)} options={categoryOptions} placeholder="Оберіть категорію" error={errors.category} />
        <Select label="Формат" value={form.format} onChange={e => setField('format', e.target.value)} options={formatOptions} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Дата та час початку" type="datetime-local" required value={form.starts_at} onChange={e => setField('starts_at', e.target.value)} error={errors.starts_at} />
        <Input label="Дата та час завершення" type="datetime-local" value={form.ends_at} onChange={e => setField('ends_at', e.target.value)} />
      </div>

      {(form.format === 'offline' || form.format === 'hybrid') && (
        <div className="grid grid-cols-2 gap-4">
          <Input label="Місто" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Київ" />
          <Select label="Регіон" value={form.region} onChange={e => setField('region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
        </div>
      )}

      {(form.format === 'offline' || form.format === 'hybrid') && (
        <Input label="Адреса" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="вул. Хрещатик, 1" />
      )}

      {(form.format === 'online' || form.format === 'hybrid') && (
        <Input label="Посилання на онлайн-трансляцію" value={form.online_link} onChange={e => setField('online_link', e.target.value)} placeholder="https://meet.google.com/..." />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input label="Макс. учасників" type="number" min="1" value={form.max_participants} onChange={e => setField('max_participants', e.target.value)} placeholder="Необмежено" />
        <Input label="URL зображення" value={form.image_url} onChange={e => setField('image_url', e.target.value)} placeholder="https://..." />
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{errors.submit}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Скасувати</Button>
        <Button type="submit" loading={loading} className="flex-1" size="lg">Створити подію</Button>
      </div>
    </form>
  )
}

export default function CreateEventPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Створити подію" description="Організуйте зустріч, воркшоп або культурний захід" />
      <Suspense>
        <CreateEventForm />
      </Suspense>
    </div>
  )
}
