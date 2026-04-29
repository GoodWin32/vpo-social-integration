'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import PageHeader from '@/components/layout/PageHeader'
import { COMMUNITY_CATEGORIES, UKRAINE_REGIONS } from '@/lib/types'

const categoryOptions = COMMUNITY_CATEGORIES.map(c => ({ value: c, label: c }))
const regionOptions   = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))

export default function CreateCommunityPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '', description: '', city: '', region: '',
    category: '', rules: '', image_url: '' as string | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())        errs.name = 'Назва обов\'язкова'
    if (!form.description.trim()) errs.description = 'Опис обов\'язковий'
    if (!form.category)           errs.category = 'Оберіть категорію'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('communities').insert({
      name:        form.name.trim(),
      description: form.description.trim(),
      city:        form.city || null,
      region:      form.region || null,
      category:    form.category || null,
      rules:       form.rules || null,
      image_url:   form.image_url || null,
      created_by:  user.id,
    }).select().single()

    if (error) {
      setErrors({ submit: error.message })
      setLoading(false)
      return
    }

    // Auto-join as admin
    await supabase.from('community_members').insert({ community_id: data.id, user_id: user.id, role: 'admin' })

    router.push(`/communities/${data.id}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Створити спільноту" description="Заповніть форму щоб створити нову спільноту" />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <Input label="Назва спільноти" required value={form.name} onChange={e => setField('name', e.target.value)} error={errors.name} placeholder="Наприклад: Переселенці Львова" />
        <Textarea label="Опис" required value={form.description} onChange={e => setField('description', e.target.value)} error={errors.description} rows={4} placeholder="Розкажіть про мету та діяльність спільноти..." />
        <Select label="Категорія" required value={form.category} onChange={e => setField('category', e.target.value)} options={categoryOptions} placeholder="Оберіть категорію" error={errors.category} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Місто" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Київ" />
          <Select label="Регіон" value={form.region} onChange={e => setField('region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
        </div>

        <FileUpload
          bucket="images"
          folder="communities"
          currentUrl={form.image_url}
          onUpload={url => setForm(prev => ({ ...prev, image_url: url }))}
          label="Обкладинка спільноти"
          hint="До 10 МБ · JPEG, PNG, WebP, GIF"
        />
        <Textarea label="Правила спільноти" value={form.rules} onChange={e => setField('rules', e.target.value)} rows={3} placeholder="Опишіть правила поведінки в спільноті..." />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Скасувати
          </Button>
          <Button type="submit" loading={loading} className="flex-1" size="lg">
            Створити спільноту
          </Button>
        </div>
      </form>
    </div>
  )
}
